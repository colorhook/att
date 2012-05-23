var FileUtil = require('./FileUtil.js');

var commandMap = {};

exports.addCommand = function(command){
	commandMap[command.name] = command;
};

exports.removeCommand = function(name){
	delete commandMap[name];
};

exports.getCommand = function(name){
	return commandMap[name];
};

exports.hasCommand = function(name){
	return commandMap[name] != null;
};

exports.executeCommand = function(name, options, callback){
	var command = commandMap[name];
	if(!command){
		return callback(new Error('command named [' + name + '] not found'));
	}
	command.execute(options, callback);
};


FileUtil.each(__dirname + "/../commands/", function(item){
	exports.addCommand(require(item.fullName));
});
