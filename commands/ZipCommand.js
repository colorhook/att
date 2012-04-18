var fs = require("fs"),
	path = require('path'),
	util = require("util"),
	FileUtil = require("../core/FileUtil.js"),
	zip = require("node-native-zip");



/**
 * @name zip
 */
exports.name = "zip";

/**
 * @option from || dir
 * @option to
 */
exports.execute = function(options, callback){


	var from = options.from,
		to = options.to,
		dir = options.dir,
		files = [],
		charset = options.charset || "utf-8";
	
	if(!to){
		return callback(new Error("The to options are required"));
	}
	if(!from && !dir){
		return callback(new Error("The one option of from and dir must define"));
	};

	var archive = new zip();
	
	if(!util.isArray(from)){
		from = from.split(",");
	}

	if(from){
		from.forEach(function(item){
			if(item.path){
				files.push(item)
			}else{
				files.push({name: item, path: item});
			}
		});
	}else{
		var includeFilter,
			excludeFilter;
		if(options.includeFilter){
			includeFilter = new RegExp(options.includeFilter, 'i');
		}
		if(options.excludeFilter){
			excludeFilter = new RegExp(options.excludeFilter, 'i');
		}
		FileUtil.each(dir, function(item){
			if(item.directory){
				return;
			}
			if(excludeFilter && excludeFilter.test(item.fullName)){
				return;
			}
			if(includeFilter && !includeFilter.test(item.fullName)){
				return;
			}
			files.push({name: item.fullName, path: item.fullName});
		});
	}


	archive.addFiles(files, function (err) {
		if (err){
			return callback(err);
		}
		var buff = archive.toBuffer();
		fs.writeFile(to, buff, function (err){
			if(err){
				return callback(err);
			}
			return callback();
		});
	});
};