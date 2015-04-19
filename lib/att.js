'use strict';
/**
@module att
**/
var path = require('path');

var async = require('async');
var fileutil = require('fileutil');
var glob = require('glob');
var read = require('read');
var request = require('request');
require('colors');

var attutil = require('./util');
var config = require('./config');
var log = require('./log');
var plugin = require('./plugin');



var _builtinInitialized = false;
var _currentPlugin = null;
var _version;

/**
`att`模块是`att`工具的顶级模块和入口模块。

在`node`中引用该模块，可以通过代码的方式执行前端任务。但是一般来说我们还是在命令行终端中使用它。
    
    #直接使用，查看可用插件
    att

    #查看版本号
    att -v
    att --version

    #执行压缩插件
    att minify -i input-file -o output-file

    #对css进行datauri
    att datauri styles/my.css

    #检查代码规范
    att hint src/my.css

如何写一个插件来扩展att功能？
    
<pre><code> &#x2F;**
 这个插件用于压缩JSON文件，压缩原理是去空格
&nbsp;@class formatjson
&nbsp;@@namespace att.plugins
 
 #Usage:
 att formatjson **&#x2F;*.json
 **&#x2F;
module.exports = function(att){
  
  //注册command
  att.register('formatjson', function(){

    var indent = 4;

    //att下面的fileutil对象，用于文件同步操作
    var fileutil = att.file;

    this.help = function(){
      var str = ['Options:',
        ' -s, --silent       无终端提示(No terminal prompt)',
        ' --indent           缩进，默认是4',
        ' --o                输出文件，默认覆盖',
        '',
        'Examples:',
        ' #忽略提示',
        ' att formatjson *.* -s',
        '',
        ' #保存副本',
        ' att formatjson my.json -o my.att.json',
        '',
        ' #缩进',
        ' att formatjson my.json -indent 2'].join("\n").green;

      require('util').puts(str);
    };

    //当在终端中输入`att formatjson *.json`时执行此方法
    this.execute = function(argv, callback){
      //模糊查找文件
      var opts = {
        matchFunction: function(name){
          return name.match(/\.json$/i) && fileutil.isFile(name);
        },
        question: function(name){
          return 'format ' + name + '? ';
        }
      }
      if(argv.indent > 0){
          indent = argv.indent;
      }
      if(!argv.o && !argv.output){
        opts.output = function(input){
          return input;
        }
      }
      att.find(argv, this.formatJSON.bind(this), callback, opts);
    }

    //针对单个文件进行操作
    this.formatJSON = function(input, output, callback){
      var content = fileutil.read(input);
      var json = JSON.parse(content);
      //格式化
      content = JSON.stringify(json, null, indent);
      fileutil.write(output, content);
      callback();
    }

  });
}
</code></pre>

保存这个项目发布到npm上，在package.json中配置att.command等字段
<pre><code>
{
  "name": "att-formatjson",
  ...
  "engines": {
    "att": ">=4.0.0"
  },
  ...
}
</code></pre>

安装该插件

    att install att-formatjson

然后我们就可以在终端中输入命令来使用此插件

    att formatjson data.json

@class att
@static
**/
var att = {
  
  /**
  @att的内置插件hash表
  @property builtins
  @protected
  @static
  @type Object
  **/
  builtins: {},

  /**
  att的插件hash表
  @property plugins
  @protected
  @static
  @type Object
  **/
  plugins: {},

  /**
  att的ini配置文件的hash对象
  @property config
  @static
  @type Object
  **/
  config: config,

  /**
  att的辅助工具类
  @property util
  @static
  @type util
  **/
  util: attutil,

  /**
  async模块，来自`github`的[`async`](http://github.com/caolan/async)
  @property async
  @static
  @type Object
  **/
  async: async,

  /**
  文件操作工具模块，来自`github`的[`fileutil`](http://github.com/colorhook/fileutil)
  @property file
  @static
  @type Object
  **/
  file: fileutil,


  /**
  日志打印
  @property log
  @static
  @type log
  **/
  log: log,

  /**
  用于模糊查找文件的模块，来自`github`的[`glob`](http://github.com/isaacs/node-glob)
  @method glob
  @static
  @param {String} str 模糊字段
  @param {Function} callback 查找回调函数
  @example

      att.glob("*.html", function(e, matched){
        console.log(matched);
      });
  **/
  glob: glob,

  /**
  用于人机交互问答的模块，来自`github`的[`read`](https://github.com/isaacs/read)
  @method read
  @static
  @param {Object} options
  @param {Function} callback 交互的回调函数
  @example

      att.read({
        prompt: 'Are you sure? '
      }, function(e, input){
        console.log('You typed %s', input);
      });
  **/
  read: read,

  /**
  用于发送HTTP请求的模块，来自`github`的[`request`](https://github.com/mikeal/request)
  @method request
  @static
  @param {Object} options
  @param {Function} callback 交互的回调函数
  @example

      att.request('http://www.google.com', function (error, response, body) {
      });

      att.request('http://google.com/doodle.png').pipe(fs.createWriteStream('doodle.png'))
  **/
  request: request

};


