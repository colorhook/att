var jshint = require("jshint/lib/hint.js"),
	glob = require("glob");


/**
 * plugin name
 */
exports.name = "jshint";

/**
 * plugin description
 */
exports.description = "jshint";

/**
 * plugin action
 */


exports.initialize = function(options){
};

exports.action = function(){
	var query = process.argv[3];

	if(!query){
		return console.log("the file glob is required");
	}
	glob(query, function(err, files){
		jshint.hint(files);
	});
};