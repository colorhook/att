var path = require("path"),
    glob = require("glob"),
    fs = require("fs"),
    argv = require('optimist').argv,
    program = require("commander"),
    att = require("../att.js"),
    minifyPlugin = require("./minify"),
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
    minifySupportedFileType = ["html", "htm", "jpg", "jpeg", "gif", "png", "js", "css"],
    minifyNotYesSupportedFileType = ["jpg", "jpeg", "gif", "png"],
    currentWorkspace = att.configuration.currentWorkspace || "default",
    workspaceRoot, cdnEndpoint;

if (!att.configuration.workspaces) {
    att.configuration.workspaces = {};
}
workspaceRoot = att.configuration.workspaces[currentWorkspace];
cdnEndpoint = att.configuration.cdnEndpoint;

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
			minifyPlugin.minifyFile(file, function (err, newFile) {
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
 * plugin action
 */
exports.action = function () {
    if (!workspaceRoot) {
        console.log("please set your workspace first");
        console.log("type <att workspace> to set");
        return;
    }
    var query = process.argv[3],
        silent = argv.s || argv.silent,
        files = [];
	
	console.log(query);

    //是否更新product CDN
    updateProductCDN = argv.p || argv.product

    glob(query, function (err, matched) {
		console.log(matched);
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
        if (silent) {
            files.forEach(function (file) {
                handleFile(file);
            });
        } else {
            AttUtil.doSequenceTasks(files, function (file, callback) {
                var extname = path.extname(file).replace(/\./, "").toLowerCase();
                if (minifySupportedFileType.indexOf(extname) !== -1) {
                    program.confirm("minify the file -> " + file + "? ", function (yes) {
                        if (yes) {
                            handleFile(file, true, callback);
                        } else if (minifyNotYesSupportedFileType.indexOf(extname) !== -1) {
                            handleFile(file, false, callback);
                        } else {
                            callback();
                        }
                    });
                } else {
					handleFile(file, false, callback);
                }
            }, function () {
                process.stdin.destroy();
            });
        }
    });

};