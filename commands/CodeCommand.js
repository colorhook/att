var vm = require("vm"),
	Project = require("../core/Project.js").Project;

/**
 * @name code
 */
exports.name = "code";

/**
 */
exports.execute = function(options, callback){
	var code = options.value,
		pname = options.output,
		output,
		project = Project.currentProject;
		
	options.project = project;
	if(!code){
		return callback(new Error("no code specify"));
	}
	try{
		eval(code);
	}catch(e){
		return callback(e);
	}
	Project.currentProject.addProperty(pname, output);
	return callback();
};