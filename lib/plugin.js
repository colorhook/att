'use strict';
/**
@module att
**/

var npm = require('npm');
var path = require('path');
var fileutil = require('fileutil');
var semver = require('semver');
var async = require('async');
var log = require('./log');
var config = require('./config');

/**
内部模块，用于应用的安装、卸载
@class plugin
@static
**/

/**
获得att内置模块
@method builtins
@static
@return {Array} 内置模块列表
@example
    
    //读出插件列表
    var list = this.builtins();


**/
exports.builtins = function(key, value){
  var data = [];
  fileutil.each(path.join(__dirname, 'builtins'), function(item){
    data.push(require(item.name));
  }, {
    recursive: false, 
    excludeDirectory: true, 
    matchFunction: function(item){
      return item.filename.match(/\.js$/i);
    }
  });
  return data;
}

/**
操作att命令的namespace
@method namespace
@static
@return {Object|String} 当前的namespace
@example
    
    //读出所以设置的命名空间
    var hash = this.namespace();
    
    //读出默认的命名空间
    var ns = this.namespace('cdn');

    //设置命名空间
    this.namespace('cdn', 'att-yunos-suite');

    //删除命名空间
    this.namespace('cdn', null);


**/
exports.namespace = function(key, value){
  if(key === undefined){
    return config.get('namespace');
  }
  if(arguments.length == 1){
    return config.get('namespace', key);
  }
  if(arguments.length == 2){
    if(value){
        config.set('namespace', key, value);
    }else{
        config.set('namespace', key, null);
    }
  }
}
/**
获得所有att插件
@method plugins
@static
@param {String|Array} filter 白名单过滤
@return {Array} 插件快照列表
@example

  var list = this.plugins()

  var list = this.plugins('my-plugin');

  var list = this.plugins(['att-yunos-suite', 'my-plugin']);
**/
exports.plugins = function(filter){
  var data = [];
  fileutil.each(path.join(__dirname, '..', 'plugins', 'node_modules'), function(item){
    var pkg = path.join(item.name, "/", "package.json");
    if(fileutil.exist(pkg)){
      var content = fileutil.read(pkg);
      try{
        content = JSON.parse(content);
      }catch(err){
        content = null;
      }
      if(content.name){
        if(!filter || 
          content.name === filter || 
          ((typeof filter ==='array') && filter.indexOf(content.name) != -1)){
          data.push({path: "../plugins/node_modules/"+item.filename, name: content.name, version: content.version});
        }
      }
    }
  }, {
    recursive: false, 
    excludeFile: true
  });
  return data;
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
@static
@param {Array} pkg 插件名称
@param {Function} callback 安装的回调函数
**/
exports.install = function(pkg, callback, registry){
  
  var self = this;

  var cfg = {
    prefix: path.normalize(__dirname + '/../plugins')
  }
  if(registry && registry !== true){
    cfg.registry = registry;
  }
  npm.load(cfg, function(e){
    if(e){
      return callback(e);
    }
    
    async.eachSeries(pkg, function(name, cb){
      if(name.indexOf("@ali/") === 0){
        return require('child_process').exec("tnpm install " + name, function(err, stdout, stderr){
          var dropVersionName = name.replace(/@[\d\.~><=]+$/, '');
          var pkgName = name.split("@ali/")[1].replace(/@[\d\.~><=]+$/, '');
          fileutil.move(__dirname + '/../node_modules/' + dropVersionName, __dirname + '/../plugins/node_modules/' + pkgName);
          
          //删除某个module
          var removePkg = function(pkgName){
            npm.commands.uninstall(pkgName, function(){});
          };

          //pkgName = pkgName.replace(/@[\d\.~><=]+$/, '');
          var jsonPath = path.join(__dirname, "../plugins/node_modules", pkgName, "package.json");
          var pjson = JSON.parse(fileutil.read(jsonPath));

          //如果engines中定义了att，判断是否能匹配到att的版本
          var attversion = (pjson.engines || {}).att;
          if(attversion && !isValidAttVersion(attversion)){
            log.error('the plugin require att version satisfies '+ attversion);
            return removePkg(pkgName);
          }
        
          var att = require('./att');
          att.loadPlugin(pkgName);
          
          log.debug('the plugin ' + name + ' has been installed.');
          cb();
        });
        return;
      }
      npm.commands.install(cfg.prefix, [name], function(e, results){

        if(e){
          return cb(e);
        }

        if(!results || !results.length){
          log.error('the plugin ' + pkg + ' was not found.');
          return cb();
        }

        //删除某个module
        var removePkg = function(pkg){
          pkg = pkg.replace(/@[\d\.~><=]+$/, '');
          npm.commands.uninstall(pkg, function(){});
        };

        //读出package.json
        var pkgName = results[results.length-1][4];
        pkgName = pkgName.indexOf('@') != -1 ? pkgName.split('@')[0] : pkgName;
        //pkgName = pkgName.replace(/@[\d\.~><=]+$/, '');
        var jsonPath = path.join(__dirname, "../plugins/node_modules", pkgName, "package.json");
        var pjson = JSON.parse(fileutil.read(jsonPath));

        //如果engines中定义了att，判断是否能匹配到att的版本
        var attversion = (pjson.engines || {}).att;
        if(attversion && !isValidAttVersion(attversion)){
          log.error('the plugin require att version satisfies '+ attversion);
          return removePkg(name);
        }
        
        var att = require('./att');
        att.loadPlugin(name);
        
        //记录到plugins.json
        log.debug('the plugin ' + name + ' has been installed.');

        cb();
      });

    }, callback);
    
  });
}
/**
卸载某个插件
@method uninstall
@static
@param {String|Array} pkg 插件名称
@param {Function} callback 卸载后的回调函数
**/
exports.uninstall = function(pkg, callback){
  var arr = [];
  if(typeof pkg !== 'array'){
    pkg = [pkg]
  }
  pkg.forEach(function(item){
    if(item.indexOf("@ali/") === 0){
      item = item.replace(/\@ali\//, '');
    }
    arr.push(item);
  });
  npm.load({
    prefix: path.normalize(__dirname + '/../plugins')
  }, function(e){
    if(e){
      return callback(e);
    }
    npm.commands.uninstall(arr, function(e){
      if(e){
        return callback(e);
      }
      var att = require('./att');
      att.unloadPlugin(pkg);
      callback();
    });
  });
}