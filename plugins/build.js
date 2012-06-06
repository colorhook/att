var path = require("path"),
    fs = require("fs"),
	argv = require('optimist').argv,
	parser = require("../parser/XMLParser.js");

/**
 * plugin name
 */
exports.name = "build";

/**
 * plugin description
 */
exports.description = "build task by xml configuration";

/**
 * plugin action
 */
exports.action = function(query, options){
	var file,
		task;
	if(argv.f || argv.file){
		file = argv.f || argv.file;
	}
	if(argv.t || argv.task){
		task = argv.t || argv.task;
	}else{
		task = process.argv[3];
		if(task && task[0] == '-'){
			task = null;
		}
	}
	file = file || "att.xml";
	
	
	if(!path.existsSync(file)){
		return console.log("Buildfile: " + file + " does not exist!");
	}

	var stat = fs.statSync(file);
	if(stat.isDirectory()){
		file = path.resolve(file + "/att.xml");
	}

	if(!path.existsSync(file)){
		return console.log("Buildfile: " + file + " does not exist!");
	}
	
	var project;
	
	try{
		project = parser.parseFile(file);
	}catch(err){
		return console.log("Build Parse Error: " + err.message);
	}
	project.run(task);
};