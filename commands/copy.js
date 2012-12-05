var fs = require('fs'),
    path = require("path"),
    wrench = require('wrench'),
    FileUtil = require("../core/FileUtil.js");
/**
 * command name
 */
exports.name = "copy";
/**
 * @option from
 * @option to
 * @option files
 * @option dir
 */
exports.execute = function (options, callback) {
    
    console.log(options);


    var from = options.from,
        to = options.to,
        files = options.files,
        dir = options.fileset ? options.fileset.dir : null;

    if (!to) {
        return callback(new Error("In copy task the to option is required."));
    }
    
    if(from){

         FileUtil.copy(from, to, callback);

    }else if (files) {
        var copyFile = function () {
                var file = files.shift();
                if (!file) {
                    return callback();
                }

                var stat = fs.statSync(file),
                    toDir;

                if (stat.isDirectory()) {
                    return copyFile();
                }

                if (file) {
                    toPath = path.resolve(to + "/" + path.relative(dir, file));
                    toDir = path.dirname(toPath);
                    

                    if (!path.existsSync(toDir)) {
                        try {
                            wrench.mkdirSyncRecursive(toDir, 0777);
                        } catch (err) {
                            console.log(err);
                            return callback(err);
                        }
                    }
                    FileUtil.copy(file, toPath, function (e) {
                        if (e) {
                            return callback(e);
                        }
                        copyFile();
                    });
                } else {
                    callback();
                }
            };
        copyFile();

    } else {
        return callback(new Error("The from option or fileset is required"));
    }
};