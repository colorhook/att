'use strict';
/**
@module att
**/

/**
为att命令设置别名的插件

    #查看命名空间
    att namespace cdn

    #设置默认命名空间
    att namespace cdn att-yunos-suite



@class alias
@namespace att.plugins
@static
**/
module.exports = function(att){
  
  att.register('namespace', 'set a command running without :namespace by default', function(){
    /**
    显示帮助信息
    @method help
    @return {String} 帮助信息
    **/
    this.help = function(){
      var str = ['Options:',
        ' -l              列出所有命名空间',
        '',
        'Examples:',
        ' #查看命名空间',
        ' att namespace cdn',
        '',
        ' #指定别名',
        ' att namespace cdn att-yunos-suite'].join("\n").green;

      require('util').puts(str);
    }
    

    /**
    执行该插件
    @method execute
    @param {Object} argv 启动参数
    @param {Function} callback 回调函数
    **/
    this.execute = function(argv, callback){
      var plugin = require('../plugin');
      
      //列出所有别名
      if(argv.l || argv._.length == 1){
        var hash = plugin.namespace();
        Object.keys(hash).forEach(function(key){
          console.log('%s:%s', key, hash[key]);
        });
        return callback();
      }

      var oldname = argv._[1];
      var newname = argv._[2];

      if(!att.load(oldname)){
        return callback("the command " + oldname + " was not defined.");
      }

      //未声明别名
      if(!newname){
        //delete
        if(argv.d){
          plugin.namespace(oldname, null);
        //modify
        }else{
          var ns = plugin.namespace(oldname);
          if(ns){
            console.log(ns);
          }else{
            console.log("the command %s has none namespace, was a builtin command.", oldname);
          }
        }
        return callback();
      }
        
      var suite = att.plugins(newname);
      if(!suite){
        return callback("the plugin %s was not defined", newname);
      }
      if(!suite.items[oldname]){
        return callback("the plugin %s has no commnad named %s", newname, oldname);
      }

      //别名已存在
      plugin.namespace(oldname, newname);
      console.log("the command %s:%s set to be a default command", oldname, newname);

      callback();
    }
  });
}