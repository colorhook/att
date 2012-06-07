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
exports.description = "check css syntax";

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
            var content = fs.readFileSync(item, 'utf-8');
            var results = CSSLint.verify(content);
            messages = results.messages;
            if (messages.length) {
                console.log("# " + item);
            }
            for (i = 0, len = messages.length; i < len; i++) {
                console.log("    " + messages[i].message + " (line " + messages[i].line + ", col " + messages[i].col + ")", messages[i].type);
            }
        });
    });
};