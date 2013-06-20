/**
@module att
**/

/**
为att命令设置别名的插件

    #设置别名
    att alias minify min

    #删除别名
    att alias minify -d

    #列出所有别名
    att alias -l

@class alias
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
      ' -d              删除插件别名',
      ' -l              列出所有别名',
      '',
      'Examples:',
      ' #列出所有别名',
      ' att alias -l',
      '',
      ' #指定别名',
      ' att alias minify min'].join("\n").green;

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
    
    var data = plugin.data();
    var list = plugin.list();

    //列出所有别名
    if(argv.l){
      Object.keys(data).forEach(function(key){
        var item = data[key];
        if(item.alias){
          console.log('plugin: %s    command: %s     alias: %s', key, item.command, item.alias);
        }
      });
      return;
    }

    var oldname = argv._[1];
    var newname = argv._[2];

    //未输入插件名称，直接显示帮助信息
    if(!oldname){
      att.log.warn('the plugin name is required.');
      return callback();
    }

    //通过command或别名指定插件
    if(!data[oldname]){
      if(list[oldname] && list[oldname].name){
        oldname = list[oldname].name;
      }
    }

    //插件不存在
    if(!data[oldname]){
      att.log.warn('the att plugin ' + oldname + ' was not found, please choose another plugin.');
      return callback();
    }

    //删除插件的别名
    if(argv.d){
      plugin.alias(oldname, null);
      att.log.info('the alias of att plugin ' + oldname + ' has been removed.');
      return callback();
    }

    //未声明别名
    if(!newname){
      att.log.warn('please specify the alias name.');
      return callback();
    }
   
    //别名已存在
    if(list[newname]){
      att.log.warn('the att command ' + newname + ' was defined, please choose another alias.');
      return callback();
    }

    //设置别名
    plugin.alias(oldname, newname);

    att.log.info('the att plugin ' + oldname + ' get an alias named ' + newname + '.');
    callback();
  }
}