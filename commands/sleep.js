var commander = require("commander");

/**
 * command name
 */
exports.name = "sleep";


/**
 * @option time
 */
exports.execute = function (options, callback) {
    var time = Number(options.time);
    if (!time || isNaN(time) || time <= 0) {
        return new Callback(new Error("In sleep task the time must be a number greater than 0."));
    }

    setTimeout(function () {
        callback();
    }, time);
};