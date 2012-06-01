var commander = require("commander");

/**
 * @name input
 */
exports.name = "input";


/**
 * @option name
 * @option label
 */
exports.execute = function(options, callback){
	var name = options.name,
		label = options.label,
		type = options.type,
		method = "prompt",
		dv = options["default"] || "";
	
	if(!name || !label){
		return callback(new Error("The name and label options are required"));
	}

	if(type == "password"){
		method = "password";
	}

	commander[method](label + " ", function(v){
		if(!v || v === ""){
			v = dv;
		}
		if(type && type.toLowerCase() === 'boolean'){
			v = Boolean(v);
		}
		Project.currentProject.addProperty(name, v);
		process.stdin.destroy();
		callback();
	});
};