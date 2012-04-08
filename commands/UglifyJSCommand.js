var fs = require("fs"),
	jsp = require("uglify-js").parser,
	pro = require("uglify-js").uglify;

var transform = exports.transform = function(input){
	var ast = jsp.parse(input); // parse code and get the initial AST
	ast = pro.ast_mangle(ast); // get a new AST with mangled names
	ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
	return pro.gen_code(ast); // compressed code here
};

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