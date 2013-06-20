/**
@module att
**/
var path = require('path');
var JSHint = require('jshint').JSHINT;
var jshint = require('jshint/lib/hint');
var CSSLint = require('csslint').CSSLint;


/**
att代码检查工具
    
    #检查js代码
    att hint script.js

    #检查src目录下的js和css代码
    att hint src/*

    #若在代码使用了保留关键字做变量名和方法名，警告提示
    att hint my.js --es5   

    #对于末尾缺少;的代码，警告提示
    att hint my.js --asi

@class hint
@namespace att.plugins
@static
**/
module.exports = function(att){
  
  var attutil = att.util;
  var fileutil = att.fileutil;


  /**
  att插件的终端帮助提示，在att终端中输入`att hint -h`可以显示此提示
  @method help
  @static
  **/
  this.help = function(){
    var str = ['Options:',
      ' --es5       若在代码使用了保留关键字做变量名和方法名，是否警告提示',
      ' --asi       对于末尾缺少;的代码是否警告提示',
      '',
      'Examples:',
      ' att hint my.js',
      '',
      ' #检查css',
      ' att hint my.css',
      '',
      ' #对保留关键字的使用使用警告',
      ' att hint my.js --es5'].join("\n").green;

    require('util').puts(str);
  }

  /**
  att插件初的初始化函数
  @method initialize
  @static
  **/
  this.initialize = function(options){
    this.options = options;
  }
  
  /**
  检查css代码的规范性
  @method hintCSS
  @static
  @param {String} file 文件路径
  @param {Object} options 检查参数
  **/
  this.hintCSS = function(file, options){
    var content = fileutil.read(file);
    var results = CSSLint.verify(content);
    messages = results.messages;
    if (!messages.length) {
      return console.log('[Perfect] %s', file);
    }
    for (i = 0, len = messages.length; i < len; i++) {
      console.log("    " + messages[i].message + 
        " (line " + messages[i].line + ", col " + messages[i].col + ")", messages[i].type);
    }
  }

  /**
  检查js代码的规范性
  @method hintJS
  @static
  @param {String} file 文件路径
  @param {Object} options 检查参数
  **/
  this.hintJS = function(file, options){
    var opts = attutil.merge(this.options.js, options);
    var r = jshint.hint([file], opts);
    if(!r.length){
      console.log('\nok %s\n'.yellow, file);
    }
  }


  /**
  根据文件判断使用JS还是CSS的检查器
  @method onFile
  @static
  @protected
  @param {String} input 文件路径
  **/
  this.hintFile = function(input, callback, options){
    var ext = fileutil.extname(input).toLowerCase();
    var opts ={};
    var argv = options.argv;
    if(argv.asi !== undefined){
      opts.asi = argv.asi;
    }
    if(argv.es5 !== undefined){
      opts.es5 = argv.es5;
    }
    if(ext == 'js'){
      this.hintJS(input, opts);
    }else if(ext == 'css'){
      this.hintCSS(input, opts);
    }
    callback();
  }

  /**
  依赖att终端执行hint，自动查找匹配到的文件并检查格式
  @method execute
  @static
  @param {String} argv 使用optimist模块解析出来的对象
      @param {String|Array} argv.input 输入文件，或文件数组
      @param {String|Function} argv.output (optional) 输出文件名，或文件转换函数
      @param {String} argv.glob 用于查找文件的glob字符
  @param {Function} callback 执行完的回调函数
  **/
  this.execute = function(argv, callback){
    var opts = {
      matchFunction: function(name){
        return name.match(/\.(css|js)$/i) && fileutil.isFile(name);
      },
      argv: argv
    }
    
    att.find(argv, function(input, output, callback, options){
       this.hintFile(input, callback, options);
    }.bind(this), callback, opts);
  }
}