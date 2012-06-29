var path = require("path"),
    glob = require("glob"),
    fs = require("fs"),
    argv = require('optimist').argv,
    program = require("commander"),
    att = require("../att.js"),
	csslint = require("./csslint"),
	jshint = require("jshint/lib/hint.js"),
	wrench = require("wrench"),
    MinifyCommand = require("../commands/minify.js"),
    AttUtil = require("../core/AttUtil.js");


/**
 * plugin name
 */
exports.name = "cdn";

/**
 * plugin description
 */
exports.description = "上传静态资源到CDN -s:同时更新staging环境 -p:同时更新product环境";

/**
 * upload to the CDN
 */
var updateCDNFlag = "test",
	autoDataURI = false,
	ignoreDataURIPrompt = false,
	mapper,
    minifySupportedFileType = ["html", "htm", "jpg", "jpeg", "gif", "png", "js", "css"],
    minifyNotYesSupportedFileType = ["jpg", "jpeg", "gif", "png"],
    workspaceRoot, 
	cdnRoot,
	cdnEndpoint,
	customService,
	validTopDirectories = null,
	checkJS = true,
	checkCSS = true;


/**
 * 根据文件分析出CDN上传路径
 */
var analyticsCDNPath = function (filename) {
	var p = "/" + path.relative(__dirname + "/../tmp", path.dirname(filename));
	p = p.replace(/\\/g, "/");
	if (p.indexOf("/..") == 0 || p == "/") {
		p = "/" + path.relative(workspaceRoot, path.dirname(filename));
		p = p.replace(/\\/g, "/");
	}
	var matches = p.match(/^\/(\w+)/);
	if(!matches || !matches[1]){
		return false;
	}
	if(validTopDirectories){
		if(validTopDirectories.indexOf(matches[1]) === -1){
			return false;
		}
	}
	
	return p;
}

/**
 * 上传文件到测试CDN或者生产环境的CDN
 */
var uploadCDN = function (file, flag, callback) {

        var filename = path.basename(file),
            filepath = analyticsCDNPath(file),
            msg = "upload " + flag + " cdn",
			httpPath,
			endpoint,
            json, params;
		
		if(cdnRoot){
			httpPath = cdnRoot + filepath + "/" + filename;
		}else{
			httpPath = filepath + "/" + filename;
		}
        if (filepath === false) {
            var err = "不支持该路径下的文件上传，请上传许可路径下的文件或者重新设置workspace";
            console.log(err);
            return callback(new Error(err));
        }

        params = {
            filename: filename,
            filepath: filepath,
            target: (flag === "product") ? "cdn_home" : "test_home",
			overwrite: (flag === "product") ? "no" : "yes"
        }
		endpoint = flag === "test" ? testEndpoint  : stagingEndpoint;
        AttUtil.upload(endpoint, file, params, function (data) {
            try {
                json = JSON.parse(data);
            } catch (err) {
                process.stdin.destroy();
                return console.log(data);
            }
            if (json.code == 200) {
                console.log(msg + " success: " + httpPath);
            } else {
                console.log(msg + " failed: " + json.msgs);
            }
            callback && callback(null,json);
        }, function (err) {
            process.stdin.destroy();
            callback(err);
        });
    };


/**
 * 做更新操作, 先更新test site, 再更新staging site, 再更新product site(需要命令行参数有标示)
 */
var doUpload = function (file, callback) {
	uploadCDN(file, "test", function (err, json) {
		if (err) {
			callback(err);
		} else if(json.code != 200){
			callback();
		}else if (updateCDNFlag == "staging" || updateCDNFlag == "product") {
			uploadCDN(file, "staging", function (err, json) {
				if (err) {
					callback(err);
				}else if (updateCDNFlag == "product"){
					uploadCDN(file, "product", function (err, json) {
						if (err) {
							callback(err);
						} else {
							callback();
						}
					});
				} else{
					callback();
				}
			});
		} else {
			callback();
		}
	});
};


/**
 * 映射到tmp临时目录
 */
var toPath = function (file) {
	var cdnPath = analyticsCDNPath(file),
		dirname = path.resolve(__dirname + "/../tmp" + cdnPath),
		basename = path.basename(file),
		p = path.resolve(dirname + "/" + basename);

	if (mapper && mapper.transform) {
		p = mapper.transform(file, p);
	}

	if (!path.existsSync(dirname)) {
		try {
			wrench.mkdirSyncRecursive(dirname, 0777);
		} catch (err) {}
	}
	return p;
};

/**
 * minify到临时目录
 */
