'use strict';
/**
@module att
**/

/**
根据模板创建项目
    
    att createapp appname

@class createapp
@namespace builtins
@static
**/
module.exports = function(att){
  
  att.register('createapp', 'create app by template', function(){

    var path = require('path');
    var TEMPLATE_DIR = __dirname + '/createapp';

    /**
    初始化createapp插件，自动扫描createapp模板

    @method initialize
    @static
    **/
    this.initialize = function(){
      var list = {};
      att.file.each(TEMPLATE_DIR, function(item){
        if(item.directory && item.filename != '.'){
          list[item.filename] = path.normalize(item.name);
        }
      }, {
        recursive: false
      });
      this.list = list;
    }

    /**
    att插件的终端帮助提示，在att终端中输入`att minify -h`可以显示此提示

    @method help
    @static
    **/
    this.help = function(){
      var str = ['Options:',
        ' -l, --list         列出所有模板',
        ' -t, --template     选择模板，默认模板是default',
        '',
        'Examples:',
        ' #忽略提示',
        ' att createapp myapp',
        '',
        ' #创建seajs app',
        ' att createapp seajs-example -t seajs',
        '',
        ' #创建jquery app',
        ' att createapp jquery-example -t jquery'].join("\n").green;

      require('util').puts(str);
    }

    /**
    执行createapp插件
    @method execute
    @param {Object} argv att参数
    @param {Function} callback 插件的回调函数
    **/
    this.execute = function(argv, callback){

      //输出模板列表
      if(argv.l || argv.list){
        var descriptions;
        try{
          descriptions = require('./createapp/description.js');
        }catch(err){
          descriptions = {};
        }
        Object.keys(this.list).forEach(function(key){
          if(key.charAt(0) != '.'){
            var desc = descriptions[key] ? descriptions[key] : "";
            console.log("  " + att.util.pad(key, 12) + desc);
          }
        });
        return callback();
      }

      //应用名称
      var name = argv._[1];
      if(!name){
        return callback('the app name is required.');
      }

      //应用模板
      var template = argv.t || argv.template || 'default';
      var dir = this.list[template];
      if(!dir){
        return callback('the template ' + template + ' was not found.');
      }

      //创建应用
      att.file.copy(dir, name, function(item){
          var filename = path.relative(__dirname, item);
          return !filename.match(/\.svn/);
      });
      if(!att.file.exist(name)){
        att.file.mkdir(name);
      }

      return callback();
    }

  });
}