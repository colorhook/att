var fs = require('fs'),
	less = require('less');



/**
 * @name less
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
		charset = options.charset || "utf-8";

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
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
		fileContent = tree.toCSS({ compress: options.compress }); 
		
		try{
			fs.writeFileSync(to, fileContent, charset);
		}catch(e2){
			return callback(e2);
		}
		return callback();
	});
};