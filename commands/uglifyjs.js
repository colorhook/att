var fs = require("fs"),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify;


var getCopyright = exports.getCopytight = function(input){
	var tok = jsp.tokenizer(input);
	var show_copyright = function(comments){
		var c = comments[0];
		if (c && c.type != "comment1" && c.value[0] == '!') {
			return "/*" + c.value + "*/";
		}
		return "";
	}
	return show_copyright(tok().comments_before);
}

var transform = exports.transform = function (input) {
        var ast = jsp.parse(input); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
        return getCopyright(input) + pro.gen_code(ast) + ";"; // compressed code here
    };


/**
 * command name
 */
exports.name = "uglifyjs";

/**
 * @option from {String}
 * @option to {String}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function (options, callback) {

    var from = options.from,
        to = options.to,
        fileContent, charset = options.charset || "utf-8";

    if (!from || !to) {
        return callback(new Error("In uglifyjs task the from and to options are required."));
    }

    try {
        fileContent = fs.readFileSync(from, charset);
    } catch (err) {
        return callback(err);
    }
    fileContent = transform(fileContent);
    try {
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};