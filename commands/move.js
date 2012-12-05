var path = require('path'),
    fs = require('fs'),
    FileUtil = require("../core/FileUtil.js");

/**
 * command name
 */
exports.name = "move";

/**
 * @option from
 * @option to
 */
exports.execute = function (options, callback) {
    var from = options.from,
        to = options.to,
        files = options.files,
        dir = options.fileset ? options.fileset.dir : null;

    console.log(options);

    if (!to) {
        return callback(new Error("In move task the to option is required."));
    }
    
    if(from){

         FileUtil.move(from, to, callback);

    }else if (files && dir) {

        var moveFile = function () {
                var file = files.shift();
                
                if (file) {
                    var stat = fs.statSync(file);
                    var toPath = path.resolve(to + "/" + path.relative(dir, file));
                    
                    if (stat.isDirectory()) {
                        return moveFile();
                    }

                    FileUtil.move(file, toPath, function (e) {
                        if (e) {
                            return callback(e);
                        }
                        moveFile();
                    });
                } else {
                    callback();
                }
            };
        moveFile();
    } else {
        return callback(new Error("In move task the from or fileset option is required."));
    }
};