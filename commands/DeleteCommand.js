var fs = require('fs'),
    path = require('path'),
	wrench = require('wrench');


/**
 * @name rm
 */
exports.name = "delete";

/**
 * @option target {String}
 */
exports.execute = function(options, callback){
	
	options = options || {};

	var target = options.target,
		exists,
		stat;

	if(!target){
		return callback(new Error("The target options is required"));
	}

	var exists = path.existsSync(target);

	if(!exists){
		return callback();
	}
	
	stat = fs.statSync(target);

	if(stat.isDirectory()){
		try{
			wrench.rmdirSyncRecursive(target, true);
		}catch(err){
			return callback(err);
		}
		return callback();
	}else if(stat.isFile()){
		fs.unlink(target, function (err) {
			if(err){
				return callback(err);
			}else{
				return callback();
			}
		});
	}else{
		return callback();
	}
};