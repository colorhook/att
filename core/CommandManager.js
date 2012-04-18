var util = require('util'),
	events = require('events'),
	FileUtil = require('./FileUtil.js');

var CommandManager,
	CMP,
	doChainTask = function(tasks, method, completed){
		if(tasks.length == 0){
			completed();
			return;
		}
		var task = tasks.shift();
		method(task, function(){
			doChainTask(tasks, method, completed);
		}, function(){
			doChainTask(tasks, method, completed);
		});
	};

CommandManager = function(){
	this.commandMap = {};
	events.EventEmitter.call(this);
};

util.inherits(CommandManager, events.EventEmitter);

CMP = CommandManager.prototype;

CMP.addCommand = function(command){
	this.commandMap[command.name] = command;
};

CMP.removeCommand = function(name){
	delete this.commandMap[name];
};

CMP.getCommand = function(name){
	return this.commandMap[name];
};

CMP.hasCommand = function(name){
	return this.commandMap[name] != null;
};

CMP.executeCommand = function(name, options, callback){
	var command = this.commandMap[name];
	if(!command){
		return callback(new Error('command named [' + name + '] not found'));
	}
	command.execute(options, callback);
};

CMP.executeChainCommand = function(commands, options){
	options = options || [];
	var i = 0,
		self = this,
		completed = function(){
			self.emit('complete');
		};

	doChainTask(commands, function(command, success, fail){
		try{
			self.executeCommand(command, options[i++], function(data){
				success(data);
				self.emit('success', data);
			}, function(data){
				fail(data);
				self.emit('fail', data);
			});
		}catch(e){
			self.emit('error', e);
			completed();
		}
	}, completed);
};


var commandManager = new CommandManager();
FileUtil.each(__dirname + "/../commands/", function(item){
	commandManager.addCommand(require(item.fullName));
});
exports.commandManager = commandManager;