/**
@module att
**/



/**
datauri插件。

你可以对css或者图片执行该插件。

如果目标是一个css文件，该插件会扫描文件中引用的图片，然后转换成DataURI编码过的css新文件。
在下列两种情况下，会忽略DataURI转换：

+ css选择器中url定义的图片路径以`?du`结尾，例如： 
        
        background: {url: (icon.png?du)}

如果目标是图片，则会计算图片的dataurl信息保存到新文件中。
@class datauri
@namespace att.builtins
@static
**/
module.exports = function(att){
  
  att.register('datauri', 'datauri the css or image', function(){

    var path = require('path');
    var fs = require('fs');
    var minifier = require('node-minifier');

    var attutil = att.util;
    var fileutil = att.file;


    /**
    att插件的终端帮助提示，在att终端中输入`att datauri -h`可以显示此提示
    @method help
    @static
    **/
    this.help = function(){
      var str = ['Options:',
        ' -s, --silent        无终端提示',
        ' --ie                忽略支持IE6/7',
        '',
        'Examples:',
        ' att datauri my.css',
        '',
        ' #忽略支持IE6/7',
        ' att datauri my.css --ie=0'].join("\n").green;

      require('util').puts(str);
    }

    /**
    att插件初始化函数
    @method initialize
    @static
    @param {Object} options 初始化的参数，从att.json中读入配置参数
    **/
    this.initialize = function(options){
      this.options = {
         "ieSupport": true
      };
    }

    /**
    执行datauri，将css中的图片转换成base64编码
    @method transformFile
    @static
    @param {String} input 输入文件的路径
    @param {String} output 输出文件的路径
    @param {Function} callback 执行完的回调函数
    @param {Object} options 配置参数，详情请查看`transform`方法
    @example

        var att = require('att');
        var datauri = att.load('datauri');
        datauri.transfromFile('/path/reset.css', '/path/reset.datauri.css');
    **/
    this.transformFile = function(input, output, callback, options){
      options = options || {};
      var charset = options.charset || 'utf-8';
      var filecontent = fileutil.read(input, charset);
      options.input = input;
      filecontent = minifier.datauri(filecontent,  options);
      fileutil.write(output, filecontent);
      callback && callback();
    }

    /**
    执行datauri，将css中的图片转换成base64编码
    @method datauri
    @static
    @param {String} argv optimist模块解析出来的参数
    @param {Function} callback 执行完的回调函数
    @example

        #忽略提示
        att datauri reset.css -s

        #指定输出文件名，不对ie做兼容
        att datauri reset.css -o reset-datauri.css --ie=0

    **/
    this.execute = function(argv, callback){
      var opts = {
        matchFunction: function(name){
          return name.match(/\.(css|less|sass|stylus)$/i) && fileutil.isFile(name);
        },
        question: function(name){
          return 'minify ' + name + '? ';
        }
      }
      if(argv.ie !== undefined){
        opts.ieSupport = attutil.toBoolean(argv.ie);
      }
      att.find(argv, this.transformFile.bind(this), callback, opts);
    }

  });

}