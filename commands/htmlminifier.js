var fs = require("fs"),
    att = require("../att.js"),
    minify = require("html-minifier").minify;


/**
 * command name
 */
exports.name = "htmlminifier";

/**
 * @option from
 * @option to
 * @option charset
 */
exports.execute = function (options, callback) {
    var from = options.from,
        to = options.to,
        fileContent, charset = options.charset || "utf-8",
        htmlOptions = att.configuration.commands.htmlminifier,
        defaults = htmlOptions;

    for (var i in defaults) {
        if (options[i] !== undefined) {
            defaults[i] = Boolean(options[i]);
        }
    }
    if (!from || !to) {
        return callback(new Error("In htmlminifier task the from and to options are required"));
    }
    try {
        fileContent = fs.readFileSync(from, charset);
    } catch (err) {
        return callback(err);
    }
    try {
        fileContent = minify(fileContent, defaults);
    } catch (e) {
        return callback(e);
    }

    try {
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};