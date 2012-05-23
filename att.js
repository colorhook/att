var program = require("commander"),
	fs = require("fs"),
	path = require("path"),
	util = require("util"),
	AttUtil = require("./core/AttUtil.js"),
	FileUtil = require("./core/FileUtil.js");


var configuration = AttUtil.storage();
var addPlugin = function(name, description, action){
	return program.command(name).description(description).action(action);
}
var initializePlugins = function(arr){
	if(!arr){
		return;
	}
	var plugin;
	if(util.isArray(arr)){
		arr.forEach(function(item){
			initializePlugins(item);
		});
	}else{
		var stat = fs.statSync(arr);
		if(stat.isDirectory()){
			FileUtil.each(arr, function(item){
				plugin = require(item.fullName);
				addPlugin(plugin.name, plugin.description, plugin.action);
			}, {
				matchFunction: function(item){
					return item.name.match(/\.js$/i)
				}
			});
		}else if(stat.isFile()){
			plugin = require(arr);
			addPlugin(plugin.name, plugin.description, plugin.action);
		}
	}
};
initializePlugins("./plugins/");
initializePlugins(configuration.plugins);

program.parse(process.argv);