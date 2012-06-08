var fs = require('fs'),
    path = require('path'),
    att = require("../att.js");

/**
 * transform the image url to base64 in the css.
 */
var transform = exports.transform = function (input, basePath, fixIE, maxSize) {
        if (maxSize === undefined || maxSize <= 0) {
            maxSize = att.configuration.commands.datauri.maxSize;
        }
		if (fixIE === undefined) {
			fixIE = att.configuration.commands.datauri.fixIE;
		}
        input = input.replace(/background.*url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\).+/gi, function (match, file, type) {
            var fileName = basePath + "/" + file + '.' + type;
            var size = fs.statSync(fileName).size;
            if (size > maxSize) {
				console.log("%s large then %s, fall to use external image.", fileName, Math.round(maxSize/1024 * 100) /100 + "KB");
                return match;
            } else {
                var base64 = fs.readFileSync(fileName).toString('base64');
                base64 = 'url("data:image/' + (type === 'jpg' ? 'jpeg' : type) + ';base64,' + base64 + '")';
                var r = match.replace(/url\(\s*\"?\'?(\S*)\.(png|jpg|jpeg|gif|svg\+xml)\"?\'?\s*\)/i, base64);
                if (fixIE) {
                    if (!match.match(/.*;\s*/)) {
                        r += ";";
                    }
                    r += '\r\n*' + match;
                }
                return r;
            }
        });
        return input;
   };
/**
 * command name
 */
exports.name = "datauri";

/**
 * @option from
 * @option to
 * @option maxSize {Number|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function (options, callback) {

    var from = options.from,
        to = options.to,
        fileContent, 
		fixIE = options.fixIE,
        charset = options.charset || "utf-8";

    if (!from || !to) {
        return callback(new Error("In datauri task the from and to options are required."));
    }
    try {
        fileContent = fs.readFileSync(from, charset);
    } catch (err) {
        return callback(err);
    }
    fileContent = transform(fileContent, path.dirname(from), fixIE, options.maxSize, options.toAbsolutePath);
    try {
        fs.writeFileSync(to, fileContent, charset);
    } catch (err) {
        return callback(err);
    }
    return callback();
};