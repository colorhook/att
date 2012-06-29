var program = require("commander"),
    o_argv = require('optimist').argv,
    fs = require("fs"),
    path = require("path"),
    util = require("util"),
    AttUtil = require("./core/AttUtil.js"),
    FileUtil = require("./core/FileUtil.js");


program.confirm = function(str, fn, verbose){
  var self = this;
  this.prompt(str, function(ok){
    if (!ok.trim()) {
      return fn(true);
    }
    fn(/^y|yes|ok|true$/i.test(ok));
  });
};

var plugins = {},
    commandMap = {},
    configuration = exports.configuration = AttUtil.storage(),
    pluginOption = configuration.plugins || {},
    argv = process.argv.slice(0, 3);

//版本定义
exports.version = "3.0.0beta3";

//添加插件
var addPlugin = exports.addPlugin = function (module) {
        var name = module.name,
            description = module.description,
            action = module.action;
        plugins[name] = module;

        if (typeof module.initialize == 'function') {
            module.initialize(pluginOption[name] || {});
        }
        program.command(module.name).description(module.description).action(module.action);
    };
//获取插件
var getPlugin = exports.getPlugin = function (name) {
        return plugins[name];
    };
//根据路径或者路径列表自动装载插件
var loadPlugins = function (arr) {
        AttUtil.findFile(arr, function (item) {
            addPlugin(require(item));
        }, "js", false);
    };
//装载系统插件
loadPlugins(__dirname + "/plugins/");
//装载自定义插件
loadPlugins(configuration["external-plugins"]);

//添加命令
var addCommand = exports.addCommand = function (command) {
        commandMap[command.name] = command;
    };
//移除命令
var removeCommand = exports.removeCommand = function (name) {
        delete commandMap[name];
    };
//获取命令
var getCommand = exports.getCommand = function (name) {
        return commandMap[name];
    };

//执行命令
var executeCommand = exports.executeCommand = function (name, options, callback) {
        var command = commandMap[name];
        if (!command) {
            return callback(new Error('command named [' + name + '] not found'));
        }
        command.execute(options, callback);
    };
//根据路径或者路径列表自动装载命令
var loadCommands = function (arr) {
        AttUtil.findFile(arr, function (item) {
            addCommand(require(item));
        }, "js", false);
    };
//装载系统命令
loadCommands(__dirname + "/commands/");
//装载自定义命令
loadCommands(configuration["external-commands"]);

//att版本命令
if (argv.length <= 2 || argv[2].indexOf("-") === 0) {
    if (o_argv.v || o_argv.version) {
        console.log(exports.version);
    } else {
        console.log("att version \"%s\"", exports.version);
        console.log("Usage: att <plugin> <...args>");
        var printHelp = function (name) {
                console.log("  -> " + name + ":\t" + (plugins[name].description || ""));
            };
        for (var i in plugins) {
            printHelp(i);
        }
    }
    process.exit();
}
//定义默认命令
program.
command("*").
action(function (name) {
    if (name.name && name.name.indexOf) {
        name = name.name;
    }
    console.log("The att plugin <%s> is not defined.", name);
});

//解析前3个参数
program.parse(argv);