var util = require('util'),
	child_process = require("child_process");

var project,
	beforeCallback = function(complete){
		//TODO execute git pull command before run task
		//Maybe https://github.com/christkv/node-git is a amazing library
		complete();
	};

exports.onActive = function(p, options){
	project = p;
	project.addBeforeCallback(beforeCallback);
}
exports.onDeactive = function(){
	project.removeBeforeCallback(beforeCallback);
}