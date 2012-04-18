var commandManager = require("./CommandManager.js").commandManager;


var doChainTask = function(tasks, method, completed){
	if(tasks.length == 0){
		completed();
		return;
	}
	var task = tasks.shift();
	method(task, function(){
		doChainTask(tasks, method, completed);
	});
};

var Target = function(){
	this._commands = [];
}

Target.prototype.addCommand = function(commandName, options){
	this._commands.push({commandName: commandName, options: options});
}

Target.prototype.run = function(callback, itemCallback){
	var self = this;
	doChainTask(this._commands, function(commandData, commandCallback){

		var commandName = commandData.commandName,
			options = commandData.options;

		commandManager.executeCommand(commandName, options, function(err, data){
			itemCallback && itemCallback(err, data);
			commandCallback();
		});
		
	}, callback);
};

exports.Target = Target;