var util = require("util"),
	path = require("path"),
	Project = require("./core/Project.js").Project;

exports.run = function(inputs, settings){
	var defaults = {
		inputs: [],
		ignoreConfirm: false,
		recursive: false,
		verbose: true
	};

	settings = settings || {};

	for (key in defaults) {
		settings[key] = (typeof settings[key] !== 'undefined') ? settings[key] : defaults[key];
	}

	var project = new Project(__dirname + "/att.json");
	
	if(settings.recursive){
		project.recursive = true;
	}
	if(settings.ignoreConfirm){
		project.ignoreConfirm = true;
	}
	
	if(settings.config){
		project.initOptions(settings.config);
		project.execute(settings.task);
	}else{
		var basedir;
		if(util.isArray(inputs)){
			inputs = inputs[0]
		}
		if(inputs.match(/^\/.+\/$/)){
			inputs = inputs.substring(1, inputs.length - 1);
		}else{
			basedir = path.dirname(inputs);
			if(inputs.basedir){
				basedir = path.join(inputs.basedir, basedir);
			}
			inputs = path.basename(inputs);
			inputs = inputs.replace(/\./g, "\\.").replace(/\*/g, ".*");
		}
		var task = {
			"rule": settings.rule || "min",
			"rule-commands": ["image", "js", "css"],
			"file-filter": inputs,
			"basedir": basedir,
			"builddir": settings.builddir || basedir,
			"listeners": ["logger"]
		}

		project.addTask("terminal", task);
		project.execute("terminal");
	}
	return project;
}