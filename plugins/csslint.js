var CSSLint = require("csslint").CSSLint,
    fs = require("fs"),
    glob = require("glob");


/**
 * plugin name
 */
exports.name = "csslint";

/**
 * plugin description
 */
exports.description = "检查CSS语法";


/**
 * 检查某个文件
 */
var checkFile = exports.checkFile = function(file){
	var content = fs.readFileSync(file, 'utf-8');
	var results = CSSLint.verify(content);
	messages = results.messages;
	if (messages.length) {
		console.log("# " + file);
	}
	for (i = 0, len = messages.length; i < len; i++) {
		console.log("    " + messages[i].message + " (line " + messages[i].line + ", col " + messages[i].col + ")", messages[i].type);
	}
}
/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3];

    if (!query) {
        return console.log("the file glob is required");
    }
    glob(query, function (err, files) {

        files.forEach(function (item) {
			var stat = fs.statSync(item);
			if(!stat.isFile()){
				return;
			}
			checkFile(item);
            
        });
    });
};
