var minimatch = require("minimatch"),
	FileUtil = require("./FileUtil.js");


/**
 * @option dir
 * @option files
 * @option glob
 * @option excludes
 * @option regexp
 * @option casesensitive
 * @option matchBase
 */
var getFiles = function(options){
	var files = [];

	if(options.files){
		if(!util.isArray(files)){
			files = files.split(',');
		}
		return files;
	}
	if(!options.dir){
		return files;
	}
	FileUtil.each(options.dir, function(item){
		var m;
		if(options.excludes){
			m = minimatch(item.fullName, options.excludes, {nocase: !options.casesensitive, matchBase: options.matchBase});
		}
		if(m){
			return;
		}
		if(options.glob){
			m = minimatch(item.fullName, options.glob, {nocase: !options.casesensitive, matchBase: options.matchBase});
		}else if(options.regexp){
			var fileName = options.matchBase ? item.name : item.fullName;
			m = new RegExp(options.regexp, options.casesensitive ? "i" : null);
			m = m.test(item.fullName);
		}
		if(m){
			files.push(item.fullName);
		}
		
	});
	return files;
}


var FileSet = function(){
	this.dir = null;
	this.files = null;
	this.glob = null;
	this.excludes = null;
	this.regexp = null;
	this.casesensitive = false;
	this.matchBase = false;
}

FileSet.prototype.getFiles = function(){
	return getFiles(this);
}

exports.getFiles = getFiles;
exports.FileSet = FileSet;