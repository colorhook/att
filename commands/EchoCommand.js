/**
 * @name echo
 */
exports.name = "echo";

/**
 * @option content {String}
 */
exports.execute = function(options, callback){
	console.log(options ? (options.content || "") : "");
	return callback();
};