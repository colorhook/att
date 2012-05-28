var fs = require("fs"),
	path = require("path"),
	FTPClient = require("ftp");

/**
 * @name ftp
 */
exports.name = "ftp";

/**
 * @option from
 * @option to
 */
exports.execute = function(options, callback){
	var host = options.host,
		port = options.port || "21",
		username = options.username,
		password = options.password,
		files = options.files,
		client;
	

	var uploadFile = function(file, callback){
			var filename = path.basename(file);
			client.put(fs.createReadStream(file), filename, callback);
		},
		uploadFiles = function(){
			if(files.length === 0){
				client.end();
				return callback();
			}
			var file = files.shift();
			uploadFile(file, function(e){
				if(e){
					console.log(e);
					client.end();
					return callback(e);
				}
				uploadFiles();
			});
		};
		
	if(!host || !port){
		return callback(new Error("the host and port option are required"));
	}
	if(!files){
		return callback(new Error("the files must be specified"));
	}

	client = new FTPClient({host: host, port: port});
	client.on('connect', function(){
		client.auth(options.username, options.password, function(e) {
			if(e){
				callback(e);
				return client.end();
			}
			if(options.remotedir !== ""){
				client.cwd(options.remotedir, function(e){
					if(e){
						callback(e);
						return client.end(); 
					}
					uploadFiles();
				});
			}else{
				uploadFiles();
			}
		});
	});
	client.on('timeout', function(e){
		callback(new Error("FTP timeout"));
	});
	client.connect();
};