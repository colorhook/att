var fs = require('fs'),
    path = require('path'),
    cleanCSS = require('clean-css'),
	DataURICommand = require("./datauri.js"),
	att = require("../att.js");

/**
 * minify css
 */
var transform = exports.transform = function (input, basedir, datauri, fixIE, toAbsolutePath) {
		var workspaceRoot = att.configuration.workspaces[att.configuration.currentWorkspace];
		if(datauri){
			input = DataURICommand.transform(input, basedir, fixIE);
		}
		if((toAbsolutePath && workspaceRoot) || true){
			input = input.replace(/background.*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\).+/gi, function (match, file, type) {
				if(!file || file[0] === '/'){
					return match;
				}
				var fileName = basedir + "/" + file + '.' + type;
				var absolutePath = path.normalize("/" + path.relative(workspaceRoot, path.dirname(fileName)) + "/" + file + "." + type);
				absolutePath = absolutePath.replace(/\\/g, "/");
				return match.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\)/i, "url("+absolutePath+")");
			});
		}
        return cleanCSS.process(input);
};
/**
 * command name
 */
exports.name = "cleancss";

/**
 * @option from
 * @option to
 */
exports.execute = function (options, callback) {
    var fileContent, from = options.from,
        to = options.to,
        charset = options.charset || "utf-8";

    if (!from || !to) {
        return callback(new Error("In cleancss task the from and to options are required."));
    }

    try {
        fileContent = fs.readFileSync(from, charset);
    } catch (err) {
        return callback(err);
    }

    fileContent = transform(fileContent, path.dirname(from), options.datauri, options.fixIE, options.toAbsolutePath);
	
    try {
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};