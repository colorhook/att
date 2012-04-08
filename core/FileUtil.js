var fs = require('fs');

/**
 * ����ĳ���ļ����µ������ļ����ļ���
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
 * �г�ĳ���ļ����µ������ļ����ļ���
 */
exports.list = function(dir, options){
	var result = [];
	exports.each(dir,function(item){
		result.push(item);
	}, options);
	return result;
};
