var FileUtil = require("../core/FileUtil.js");

/**
 * @name move
 */
exports.name = "move";

/**
 * @option from
 * @option to
 */
exports.execute = function(options, callback){
	var from = options.from,
		to = options.to;

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}
	FileUtil.move(from, to, callback);
};