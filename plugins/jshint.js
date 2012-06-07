var jshint = require("jshint/lib/hint.js"),
    glob = require("glob");

/**
 * plugin name
 */
exports.name = "jshint";

/**
 * plugin description
 */
exports.description = "check js syntax";

/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3];

    if (!query) {
        return console.log("the file glob is required");
    }
    glob(query, function (err, files) {
        if (jshint.hint(files).length === 0) {
            console.log("Perfect!");
        }
    });
};