var glob = require("glob"),
    path = require("path"),
    wrench = require("wrench");

/**
 * plugin name
 */
exports.name = "tmp";

/**
 * plugin description
 */
exports.description = "list or clear the temp files";

/**
 * plugin action
 */
exports.action = function () {
    var command = process.argv[3];

    if (command == 'clear') {
        var target = path.resolve(__dirname + "/../tmp/");
        wrench.rmdirSyncRecursive(target, true);
        wrench.mkdirSyncRecursive(target, 0777);
        return;
    }
    glob(__dirname + "/../tmp/**/*", function (err, files) {
		if(files.length == 0){
			return console.log("the tmp directory is empty");
		}
        files.forEach(function (item) {
            console.log("  -> " + path.resolve(item));
        });
    });
};