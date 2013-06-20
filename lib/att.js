/**
@module att
**/
var path = require('path');
var util = require('util');

var async = require('async');
var fileutil = require('fileutil');
var glob = require('glob');
var read = require('read');
require('colors');

var attutil = require('./util');
var config = require('./config');
var log = require('./log');
var plugin = require('./plugin');

var version = (function(){
  var pkgContent = fileutil.read(path.join(__dirname, '../package.json'));
  return JSON.parse(pkgContent).version;
})();

var plugins = plugin.list();

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
    att datauri styles/*.css

    #检查代码规范
    att hint src/*.*

如何写一个插件来扩展att功能？
    
<pre><code> &#x2F;**
 这个插件用于压缩JSON文件，压缩原理是去空格
&nbsp;@class formatjson
&nbsp;@@namespace att.plugins
 
 #Usage:
 att formatjson **&#x2F;*.json
 **&#x2F;
module.exports = function(att){
    
  var indent = 4;

  //att下面的fileutil对象，用于文件同步操作
  var fileutil = att.fileutil;

  //定义插件名称
  this.name = 'formatjson';

  //定义插件描述
  this.description = '格式化json';

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
}
</code></pre>

保存这个项目发布到npm上，在package.json中配置att.command等字段
<pre><code>
{
  "name": "att-formatjson",
  ...
  "att.command": "formatjson",
  "att.description": "format your json file",
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
  att的当前版本
  @property version
  @static
  @type String
  **/
  version: version,

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
  @property fileutil
  @type Object
  **/
  fileutil: fileutil,


  /**
  日志打印
  @property log
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
  @param {Object} options
  @param {Function} callback 交互的回调函数
  @example

      att.read({
        prompt: 'Are you sure? '
      }, function(e, input){
        console.log('You typed %s', input);
      });
  **/
  read: read

};



/**
加载一个插件
@method load
@param {String} name 插件名称
@return {Object} 模块 
**/
att.load = function(name){
  if(!name){
    return null;
  }

  var pdata;
  var command;
  var module;
  
  if(name.name && !att.plugins[name] && name.module){
    //从外部载入插件
    command = name.command || name.name;
    module = name.module;
    pdata = {
      command: command,
      description: name.description,
      name: name.name,
      module: module,
      dynamic: true
    }
    name = name.name;
  }else{
    //从缓存中取出模块
    if(att.plugins[name]){
      return att.plugins[name];
    }
    //初始化插件列表
    var data = plugin.data();
    pdata = data[name] || {};
    command = pdata.command;
    if(!command){
      return null;
    }
  }

  if(pdata.builtin){
    //内置插件
    module = './plugins/' + command;
  }else{
    if(!pdata.dynamic){
      //插件模块
      module = name;
      if(pdata.module){
        module += "/" + pdata.module;
      }
    }else{
      //外部动态模块
      module = pdata.module;
    }
  }
  //载入插件
  try{
    module = require(module);
  }catch(e){
    module = null;
  }

  if(!module){
    return null;
  }
  if(!module.execute){
    module = new module(this);
  }
  if(!module || !module.execute){
    return null;
  }
  if(module.initialize){
    module.initialize(config.plugins[name] || {});
  }
  this.plugins[name] = module;
  return module;
}

/**
从内存中卸载插件
@method unload
@param {String} name 插件的名称
**/
att.unload = function(name){
  delete this.plugins[name];
}
/**
根据alias或command来查找插件模块
@method loadCommand
@param {String} command
@return {Object} 插件模块
**/
att.loadCommand = function(command){
  if(this.plugins[command]){
    return this.plugins[command];
  }
  var list = plugin.list();
  if(!list[command]){
    return null;
  }
  return this.load(list[command].name);
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
  var module = this.loadCommand(name);
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
    util.puts(name + ':\t' + plugins[name].description);
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
      log.warn('nothing matched, please check your argv.');
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
    if(attutil.isFunction(output)){
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
        if(!e || att.force){
          nextIterator();
        }else{
          nextIterator(e);
        }
      }, options);
    };
    if(silent || !question){
      handler();
    }else{
      var msg;
      if(attutil.isFunction(question)){
        msg = question(name);
      }else{
        msg = question;
      }
      att.ask(msg, function(ok) {
        if(ok){
          handler();
        }else{
          nextIterator();
        }
      });
    }
  }, onComplete, !silent);
};
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
      util.puts("" + this.version);
    }else{
      util.puts("Usage: att COMMAND [ARGS] [--silent]");
      util.puts("");
      var printHelp = function (name) {
        var line = "   " + attutil.pad(name, 12) + (plugins[name].description || "");
        util.puts(line);
      };
      for (var i in plugins) {
        printHelp(i);
      }
    }
  }
};

module.exports = att;