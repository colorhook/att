'use strict';
/**
@module att
**/


/**
att资源文件压缩插件，压缩的对象可以是脚本，样式和图片。
    
    #忽略提示
    att minify *.* -s

    #指定输出文件名
    att minify my.js -o my.min.js

    #压缩图片并替换旧图
    att minify logo.png -o logo.png

att的js压缩使用了[`UglifyJS v2`](https://github.com/mishoo/UglifyJS2)实现。
在压缩的同时，加入了保留版权注释和去除log的功能。

+ &#x2F;*! ... *&#x2F; 类型的注释会保留

@class minify
@namespace builtins
@static
**/

module.exports = function(att){
  
  att.register('minify', 'minify html, css, js and image files', function(){

    var path = require('path');
    var minifier = require('node-minifier');
    var attutil = att.util;
    var fileutil = att.file;

    /**
    att插件的终端帮助提示，在att终端中输入`att minify -h`可以显示此提示

    @method help
    @static
    **/
    this.help = function(){
      var str = ['Options:',
        ' -s, --silent       无终端提示(No terminal prompt)',
        ' -d, --datauri      是否开启datauri编码(Enable datauri)',
        ' --copyright        是否保留/*! */ 注释',
        ' --remove-console   是否移除console',
        ' -o                 指定输出文件名(Output name)',
        '',
        'Custom:',
        ' Keep copyright: ' + this.options.js.copyright,
        ' Remove log: ' + this.options.js.removeLog,
        '',
        'Examples:',
        ' #忽略提示',
        ' att minify *.* -s',
        '',
        ' #压缩图片',
        ' att minify my.png -o my.min.png',
        '',
        ' #禁用datauri',
        ' att minify my.css -d 0'].join("\n").green;

      require('util').puts(str);
    };

    /**
    att插件初的初始化函数

    @method initialize
    @static
    **/
    this.initialize = function(options){
      this.options = {
        "js": {
          "copyright": true
        },
        "css": {
          "datauri": true
        },
        "image": {
          "pngquant": false
        },
        "html": {
          "removeComments": true,
          "removeCommentsFromCDATA": true,
          "removeCDATASectionsFromCDATA": true,
          "collapseWhitespace": true,
          "collapseBooleanAttributes": true,
          "removeAttributeQuotes": false,
          "removeRedundantAttributes": true,
          "useShortDoctype": true,
          "removeEmptyAttributes": true,
          "removeEmptyElements": false,
          "removeOptionalTags": false,
          "removeScriptTypeAttributes": true,
          "removeStyleLinkTypeAttributes": true
        }
      };
    }

    /**
    文件读写的私有封装方法

    @method _minifyWithTransform
    @static
    @private
    @param {String} transform 文件转换的闭包函数
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} callback 压缩完成后的回调函数
    @param {Object} options 压缩时的参数
    @example

        var transformJSON = function(content){
          return JSON.stringify(JSON.parse(content));
        }
        this.minifyJSON = function(input, output, callback, options){
          this._minifyWithTransform(transformJSON, input, output, callback, options);
        }
    **/
    this._minifyWithTransform = function(transform, input, output, callback, options){
      options = options || {};
      var charset = options.charset || 'utf-8';
      var filecontent = fileutil.read(input, charset);
      filecontent = transform(filecontent, options);
      fileutil.mkdir(path.dirname(output));
      fileutil.write(output, filecontent, charset);
      callback();
    }
    /**
    压缩JS资源文件
    @method minifyJS
    @static
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} callback 压缩完成后的回调函数
    @param {Object} options 压缩时的参数
    **/
    this.minifyJS = function(input, output, callback, options){
      var opts = attutil.merge(this.options.js, options);
      this._minifyWithTransform(function(filecontent){
        return minifier.minifyJS(filecontent, {
          remove: (opts.remove || []),
          copyright: opts.copyright
        });
      }, input, output, callback, opts);
    }

    /**
    压缩HTML资源文件
    @method minifyHTML
    @static
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} callback 压缩完成后的回调函数
    @param {Object} options 压缩时的参数
    **/
    this.minifyHTML = function(input, output, callback, options){
      var opts = attutil.merge(this.options.html, options);
      this._minifyWithTransform(function(filecontent){
        return minifier.minifyHTML(filecontent, opts);
      }, input, output, callback, opts);
    }

    /**
    压缩CSS资源文件
    @method minifyCSS
    @static
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} (optional) callback 压缩完成后的回调函数
    @param {Object} (optional) options 压缩时的参数
        @param {Boolean} options.datauri 压缩css时是否使用`datauri`
    @example

        var att = require('att');
        var minify = att.load('minify');

        minify.minifyCSS('/path/to/minify.css', '/path/to/minified.css');
    **/
    this.minifyCSS = function(input, output, callback, options){
      var opts = attutil.merge(this.options.css, options);
      this._minifyWithTransform(function(filecontent){
        return minifier.minifyCSS(filecontent, {
          datauri: opts.datauri,
          input: input,
          output: output,
          workspace: options.workspace,
          host: options.host,
          pathPrefix: options.pathPrefix
        });
      }.bind(this), input, output, callback, opts);
    };
    /**
    压缩图片资源文件
    @method minifyImage
    @static
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} (optional) callback 压缩完成后的回调函数
    @param {Object} (optional) options 压缩时的参数
    @example

        var att = require('att');
        var minify = att.load('minify');

        minify.minifyCSS('/path/to/minify.png', '/path/to/minified.png');
    **/
    this.minifyImage = function(input, output, callback, options){
      var opts = attutil.merge(this.options.image, options);
      minifier.minifyImage(input, output, function(e, data){
        if(e){
          callback && callback(e);
        }else{
          att.log.info(data.msg);
          callback(null);
        }
        
      }, opts)
    }

    /**
    压缩资源文件，文件可以是JS, CSS, HTML, 图片。
    @method minifyFile
    @static
    @param {String} input 资源文件的路径
    @param {String} output 资源文件压缩后保存的路径
    @param {String} callback 压缩完成后的回调函数
    @param {Object} options 压缩时的参数
        @param {Boolean} options.datauri 压缩css时是否使用datauri
    @example

        var att = require('att');
        var minify = att.load('minify');

        minify.minifyFile('/path/to/minify.png', '/path/to/minified.png');
    **/
    this.minifyFile = function(input, output, callback, options){
      options = options || {};
      input = path.normalize(input);
     
      var extname = fileutil.extname(input).toLowerCase();
      var method = 'minifyJS';
      if(extname == 'js'){
        method = 'minifyJS';
      }else if(extname == 'css'){
        method = 'minifyCSS';
      }else if(['html','htm'].indexOf(extname) >= 0){
        method = 'minifyHTML';
      }else if(['png','jpg','jpeg','gif'].indexOf(extname) >= 0){
        method ='minifyImage';
      }
      att.log.info("minify: " + input);
      this[method](input, output, function(e){
        if(e){
          att.log.warn("minify failed: " + input);
        }else{
          att.log.debug("minify succeed: " + input);
        }
        callback(e);
      }, options);
    };

    /**
    执行minfy，支持压缩html, css, js, 图片
    @method execute
    @static
    @param {String} argv 使用optimist模块解析出来的对象
    @param {Function} callback 执行完的回调函数
    **/
    this.execute = function(argv, callback){
      var opts = {
        matchFunction: function(name){
          return name.match(/\.(css|js|html|htm|png|jpg|jpeg|gif)$/i) && fileutil.isFile(name);
        },
        question: function(name){
          return 'minify ' + name + '? ';
        },
        datauri: argv.d || argv.datauri,
        copyright: argv.copyright
      }
      if(argv['remove-console']){
        opts.remove = ['console']
      }else{
        opts.remove = [];
      }
      att.find(argv, this.minifyFile.bind(this), callback, opts);
    }
  });
}