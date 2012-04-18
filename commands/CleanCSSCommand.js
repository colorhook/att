var fs = require('fs'),
	cleanCSS = require('clean-css');

var transform = exports.transform = function(input){
	return cleanCSS.process(input);
}

/**
 * @name cleancss
 */
exports.name = "cleancss";

/**
 * @option from {String}
 * @option to {String}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, callback){
	var fileContent,
		from = options.from,
		to = options.to,
		charset = options.charset || "utf-8";

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}

	try{
		fileContent = fs.readFileSync(from, charset);
	}catch(err){
		return callback(err);
	}
	fileContent = transform(fileContent);
	try{
		fs.writeFileSync(to, fileContent, charset);
	}catch(err){
		return callback(err);
	}
	return callback();
};