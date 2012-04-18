var fs = require('fs'),
	wrench = require('wrench');

/**
 * @name mkdir
 */
exports.name = "mkdir";

/**
 * @option target {String}
 */
exports.execute = function(options, callback){
	options = options || {};
	var target = options.target;

	if(!target){
		return callback(new Error("The target options is required"));
	}
	try{
		wrench.mkdirSyncRecursive(target, options.permission || 0777);
	}catch(err){
		return callback(err);
	}
	return callback();
};