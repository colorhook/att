'use strict';
/**
@module att
**/

/**
代码格式化插件
@class beautify
@static
@namespace builtins
**/
module.exports = function(att){

  var fileutil = att.file;
  var path = require('path');

  att.register('beautify', 'format the code to be beautiful', function(){
    /**
    初始化插件
    @method initialize
    @static
    @protected
    **/
    this.initialize = function(){
      /**
      默认的配置
      @property options
      @type {Object}
      **/
      this.options = {
        js: {
          indent_size: 4
        },
        json: {
          indent_size: 4
        },
        css: {
          indent_size: 4
        },
        html: {
          indent_size: 4
        }
      }
    }

    /**
    格式化JSON文件
    @method beautifyHTML
    @static
    @param {String} input 输入文件名
    @param {String} output 输出文件名
    @param {Function} callback 回调函数
    @param {Object} options 格式化参数
    **/
    this.beautifyJSON = function(input, output, callback, options) {
      options = options || {};
      var indent = options.indent || this.options.json.indent_size;
      this._beautifyWithTransform(function(content) {
        return JSON.stringify(JSON.parse(content), null, indent);
      }, input, output, callback, options);
    },

    /**
    格式化HTML文件
    @method beautifyHTML
    @static
    @param {String} input 输入文件名
    @param {String} output 输出文件名
    @param {Function} callback 回调函数
    @param {Object} options 格式化参数
    **/
    this.beautifyHTML = function(input, output, callback, options) {
      var lib = require('js-beautify');
      options = options || {};
      var indent = options.indent || this.options.html.indent_size;
      this._beautifyWithTransform(function(content) {
        return lib.html(content, {
          indent_size: indent
        });
      }, input, output, callback, options);
    },

    /**
    格式化CSS
    @method beautifyCSS
    @static
    @param {String} input 输入文件名
    @param {String} output 输出文件名
    @param {Function} callback 回调函数
    @param {Object} options 格式化参数
    **/
    this.beautifyCSS = function(input, output, callback, options) {
      var lib = require('js-beautify');
      options = options || {};
      var indent = options.indent || this.options.css.indent_size;
      this._beautifyWithTransform(function(content) {
        return lib.css(content, {
          indent_size: indent
        });
      }, input, output, callback, options);
    }

    /**
    格式化JS
    @method beautifyJS
    @static
    @param {String} input 输入文件名
    @param {String} output 输出文件名
    @param {Function} callback 回调函数
    @param {Object} options 格式化参数
    **/
    this.beautifyJS = function(input, output, callback, options) {
      var lib = require('js-beautify');
      options = options || {};
      var indent = options.indent || this.options.css.indent_size;
      this._beautifyWithTransform(function(content) {
        return lib(content, {
          indent_size: indent
        });
      }, input, output, callback, options);
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
    this._beautifyWithTransform = function(transform, input, output, callback, options) {
      options = options || {};
      var charset = options.charset || 'utf-8';
      var filecontent = fileutil.read(input, charset);
      filecontent = transform(filecontent, options);
      fileutil.mkdir(path.dirname(output));
      fileutil.write(output, filecontent, charset);
      callback();
    }

    /**
    格式化文件
    @method beautifyFile
    @static
    @param {String} input 输入文件名
    @param {String} output 输出文件名
    @param {Function} callback 回调函数
    @param {Object} options 格式化参数
    **/
    this.beautifyFile = function(input, output, callback, options) {
      options = options || {};
      input = path.normalize(input);
      if(options.overwrite){
        output = input;
      }
      att.log.info("beautify: " + input);

      var extname = fileutil.extname(input).toLowerCase();
      var method;
      if (extname == 'js') {
        method = 'beautifyJS';
      } else if (extname == 'css') {
        method = 'beautifyCSS';
      } else if (['html', 'htm'].indexOf(extname) >= 0) {
        method = 'beautifyHTML';
      } else if (extname == 'json') {
        method = 'beautifyJSON';
      }

      this[method](input, output, function(e){
        if(e){
          att.log.warn("beautify failed: " + input);
        }else{
          att.log.debug("beautify succeed: " + input);
        }
        callback(e);
      }, options);
    }

    /**
    显示帮助信息
    @method help
    @return {String} 帮助信息
    **/
    this.help = function(){
      var str = ['Options:',
        'att beautify file',
        '',
        'Examples:',
        ' #格式化文件',
        ' att beautify my.js'].join("\n").green;

      require('util').puts(str);
    }

   

    /**
    执行beautifier，支持html, css, js, json
    @method execute
    @static
    @param {String} argv 使用optimist模块解析出来的对象
    @param {Function} callback 执行完的回调函数
    **/
    this.execute = function(argv, callback){
      var opts = {
        matchFunction: function(name){
          return name.match(/\.(css|js|html|htm|json)$/i) && fileutil.isFile(name);
        },
        question: function(name){
          return 'beautify ' + name + '? ';
        },
        indent: argv.indent,
        overwrite: argv.overwrite
      }
      //默认覆盖
      var outputName = argv.o || argv.output;
      if(outputName === undefined){
        opts.overwrite = true;
      }
      att.find(argv, this.beautifyFile.bind(this), callback, opts);
    }

  });

}