var fs = require("fs"),
    exec = require("child_process").exec;

/**
 * command name
 */
exports.name = "exec";
/**
 * @option line
 */
exports.execute = function (options, callback) {
    options = options || {};
    if (!options.line && !options.value) {
        return callback(new Error("In exec task the line option is required."));
    }
    exec(options.line || options.value, callback);
};