var fs = require("fs"),
	exec = require("child_process").exec;

/**
 * @option inputFileName
 * @option outputFileName
 * @option yuicompressor
 * @option charset
 */
exports.execute = function(options, success, fail){
	var input = options.inputFileName,
		output = options.outputFileName,
		yuicompressor = options.yuicompressor,
		charset = options.charset || "utf-8",
		line = "java -jar " + yuicompressor + " --type css --charset " + charset + " " + input + "-o " + output,
		child = exec(line, function(error, stdout, stderr){
			if(error !== null){
				fail && fail(error);
			}else{
				success && success();
			}
		});
};