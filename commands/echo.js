/**
 * command name
 */
exports.name = "echo";
/**
 * @option content {String}
 */
exports.execute = function (options, callback) {
    var log = options ? (options.value || "") : "";
    console.log(log);
    return callback();
};