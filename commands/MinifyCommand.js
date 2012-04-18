var uglifyjsCommand = require("./UglifyJSCommand.js"),
	smushitCommand = require("./SmushitCommand.js"),
	cleancssCommand = require("./CleanCSSCommand.js"),
	htmlminifierCommand = require("./HTMLMinifierCommand.js");

/**
 * @name minify
 */
exports.name = "minify";


var commandMap = {
	"js": uglifyjsCommand,
	"css": cleancssCommand,
	"image": smushitCommand,
	"html": htmlminifierCommand
};
/**
 * @option from
 * @option to
 * @option type [default js]
 */
exports.execute = function(options, callback){
	var type = options.type || "js",
		command = commandMap[type],
		from = options.from,
		to = options.to;

	if(!from || !to || !command){
		return callback(new Error("The from, to and command options are required"));
	}

	command.execute(options, callback);
};