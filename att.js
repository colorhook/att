var program = require("commander"),
	fs = require("fs"),
	path = require("path"),
	util = require("util"),
	AttUtil = require("./core/AttUtil.js"),
	FileUtil = require("./core/FileUtil.js");


var plugins = {},
	configuration = exports.configuration = AttUtil.storage(),
	pluginOption = configuration.plugins || {};
	argv = process.argv.slice();


var addPlugin = exports.addPlugin = function(module){
	var name = module.name,
		description = module.description,
		action = module.action;
	plugins[name] = module;
	if(typeof module.initialize == 'function'){
		module.initialize(pluginOption[name] || {});
	}
	program.command(name).description(description).action(action);
};
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
				addPlugin(plugin);
			}, {
				recursive: false,
				matchFunction: function(item){
					return item.name.match(/\.js$/i);
				}
			});
		}else if(stat.isFile()){
			plugin = require(arr);
			addPlugin(plugin.name, plugin.description, plugin.action);
		}
	}
};


//初始化系统插件
initializePlugins(__dirname + "/plugins/");
//初始化自定义插件
initializePlugins(configuration["external-plugins"]);
//定义help命令
program.
	command("help").
	action(function(){
		var name = process.argv[3],
			printHelp = function(name){
				console.log("  -> " + name + ":\t" +  (plugins[name].description || ""));

			};
		if(plugins[name]){
			printHelp(name);
		}else{
			for(var i in plugins){
				printHelp(i);
			}
		}
	});
//定义默认命令
program.
	command("*").
	action(function(name){
		console.log("The att plugin <" + name + "> is not defined.");
	});
//解析前3个参数
argv.length = 3;
program.parse(argv);