var minimatch = require("minimatch"),
	path = require("path"),
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
		if(!util.isArray(options.files)){
			options.files = options.files.split(',');
		}
		return options.files;
	}
	if(!options.dir){
		return files;
	}
	if(options.matchBase === undefined){
		options.matchBase = true;
	}

	var matchItem = function(item, fullname){
		var m;
		if(item.type == 'glob'){
			m =  minimatch(fullname, item.value, {nocase: !options.casesensitive, matchBase: options.matchBase});
		}else if(item.type == 'regexp'){
			m = new RegExp(item.value, options.casesensitive ? "i" : undefined);
			m = m.test(fullname);
		}else if(item.type == 'file'){
			m = path.normalize(fullname) == path.normalize(options.dir + '/' + item.value);
		}
		return m;
	};
	FileUtil.each(options.dir, function(item){
		var m, i, l, fullname = item.fullName;
		for(i = 0, l = options.includes.length; i < l; i++){
			if(matchItem(options.includes[i], fullname)){
				files.push(item.fullName);
				return;
			}
		}
		for(i = 0, l = options.excludes.length; i < l; i++){
			if(matchItem(options.excludes[i], fullname)){
				return;
			}
		}
		files.push(item.fullName);
	});
	return files;
};


var FileSet = function(){
	this.dir = null;
	this.excludes = [];
	this.includes = [];
	this.casesensitive = false;
	this.matchBase = true;
};

FileSet.prototype.getFiles = function(){
	return getFiles(this);
};

exports.getFiles = getFiles;
exports.FileSet = FileSet;