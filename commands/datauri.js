var fs = require('fs'),
	path = require('path'),
	att = require("../att.js");

var transform = exports.transform = function(input, basePath, ieCompat, maxSize){
	if(maxSize === undefined){
		maxSize = 0;
	}
	input = input.replace(/background.*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\).+/gi, function(match, file, type){
		var fileName = basePath + "/" + file + '.' + type;
		var size = fs.statSync(fileName).size;
		if (size > maxSize && maxSize > 0) {
			return match;
		}else {
			var base64 = fs.readFileSync(fileName).toString('base64');
			base64 = 'url("data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + '")';
			var r =  match.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\)/i, base64);
			if(ieCompat){
				if(!match.match(/.*;\s*/)){
					r += ";";
				}
				r += '\r\n*' + match;
			}
			return r;
		}
	});
	return input;
};
/**
 * @name datauri
 */
exports.name = "datauri";

/**
 * @option from
 * @option to
 * @option maxSize {Number|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, callback){

	var from = options.from,
		to = options.to,
		fileContent,
		ieCompat = options.ieCompat,
		charset = options.charset || "utf-8";

	if(!from || !to){
		return callback(new Error("The from and to options are required"));
	}
	if(ieCompat === undefined){
		ieCompat = att.configuration.commands.datauri.ieCompat;
	}
	try{
		fileContent = fs.readFileSync(from, charset);
	}catch(err){
		return callback(err);
	}
	fileContent = transform(fileContent, path.dirname(from), ieCompat, options.maxSize);
	try{
		fs.writeFileSync(to, fileContent, charset);
	}catch(err){
		return callback(err);
	}
	return callback();
};