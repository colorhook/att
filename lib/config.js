/**
@module att
**/
var path = require('path');

var fileutil = require('fileutil');
require('colors');

var attutil = require('./util');

/**
att的config对象。att启动时会加载conf下的att.json配置文件，config对象是根据配置文件解析出来的hash对象
@class config
@namespace att
@static
**/


/*
加载解析一个json配置文件
@param {String} file json文件的路径
@return {Object} 解析出来的hash对象
*/
var load = function(file){
  if(fileutil.exist(file)){
    try{
      config = JSON.parse(fileutil.read(file));
    }catch(err){
      console.log('parse .json file error at %s', file.red);
    }
  }else{
    console.log('cannot find .json config file at %s', file.magenta);
  }
  config = config || {};
  return config;
}

//解析默认的配置文件att.json
var config = load(path.join(__dirname, '../conf/att.json'));

module.exports = config;