var fs = require("fs"),
    path = require("path"),
    FTPClient = require("ftp");

/**
 * command name
 */
exports.name = "ftp";

/**
 * @parse XML
 */
exports.parseXML = function (xml, project, parser) {
    var supportCommands = ["cd", "touch", "delete", "mkdir", "upload", "download"];
    commands = [], options = null, toCommand = function (name, node) {
        return {
            name: name,
            options: parser.parseNode(node)
        }
    };

    options = parser.parseAttribute(xml);
    xml.child("*").each(function (item) {
        var name = item.localName();
        if (supportCommands.indexOf(name) !== -1) {
            commands.push(toCommand(name, item));
        }
    });

    options.commands = commands;
    return options;
};


var doUpload = function (options, client, callback) {
        var files = options.files;
        if (!files || files.length === 0) {
            return callback();
        }
        var uploadFile = function (file, callback) {
                var filename = path.basename(file);
                console.log("  -> upload %s", file);
                client.put(fs.createReadStream(file), filename, callback);
            },
            uploadFiles = function () {
                if (files.length === 0) {
                    return callback();
                }
                var file = files.shift();
                uploadFile(file, function (e) {
                    if (e) {
                        return callback(e);
                    }
                    uploadFiles();
                });
            };
        uploadFiles();
    };
var doCommand = function (name, options, client, callback) {
        switch (name) {
        case 'cd':
            console.log("  -->ftp cd %s", options.target);
            client.cwd(options.target, callback);
            break;
        case 'mkdir':
            console.log("  -->ftp mkdir %s", options.target);
            client.mkdir(options.target, callback);
            break;
        case 'delete':
            console.log("  -->ftp delete %s", options.target);
            client.delete(options.target, callback);
            break;
        case 'rmdir':
            console.log("  -->ftp rmdir %s", options.target);
            client.rmdir(options.target, callback);
            break;
        case 'rename':
            console.log("  -->ftp rename from %s to %s", options.from, options.to);
            client.rename(options.from, client.to, callback);
            break;
        case 'upload':
            console.log("  -->ftp upload...");
            doUpload(options, client, callback);
            break;
        default:
            return callback();
        }
    };
/**
 * @option from
 * @option to
 */
exports.execute = function (options, callback) {
    var host = options.host,
        port = options.port || "21",
        username = options.username,
        password = options.password,
        commands = options.commands,
        client;

    if (commands.length == 0) {
        return callback();
    }

    if (!host || !port) {
        return callback(new Error("In ftp task the host and port option are required."));
    }

    var executeCommands = function (completed) {
            AttUtil.doSequenceTasks(commands, function (item, callback) {
                doCommand(item.name, item.options, client, function (e) {
                    if (e) {
                        console.log(e);
                    }
                    if (e && client.keepGoingMode === false) {
                        commands = [];
                        completed(e);
                    } else {
                        callback();
                    }
                });
            }, completed);
        };

    client = new FTPClient({
        host: host,
        port: port
    });
    client.keepGoingMode = options.keepGoingMode;

    client.on('connect', function () {
        client.auth(options.username, options.password, function (e) {
            if (e) {
                callback(e);
                return client.end();
            }
            if (options.remotedir !== "") {
                client.cwd(options.remotedir, function (e) {
                    if (e) {
                        callback(e);
                        return client.end();
                    }
                    executeCommands(function (e) {
                        callback(e);
                        client.end();
                    });
                });
            } else {
                executeCommands(function (e) {
                    callback(e);
                    client.end();
                });
            }
        });
    });
    client.on('timeout', function (e) {
        callback(new Error("FTP timeout"));
    });
    client.connect();
};