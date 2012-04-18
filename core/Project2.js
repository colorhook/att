var fs = require("node-fs"),
	program = require('commander'),
	path = require('path'),
	util = require('util'),
	events = require("events"),
	FileUtil = require("./FileUtil.js");


/**
 * @description execute multi task one by one
 */
var doChainTask = function(tasks, method, completed){
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
/**
 * @read file comment data by key
 */
var readFileComment = function(file, key){
	var content = fs.readFileSync(file, "utf-8"),
		matches = content.match(/\/\*[.\s\S]+?\*\//),
		map = {};

	if(!matches || !matches[0]){
		return null;
	}
	var ret;
	matches[0].replace(/\*\s*@(\w+)\s*([.\s\S]+?)\*/, function(match, v1, v2){
		if(!ret && v1.trim() == key){
			ret = v2.trim();
		}
	});
	return ret;
};

/**
 * @constructor
 * @description 定义一个工程
 */
var Project = function(options){
	events.EventEmitter.call(this);
	this.properties = {};
	this.commands = {};
	this.listeners = {};
	this.tasks = {};
	this.rules = {};
	this.verbose = true;
	this.logLevel = "log";
	this.ignoreConfirm = false;
	this._beforeCallbacks = [];
	this._afterCallbacks = [];
	this.initOptions(options);
};


util.inherits(Project, events.EventEmitter);
/**
 * @description 格式化字符串
 * @example
 * <pre>
 * var dict = {name : "att"};
 * console.log(Project.format("${name} is a good tool!", dict)); //att is a good tool!
 * </pre>
 */
Project.format = function(str, dict){
	var getValue = function(key){
		if(util.isArray(dict)){
			for(var i = 0, l = dict.length; i < l; i++){
				if(getValue(dict[i]) !== undefined){
					return getValue(dict[i]);
				}
			}
			return undefined;
		}else{
			return dict[key];
		}
	}
	str = str.replace(/\$\{([a-zA-Z0-9\-_]+)\}/g, function(match, key){
		return getValue(key)
	});
	return str;
};


/**
 * @description 在控制台中输出日志
 */
Project.prototype.log = function(type, message){
	if(!this.verbose){
		return;
	}
	var map = {
			"log" : 0,
			"info" : 1,
			"debug": 2,
			"warn": 3,
			"error": 4
		},
		v1 = map[this.logLevel],
		v2 = map[type];
	if(v2 >= v1){
		console.log("[" + type + "] " + message);
	}
};

/**
 * 根据工程定义的变量格式化字符串
 */
Project.prototype.format = function(value){
	if(typeof value !== "string"){
		var v = JSON.stringify(value);
		v = this.format(v, this.properties);
		return JSON.parse(v);
	}else{
		return Project.format(value, this.properties);
	}
};
/**
 * @description 未工程中添加一个属性
 */
Project.prototype.addProperty = function(key, value){
	this.properties[key] = value;
};
/**
 * @description 删除工程中定义的某个属性
 */
Project.prototype.removeProperty = function(key){
	delete this.properties[key];
};
/**
 * @description 取得工程定义的某个属性
 */
Project.prototype.getProperty = function(key){
	var value = this.properties[key];
	return this.format(value);
};
/**
 * @description 为工程中添加一个Rule
 */
Project.prototype.addRule = function(name, rule){
	this.rules[name] = rule;
};
/**
 * @description 删除工程中某个Rule
 */
Project.prototype.removeRule = function(name){
	delete this.rules[name];
};
/**
 * @description 返回工程中某个Rule
 */
Project.prototype.getRule = function(name){
	return this.rules[name];
};

/**
 * @description 为工程中添加一个Command
 */
Project.prototype.addCommand = function(name, command){
	this.commands[name] = command;
};
/**
 * @description 删除工程中某个Command
 */
Project.prototype.removeCommand = function(name){
	delete this.commands[name];
};
/**
 * @description 返回工程中某个Command
 */
Project.prototype.getCommand = function(name){
	return this.commands[name];
};
/**
 * @description 在工程中添加一个监听器
 */
Project.prototype.addListener = function(name, listener){
	if(this.listeners[name] != undefined){
		this.log("warn", "There has a listener named " + name + " has beed added");
		return;
	}
	this.listeners[name] = listener;
};
/**
 * @description 移除工程中某个监听器
 */
Project.prototype.removeListener = function(name){
	delete this.listeners[name];
};
/**
 * @description 返回工程中某个监听器的描述
 */
Project.prototype.getListener = function(name){
	return this.listeners[name];
};
/**
 * @description 激活监听器
 */
Project.prototype.activeListener = function(name){
	var listener = this.listeners[name],
		listenerModule,
		listenerFile;
	
	if(!listener){
		this.log("warn", "listener named " + name + " not found");
		return;
	}
	listenerModule = listener.module;
	listenerFile = listener.file;
	
	if(!listenerModule){
		try{
			listenerModule = require(__dirname + "/../" + listenerFile);
		}catch(error){
			this.log("error", "listener " + name + " can't be loaded by path " + listenerFile);
			return;
		}
	}
	listenerModule.onActive(this, listener.options);
};
/**
 * @description 取消监听器
 */
Project.prototype.deactiveListener = function(name){

	var listener = this.listeners[name],
		listenerModule,
		listenerFile;
	
	if(!listener){
		return
	}
	listenerModule = listener.module;
	listenerFile = listener.file;
	
	if(!listenerModule){
		try{
			listenerModule = require(__dirname + "/../" + listenerFile);
		}catch(error){
			return;
		}
	}
	listenerModule.onDeactive(this, listener.options);
};
/**
 * add before callback for project to run
 */
Project.prototype.addBeforeCallback = function(callback){
	this._beforeCallbacks.push(callback);
};
/**
 * remove before callback for project to run
 */
Project.prototype.removeBeforeCallback = function(callback){
	var index = this._beforeCallbacks.indexOf(callback);
	if(index != -1){
		this._beforeCallbacks.splice(index, 1);
	}
};
/**
 * add after callback for project to complete
 */
Project.prototype.addAfterCallback = function(callback){
	this._afterCallbacks.push(callback);
};
/**
 * remove after callback for project to complete
 */
Project.prototype.removeAfterCallback = function(callback){
	var index = this._afterCallbacks.indexOf(callback);
	if(index != -1){
		this._afterCallbacks.splice(index, 1);
	}
};
/**
 * @description 在工程中添加一个任务
 */
Project.prototype.addTask = function(name, task){
	if(this.tasks[name] != undefined){
		this.log("warn", "There is a task named " + name + " has beed added, the new task will overwrite it");
	}
	this.tasks[name] = task;
};

/**
 * @description 移除工程中某个任务
 */
Project.prototype.removeTask = function(name, task){
	delete this.tasks[name];
};

/**
 * @description 返回工程中某个任务
 */
Project.prototype.getTask = function(name, task){
	return this.tasks[name];
};


/**
 * 执行某个task，默认为default
 */
Project.prototype.execute = function(taskName, callback, fail){
	if(taskName == undefined){
		taskName = "default";
	}

	if(!this.getTask(taskName)){
		this.log("error", "task " + taskName + " not found in this project");
		fail && fail();
		return;
	}
	var that = this,
		task = this.getTask(taskName),
		rulename = task.rule,
		rule,
		ruleCommands = task["rule-commands"],
		basedir = task.basedir || __dirname,
		builddir = task.buiddir || this.tmpdir,
		fileFilter = task["file-filter"],
		listeners = task.listeners,
		finished = 0;

	if(!rulename){
		this.log("error", "no rule specify in the task " + taskName);
		fail && fail();
		return;
	}
	rule = this.getRule(rulename);

	if(!rule){
		this.log("error", "rule " + rulename + " not found");
		fail && fail();
		return;
	}
	if(!ruleCommands || ruleCommands.length == 0){
		this.log("error", "no command in rule " + rulename + " while running task " + taskName);
		fail && fail();
		return;
	}
	this.taskData = {
		basedir: basedir,
		builddir: builddir,
		rulename: rulename,
		taskName: taskName,
		task: task,
		rule: rule,
		ruleCommands: ruleCommands,
		listeners: listeners
	};
	this.onBeforeExecute();
	this._beforeExecute(function(){
		var matchFiles = FileUtil.list(basedir, {
			excludeDirectory: true,
			matchFunction: function(item){
				if(!fileFilter || fileFilter == "" || fileFilter == "*"){
					return true;
				}
				var pattern;
				if(util.isArray(fileFilter)){
					pattern = new RegExp(fileFilter[0], fileFilter[1]);
				}else{
					pattern =  new RegExp(fileFilter, "i");
				}
				return pattern.test(item.fullName);
			}
		});
		that.taskData.matchFiles = matchFiles;
		if(matchFiles.length == 0){
			that.onAfterExecute();
		}else{
			doChainTask(matchFiles, function(file, taskSuccess, taskFail){
				that.executeByRule(file, taskSuccess);
			}, function(){
				that.onAfterExecute();
			});
		}
	});
};


Project.prototype.executeByRule = function(item, completed){
	var that = this,
		taskData = this.taskData,
		rule = taskData.rule,
		currentRule,
		ruleCommands = taskData.ruleCommands,
		commands = [],
		getCurrentRule = function(rule, ruleCommand){
			var cr = rule[ruleCommand] || {},
				parent = rule;
			while(parent = that.getRule(parent["extend-rule"])){
				parent[ruleCommand] = parent[ruleCommand] || {};
				for(var i in parent[ruleCommand]){
					if(cr[i] == undefined){
						cr[i] = parent[ruleCommand][i];
					}
				}
			}
			return cr;
		};
	
	taskData.fileItem = item;
	

	ruleCommands.forEach(function(ruleCommand){
		currentRule = getCurrentRule(rule, ruleCommand);
	
		var deepRuleCommands = currentRule.commands,
			matchPattern = currentRule["match-pattern"];
		
		if(!deepRuleCommands || deepRuleCommands.length == 0){
			return;
		}

		if(matchPattern){
			if(util.isArray(matchPattern)){
				matchPattern = new RegExp(matchPattern[0], matchPattern[1]);
			}else{
				matchPattern = new RegExp(matchPattern, "i");
			}
			if(!matchPattern.test(item.fullName)){
				return;
			}
		}
		
		taskData.currentRule = currentRule;

		deepRuleCommands.forEach(function(commandName){
			var command = that.getCommand(commandName),
				commandModule;

			if(command){
				commandModule = command.module;
				if(!commandModule){
					try{
						commandModule = require(__dirname + "/../" + command.file);
						command.module = commandModule;
					}catch(err){
						that.log("error", "command error while requiring by file: " + command.file);
						return;
					}
				}
				commands.push(commandName);
			}else{
				that.log("warn", "command " + commandName + " not found");
			}
		});
	});

	that.emit("file_start", item);

	taskData.multiCommands = Boolean(commands.length > 1);
	taskData.tmpFullName = null;
	
	doChainTask(commands, function(command, taskSuccess, taskFail){
		that.executeCommand(command, taskSuccess, taskFail);
	}, function(){
		that.emit("file_complete", item);
		completed && completed();
	});
};

Project.prototype._beforeExecute = function(callback){
	doChainTask(this._beforeCallbacks, function(item, success){
		item(success);
	}, callback);
};
/**
 * @description defore the project start to execute, active all the relatived listeners.
 */
Project.prototype.onBeforeExecute = function(){
	this.emit("beforeExecute");
	var that = this,
		listeners = this.taskData.listeners;
	if(listeners && util.isArray(listeners)){
		listeners.forEach(function(item){
			that.activeListener(item);
		});
	}
	this.emit("execute");
};
Project.prototype._afterExecute = function(callback){
	doChainTask(this._afterCallbacks, function(item, success){
		item(success);
	}, callback);
};
/**
 * @description after the project executed, deactive all the relatived listeners.
 */
Project.prototype.onAfterExecute = function(){
	this.emit("afterExecute");
	var that = this,
		listeners = this.taskData.listeners;

	this._afterExecute(function(){
		if(listeners && util.isArray(listeners)){
			listeners.forEach(function(item){
				that.deactiveListener(item);
			});
		}
		process.stdin.destroy();
		that.emit("complete");
	});
};
/**
 * @description execute a command for a file
 */
Project.prototype.executeCommand = function(commandName, success, fail){
	var that = this,
		command = this.getCommand(commandName),
		commandModule = command.module,
		taskData = this.taskData,
		task = taskData.task,
		fileItem = taskData.fileItem,
		options = command.options || {},
		currentRule = taskData.currentRule || {},
		outputRule = currentRule["output-rule"],
		toOutputFileName = function(item){
			var rel = path.relative(task.basedir, item.fullName);
			var filePath = task.builddir + "/" + rel;
			var fileDir = path.dirname(filePath);
			var filename = path.basename(filePath);
			var extname = path.extname(filePath);

			if(outputRule){
				filename = outputRule.replace(/#\{(\d+|\w+)\}/g, function(match, key){
					if(key == 0){
						if(extname != ""){
							return filename.replace(new RegExp(extname + "$"), "");
						}
						return filename;
					}else if(key == 1){
						return extname.replace(/^\./, "");
					}else if(key == "version"){
						return readFileComment(fileItem.fullName, "version");
					}else if(key == "time"){
						return new Date().getTime();
					}
					return match;
				});
			};
			if(!path.existsSync(fileDir)){
				fs.mkdirSync(fileDir, 0777, true);
			}
			return fileDir + "/" + filename;
		};
	
	
	var eventParams = {command: commandModule, commandName: commandName, fileItem: fileItem},
		doExecute = function(){
			options.inputFileName = taskData.tmpFullName || fileItem.fullName;
			if(taskData.multiCommands){
				taskData.tmpFullName =  toOutputFileName(fileItem);
			}else{
				taskData.tmpFullName = null;
			}
			options.outputFileName = taskData.tmpFullName || toOutputFileName(fileItem);
			that.emit("command_start", eventParams);
			that.log("info", "command " + commandName +" start running");
			commandModule.execute(options, function(){
				that.emit("command_success", eventParams);
				that.emit("command_complete", eventParams);
				success && success();
			}, function(){
				that.emit("command_fail", eventParams);
				that.emit("command_complete", eventParams);
				success && success();
			});
		};
	if(this.ignoreConfirm){
		doExecute();
	}else{
		program.confirm('confirm '+ commandName + "@ " + fileItem.fullName + "? ", function(ok){
			if(ok){
				doExecute();
			}else{
				success();
			}
		});
	}
};

Project.prototype.initOptions = function(options){
	if(typeof options == "string"){
		try{
			options = fs.readFileSync(options, "utf-8");
		}catch(err1){
			console.log("Error: error occur while reading configuration file " + options);
			return;
		}
		try{
			options = JSON.parse(options);
		}catch(err2){
			console.log("Error: error occur while parse configuration file " + options + " using JSON");
			return;
		}
	};
	var i,
		properties = options.properties || {},
		rules = options.rules || {},
		listeners = options.listeners || {},
		commands = options.commands || {},
		tasks = options.tasks || {};
	
	if(options.logLevel !== undefined){
		this.logLevel = options.logLevel || "info";
	}
	if(options.verbose !== undefined){
		this.verbose = options.verbose;
	}
	if(options.ignoreConfirm !== undefined){
		this.ignoreConfirm = options.ignoreConfirm;
	}
	for(i in properties){
		this.addProperty(i, this.format(properties[i]));
	}
	for(i in rules){
		this.addRule(i, this.format(rules[i]));
	}
	for(i in listeners){
		this.addListener(i, this.format(listeners[i]));
	}
	for(i in commands){
		this.addCommand(i, this.format(commands[i]));
	}
	for(i in tasks){
		this.addTask(i, this.format(tasks[i]));
	}
};

exports.run = function(options, taskName){
	var project = new Project(options);
	project.execute(taskName);
	return project;
};
exports.Project = Project;