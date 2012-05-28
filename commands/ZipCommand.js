var fs = require("fs"),
	path = require('path'),
	util = require("util"),
	fileset = require("../core/FileSet.js"),
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
		files = options.files,
		zipFiles = [];

	if(!to){
		return callback(new Error("The to options are required"));
	}
	if(!files){
		return callback(new Error("The fileset option must be specified"));
	}

	files.forEach(function(item){
		var stat = fs.statSync(item);
		if(stat.isFile()){
			zipFiles.push({name: path.relative(options.dir, item ), path: item});
		}
	});
	var archive = new zip();
	archive.addFiles(zipFiles, function (err) {
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