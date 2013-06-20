/**
@module att
**/

/**
列出所有att插件
    
    att list

@class list
@namespace att.plugins
@static
**/


module.exports = function(att){
  
  var util = require('util');

  /**
  显示帮助信息
  @method help
  @return {String} 帮助信息
  **/
  this.help = function(){
    var str = ['Options:',
      ' att list',
      '',
      'Examples:',
      ' #列出插件信息',
      ' att list'].join("\n").green;

    util.puts(str);
  }

  /**
  执行list插件
  @method execute
  @param {Object} argv att参数
  @param {Function} callback 插件的回调函数
  **/
  this.execute = function(argv, callback){
    var plugin = require('../plugin');
    var list = plugin.list();

    var pad = function(str, len){
      var count = len - str.length;
      var padright = '';
      while(count-- > 0){
        padright += ' ';
      }
      return str + padright;
    }
    var result = [];
    var printPlugin = function (name) {
      var item = list[name];
      var line = "   command: " + pad(name, 16);
      line += "plugin: " + pad(item.name, 24) + "builtin: " + Boolean(item.builtin);
      util.puts(line);
      result.push(item);
    };

    Object.keys(list).forEach(function(key){
      printPlugin(key);
    });
    callback(null, result);
  }
}