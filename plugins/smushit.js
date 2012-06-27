var path = require("path"),
    glob = require("glob"),
    argv = require('optimist').argv,
    program = require("commander"),
    AttUtil = require("../core/AttUtil.js"),
    SmushitCommand = require("../commands/smushit.js");


/**
 * plugin name
 */
exports.name = "smushit";

/**
 * plugin description
 */
exports.description = "使用!Yahoo smush.it压缩图片，压缩后的图片会直接替换当前图片";

/**
 * plugin action
 */
var supportedFileType = ["jpg", "jpeg", "gif", "png"];
var customService;

exports.initialize = function(options){
	customService = options.service;
}
var smushitFile = function (file, callback) {
	var options = {
		from: file,
		to: file,
		service: customService
	};
	SmushitCommand.execute(options, function (err, response) {
		if (err) {
			if(response.error == "No savings"){
				console.log("No savings, the size is %s, file is %s", response.src_size, file);
			}else{
				console.log("smushit error occur at: %s", file);
				console.log(err);
			}
		} else {
			console.log("smushit success: %s", file);
			var size1 = Math.round(response.src_size/1024 * 10000) / 10000 + "KB",
				size2 = Math.round(response.dest_size/1024 * 10000) / 10000 + "KB",
				percent = Math.round((response.dest_size/response.src_size) * 10000) / 100 + "%";

			console.log("size before smushit: %s  size after smushit: %s  smushit percent: %s", size1, size2, percent);
		}
		callback && callback(err);
	});
};


/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3],
        silent = argv.s || argv.silent,
        files = [];
    if (!query) {
        return console.log("the file glob is required");
    };
    glob(query, function (err, matched) {
        matched.forEach(function (item) {
            var extname = path.extname(item).replace(/\./, "").toLowerCase();
            if (supportedFileType.indexOf(extname) !== -1) {
                files.push(item);
            }
        });

        if (files.length === 0) {
            return console.log("no image file matched");
        }
        if (silent) {
            files.forEach(function (file) {
                smushitFile(file);
            });
        } else {
            AttUtil.doSequenceTasks(files, function (file, callback) {
                program.confirm("minify the file -> " + file + " ? ", function (yes) {
                    if (yes) {
                        smushitFile(file, callback);
                    } else {
                        callback();
                    }
                });
            }, function () {
                process.stdin.destroy();
            });
        }
    });
};