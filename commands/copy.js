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

    var from = options.from,
        to = options.to,
        files = options.files,
        dir = options.fileset.dir;

    if (!to) {
        return callback(new Error("In copy task the to option is required."));
    }

    if (files) {
        var copyFile = function () {

                var file = files.shift();
                if (!file) {
                    return callback();
                }

                var fdir = path.dirname(file),
                    stat = fs.statSync(file),
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
        if (!from) {
            return callback(new Error("The from option is required"));
        }
        FileUtil.copy(from, to, callback);
    }
};