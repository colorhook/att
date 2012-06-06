var fs = require("node-fs"),
	program = require('commander'),
	path = require('path'),
	util = require('util'),
	events = require("events"),
	FileUtil = require("./FileUtil.js"),
	AttUtil = require("./AttUtil.js"),
	Reporter = require("./Reporter.js").Reporter;


/**
 * @constructor
 * @description 定义一个工程
 */
var Project = function(){
	events.EventEmitter.call(this);
	this.properties = {};
	this.commands = {};
	this.listeners = {};
	this.targets = {};
	this.verbose = true;
	this._beforeCallbacks = [];
	this._afterCallbacks = [];
	this.defaultTargetName = "build";
	this.logLevel = "info";
	this.targetName = null;
	this.reporter = new Reporter(this);
};


util.inherits(Project, events.EventEmitter);


Project.prototype.log = function(type, message){
	this.emit('log', type, message);
	var map = {
			"log" : 0,
			"info" : 1,
			"verbose" : 2,
			"debug": 3,
			"warn": 4,
			"error": 5
		},
		v1 = map[this.logLevel],
		v2 = map[type];

	if(v1 >= v2){
		console.log("========== ATT [" + type + "] " + message);
	}
};

/**
 * 根据工程定义的变量格式化字符串
 */
Project.prototype.format = function(value){
	return AttUtil.format(value, this.properties);
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
	listenerModule.initialize(this, listener.options);
};
/**
 * @description 取消监听器
 */
Project.prototype.deactiveListener = function(name){

	var listener = this.listeners[name],
		listenerModule,
		listenerFile;
	
	if(!listener){
		return;
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
	listenerModule.dispose(this, listener.options);
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
Project.prototype.addTarget = function(name, target){
	this.targets[name] = target;
};

/**
 * @description 移除工程中某个任务
 */
Project.prototype.removeTarget = function(name){
	delete this.targets[name];
};

/**
 * @description 返回工程中某个任务
 */
Project.prototype.getTarget = function(name){
	return this.targets[name];
};


/**
 * 执行某个target，默认为build
 */
Project.prototype.runTarget = function(name, callback, ignoreDepends){

	if(name === undefined){
		name = this.defaultTargetName;
	}else{
		name = name.trim();
	}
	if(!this.getTarget(name)){
		var e = new Error("target " + name + " was not found");
		this.emit('targetNotFound', this, name, e);
		callback(e);
		return;
	}

	var that = this,
		target = this.getTarget(name),
		depends = target.depends;
	if(depends && !ignoreDepends){
		AttUtil.doSequenceTasks(depends, function(d, callback2){
			if(!d || d=== ""){
				callback2();
			}else{
				that.runTarget(d, function(e){
					if(e){
						callback(e);
					}else{
						callback2();
					}
				});
			}
		}, function(){
			that.runTarget(name, callback, true);
		});
		return;
	}
	this.emit('targetStart', target);
	target.run(function(err){
		that.emit('targetFinish', target, err);
		callback(err);
	}, function(err, commandName, data){
		that.emit('targetItem', target, err, commandName, data);
	});
};

Project.prototype.run = function(targetName){
	var self = this;
	this.targetName = targetName || this.defaultTargetName;
	Project.currentProject = this;
	this.emit("beforeStart", self);
	this.onBeforeExecute();
	this._beforeExecute(function(){
		self.emit("start", self);
		self.runTarget(self.targetName, function(err){
			self.emit("beforeFinish", self);
			self.onAfterExecute(function(){
				self.emit("finish", self, err);
			});
		});
	});
};


Project.prototype._beforeExecute = function(callback){
	AttUtil.doSequenceTasks(this._beforeCallbacks, function(item, success){
		item(success);
	}, callback);
};
/**
 * @description defore the project start to execute, active all the relatived listeners.
 */
Project.prototype.onBeforeExecute = function(){
	var that = this,
		listeners = this.listeners;
	if(listeners && util.isArray(listeners)){
		listeners.forEach(function(item){
			that.activeListener(item);
		});
	}
};
Project.prototype._afterExecute = function(callback){
	AttUtil.doSequenceTasks(this._afterCallbacks, function(item, success){
		item(success);
	}, callback);
};
/**
 * @description after the project executed, deactive all the relatived listeners.
 */
Project.prototype.onAfterExecute = function(callback){
	var that = this,
		listeners = this.listeners;
	
	this._afterExecute(function(err){
		if(listeners && util.isArray(listeners)){
			listeners.forEach(function(item){
				that.deactiveListener(item);
			});
		}
		process.stdin.destroy();
		callback();
		Project.currentProject = null;
	});
};



exports.Project = Project;
