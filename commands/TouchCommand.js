var fs = require('fs'),
	path = require('path'),
	wrench = require('wrench');


/**
 * @name touch
 */
exports.name = "touch";

/**
 * @option target {String}
 */
exports.execute = function(options, callback){
	options = options || {};

	var target = options.target,
		dirname,
		content = options.content || "",
		charset = options.charset || "utf-8";
	
	if(!target){
		return callback(new Error("The target option is required"));
	}

	dirname = path.dirname(target);

	if(!path.existsSync(dirname)){
		try{
			wrench.mkdirSyncRecursive(dirname, options.permission || 0777);
		}catch(err){
			return callback(err);
		}
	}
	try{
		fs.writeFileSync(target, content, charset);
	}catch(err){
		return callback(err);
	}
	return callback();
};