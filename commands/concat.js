var fs = require("fs"),
    path = require("path"),
    wrench = require('wrench'),
    util = require("util");

/**
 * command name
 */
exports.name = "concat";

/**
 * @option from
 * @option to
 * @option fileset
 * @option charset
 */
exports.execute = function (options, callback) {

    var from = options.from,
        to = options.to,
        fileset = options.fileset,
        files = options.files,
        fileContent = "",
        split = options.split,
        charset = options.charset || "utf-8";

    if (!to) {
        return callback(new Error("In concat task the to options are required"));
    }
    if (!fileset && !from) {
        return callback(new Error("In concat task the from or fileset must be specified"));
    }
    if (fileset) {
        from = files;
    } else if (!util.isArray(from)) {
        from = from.split(",");
    }

    var toDir = path.dirname(to);
    if (!path.existsSync(toDir)) {
        wrench.mkdirSyncRecursive(toDir, 0777);
    }
    try {
        from.forEach(function (item) {
            fileContent += fs.readFileSync(item.trim(), charset);
            if (split) {
                var map = [
                    [/\\r/g, '\r'],
                    [/\\n/g, '\n'],
                    [/\\t/g, '\t'],
                    [/\\f/g, '\f'],
                    [/\\v/g, '\v']
                ];
                map.forEach(function (item) {
                    split = split.replace(item[0], item[1]);
                });
                fileContent += split;
            }
        });
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};