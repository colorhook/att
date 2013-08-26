'use strict';
/**
@module att
**/

var util = require('util');

/**
att日志打印对象
    
    att.log.info("plugin executed succeed.")

@class log
@static
**/
var log = {

  /**
  `LOG`等级
  @property LOG
  @final
  @static
  @type int
  **/
  LOG: 0,

  /**
  `INFO`等级
  @property INFO
  @final
  @static
  @type int
  **/
  INFO: 1,

  /**
  `DEBUG`等级
  @property DEBUG
  @final
  @static
  @type int
  **/
  DEBUG: 2,

  /**
  `WARN`等级
  @property WARN
  @final
  @static
  @type int
  **/
  WARN: 3,

  /**
  `ERROR`等级
  @property ERROR
  @final
  @static
  @type int
  **/
  ERROR: 4,

  /**
  level等级
  @property level
  @static
  @type int
  **/

  level: 1,

  /**
  日志是否开启
  @property enabled
  @static
  @type Boolean
  @default false
  **/
  enabled: false
}

/**
打印日志到控制台
@method _log
@private
@static
@param {int} level 记录等级
@param {String} message 日志
**/
log._log = function(level, message){
  if(!this.enabled){
    return;
  }
  if(this.level > level){
    return;
  }
  var cate = ['LOG', 'INFO', 'DEBUG', 'WARN', 'ERROR'];
  var colorMap = ['white', 'cyan', 'green', 'magenta', 'red'];
  var msg = ('[' + cate[level] + '] ' + message)[colorMap[level]];
  util.puts(msg);
}

/**
以LOG级别打印日志到控制台
@method log
@param {String} message 日志信息
@static
**/
log.log = function(message){
  this._log(this.LOG, message);
}

/**
以INFO级别打印日志到控制台
@method info
@param {String} message 日志信息
@static
**/
log.info = function(message){
  this._log(this.INFO, message);
}

/**
以DEBUG级别打印日志到控制台
@method debug
@param {String} message 日志信息
@static
**/
log.debug = function(message){
  this._log(this.DEBUG, message);
}

/**
以WARN级别打印日志到控制台
@method warn
@param {String} message 日志信息
@static
**/
log.warn = function(message){
  this._log(this.WARN, message);
}

/**
以ERROR级别打印日志到控制台
@method error
@param {String} message 日志信息
@static
**/
log.error = function(message){
  this._log(this.ERROR, message);
}

module.exports = log;