/**
att的当前版本
@property version
@static
@type String
**/
Object.defineProperty(att, 'version', {
  get: function(){
    if(!_version){
      var pkgContent = fileutil.read(path.join(__dirname, '../package.json'));
      _version = JSON.parse(pkgContent).version;
    }
    return _version;
  }
});

/**
注册一个att command, att插件必须要使用该方法来注册command.
@method register
@static
@param command {String} 命令名称
@param prompt {String} 详细提示
@param impl {Function} 插件的实现函数
@example
    
    //hello.js
    module.exports = function(att){
      att.register('hello', 'give a greeting message', function(){
        this.execute = function(){
          console.log('hello, att');
        }
      });
    }
**/
att.register = function(command, prompt, impl){
  if(attutil.isFunction(prompt)){
    impl = prompt;
    prompt = '';
  }
  var finger = {command:command, prompt: prompt, impl: impl};
  if(!_builtinInitialized){
    this.builtins[command] = {prompt: prompt, impl: impl};
  }else{
    this.plugins[_currentPlugin].items[command] = {prompt: prompt, impl: impl};
  }
};

/**
取得某个command的快照
@method receive
@static
@param command {String} 命令名称
@example
    
    var module = this.receive('hello');
    console.log(module.prompt);
    comsole.log(module.impl);
**/
att.receive = function(command){
  var cmd;
  var namespace;
  var result;
  if(command.indexOf(':')){
    var temp = command.split(':');
    cmd = temp[0];
    namespace = temp[1];
  }else{
    cmd = command;
  }

  if(!namespace){
    namespace = plugin.namespace(command);
  }
  if(namespace){
    var item = this.plugins[namespace];

    if(item){
      var cmdList = item.items;
      result = item.items[cmd]
    }
    if(result){
      return result;
    }
    plugin.namespace(command, null);
  }
  result = this.builtins[command];
  if(!result){
    result = [];
    Object.keys(this.plugins).forEach(function(key){
      var items = this.plugins[key].items;
      if(items[cmd]){
        result.push(items[cmd]);
      }
    }.bind(this));
    if(result.length > 1){
      result = result[0];
    }else if(result.length === 1){
      result = result[0];
    }else{
      result = null;
    }
  }
  return result;
}



/**
根据名称来载入command模块
@method load
@static
@param {String} name
@return {Object} 插件模块
**/
att.load = function(name){
  var item = this.receive(name);
  if(!item){
    return null;
  }
  if(item.module){
    return item.module;
  }

  var module;
  if(item.impl){
    if(attutil.isFunction(item.impl)){
      module = new item.impl();
    }else{
      module = item.impl;
    }
    if(!attutil.isFunction(module.execute)){
      return null;
    }
    if(attutil.isFunction(module.initialize)){
      module.initialize();
    }
    item.module = module;
  }
  return module;
}
/**
执行某个插件
@method execute
@static
@param {String} name 插件名称
@param {Object} argv optimist参数
@param {Function} callback (optional)  插件执行完的回调函数
**/
att.execute = function(name, argv, callback){
  var module = this.load(name);
  if(!module){
    return callback('the command ' + name + ' was not found.');
  }
  module.execute(argv, callback);
};

/**
执行某个插件的帮助信息
@method help
@static
@param {String} name 插件名称
@param {Object} argv optimist参数
@param {Function} callback (optional)  插件执行完的回调函数
**/
att.help = function(name){
  var module = this.load(name);
  if(!module){
    return log.error('the plugin ' + name + ' was not found.');
  }
  if(module.help){
    module.help();
  }else{
    console.log(name + ':\t' + this.receive(name).prompt);
  }
};

