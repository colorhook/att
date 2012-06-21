var fs = require("fs"),
	jshint = require("./jshint"),
	csslint = require("./csslint"),
    glob = require("glob");

/**
 * plugin name
 */
exports.name = "lint";

/**
 * plugin description
 */
exports.description = "检查JS&CSS语法";

/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3],
		files = [];

    if (!query) {
        return console.log("the file glob is required");
    }
	jshint.action();
	csslint.action();
};