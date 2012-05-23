var path = require("path"),
	argv = require('optimist').argv
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
		return console.log("the configuration file " + file + " not found.");
	}
	var project = parser.parseFile(file);
	project.run(task);
}