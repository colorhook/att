'use strict';
/**
@module att
**/

/**
卸载插件
  
    att uninstall att-formatjson

@class uninstall
@namespace builtins
@static
**/


module.exports = function(att){
  
  att.register('uninstall', 'uninstall att plugin', function(){
    /**
    显示帮助信息
    @method help
    @return {String} 帮助信息
    **/
    this.help = function(){
      var str = ['Options:',
        'att uninstall [PLUGIN]',
        '',
        'Examples:',
        ' #忽略提示',
        ' att uninstall att-formatjson'].join("\n").green;

      require('util').puts(str);
    }

    /**
    执行卸载插件
    @method execute
    @param {Object} argv att参数
    @param {Function} callback 插件回调函数
    **/
    this.execute = function(argv, callback){
      var pkg = argv._[1];
      if(!pkg){
        att.log.warn('the plugin name is required.');
        return callback();
      }
      var plugin = require('../plugin');

      plugin.uninstall(pkg, callback);
      
    }
  });
}