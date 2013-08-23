/**
@module att
**/

/**
安装att插件的插件
  
    att install att-formatjson

    #如果安装过了，强制重新安装
    att install att-formatjson -f

    #指定特定的npm环境
    att install att-formatjson --registry=http://registry.npm.taobao.net

@class install
@namespace att.builtins
@static
**/


module.exports = function(att){
  
  att.register('install', 'install att plugin by npm module', function(){
    /**
    显示帮助信息
    @method help
    @return {String} 帮助信息
    **/
    this.help = function(){
      var str = ['Options:',
        'att install [PLUGIN]',
        ' -a, --alias       别名',
        ' -f, --force       如果该插件已经安装过，可以强制重新安装',
        ' --registry        指定特定的npm环境',
        '',
        'Examples:',
        ' #忽略提示',
        ' att install att-formatjson',
        '',
        ' #指定特定的npm环境',
        ' att install att-formatjson --registry=http://registry.npm.taobao.net'].join("\n").green;

      require('util').puts(str);
    }

    /**
    执行安装插件
    @method execute
    @param {Object} argv att参数
    @param {Function} callback 插件的回调函数
    **/
    this.execute = function(argv, callback){
      var pkg;
      var plugin = require('../plugin');

      //批量安装
      if(argv._.length > 2){
        pkg = argv._.splice(1);
      }else{
        pkg = [argv._[1]];
      }
      if(!pkg[0]){
        att.log.warn('the plugin name is required.');
        return callback();
      }

      plugin.install(pkg, callback, argv.registry);
    }
  });
}