/**
通过argv参数智能遍历文件，便于在插件中处理每个匹配到的文件
@method each
@static
@param {Object} argv optimist参数
@param {Function} iterator 对每个匹配到的文件的处理函数
@param {Function} callback 回调函数
**/
att.each = function(argv, iterator, callback, series){
  var input = argv.i || argv.input;
  var method = series ? 'eachSeries' : 'each';
  var handler = function(){
    if(!input || !input.length){
      log.warn('Nothing matched, please check your argv.');
      return callback();
    }
    async[method](input, function(item, cb){
      iterator(path.normalize(item), cb);
    }, function(){
      callback && callback();
    });
  };
  if(input){
    if(!attutil.isArray(input)){
      input = [input];
    }
    handler();
  }else{
    glob(argv.glob, function(err, matched){
      if(err){
        log.error(err);
        return;
      }
      input = matched;
      handler();
    });
  }
};
/**
询问终端进行人机交互
@method ask
@static
@param {String} query 询问的字符串
@param {Function} callback 回调函数
@example
    
    att.ask('Continue to handle this file? ', function(yes, input){
      if(yes){
        //continue action
      }else{
        //break action
      }
    });
**/
att.ask = function(query, callback, passMode){
  read({
    prompt: query
  }, function(e, v){
    callback(v === '' || attutil.toBoolean(v), v);
  });
};
/**
通过argv参数寻找文件，跟`each`不同的是它增加了输入判断、人机问答交互和输出文件名称检测。
如果文件需要输入输出，或者需要人机问答交互，推荐使用这个方法。
@method find
@static
@param {Object} argv optimist参数
    @param {Boolean} argv.s 是否禁止终端提示
    @param {String} argv.o 输出文件名
@param {Function} iterator 文件遍历时的处理器
@param {Function} complete 遍历完成的回调函数
@param {Object} options 自定义参数
@example
    
    var complete = function(e, results){
      console.log('task complete')
    }
    var iterator = function(input, output, callback, options){
      var content = fileutil.read(input);
      fileuti.wirte(content, output);
      callback();
    }
    att.find(argv, iterator, complete, options);
**/
att.find = function(argv, iterator, complete, options){
  options = options || {};
  //options
  var input = argv.i || argv.input;
  var output;
  if(options.output !== undefined){
    output = options.output;
  }else{
    output = argv.o || argv.output;
  }
  var silent;
  if(options.silent !== undefined){
    silent = options.silent;
  }else{
    silent = argv.s || argv.silent;
  }
  var question = options.question;
  var matchFunction = options.matchFunction;

  //complete callback
  var errors = [];
  var onComplete = function(){
    var err = errors.length ? errors : null;
    complete && complete(err);
  };
  
  //check argv.glob
  if(!argv.glob && !input){
    log.warn('the glob or --input | -i argv should be required');
    return onComplete();
  }

  //lookup file
  att.each(argv, function(name, nextIterator){
    if(matchFunction && !matchFunction(name)){
      return nextIterator();
    }

    //get outputName
    var outputName;
    if(argv.overwrite){
      outputName = name;
    }else if(attutil.isFunction(output)){
      outputName = output(name);
    }else if(output && output.length){
      outputName = output;
    }else{ 
      var extname = path.extname(name);
      var basename = path.basename(name, extname);
      outputName = basename + '.att' + extname;
      var dirname = path.dirname(name);
      if(dirname){
        outputName = dirname + path.sep + outputName;
      }
    }
    var handler = function(){
      iterator(name, outputName, function(e){
        if(e){
          errors.push(e);
        }
        if(!e || this.config.get('force')){
          nextIterator();
        }else{
          nextIterator(e);
        }
      }.bind(this), options);
    }.bind(this);

    if(silent || !question){
      handler();
    }else{
      var msg;
      if(attutil.isFunction(question)){
        msg = question(name);
      }else{
        msg = question;
      }
      this.ask(msg, function(ok) {
        if(ok){
          handler();
        }else{
          nextIterator();
        }
      });
    }
  }.bind(this), onComplete, !silent);
};
/**
初始化att，加载builtin模块，plugins模块
@method _initialize
@static
@private
**/
att._initialize = function(){
  if(_builtinInitialized){
    return;
  }
  //builtin modules
  var builtins = plugin.builtins();
  builtins.forEach(function(module){
    module(this);
  }.bind(this));
  
  //set builtin initialized flag to true
  _builtinInitialized = true;
  this.loadPlugin();
}

/**
卸载att的plugin
@method unloadPlugin
@static
@param {String} name
**/
att.unloadPlugin = function(name){
  delete this.plugins[name];
}

/**
加载att的plugin
@method loadPlugin
@params name {String} plugin名称
@static
@param {String} name
**/
att.loadPlugin = function(name){
  //plugins
  var plugins = plugin.plugins(name);
  plugins.forEach(function(p){
    var name = p.name;
    if(this.plugins[name]){
      return;
    }
    this.plugins[name] = {version: p.version, items:{}};
    _currentPlugin = name;
    var module;
    try{
      module = require(p.path);
    }catch(err){
      delete this.plugins[name];
    }
    if(attutil.isFunction(module)){
      try{
        module(this);
      }catch(err2){}
    }
  }.bind(this));
}
/**
通过解析命令行参数执行插件
@method parse
@static
@protected
@param {Object} 经过optimist模块解析过的hash对象
@param {Function} (optional) callback 插件执行完的回调函数
**/
att.parse = function(argv, callback){
  var name;
  name = argv._[0];
  if(name){
    argv.glob = argv._[1];
    if(argv._.length == 1 && (argv.h || argv.help)){
      this.help(name);
    }else{
      this.execute(name, argv, function(e){
        if(e){
          log.error(e);
        }
        callback && callback();
      });
    }
  }else{
    if(argv.v || argv.version){
      console.log(this.version);
    }else{
      console.log('Usage: att COMMAND[:NAMESPACE] [ARGS] [--silent]');
      console.log('');
      var printHelp = function (name, prompt) {
        var line = '   ' + attutil.pad(name, 12) + (prompt || '');
        console.log(line);
      };
      
      Object.keys(this.builtins).forEach(function(key){
        printHelp(key, this.builtins[key].prompt);
      }.bind(this));
      Object.keys(this.plugins).forEach(function(key){
        console.log('');
        var version = this.plugins[key].version;
        console.log('  :' + key + (version ? '    ' + version : ''));
        var stack = this.plugins[key].items;
        Object.keys(stack).forEach(function(key){
          printHelp(key, stack[key].prompt);
        });
      }.bind(this));
    }
  }
};

att._initialize();
module.exports = att;