var fs = require('fs'),
	cleanCSS = require('clean-css');

var transform = exports.transform = function(input){
	return cleanCSS.process(input);
}

/**
 * @option input {String|Optional}
 * @option inputFileName {String|Optional}
 * @option outputFileName {String|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, success, fail){
	var fileContent,
		charset = options.charset || "utf-8";
	if(!options.input && options.inputFileName){
		options.input = fs.readFileSync(options.inputFileName, charset);
	}
	if(options.input){
		fileContent = transform(options.input);
		if(options.outputFileName){
			fs.writeFileSync(options.outputFileName, fileContent, charset);
		}
		success && success(fileContent);
	}else{
		fail && fail(null);
	}
};