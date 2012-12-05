var glob = require("glob"),
    path = require("path"),
	exec = require("child_process").exec,
    wrench = require("wrench");

/**
 * plugin name
 */
exports.name = "tmp";

/**
 * plugin description
 */
exports.description = "查看或清除临时文件";

/**
 * plugin action
 */
exports.action = function () {
    var command = process.argv[3];

    if (command === 'clear') {
        var target = path.resolve(__dirname + "/../tmp/");
        wrench.rmdirSyncRecursive(target, true);
        wrench.mkdirSyncRecursive(target, 0777);
        return;
    }else if(command === 'dir'){
		if(require("os").platform().match(/win/)){
			exec('explorer ' + path.resolve(__dirname + "/../tmp/"));
		}else{
			console.log("不支持这个操作系统");
		}
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