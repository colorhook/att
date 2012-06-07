var fs = require("fs"),
    jsp = require("uglify-js").parser,
    pro = require("uglify-js").uglify;

var transform = exports.transform = function (input) {
        var ast = jsp.parse(input); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
        return pro.gen_code(ast); // compressed code here
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