var minifyFile = function(file, datauri, callback){
	var toName = toPath(file);
	var options = {
		from: file,
		to: toName,
		service: customService
	};
	if (toName.match(/\.css$/i)) {
		options.datauri = datauri;
		options.toAbsolutePath = true;
		options.workspaceRoot = workspaceRoot;
	}
	MinifyCommand.execute(options, function (err, response) {
		if (err) {
			if(response && response.error){
				if(response.error.match(/No savings/i)){
					console.log('Image no saving: ' + file);
					return callback(null, toName);
				}
			}
			console.log("Error occur at: " + file);
			console.log(err);
		} else {
			console.log("minify success: %s -> %s", file, path.basename(toName));
			if(response){
				console.log("src_size: %s		dest_size: %s		percent: %s%", response.src_size, response.dest_size, response.percent); 
			}
		}
		callback && callback(err, toName);
	});
}
/**
 * 处理单个匹配到的文件
 */
var handleFile = function (file, minifyFirst, callback) {
	var uploadFunc = function(newFile){
		 program.confirm("upload to " + updateCDNFlag + " CDN: " + file + "? ", function (yes) {
			if (yes) {
				doUpload(newFile, callback);
			} else {
				callback();
			}
		 });
	};
	if (minifyFirst) {
		minifyFile(file, autoDataURI, function (err, newFile) {
			if (err) {
				callback(err);
			} else {
				uploadFunc(newFile);
			}
		});
	} else {
		uploadFunc(file);
	};
};



/**
 * plugin config
 */
exports.initialize = function(options){
	if(options.checkJS !== undefined){
		checkJS = options.checkJS;
	}
	if(options.checkCSS !== undefined){
		checkCSS = options.checkCSS;
	}
	if(options.ignoreDataURIPrompt !== undefined){
		ignoreDataURIPrompt = options.ignoreDataURIPrompt;
	}
	if(options.defaultEnableDataURI !== undefined){
		autoDataURI = options.defaultEnableDataURI;
	}
	if(options.validTopDirectories !== undefined){
		validTopDirectories = options.validTopDirectories;
	}
	if (options.mapper) {
        mapper = require(__dirname + "/../" + options.mapper);
    }
	if(options.cdnRoot){
		cdnRoot = options.cdnRoot;
	}
	customService = options.smushService;

	workspaceRoot = (options.workspaces || {})[options.currentWorkspace];
	testEndpoint = options.testEndpoint;
	stagingEndpoint = options.stagingEndpoint;
}
/**
 * plugin action
 */
exports.action = function () {
    if (!workspaceRoot) {
      return  console.log("please set your workspace first");
    }
	if(!testEndpoint){
		return console.log("please set test cdn endpoint first");
	}
	if(!stagingEndpoint){
		return console.log("please set staging cdn endpoint first");
	}
    var query = process.argv[3],
        check = argv.c || argv.check,
        files = [];
	
	if(!query){
		return console.log("file glob is required");
	}
    //更新标记
	if(argv.p || argv.product){
		updateCDNFlag = "product";
	}else if(argv.s || argv.staging){
		updateCDNFlag = "staging";
	}else{
		updateCDNFlag = "test";
	}
	
    glob(query, function (err, matched) {
		matched.forEach(function(item){
			var cdnPath = analyticsCDNPath(item);
			if(cdnPath === false){
				return;
			}
			var stat = fs.statSync(item);
			if(stat.isFile()){
				files.push(item);
			}
		});

        if (files.length === 0) {
            return console.log("no assets file matched to the cdn valid path.");
        }
	
		AttUtil.doSequenceTasks(files, function (file, callback) {

			var extname = path.extname(file).replace(/\./, "").toLowerCase();

			//检查 js, css syntax
			if(check === 'true' || (check !== 'false' && extname == "js" && checkJS)){
				var results = jshint.hint([file]);
				var len = results.length,
					str = '',
					file, error;

				results.forEach(function (result) {
					file = result.file;
					error = result.error;
					str += file  + ': line ' + error.line + ', col ' +
						error.character + ', ' + error.reason + '\n';
				});

				if (str) {
					console.log(str + "\n" + len + ' error' + ((len === 1) ? '' : 's') + "\n");
				}else{
					console.log("jshint Perfect: %s", file);
				}

			}else if(check === 'true' || (check !== 'false' && extname == "css" && checkCSS)){
			   csslint.checkFile(file);
			}

			//自动判断是否要压缩代码
			if (minifySupportedFileType.indexOf(extname) !== -1) {
				var promptMinify = function(){
					program.confirm("minify the file -> " + file + "? ", function (yes) {
						if (yes) {
							handleFile(file, true, callback);
						} else if (minifyNotYesSupportedFileType.indexOf(extname) !== -1) {
							handleFile(file, false, callback);
						} else {
							callback();
						}
					});
				},
				promptDataURI = function(callback2){
					program.confirm("datauri the file -> " + file + "? ", function (yes) {
						callback2(yes);
					});
				};
				if(extname === "css" && !ignoreDataURIPrompt){
					promptDataURI(function(datauri){
						autoDataURI = datauri;
						promptMinify();
					});
				}else{
					promptMinify();
				}
			} else {
				handleFile(file, false, callback);
			}
		}, function () {
			process.stdin.destroy();
		});

    });

};