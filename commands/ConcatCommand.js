var fs = require("fs"),
	util = require("util");


/**
 * @name concat
 */
exports.name = "concat";

/**
 * @option inputFileName
 * @option outputFileName
 * @option yuicompressor
 * @option charset
 */
exports.execute = function(options, callback){

	var from = options.from,
		to = options.to,
		fileContent = "",
		split = options.split,
		charset = options.charset || "utf-8";

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}
	if(!util.isArray(from)){
		from = from.split(",");
	}
	
	try{
		from.forEach(function(item){
			fileContent += fs.readFileSync(item.trim(), charset);
			if(split){
				fileContent += split;
			}
		});
		fs.writeFileSync(to, fileContent, charset);
	}catch(err){
		return callback(err);
	}
	return callback();
};