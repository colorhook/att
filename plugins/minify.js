var path = require("path"),
	glob = require("glob"),
	wrench = require("wrench"),
	MinifyCommand = require("../commands/MinifyCommand.js");

/**
 * plugin name
 */
exports.name = "minify";

/**
 * plugin description
 */
exports.description = "minify js, css, image and html";

var toPath = function(file){
	var p = path.resolve( __dirname + "/../tmp/" + file),
		dirname = path.dirname(p);

	if(!path.existsSync(dirname)){
		try{
			wrench.mkdirSyncRecursive(dirname, 0777);
		}catch(err){}
	}
	return p;
};
/**
 * plugin action
 */
exports.action = function(query){
	glob(query, function(err, files){
		files.forEach(function(file){
			MinifyCommand.execute({
				from: file,
				to: toPath(file)
			}, function(err){
				if(err){
					console.log("Error occur while handling file: " + file);
					console.log(err);
				}else{
					console.log("Minify success at file: " + file);
				}
			});
		});
	});
}