var path = require("path"),
    glob = require("glob"),
    fs = require("fs"),
    argv = require('optimist').argv,
    program = require("commander"),
    att = require("../att.js"),
	csslint = require("./csslint"),
	jshint = require("jshint/lib/hint.js"),
    MinifyCommand = require("../commands/minify.js"),
    AttUtil = require("../core/AttUtil.js");


/**
 * plugin name
 */
exports.name = "cdn";

/**
 * plugin description
 */
exports.description = "upload assets to the CDN";

/**
 * upload to the CDN
 */
var updateProductCDN = false,
	autoDataURI = false,
	mapper,
    minifySupportedFileType = ["html", "htm", "jpg", "jpeg", "gif", "png", "js", "css"],
    minifyNotYesSupportedFileType = ["jpg", "jpeg", "gif", "png"],
    currentWorkspace = att.configuration.currentWorkspace || "default",
    workspaceRoot, cdnEndpoint,
	checkJS = true,
	checkCSS = true;

if (!att.configuration.workspaces) {
    att.configuration.workspaces = {};
}
workspaceRoot = att.configuration.workspaces[currentWorkspace];

/**
 * 根据文件分析出CDN上传路径
 */
var analyticsCDNPath = function (filename) {
	var p = "/" + path.relative(__dirname + "/../tmp", path.dirname(filename));
	p = p.replace(/\\/g, "/");
	if (p.indexOf("/..") == 0 || p == "/") {
		p = "/" + path.relative(workspaceRoot, path.dirname(filename));
		p = p.replace(/\\/g, "/");
		if (p.indexOf("/..") == 0 || p == "/") {
			return false;
		}
	} else {
		return p;
	}
	return p;
}

/**
 * 上传文件到测试CDN或者生产环境的CDN
 */
var uploadCDN = function (file, notTest, callback) {

        var filename = path.basename(file),
            filepath = analyticsCDNPath(file),
            msg = "upload " + (notTest ? "product" : "test") + " cdn",
            json, params;

        if (filepath === false) {
            var err = "不支持该路径下的文件上传，请上传许可路径下的文件或者重新设置workspace";
            console.log(err);
            return callback(new Error(err));
        }

        params = {
            filename: filename,
            filepath: filepath,
            target: notTest ? "cdn_home" : "test_home"
        }

        AttUtil.upload(cdnEndpoint, file, params, function (data) {
            try {
                json = JSON.parse(data);
            } catch (err) {
                process.stdin.destroy();
                return console.log(data);
            }
            if (json.code == 200) {
                console.log(msg + " success: " + file);
            } else {
                console.log(msg + " failed: " + json.msgs);
            }
            callback && callback();
        }, function (err) {
            process.stdin.destroy();
            callback(err);
        });
    };


/**
 * 做更新操作, 先更新test cdn, 再更新product cdn(需要命令行参数有标示)
 */
var doUpload = function (file, callback) {
	uploadCDN(file, false, function (err) {
		if (err) {
			callback(err);
		} else if (updateProductCDN) {
			uploadCDN(file, true, function (err) {
				if (err) {
					callback(err);
				} else {
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
	var p = path.resolve(__dirname + "/../tmp/" + file),
		dirname = path.dirname(p),
		basename = path.basename(p);

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
		to: toName
	};
	if (toName.match(/\.css$/i)) {
		options.datauri = datauri;
		options.toAbsolutePath = true;
	}
	MinifyCommand.execute(options, function (err) {
		if (err) {
			console.log("Error occur at: " + file);
			console.log(err);
		} else {
			console.log("minify success: %s -> %s", file, path.basename(toName));
		}
		callback && callback(err, toName);
	});
}
/**
 * 处理单个匹配到的文件
 */
var handleFile = function (file, minifyFirst, callback) {
	var uploadFunc = function(newFile){
		 program.confirm("upload to CDN -> " + file + "? ", function (yes) {
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
	if (options.mapper) {
        mapper = require(__dirname + "/../" + options.mapper);
    }
	cdnEndpoint = options.endpoint;
}
/**
 * plugin action
 */
exports.action = function () {
    if (!workspaceRoot) {
        console.log("please set your workspace first");
        console.log("type <att workspace> to set");
        return;
    }
	if(!cdnEndpoint){
		return console.log("please set cdn endpoint first");
	}
    var query = process.argv[3],
        check = argv.c || argv.check,
        files = [];
	
    //是否更新product CDN
    updateProductCDN = argv.p || argv.product
	
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
            return console.log("no file matched.");
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
				if(extname === "css"){
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