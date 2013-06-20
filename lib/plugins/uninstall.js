/**
@module att
**/

/**
卸载插件
  
    att uninstall att-formatjson

@class uninstall
@namespace att.plugins
@static
**/


module.exports = function(att){
  
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

    var data = plugin.data();

    if(data[pkg]){
      plugin.uninstall(pkg, callback);
    }else{
      var list = plugin.list();
      if(!list[pkg]){
        att.log.warn('the plugin ' + pkg + ' has not been installed');
        return callback();
      }
      var realname = list[pkg].name;
      att.ask(pkg + ' is an att command, do you mean to uninstall the plugin ' + realname + ' ?', function(yes){
        if(yes){
          plugin.uninstall(realname, callback);
        }else{
          callback();
        }
      });
    }
    
  }
}