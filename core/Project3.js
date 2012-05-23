var fs = require("node-fs"),
	program = require('commander'),
	path = require('path'),
	util = require('util'),
	events = require("events"),
	FileUtil = require("./FileUtil.js"),
	commandManager = require("./CommandManager.js").commandManager;


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
 * @description ����һ������
 */
var Project = function(options){
	events.EventEmitter.call(this);
	this.properties = {};
	this.commands = {};
	this.listeners = {};
	this.targets = {};
	this.verbose = true;
	this.silence = false;
	this._beforeCallbacks = [];
	this._afterCallbacks = [];
	this.initOptions(options);
};


util.inherits(Project, events.EventEmitter);
/**
 * @description ��ʽ���ַ���
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

Project.prototype.log = function(){
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
 * ���ݹ��̶���ı�����ʽ���ַ���
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
 * @description δ����������һ������
 */
Project.prototype.addProperty = function(key, value){
	this.properties[key] = value;
};
/**
 * @description ɾ�������ж����ĳ������
 */
Project.prototype.removeProperty = function(key){
	delete this.properties[key];
};
/**
 * @description ȡ�ù��̶����ĳ������
 */
Project.prototype.getProperty = function(key){
	var value = this.properties[key];
	return this.format(value);
};

/**
 * @description �ڹ���������һ��������
 */
Project.prototype.addListener = function(name, listener){
	if(this.listeners[name] != undefined){
		this.log("warn", "There has a listener named " + name + " has beed added");
		return;
	}
	this.listeners[name] = listener;
};
/**
 * @description �Ƴ�������ĳ��������
 */
Project.prototype.removeListener = function(name){
	delete this.listeners[name];
};
/**
 * @description ���ع�����ĳ��������������
 */
Project.prototype.getListener = function(name){
	return this.listeners[name];
};
/**
 * @description ���������
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
 * @description ȡ��������
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
 * @description �ڹ���������һ������
 */
Project.prototype.addTarget = function(name, target){
	this.targets[name] = target;
};

/**
 * @description �Ƴ�������ĳ������
 */
Project.prototype.removeTarget = function(name){
	delete this.targets[name];
};

/**
 * @description ���ع�����ĳ������
 */
Project.prototype.getTarget = function(name){
	return this.targets[name];
};


/**
 * ִ��ĳ��target��Ĭ��Ϊbuild
 */
Project.prototype.runTarget = function(name, targetSuccess, targetFail, ignoreDepends){
	if(name == undefined){
		name = "build";
	}else{
		name = name.trim();
	}
	
	

	if(!this.getTarget(name)){
		fail && fail();
		this.log("error", "target " + name + " not found");
		return;
	}

	var that = this,
		target = this.getTarget(name),
		depends = target.depends,
		finished = 0,
		dependsCompleted = false;
	
	
	
	if(depends && !ignoreDepends){
		if(!util.isArray(depends)){
			depends = depends.split(',');
		}


		doChainTask(depends, function(d, s, f){
			if(d && d.length){
				that.runTarget(d, s, f);
			}else{
				s();
			}
		}, function(){
			that.runTarget(name, targetSuccess, targetFail, true);
		});
		return;
	};

	var commandName = target.command;
	if(target.commandFile){
		var newCommand = require(target.commandFile);
		commandName = newCommand.name;
		commandManager.addCommand(newCommand);
	}
	if(!commandName){
		targetSuccess();
		return;
	}
	commandManager.executeCommand(commandName, target, targetSuccess, targetFail);
};

Project.prototype.run = function(){
	this.onBeforeExecute();
	var self = this;
	this._beforeExecute(function(){
		try{
			self.runTarget(this.targetName, function(){
				self.emit('complete');
				self.onAfterExecute();
			}, function(){
				self.emit('fail');
				self.onAfterExecute();
			});
		}catch(error){
			self.emit('fail');
			self.onAfterExecute();
		}
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
		listeners = this.listeners;
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
		listeners = this.listeners;

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
		self = this,
		properties = options.properties || {},
		listeners = options.listeners || {},
		targets = options.targets || {},
		imports = options["import"] || [];

	if(!util.isArray(imports)){
		imports = imports.split(',');
	}
	imports.forEach(function(item){
		if(item.length){
			self.initOptions(item);
		}
	});

	if(options.silence !== undefined){
		this.silence = options.silence;
	}
	for(i in properties){
		this.addProperty(i, this.format(properties[i]));
	}
	for(i in listeners){
		this.addListener(i, this.format(listeners[i]));
	}
	for(i in targets){
		this.addTarget(i, this.format(targets[i]));
	}
};


exports.Project = Project;

exports.run = function(options){
	var project = new Project(options);
	project.run();
	return project;
};