var fs = require("fs"),
	jshint = require("jshint/lib/hint.js"),
    glob = require("glob");

/**
 * plugin name
 */
exports.name = "jshint";

/**
 * plugin description
 */
exports.description = "检查JS语法";

/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3],
		files = [];

    if (!query) {
        return console.log("the file glob is required");
    }
    glob(query, function (err, matches) {
		matches.forEach(function(item){
			var stat = fs.statSync(item);
			if(stat.isFile()){
				files.push(item);
			}
		});

		if(files.length == 0){
			return console.log("no file matched");
		}
			
        if (jshint.hint(files).length === 0) {
            console.log("Perfect!");
        }
    });
};