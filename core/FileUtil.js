var fs = require('fs'),
	wrench = require("wrench"),
	path = require("path"),
	util = require('util');

/**
 * 遍历某个文件夹下的所有文件和文件夹
 */
exports.each = function(dir, callback, options){
	options = options || {};
	dir = dir.replace(/(\/+)$/, '');
	var excludeFile = options.excludeFile,
		excludeDirectory = options.excludeDirectory,
		matchFunction = options.matchFunction,
		breakBeforeFunction = options.breakBeforeFunction,
		breakAfterFunction = options.breakAfterFunction,
		recursive = true,
		root = fs.statSync(dir),
		p,
		i,
		l;

	if(options.recursive === false){
		recursive = false;
	}
	
	if(!root.isDirectory()){
		return [];
	}

	p = fs.readdirSync(dir);
	
	for(i = 0, l = p.length; i < l; i++){
		var name = p[i],
			fullName = dir +"/"+ name,
			ss = fs.statSync(fullName),
			isDir = ss.isDirectory(),
			info = {
				directory: isDir,
				name: name,
				fullName: fullName
			};
		
		if(breakBeforeFunction){
			if(breakBeforeFunction(info)){
				break;
			}
		}

		if(isDir){
			if(recursive){
				this.each(fullName, callback, options);
			}
			if(breakAfterFunction){
				if(breakAfterFunction(info)){
					break;
				}
			}
			if(!excludeDirectory && (!matchFunction || (matchFunction && matchFunction(info)))){
				callback(info);
			}
		}else if(ss.isFile()){
			if(!excludeFile && (!matchFunction || (matchFunction && matchFunction(info)))){
				callback(info);
			}

			if(breakAfterFunction){
				if(breakAfterFunction(info)){
					break;
				}
			}
		}
	}
};

/**
 * 列出某个文件夹下的所有文件和文件夹
 */
exports.list = function(dir, options){
	var result = [];
	exports.each(dir,function(item){
		result.push(item);
	}, options);
	return result;
};

/**
 * copy file
 */
exports.copy = function (src, dst, callback) {
    fs.stat(dst, function(err){
		if (!err) {
			return callback(new Error("File " + dst + " exists."));
		}
		
		var dir = path.dirname(dst);
		if(!path.existsSync(dir)){
			try{
				wrench.mkdirSyncRecursive(dir, 0777);
			}catch(err){
				return callback(err);
			}
		}

		var is = fs.createReadStream(src),
			os = fs.createWriteStream(dst);
	

		try{
			util.pump(is, os, callback);
		}catch(e){
			return callback(e);
		}
	});
};

/**
 * move file
 */
exports.move = function (src, dst, cabllback) {

	fs.stat(dst, function (err) {
		if (!err) {
			return cabllback(new Error("File " + dst + " exists."));
		}

		fs.rename(src, dst, function(err) {
			if (!err) {
				return cabllback(null);
			}
			exports.copy(src, dst, function(err) {
				if (!err) {
					fs.unlink(src, cabllback);
				} else {
					cabllback(err);
				}
			});
		});

	});
};