var exec = require("child_process").exec,
    path = require("path");

/**
 * command name
 */
exports.name = "nodeunit";

/**
 * @option value
 */
exports.execute = function (options, callback) {

    var value = options.value

    if (!value) {
        return callback(new Error("In nodeunit task the test target is required."));
    }
	value = path.resolve(value);
	
    exec("nodeunit " + path.basename(value), {
		cwd: path.dirname(value)
	}, function(err, stdout, stderr){
		if(err){
			if(stdout){
				callback(new Error(stdout));
			}else{
				callback(err);
			}
		}else if(stderr){
			callback(new Error(stderr), stdout);
		}else{
			callback(null, stdout);
		}
	});
};