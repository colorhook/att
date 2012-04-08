var fs = require('fs'),
	path = require('path');


var transform = exports.transform = function(input, basePath, maxSize){
	if(maxSize == undefined){
		maxSize = 0;
	}
	input = input.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\)/gi, function(match, file, type){
		var fileName = basePath + "/" + file + '.' + type;
		var size = fs.statSync(fileName).size;
		if (size > maxSize && maxSize > 0) {
			return match;
		}else {
			var base64 = fs.readFileSync(fileName).toString('base64');
			return 'url("data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + '")';
		}
	});
	return input;
};
/**
 * @option input {String|Optional}
 * @option inputFileName {String|Optional}
 * @option outputFileName {String|Optional}
 * @option maxSize {Number|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, success, fail){
	var fileContent,
		charset = options.charset || "utf-8";
	if(!options.input && options.inputFileName){
		options.input = fs.readFileSync(options.inputFileName, charset);
	}
	if(options.input){
		fileContent = transform(options.input, path.dirname(options.inputFileName), options.maxSize); 
		if(options.outputFileName){
			fs.writeFileSync(options.outputFileName, fileContent, charset);
		}
		success && success(fileContent);
	}else{
		fail && fail(null);
	}
};