var spawn = require('child_process').spawn,
    argv = require('optimist').argv,
    createWriteStream = require('fs').createWriteStream,
    glob = require("glob"),
    program = require("commander"),
    AttUtil = require("../core/AttUtil.js");



function buildArgs(options, defaults) {
    var args = [];
    for (name in options) {
        var value = options.hasOwnProperty(name) ? options[name] : defaults.hasOwnProperty(name) ? defaults[name] : null;
        if (value === true) {
            args.push('--' + name)
        } else if (value !== false) {
            args.push('--' + name + '=' + value);
        }
    }
    args.push('-');
    return args;
}
/**
 * plugin name
 */
exports.name = "html2pdf";

/**
 * plugin description
 */
exports.description = "convert html to PDF";

/**
 * plugin action
 */

var convertToPDF = function (from, to) {
        var opt = [from || "-"].concat(buildArgs({}));
        var ls = spawn("wkhtmltopdf", opt);
        ls.stderr.on('data', function (data) {
            if ((data + "").indexOf("CreateProcessW") != -1) {
                console.log("[ERROR] <wkhtmltopdf> run failed, please install the <wkhtmltopdf> and add it to the system path.");
            }
        });
        ls.stdout.pipe(createWriteStream(to));
    };
exports.action = function () {
    var query = process.argv[3],
        silent = argv.s || argv.silent;

    if (!query) {
        return console.log("the file glob is required");
    }

    glob(query, function (err, files) {
        if (silent) {
            files.forEach(function (file) {
                convertToPDF(file, file + ".pdf");
            });
        } else {
            AttUtil.doSequenceTasks(files, function (file, callback) {
                program.confirm("convert the file to pdf -> " + file + " ? ", function (yes) {
                    if (yes) {
                        convertToPDF(file, file + ".pdf");
                    }
                    callback();
                });
            }, function () {
                process.stdin.destroy();
            });
        }
    });
};