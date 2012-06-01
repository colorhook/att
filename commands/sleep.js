var commander = require("commander");

/**
 * @name sleep
 */
exports.name = "sleep";


/**
 * @option time
 */
exports.execute = function(options, callback){
	var time = Number(options.time);
	if(!time || isNaN(time) || time <= 0){
		return new Callback(new Error("The time must be a number greater than 0."));
	}

	setTimeout(function(){
		callback();
	}, time);
};