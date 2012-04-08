var util = require('util'),
	child_process = require("child_process");

var project,
	afterCallback = function(complete){
		//TODO execute git push command after run task
		//Maybe https://github.com/christkv/node-git is a amazing library
		complete();
	};

exports.onActive = function(p, options){
	project = p;
	project.addAfterCallback(afterCallback);
};
exports.onDeactive = function(){
	project.removeAfterCallback(afterCallback);
};