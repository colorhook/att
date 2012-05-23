var play = require('play');

/**
 * @name sound
 */
exports.name = "sound";


/**
 * @option file
 */
exports.execute = function(options, callback){
	
	var file = options.file,
		dir = options.dir;
	
	if(!file){
		return callback(new Error('the sound file must be specified'));
	}

	if(dir){
		file = dir + '/' +file;
	}
	
	if(options.executable){
		play.playerList.unshift(options.executable);
	}

	play.sound(file, function(e){
		callback(e);
	})
};