var fs = require('fs'),
	XML = require("node-jsxml").XML,
	pParser = require("node-properties-parser"),
	commandManager = require("../core/CommandManager").commandManager,
	fileset = require("../core/FileSet.js");
	Project = require("../core/Project.js").Project,
	Target = require("../core/Target.js").Target;

var parse = function(data){
	var xml, 
		node,
		project = new Project(),
		toBoolean = function(v){
			if(!v){
				return false;
			}
			v = v.toLownerCase();
			if(v == "1" || v == "true" || v == "ok" || v== "yes"){
				return true;
			}
			return false;
		};

	xml = new XML(data);

	project.name = xml.attribute('name').toString();
	project.description = xml.attribute('description').toString();

	xml.child('import').each(function(item){
		var data = parserPropertiesFile(item.attribute('file').toString());
		if(data){
			for(var i in data){
				project.addProperty(i, data[i]);
			}
		}
	});

	xml.child('properties').child('property').each(function(item){
		var key = item.attribute('name').toString(),
			value = item.attribute('value').toString(),
			content = item.text().toString();

		if(key != ""){
			project.addProperty(key, content || value);
		}
	});

	xml.child('listeners').child('listener').each(function(item){
		var key = item.attribute('name').toString(),
			value = item.attribute('value').toString(),
			content = item.text().toString();

		if(key != ""){
			project.addListener(key, content || value);
		}
	});

	xml.child('targets').child('target').each(function(item){
		var name = item.attribute('name').toString(),
			desc = item.attribute('description').toString(),
			depends = item.attribute('depends').toString(),
			content = item.text().toString();
		
		if(name == ""){
			return;
		}

		var target = new Target();
		target.name = name;
		target.description = desc;
		target.depends = depends.split(",");

		item.children().each(function(child){
			var localName = child.localName(), 
				options = {};

			if(!commandManager.hasCommand(localName)){
				return;
			}
			var filesetNode,
				files,
				mapper,
				set = {};
			
			options.content = child.text().toString();
			child.attributes("*").each(function(attr){
				options[attr.localName()] = attr.toString();
			});
			
			
			mapper = child.child("mapper").attribute("type").toString();
			filesetNode = child.child("fileset");
			
			if(mapper == ""){
				mapper = null;
			}

			if(filesetNode.length()){
				filesetNode.attributes("*").each(function(attr){
					set[attr.localName()] = attr.toString();
				});
				set.casesensitive = toBoolean(set.casesensitive);
				files = fileset.getFiles(set);
			}else{
				set = null;
				files = [];
			}
			
			target.addCommand(localName, options, fileset, mapper);
			
		});

		project.addTarget(name, target);
	});

	return project
};


var parseFile = function(file, charset){
	var content = fs.readFileSync(file, charset || 'utf-8');
	return parse(content);
}

var parserPropertiesFile = function(file, charset){
	var content = fs.readFileSync(file, charset || 'utf-8');
	return pParser.parse(content);
}

exports.parse = parse;
exports.parseFile = parseFile;