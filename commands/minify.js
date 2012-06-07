var path = require('path'),
    uglifyjsCommand = require("./uglifyjs.js"),
    smushitCommand = require("./smushit.js"),
    cleancssCommand = require("./cleancss.js"),
    htmlminifierCommand = require("./htmlminifier.js");

/**
 * command name
 */
exports.name = "minify";


var commandMap = {
    "js": uglifyjsCommand,
    "css": cleancssCommand,
    "image": smushitCommand,
    "html": htmlminifierCommand
};
/**
 * @option from
 * @option to
 * @option type [default js]
 */
exports.execute = function (options, callback) {
    var type = options.type,
        command, from = options.from,
        to = options.to;


    if (!from || !to) {
        return callback(new Error("In minify task the from, to and command options are required"));
    }
    if (!type) {
        var ext = path.extname(from).replace('.', '').toLowerCase();

        if (["png", "jpg", "jpeg", "gif"].indexOf(ext) != -1) {
            ext = "image";
        }
        type = ext;
    }
    if (!commandMap[type]) {
        type = 'js';
    }
    command = commandMap[type];
    command.execute(options, callback);
};