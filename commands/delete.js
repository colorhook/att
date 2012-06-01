var fs = require('fs'),
    path = require('path'),
	Project = require('../core/Project.js').Project,
	wrench = require('wrench');

/**
 * @name delete
 */
exports.name = "delete";

/**
 * @option target {String}
 * @option files {Array}
 */
var execute = function(options, callback){

	var target = options.target,
		files = options.files,
		dir = options.dir,
		exists,
		stat;


	if(files){
		var deleteFile = function(){
			var file = files.shift();
			if(!file){
				return callback();
			}
			execute({target: file}, function(e){
				if(e){
					return callback(e);
				}
				deleteFile();
			});
		};
		return deleteFile();
	}
	
	if(!target){
		return callback(new Error("The target options is required"));
	}
	
	if(Project.currentProject){
		target = path.resolve(Project.currentProject.basedir, target);
	}

	exists = path.existsSync(target);

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


exports.execute = execute;