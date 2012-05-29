var program = require("commander"),
	o_argv = require('optimist').argv,
	fs = require("fs"),
	path = require("path"),
	util = require("util"),
	AttUtil = require("./core/AttUtil.js"),
	FileUtil = require("./core/FileUtil.js");


var plugins = {},
	configuration = exports.configuration = AttUtil.storage(),
	pluginOption = configuration.plugins || {};
	argv = process.argv.slice(0, 3);


exports.version = "0.0.1";
//添加插件
var addPlugin = exports.addPlugin = function(module){
	var name = module.name,
		description = module.description,
		action = module.action;
	plugins[name] = module;

	if(typeof module.initialize == 'function'){
		module.initialize(pluginOption[name] || {});
	}
	program.command(module.name).description(module.description).action(module.action);
};
//获取插件
var getPlugin = exports.getPlugin = function(name){
	return plugins[name];
};
//根据路径或者路径列表自动装载插件
var loadPlugins = function(arr){
	if(!arr){
		return;
	}
	var plugin;
	if(util.isArray(arr)){
		arr.forEach(function(item){
			loadPlugins(item);
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
			addPlugin(plugin);
		}
	}
};
//装载系统插件
loadPlugins(__dirname + "/plugins/");
//装载自定义插件
loadPlugins(configuration["external-plugins"]);
//att版本命令
if(argv.length <= 2 || argv[2].indexOf("-") === 0){
	if(o_argv.v || o_argv.version){
		console.log("v%s", exports.version);
	}else{
		console.log("att version \"%s\"", exports.version);
		console.log("Usage: att <command> <...args>");
		var printHelp = function(name){
			console.log("  -> " + name + ":\t" +  (plugins[name].description || ""));
		};
		for(var i in plugins){
			printHelp(i);
		}
	}
	process.exit();
}
//定义默认命令
program.
	command("*").
	action(function(name){
		if(name.name.indexOf){
			name = name.name;
		}
		console.log("The att plugin <%s> is not defined.", name);
	});

//解析前3个参数
program.parse(argv);