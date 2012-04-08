var fs = require('fs'),
	less = require('less');


/**
 * @option input {String|Optional}
 * @option inputFileName {String|Optional}
 * @option outputFileName {String|Optional}
 * @option compress {Boolean|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, success, fail){
	var fileContent,
		charset = options.charset || "utf-8";
	if(!options.input && options.inputFileName){
		options.input = fs.readFileSync(options.inputFileName, charset);
	}
	if(options.input){
		var parser = new(less.Parser)(options);
		parser.parse(options.input, function (e, tree) {
			if(e){
				fail && fail(null);
				return;
			}
			fileContent = tree.toCSS({ compress: options.compress }); 
			if(options.outputFileName){
				fs.writeFileSync(options.outputFileName, fileContent, charset);
			}
			success && success(fileContent);
		});
	}else{
		fail && fail(null);
	}
};