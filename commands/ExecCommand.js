var fs = require("fs"),
	exec = require("child_process").exec;


/**
 * @name exec
 */
exports.name = "exec";

/**
 * @option line
 */
exports.execute = function(options, callback){
	options = options || {};
	if(!options.line && !options.content){
		return callback(new Error("The line option is required"));
	}
	exec(options.line || options.content, callback);
};