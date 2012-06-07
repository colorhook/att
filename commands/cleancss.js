var fs = require('fs'),
    cleanCSS = require('clean-css');

/**
 * minify css
 */
var transform = exports.transform = function (input) {
        return cleanCSS.process(input);
    };
/**
 * command name
 */
exports.name = "cleancss";

/**
 * @option from
 * @option to
 */
exports.execute = function (options, callback) {
    var fileContent, from = options.from,
        to = options.to,
        charset = options.charset || "utf-8";

    if (!from || !to) {
        return callback(new Error("In cleancss task the from and to options are required."));
    }

    try {
        fileContent = fs.readFileSync(from, charset);
    } catch (err) {
        return callback(err);
    }
    fileContent = transform(fileContent);
    try {
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};