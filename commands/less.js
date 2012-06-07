var fs = require('fs'),
	less = require('less'),
	att = require("../att.js");

/**
 * command name
 */
exports.name = "less";

/**
 * @option from
 * @option to
 */
exports.execute = function(options, callback){

	var from = options.from,
		to = options.to,
		fileContent,
		parser = new (less.Parser)(options),
		charset = options.charset || "utf-8",
		defaults = att.configuration.commands.less || {};

	if(options.compress !== undefined){
		defaults.compress = options.compress;
	}

	if(!from || !to){
		return callback(new Error("In less task the from and to options are required."));
	}

	try{
		fileContent = fs.readFileSync(from, charset);
	}catch(err){
		return callback(err);
	}

	parser.parse(fileContent, function (e, tree) {
		if(e){
			return callback(e);
		}
		fileContent = tree.toCSS(defaults); 
		
		try{
			fs.writeFileSync(to, fileContent, charset);
		}catch(e2){
			return callback(e2);
		}
		return callback();
	});
};