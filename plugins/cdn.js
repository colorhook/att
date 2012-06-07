var path = require("path"),
    glob = require("glob"),
	fs = require("fs"),
    argv = require('optimist').argv,
    program = require("commander"),
	att = require("../att.js"),
    AttUtil = require("../core/AttUtil.js"),
	UploadUtil = require("../core/UploadUtil.js");

/**
 * plugin name
 */
exports.name = "cdn";

/**
 * plugin description
 */
exports.description = "upload assets to the CDN";

/**
 * upload to the CDN
 */
var currentWorkspace =  att.configuration.currentWorkspace || "default";
if(!att.configuration.workspaces){
	att.configuration.workspaces = {};
}
var workspaceRoot = att.configuration.workspaces[currentWorkspace];
var cdnEndpoint = att.configuration.cdnEndpoint;

var analyticsCDNPath = function(filename){
	var p =  "/" + path.relative(workspaceRoot, path.dirname(filename));
	p = p.replace(/\\/g, "/");
	return p;
}
var uploadCDN = function(file, callback){
	var filename = path.basename(file),
		filepath = analyticsCDNPath(file),
		params = {filename: filename, filepath: filepath};
	
	params = {
		filename: filename,
        filecontent: fs.readFileSync(file),
        filepath: filepath,
        target: "test_home"
	}
	UploadUtil.upload(cdnEndpoint, file, params, function(data){
		var json;
		try{
			json = JSON.parse(data);
		}catch(err){
			process.stdin.destroy();
			return console.log(data);
		}
		if(json.code == 200){
			console.log("upload success: " + file);
		}else{
			console.log("upload failed: " + json.error);
		}
		callback && callback();
	}, function(err){
		process.stdin.destroy();
		console.log(err);
	});
};
/**
 * plugin action
 */
exports.action = function () {
	if(!workspaceRoot){
		console.log("please set your workspace first");
		console.log("type <att workspace> to set");
		return;
	}
    var query = process.argv[3],
        silent = argv.s || argv.silent;
    if (!query) {
        return console.log("the file glob is required");
    }
    glob(query, function (err, files) {
        if (silent) {
            files.forEach(function (file) {
                uploadCDN(file);
            });
        } else {
            AttUtil.doSequenceTasks(files, function (file, callback) {
                program.confirm("upload the file to CDN-> " + file + " ? ", function (yes) {
                    if (yes) {
                        uploadCDN(file, callback);
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