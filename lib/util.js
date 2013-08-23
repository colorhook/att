'use strict';
/**
@module att
**/
var util = require("util");
var http = require("http");
var https = require("https");
var url = require('url');
var path = require('path');
var querystring = require('querystring');

var fileutil = require('fileutil');

var TOSTRING =  Object.prototype.toString;
var TYPES = {
  'undefined':'undefined',
  'number':'number',
  'boolean':'boolean',
  'string':'string',
  '[object Function]':'function',
  '[object RegExp]':'regexp',
  '[object Array]':'array',
  '[object Date]':'date',
  '[object Error]':'error'
};

/**
att的静态工具类，提供变量类型检测和网络请求等一些常用方法。
@class util
@namespace att
@static
**/
module.exports = {
  
  /**
  返回某个变量的类型
  @method type
  @static
  @param {Object} o 某个对象
  @return {String} 对象类型
  **/
  type: function(o){
    return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? 'object' : 'null');
  },
  /**
  检测某个对象是否是数字
  @method isNumber
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为数字
  **/
  isNumber: function(o){
    return typeof o === 'number' && isFinite(o);
  },
  /**
  检测某个对象是否是布尔值
  @method isBoolean
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为布尔值
  **/
  isBoolean: function(o){
     return typeof o === 'boolean';
  },
  /**
  检测某个对象是否是字符串
  @method isString
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为字符串
  **/
  isString: function(o){
    return typeof o === 'string';
  },
  /**
  检测某个对象是否是数组
  @method isArray
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为数组
  **/
  isArray: function(o){
    return util.isArray(o);
  },
  /**
  检测某个对象是否是函数
  @method isFunction
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为函数
  **/
  isFunction: function(o){
    return this.type(o) === 'function';
  },
  /**
  检测某个对象是否是日期
  @method isDate
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为日期
  **/
  isDate: function(o){
    return util.isDate(o);
  },
  /**
  检测某个对象是否是正则表达式
  @method isRegExp
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为正则表达式
  **/
  isRegExp: function(o){
    return util.isRegExp(o);
  },

  /**
  检测某个对象是否是Error对象
  @method isError
  @static
  @param {Object} o 某个对象
  @return {Boolean} 是否为Error对象
  **/
  isError: function(o){
    return util.isError(o);
  },
  

  /**
  转换一个字符串成布尔值
  @method toBoolean
  @static
  @param {Object} v 某个string
  @return {Boolean} 布尔值
  @example

      var attutil = att.util;
      attutil.toBoolean('true'); //true
      attutil.toBoolean('1'); //true
      attutil.toBoolean('ok'); //true
      attutil.toBoolean('yes'); //true

      //大小写不明感
      attutil.toBoolean('YES'); //true
  **/
  toBoolean: function(v){
    if (!v) {
        return false;
    }
    if(this.isBoolean(v)){
      return v;
    }
    if(!this.isString(v)){
      v = v.toString();
    }
    v = v.toLowerCase();
    if (v == "1" || v == "true" || v == "ok" || v == "yes" || v == 'y') {
        return true;
    }
    return false;
  },

  /**
  合并多个对象到一个新的对象
  @method merge
  @static
  @param {Object} ...rest
  @return {Object} 合并之后的新对象
  @example

      var a = {
        key1: 'a_v1',
        key2: 'a_v2'
      }
      var b = {
        key2: 'b_v2',
        key3: 'b_v3'
      }
      var c = util.merge(a, b);
      // c = {key1: 'a_v1', key2: 'b_v2', key3: 'b_v3'}
  **/
  merge: function(s1, s2){
    var i = 0;
    var len = arguments.length;
    var result = {};
    var key, obj;

    for (; i < len; ++i) {
      obj = arguments[i];
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
      }
    }
    return result;
  },
    
  /**
  使用空白补全字符
  @method pad
  @static
  @example
        
        var line = att.util.pad('command', 16) + 'command description');
  **/
  pad: function(str, len, leftMode, code){
    var result = '';
    var count = len - str.length;
    while(count-- >= 0){
      result += code ? code : ' ';
    }
    return leftMode ? (result + str) : (str + result);
  },
  /**
  根据字典替代字符串中的自定义变量
  @method sustitute
  @static
  @param {String} str 某个string
  @param {Object} dict 字典对象
  @return {String} 使用变量替换过后的新字符串
  @example

      var attutil = att.util;
      attutil.substitute('hello, ${name}', {name: 'att'}); //hello, att

  **/
  substitute: function(str, dict){
    if (typeof str !== "string") {
      var v = JSON.stringify(str);
      v = this.substitute(v, dict);
      return JSON.parse(v);
    }

    var getValue = function (key) {
      if (util.isArray(dict)) {
        for (var i = 0, l = dict.length; i < l; i++) {
          if (getValue(dict[i]) !== undefined) {
            return getValue(dict[i]);
          }
        }
        return undefined;
      } else {
        return dict[key];
      }
    };
    str = str.replace(/\$\{([a-zA-Z0-9\-\._]+)\}/g, function (match, key) {
      var s = getValue(key);
      if (s === undefined) {
        return match;
      }
      return s;
    });
    return str;
  },

  /**
  获取代码注释中的某项内容
  @method comment
  @static
  @param {String} key 注释的key
  @param {String} content 代码文件内容
  @return {String} 注释中代表key的内容
  @example

      var attutil = att.util;
      var fileutil = att.fileutil;
      util.comment('version', fileutil.read('seed.js')); 
      util.comment('author', fileutil.read('seed.js')); 
  **/
  comment: function(key, content){
    var matches = content.match(/\/\*[.\s\S]+?\*\//),
      map = {},
      ret;

    if (!matches || !matches[0]) {
      return null;
    }
    matches[0].replace(/\S?\**\s*@(\w+)\s*([^@\*]+)/g, function (match, v1, v2) {
      if (!ret && v1.trim() == key) {
        ret = v2.trim();
        if(ret.charAt(0) == ':'){
          ret = ret.substr(1).trim();
        }
      }
    });
    return ret;
  },
  /**
  @method request
  @static
  @param {Object|String} options 请求的URL或者请求的参数
      @param {String} options.url 请求的URL
      @param {String} options.method 请求的方法，默认为`GET`
      @param {Object} options.headers (optional) 请求的头信息
  @param {Function} callback 请求的回调函数
  @example

      #快速地执行GET请求
      var url = 'http://my-domain/my-service/?param=data';
      util.request(url, function(e, data){
        console.log('the response is: %s', data);
      });

      #指定method和data
      var options = {
        url: 'the http or https url',
        method: 'POST',
        data: {
          client: 'att',
          msg: 'some message'
        }
      }
      util.request(options, function(e, data){});
  **/
  request: function(options, callback){
    if(typeof options == 'string'){
      options = {
        url: options
      }
    }
    var endpoint = options.url;
    var urlParsed = url.parse(endpoint);
    var requestOptions = {
      host: urlParsed.hostname,
      port: urlParsed.port,
      path: urlParsed.pathname,
      method: options.method ? options.method.toUpperCase() : 'GET',
      headers: options.headers || {},
      auth: options.auth,
      agent: options.agent
    }

    var req;
    var onRequest = function(response){
      var resBody = '';
      response.setEncoding('utf8');
      response.on('data', function(chunk){
        resBody += chunk;
      });
      response.on('end', function(e){
        callback && callback(e, resBody);
      });
    }

    var query = urlParsed.query;
    if(query){
      requestOptions.path += '?' + query;
    }
    var strParam;
    if(options.data){
       strParam = querystring.stringify(options.data);
    }
    if(requestOptions.method == 'POST'){
      if(strParam){
        var headers = requestOptions.headers;
        var defaultContentType = 'application/x-www-form-urlencoded';
        if(!headers['Content-Type']){
          headers['Content-Type'] = defaultContentType;
        }
        headers['Content-Length'] = strParam.length;
      }
    }else {
      if(strParam){
        if(query){
          requestOptions.path += '&';
        }
        requestOptions.path += strParam;
      }
    }
    if(urlParsed.protocol == 'https:'){
      req = https.request(requestOptions, onRequest);
    }else{
      req = http.request(requestOptions, onRequest);
    }
    if(requestOptions.method == 'POST'){
      req.write(strParam);
    }
    req.on('error', function (e) {
      callback && callback(e);
    });
    req.end();
  },

  /**
  在指定目录查找某个文件，如果查找不到，则往文件夹上查找
  @method findup
  @static
  @param {String} name 文件名
  @param {String} charset 文件编码
  @param {String} dir 初始查找目录
  @example

      var content = this.findup(".htaccess", '/var/www/subdomin/app/dir');

  **/
  findup: function(name, dir, charset){
    dir = path.normalize(dir || process.cwd());
    var file = path.join(dir, name);
    if(fileutil.isFile(file)){
      return {
        dir: dir,
        data: fileutil.read(file, charset)
      }
    }
    var updir = path.dirname(dir);
    if(updir === dir){
      return null;
    }
    return this.findup(name, updir, charset);
  },

  /**
  获取指定目录的att配置
  @method getConfig
  @static
  @param {String} dir 指定目录，如果改参数缺失就是指当前目录
  @example

    var config = this.getConfig();
    console.log(config);

  **/
  getConfig: function(dir){
    var result = this.findup(".att", dir);
    if(!result){
      return null;
    }
    var json;
    try{
      json = JSON.parse(result.data)
    }catch(err){}
    return {
      dir: result.dir,
      data: (json || {})
    }
  }
}