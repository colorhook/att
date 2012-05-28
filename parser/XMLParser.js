var fs = require("fs"),
    path = require("path");
	XML = require("node-jsxml").XML,
	pParser = require("node-properties-parser"),
	AttUtil = require("../core/AttUtil.js"),
	commandManager = require("../core/CommandManager.js"),
	FileSet = require("../core/FileSet.js"),
	Project = require("../core/Project.js").Project,
	Target = require("../core/Target.js").Target;


var format,
/**
 * 解析Att的XML build文档
 * @see parseFile
 */
parse = function(data){
	var xml, 
		node,
		logLevel,
		getAttr,
		project = new Project();
	
	format = function(str){
		return project.format(str);
	};
	getAttr = function(xml, attr){
		return format(xml.attribute(attr).toString());
	};
	xml = new XML(data);
	
	//初始化property
	xml.child('property').each(function(item){
		var key = getAttr(item, 'name'),
			value = getAttr(item, 'value') || format(item.text().toString()),
			file = getAttr(item, 'file');
		
		if(file){
			var data = parsePropertiesFile(file);
			for(var i in data){
				project.addProperty(i, data[i]);
			}
		}else if(key !== ""){
			project.addProperty(key, value);
		}
	});

	//初始化属性
	project.name = getAttr(xml, 'name');
	project.description = getAttr(xml, 'description');
	project.defaultTargetName = getAttr(xml, 'default') || "build";
	project.basedir = getAttr(xml, 'basedir') || process.cwd();
	logLevel  = getAttr(xml, 'logLevel');
	if(logLevel){
		project.logLevel = project.logLevel;
	}
	
	//初始化插件
	xml.child('plugin').each(function(item){
		var file = getAttr(item, 'file');
		if(path.existSync(file)){
			commandManager.addCommand(file);
		}else{
			throw new Error("The plugin not found at " + file);
		}
	});

	//初始化监听器
	xml.child('listener').each(function(item){
		var key = getAttr(item, 'name'),
			value = getAttr(item, 'value') || format(item.text().toString());
		if(key !== ""){
			project.addListener(key, value);
		}
	});
	
	//初始化target
	xml.child('target').each(function(item){
		var name = getAttr(item, 'name'),
			desc = getAttr(item, 'description'),
			depends = getAttr(item, 'depends');
		
		if(name === ""){
			throw new Error("The target must have a name");
		}

		var target = new Target();
		target.name = name;
		target.description = desc;
		if(depends !== ""){
			target.depends = depends.split(",");
		}

		item.children().each(function(child){
			var localName = child.localName(), 
				command = commandManager.getCommand(localName),
				options;

			if(!command){
				throw new Error("Cannot find the command named " + localName);
			}
			if(command.parseXML){
				options = command.parseXML(child, project) || {};
			}else{
				options = {value:  child.text().toString()};
				child.attributes("*").each(function(attr){
					options[attr.localName()] = attr.toString();
				});
			
				var mapper = child.child("mapper").attribute("type").toString(),
					filesetNode = child.child("fileset");

				if(mapper !== ""){
					options.mapper = format(mapper);
				}
				if(filesetNode.length()){
					var set = parseFileSet(filesetNode);
					if(set){
						options.files = FileSet.getFiles(set);
						options.fileset = set;
					}
				}else{
					if(options.from && options.from !== ""){
						var arr = options.from.split(",");
						options.files = arr;
					}else{
						options.files = null;
					}
				}
			}
			target.addCommand(localName, options);
		});
		project.addTarget(name, target);
	});
	return project;
},

/**
 * 解析FileSet
 */
parseFileSet = function(filesetNode){
	var set = {includes:[], excludes:[]};
	filesetNode.attributes("*").each(function(attr){
		set[attr.localName()] = format(attr.toString());
	});
	if(!set.dir){
		return;
	}
	set.casesensitive = AttUtil.toBoolean(set.casesensitive);
	
	var addIncludeOrExclude = function(item, include){
		var host = include ? set.includes : set.excludes;
		if(item.glob && item.glob !== ""){
			host.push({type: 'glob', value: item.glob});
		}
		if(item.regexp && item.regexp !== ""){
			host.push({type: 'regexp', value: item.regexp});
		}
		if(item.file && item.file !== ""){
			host.push({type: 'file', value: item.file});
		}
	};
	filesetNode.child("include").each(function(item){
		addIncludeOrExclude({
			glob: item.attribute('glob').toString(),
			regexp: item.attribute('regexp').toString(),
			file: item.attribute('file').toString()
		}, true);
	});
	filesetNode.child("exclude").each(function(item){
		addIncludeOrExclude({
			glob: item.attribute('glob').toString(),
			regexp: item.attribute('regexp').toString(),
			file: item.attribute('file').toString()
		});
	});
	return set;
},
/**
 * 解析XML文档文件
 */
parseFile = function(file, charset){
	var content = fs.readFileSync(file, charset || 'utf-8');
	return parse(content);
},
/**
 * parse propertiesFile
 */
parsePropertiesFile = function(file, charset){
	var content = fs.readFileSync(file, charset || 'utf-8');
	return pParser.parse(content);
};

exports.parse = parse;
exports.parseFile = parseFile;