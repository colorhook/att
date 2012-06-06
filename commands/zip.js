/**
 * download the native executable program at
 * http://stahlworks.com/dev/index.php?tool=zipunzip
 */
var exec = require("child_process").exec,
	path = require("path");

/**
 * @name zip
 */
exports.name = "zip";

/**
 * @option from
 * @option to
 */
exports.execute = function(options, callback){

	var from = options.from,
		to = options.to,
		files = options.files;

	if(!from || !to){
		return callback(new Error("The dir and to options are required"));
	}
	var cwd = path.dirname(from);
	from = path.relative(cwd, from);
	exec("zip -r " + to + " " + from, {
		cwd: cwd,
		env: process.env
	}, callback);
};