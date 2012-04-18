var fs = require("fs"),
	minify = require("html-minifier").minify;


/**
 * @name htmlminify
 */
exports.name = "htmlminifier";

/**
 * @option from
 * @option to
 * @option charset
 */
exports.execute = function(options, callback){


	var from = options.from,
		to = options.to,
		fileContent,
		charset = options.charset || "utf-8",
		defaults = {
			removeComments:                 true,
			removeCommentsFromCDATA:        true,
			removeCDATASectionsFromCDATA:   true,
			collapseWhitespace:             true,
			collapseBooleanAttributes:      true,
			removeAttributeQuotes:          false,  
			removeRedundantAttributes:      true,
			useShortDoctype:                true,
			removeEmptyAttributes:          true,
			removeEmptyElements:            false,
			removeOptionalTags:             false,
			removeScriptTypeAttributes:     true,
			removeStyleLinkTypeAttributes:  true
		}
	
	for(var i in defaults){
		if(options[i] != undefined){
			defaults[i] = Boolean(options[i]);
		}
	}

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}
	try{
		fileContent = fs.readFileSync(from, charset);
	}catch(err){
		return callback(err);
	}
	try{
		fileContent = minify(fileContent, defaults);
	}catch(e){
		return callback(e);
	}

	try{
		fs.writeFileSync(to, fileContent, charset);
	}catch(err){
		return callback(err);
	}
	return callback();
};