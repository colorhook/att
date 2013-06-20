/**
@module att
**/

var npm = require('npm');
var path = require('path');
var fileutil = require('fileutil');
var semver = require('semver');
var async = require('async');
var log = require('./log');


/**
内部模块，用于应用的安装、卸载
@class plugin
@namespace att<internal>
@static
**/
var PLUGIN_CONFIG_PATH = exports.PLUGIN_CONFIG_PATH = path.join(__dirname, '..', 'conf', 'plugins.json');
/**
操作插件配置文件的简易方法
@method data
@param {String} key 插件的key字段
@param {Object} value 插件的value字段
@return {Object|null}
@example
    
    //读出插件列表
    var list = this.data();

    //根据插件名称读出插件
    var plugin = this.data('myplugin');

    //删除一个插件
    this.data('myplugin', null);

    //增加一个插件
    this.data('myplugin', {
        command: 'createapp',
        description: '创建一个app'
    });
**/
exports.data = function(key, value){
  var data = JSON.parse(fileutil.read(PLUGIN_CONFIG_PATH));
  if(key === undefined){
    return data;
  }
  if(value === undefined){
    return data[key];
  }
  if(value === null){
    delete data[key]
  }else{
    data[key] = value;
  }
  fileutil.write(PLUGIN_CONFIG_PATH, JSON.stringify(data, null, 4));
}

/**
为插件声明别名
@method alias
**/
exports.alias = function(plugin, alias){
  var data = this.data(plugin);
  if(!alias){
    delete data.alias;
  }else{
    data.alias = alias;
  }
  this.data(plugin, data);
}

/**
列出所有插件
@method list
@return {Object} 插件对象
**/
exports.list = function(){
  var data = this.data();
  var list = {};
  Object.keys(data).forEach(function(key){
    var item = data[key];
    list[(item.alias || item.command)] = {
      description: item.description,
      builtin: item.builtin,
      path: item.path,
      command: item.command,
      alias: item.alias,
      name: key
    }
  });
  return list;
}


//插件定义的att是否匹配当前att版本
var isValidAttVersion = function(version){
  var att = require('./att');
  var current = att.version;
  return semver.satisfies(current, version);
}
/**
安装某个插件
@method install
@param {Array} pkg 插件名称
@param {Function} callback 安装的回调函数
**/
exports.install = function(pkg, callback, alias, force, registry){
  
  var self = this;

  var cfg = {
    prefix: path.normalize(__dirname + '/..')
  }
  if(registry && registry !== true){
    cfg.registry = registry;
  }
  npm.load(cfg, function(e){
    if(e){
      return callback(e);
    }
    
    async.eachSeries(pkg, function(name, cb){
      
      //如果安装过
      var data = self.data(pkg);
      if(data && !force){
        return cb('the plugin ' + name + ' has been installed.');
      }

      npm.commands.install([name], function(e, results){

        if(e){
          return cb(e);
        }

        if(!results || !results.length){
          log.error('the plugin ' + pkg + ' was not found.');
          return cb();
        }

        //删除某个module
        var removePkg = function(pkg){
          pkg = pkg.indexOf('@') != -1 ? pkg.split('@')[0] : pkg;
          npm.commands.uninstall(pkg, function(){});
        };

        //读出package.json
        var pkgName = results[results.length-1][4];
        pkgName = pkgName.indexOf('@') != -1 ? pkgName.split('@')[0] : pkgName;
        var pjson = require(pkgName + "/package.json");

        //如果engines中定义了att，判断是否能匹配到att的版本
        var attversion = (pjson.engines || {}).att;
        if(attversion && !isValidAttVersion(attversion)){
          log.error('the plugin require att version satisfies '+ attversion);
          return removePkg(name);
        }
        var data = {
          command: pjson['att.command'],
          module: pjson['att.module'],
          description: (pjson['att.description'] || pjson.description)
        }
        //如果package.json中没有定义att.command, 则抛出异常
        if(!data.command){
          log.error('the att plugin in invalid, please set the att command in the package.json.');
          removePkg(name);
          return cb();
        }
        if(alias){
          data.alias = alias;
        }
        var command = data.alias || data.command;
        var list = exports.list();

        //如果命令已经存在于att中，则抛出异常
        if(list[command] && !force){
          log.error('the att command ' + command + ' has beed defined, ' + 
            'please set an alias by --alias for this plugin.');
          removePkg(name);
          return cb();
        }

        //记录到plugins.json
        exports.data(name, data);
        log.debug('the plugin ' + name + ' has been installed.');

        cb();
      });

    }, callback);
    
  });
}
/**
卸载某个插件
@method uninstall
@param {String} pkg 插件名称
@param {Function} callback 安装的回调函数
**/
exports.uninstall = function(pkg, callback){
  var data = this.data(pkg);
  if(!data){
    return callback('the plugin ' + pkg + ' was not installed.');
  }
  if(data.builtin){
    return callback('the plugin ' + pkg + ' is builtin, you can not uninstall it.');
  }
  npm.load({
    prefix: path.normalize(__dirname + '/..')
  }, function(e){
    if(e){
      return callback(e);
    }

    npm.commands.uninstall(pkg, function(e){
      exports.data(pkg, null);
      if(e){
        log.error(e.toString());
      }

      //unload plugin after uninstall it.
      require('./att').unload(pkg);

      log.debug('the plugin ' + pkg + ' has been removed.');
      callback();
    });
  });
}