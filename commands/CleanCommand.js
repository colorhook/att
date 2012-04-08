var fs = require('fs'),
	wrench = require('wrench');

/**
 * @option dir {String}
 */
exports.execute = function(options, success, fail){
	var fileContent,
		charset = options.charset || "utf-8";

	if(options.dir){
		wrench.rmdirSyncRecursive(options.dir, true);
		success();
	}
};