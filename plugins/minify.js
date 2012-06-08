var path = require("path"),
    glob = require("glob"),
    argv = require('optimist').argv,
    wrench = require("wrench"),
    program = require("commander"),
    AttUtil = require("../core/AttUtil.js"),
    MinifyCommand = require("../commands/minify.js");


var mapper, interceptor;
/**
 * plugin name
 */
exports.name = "minify";

/**
 * plugin description
 */
exports.description = "minify js, css, image and html";

/**
 * plugin action
 */
var toPath = function (file) {
	var p = path.resolve(__dirname + "/../tmp/" + file),
		dirname = path.dirname(p),
		basename = path.basename(p);

	if (mapper && mapper.transform) {
		p = mapper.transform(file, p);
	}

	if (!path.existsSync(dirname)) {
		try {
			wrench.mkdirSyncRecursive(dirname, 0777);
		} catch (err) {}
	}
	return p;
};



/**
 * minify
 */
var supportedFileType = ["html", "htm", "jpg", "jpeg", "gif", "png", "js", "css"];
var toAbsolutePath = true;
var datauri = true;

var minifyFile = function (file, callback) {
	var toName = toPath(file);
	var options = {
		from: file,
		to: toName
	};
	if (toName.match(/\.css$/i)) {
		options.datauri = datauri;
		options.toAbsolutePath = toAbsolutePath;
	}
	MinifyCommand.execute(options, function (err) {
		if (err) {
			console.log("Error occur at: " + file);
			console.log(err);
		} else {
			console.log("minify success: %s -> %s", file, path.basename(toName));
		}
		callback && callback(err);
		if (interceptor) {
			interceptor.execute(toName);
		}
	});
};


/**
 * plugin optional interface
 */
exports.initialize = function (options) {
    if (options.interceptor) {
        interceptor = require(__dirname + "/../" + options.interceptor);
    }
    if (options.mapper) {
        mapper = require(__dirname + "/../" + options.mapper);
    }
    if (options.supportedFileType) {
        supportedFileType = options.supportedFileType;
    }
    if (options.datauri !== undefined) {
        datauri = Boolean(options.datauri);
    }
    if (options.toAbsolutePath !== undefined) {
        toAbsolutePath = Boolean(options.toAbsolutePath);
    }
};

/**
 * plugin action
 */
exports.action = function () {
    var query = process.argv[3],
        silent = argv.s || argv.silent,
        files = [];
    if (!query) {
        return console.log("the file glob is required.");
    };
    glob(query, function (err, matched) {
        matched.forEach(function (item) {
            var extname = path.extname(item).replace(/\./, "").toLowerCase();
            if (supportedFileType.indexOf(extname) !== -1) {
                files.push(item);
            }
        });

        if (files.length === 0) {
            return console.log("no file matched.");
        }
        if (silent) {
            files.forEach(function (file) {
                minifyFile(file);
            });
        } else {
            AttUtil.doSequenceTasks(files, function (file, callback) {
                program.confirm("minify the file -> " + file + " ? ", function (yes) {
                    if (yes) {
                        minifyFile(file, callback);
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