var fs = require("fs");

/**
 * command name
 */
exports.name = "rename";

/**
 * @option from
 * @option to
 */
exports.execute = function (options, callback) {
    var from = options.from,
        to = options.to;

    if (!from || !to) {
        return callback(new Error("In rename task the from and to options are required."));
    }
    fs.rename(from, to, callback);
};