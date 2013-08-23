'use strict';
/**
@module att
**/
var path = require('path');
var fileutil = require('fileutil');

/**
att的config对象。att启动时会加载conf下的att.json配置文件，config对象是根据配置文件解析出来的hash对象
@class config
@namespace att
@static
**/
module.exports = {
  
  /**
  根据名称获得配置
  @method get
  @param {...rest} arguments 可变长度的参数
  @static
  @return {Object} 返回值
  @param
      
      var value = this.get(); //整个配置

      var value = this.get('key1'); //key1

      var value = this.get('key1', 'subkey'); //key1.subkey
  **/
  get: function(){
     var args = Array.prototype.slice.call(arguments, 0);
     var data = JSON.parse(this.load());
     if(args.length == 0){
      return data;
     }
     var result = data[args.shift()];
     while(result != null && args.length){
       result = result[args.shift()];
     }
     return result;
  },
  
  /**
  根据名称和值设置配置环境
  @method set
  @param {...rest} arguments 可变长度的参数
  @static
  @param
      
      this.set('key1', 'value'); //整个配置Object

      this.set('key1', 'subkey', 'value'); //key1.subkey = 'value'
  **/
  set: function(){
    var args = Array.prototype.slice.call(arguments, 0);
    if(args.length < 2){
      return;
    }
    var data = JSON.parse(this.load());
    var value = args.pop();
    var host = data;
    var key = args.shift();

    while(args.length){
     if(!host[key]){ 
       host[key] = {};
     }
     host = host[key];
     key = args.shift();
    }
    if(value === null && value === undefined){
      delete host[key];
    }else{
      host[key] = value;
    }
    this.save(JSON.stringify(data, null, 2));
  },
  
  /**
  载入配置文件的文本值
  @method load
  @static
  @return {String} 配置文件的内容
  @param
      
      var value = this.load(); //整个配置文本
  **/
  load: function(){
    return fileutil.read(this.path);
  },

  /**
  保存配置文件的文本值
  @method save
  @static
  @param data {String} 配置文件的内容
      
      this.save('.........');
  **/
  save: function(data){
    return fileutil.write(this.path, data);
  }
};

/**
att配置文件的路径
@property path
@static
@readonly
**/
Object.defineProperty(module.exports, 'path', {
  value: path.join(__dirname, '..', 'conf', 'att.json'),
  writable:false
});