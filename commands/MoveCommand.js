var path = require('path'),
	FileUtil = require("../core/FileUtil.js");

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
		to = options.to,
		files = options.files,
		dir = options.dir;
	

	if(!to){
		return callback(new Error("The to option is required"));
	}

	if(files){
		var moveFile = function(){
			var file = files.shift();
			if(file){
				FileUtil.move(file, to + "/" + path.relative(dir, item ), function(e){
					if(e){
						return callback(e);
					}
					moveFile();
				});
			}else{
				callback();
			}
		}
		moveFile();
	}else{
		if(!from){
			return callback(new Error("The from option is required"));
		}
		FileUtil.move(from, to, callback);
	}
};