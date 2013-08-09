/**
@module att
**/
var path = require('path');
var uploader = require('node-uploader');

/**
上传静态资源到CDN。

`att`的`cdn`插件是我们使用最频繁的插件，图片、样式和脚本的上传和发布都依赖于该插件。

在配置文件中，我们配置了CDN的域名信息、CDN接受文件的服务和本地的工作目录。
      
    "cdn": {
      "workspace": "D:\\Develop\\workspace",
      "css2absolute": true,
      "host": "http://m.alicdn.com",
      "topDirectories": ["product","cloudapp","promotion","y","k2", "yui", "easy"],
      "mapper": "version",
      "flags": {
        "test": {
          "url": "http://10.249.193.138/att_server/upload.php"
        },
        "staging": {
          "url": "http://m-source.aliyun.com/att_server/upload.php",
          "depend": "test"
        },
        "production": {
          "url": "http://m-source.aliyun.com/att_server/upload.php",
          "depend": "staging"
        }
      }
    }

使用该插件我们可以压缩、上传到QA, staging, production CDN站点。
    
    #忽略提示
    att cdn *.* -s

    #默认上传到测试环境
    att cdn my.js

    #禁用datauri
    att cdn my.css -d 0
    att cdn my.css --datauri 0

    #略过minify
    att cdn my.css --ignore

    #上传到production site
    att cdn my.js -p


    #直接上传文件
    att cdn my.pdf --upload
    
    #自定义staging site
    #在配置文件中添加staging site的声明
    # ...
    # "staging" : {
    #   "url": "http://staging.hostname.com/upload.php",
    #   "depend": "test"
    # }
    # ..
    att cdn my.js --flag staging

@class cdn
@namespace att.plugins
@static
**/
module.exports = function(att){
  
  var attutil = att.util;
  var fileutil = att.fileutil;
  var attevent = att.event;

  var flags;
  var tmpDir;
  var host;

  var REGEXP_IMAGE = /url\(\s*["']?\s*([^\(\)]*)\.(cur|png|jpg|jpeg|gif)(\?du)?\s*["']?\s*\)/gi;
  var REGEXP_PNG_FILTER = /url\(\s*["']?(.+)\.(png).+\/\*\s*ie6\s*\*\//gi
  /**
  att插件的名称
  @property name
  @static
  @type String
  **/
  this.name = 'cdn';

  /**
  att插件的描述
  @property description
  @static
  @type String
  **/
  this.description = '上传资源文件到CDN';

  /**
  att插件的终端帮助提示，在att终端中输入`att cdn -h`可以显示此提示
  @method help
  @static
  **/
  this.help = function(){
    var str = ['Options:',
      ' -s, --silent       无终端提示',
      ' --ignore           忽略压缩',
      ' -d, --datauri      是否对CSS中的图片datauri编码',
      ' -t                 上传到QA站点',
      ' -p                 上传到production站点',
      '',
      'Examples:',
      ' #忽略提示',
      ' att cdn *.* -s',
      '',
      ' #默认上传到测试环境',
      ' att cdn my.js',
      '',
      ' #禁用datauri',
      ' att cdn my.css -d 0',
      ' att cdn my.css --datauri 0',
      '',
      ' #略过minify',
      ' att cdn my.css --ignore',
      '',
      ' #上传到production site',
      ' att cdn my.js -p'].join("\n").green;

    require('util').puts(str);
  };

  /**
  att插件初的初始化函数
  @method initialize
  @static
  **/
  this.initialize = function(options){
    this.config = attutil.getConfig() || {}
    this.options = options;
    var json = this.config.data || {};
    if(this.config.dir){
      this.options.workspace = this.config.dir;
      this.options.topDirectories = null;
      if(json.cdnPath){
        this.options.pathPrefix = json.cdnPath.replace(/^\/|\/$/g, "");
      }
    }
   
    tmpDir = json.tempdir || this.options.tmpDir;
    if(!tmpDir){
      tmpDir = path.join(__dirname, '..', '..', 'tmp');
    }
    host = json.host || this.options.host;
  };

  /**
  上传某个文件到远端服务器指定的地址
  @method _copyToServer
  @private
  @static
  @param {String} url 上传服务地址
  @param {String} file 本地文件路径
  @param {String} identity 文件上传的标识
  @param {Object} params 上传的参数
  @param {Function} callback 上传的回调函数
  **/
  this._copyToServer= function(url, file, identity, params, callback){
    var files = {};
    files[identity] = file;
    uploader.upload({
      url: url,
      files: files,
      data: params
    }, function (e, data) {
      if(e){
        return callback(e);
      }
      var json;
      try {
        json = JSON.parse(data);
      } catch (err) {
        att.log.error(data);
        return callback(err);
      }
      if(json.code != 200){
        return callback(new Error(json.msgs));
      }
      callback && callback(null, json);
    });
  };

  /**
  根据依赖上传静态资源文件到服务器。
  一般来说，如果要上传文件到production CDN, 应该先把文件上传到QA CDN, Staging CDN。
  该方法会通过`att.json`中配置的依赖信息，以此上传CDN服务器。
  @method copyToServer
  @static
  @protected
  @param {String} file 资源文件的路径
  @param {Object} options 压缩时的参数
      @param {Boolean} options.datauri 压缩css时是否使用`datauri`
      @param {String} options.flag 上传的服务器标识，默认是`test`
      @param {String} filepath 上传到服务器相对于workspace的路径
  @example

      var att = require('att');
      var cdn = require('cdn');
      cdn.copyToServer('/path/to/file.png');
  **/
  this.copyToServer = function(file, callback, options){
    var flag = options.flag ? options.flag : 'test';
    var identify = options.identify || 'file';
   
    //上传单个文件
    var doUploadOne = (function(url, flag, uploadComplete){
      var params = {
        filename: path.basename(file),
        filepath: options.filepath,
        target: (flag === "production") ? "cdn_home" : "test_home",
        overwrite: (flag === "production") ? "no" : "yes"
      }
      this._copyToServer(url, file, identify, params, function(e, response){
        if(!e){
          att.log.info('upload ' + flag + ' site succeed');
        }else{
          att.log.error('upload ' + flag + ' site failed: ' + e.message);
        }
        uploadComplete(e);
      });
    }).bind(this);
    
    //通过依赖上传文件
    var doUpload = (function(flag, uploadComplete){
      var data = this.options.flags[flag];
      if(!data || !data.url){
        return uploadComplete(new Error('No service endpoint find by upload flag ' + flag));
      }
      if(data.depend){
        doUpload(data.depend, function(){
          doUploadOne(data.url, flag, uploadComplete);
        });
      }else{
        doUploadOne(data.url, flag, uploadComplete);
      }
    }).bind(this);
    
    doUpload(flag, callback);
  }

  /**
  根据要上传的文件和工作目录获取上传到远端的服务器文件路径
  @method getDirectory
  @static
  @protected
  @param {String} file 本地文件的路径
  @param {String} workspace 本地workspace的根目录
  @param {Array} topDirectories (optional) 合法的顶级目录名称
  @param {String} pathPrefix 补全的路径
  **/
  this.getDirectory = function(file, workspace, topDirectories, pathPrefix){
    var p = "/" + path.relative(tmpDir, path.dirname(file));

    if (p.indexOf("/..") === 0 || p == "/") {
      p = "/" + path.relative(workspace, path.dirname(file));
    }
   
    //因为上传传递的参数filepath必须是linux风格的目录
    p = p.replace(/\\/g, "/");
    //忽略盘符不一致
    if(p.match(/\/\w+:/)){
      return false;
    }
    var matches = p.match(/^\/(\w+)/);
    if(!matches || !matches[1]){
      return false;
    }
    
    //自动获取顶级文件夹
    if(!topDirectories){
      topDirectories = []
      var dirs = fileutil.list(workspace, {excludeFile: true, recursive: false});
      dirs.forEach(function(item){
        var dirname = path.basename(item);
        if(dirname.indexOf(".") == -1){
          topDirectories.push(dirname);
        }
      })
    }

    if(topDirectories.indexOf(matches[1]) === -1){
      return false;
    }

    if(pathPrefix){
      p = "/" + pathPrefix + p;
    }
    return p;
  }

  /**
  根据文件地址获取上传后的文件名称。js、css文件需要在文件中携带版本号。
  @method getVersionName
  @static
  @param {String} file 本地文件路径
  @return {String} 上传后的文件名称。
  **/
  this.getVersionName = function(file){
    if(!file.match(/\.(js|css)$/i)){
      return path.basename(file);
    }
    var content = fileutil.read(file);
    var version = attutil.comment('version', content);
    if(!version){
      throw new Error("the version not found in the file: " + file);
    }
    var extname = path.extname(file);
    var basename = path.basename(file, extname);
    return basename + "-" + version + extname;
  }

  /**
  将CSS代码中用的图片转换成绝对路径。
  @method transformCSSToAbsoluteURL
  @static
  @protected
  @param {String} input 需要transform的CSS代码
  @param {String} basedir css文件的路径
  @param {String} workspace workspace的本地路径
  @return {String} transform之后的CSS
  **/
  this.transformCSSToAbsoluteURL = function(input, basedir, workspace, pathPrefix){
    input = input.replace(REGEXP_IMAGE, function(matches, file, type){
      if(!file || file[0] === '/' || file.indexOf('http') === 0){
        return matches;
      }
      var fileName = path.normalize(basedir + path.sep + file + '.' + type);
      att.log.log("use absolute path: " + fileName);
      var workspaceDir = path.relative(workspace, basedir);
      var absolutePath = path.normalize("/" + workspaceDir + "/" + file + "." + type);
      if(pathPrefix){
        absolutePath = "/" +  pathPrefix + absolutePath;
      }
      absolutePath = absolutePath.replace(/\\/g, "/");
      return "url("+absolutePath+")";
    });
    return input;
  };

  /**
  将CSS代码中png24的地方使用IE滤镜支持。css中注释了<code>&#x2F;*ie6\*&#x2F;</code>那一行的代码会加入css滤镜。
  
  @method transformCSSToIE6Filter
  @static
  @protected
  @param {String} input 需要transform的CSS代码
  @param {String} host css文件的存放地址
  @return {String} transform之后的CSS
  **/
  this.transformCSSToIE6Filter = function(input, host){
    input = input.replace(REGEXP_PNG_FILTER, function(match, file, type){
      var fileName = file + "." + type;
      if(fileName.charAt(0) !== '/'){
        return match;
      }
      if(fileName.toLowerCase().indexOf("http") !==0){
          fileName = host + fileName;
      }
      att.log.log("use ie6 filter: " + fileName);
      var ie6hack = "_filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + fileName + "', sizingMethod='scale');";
      match += ";\n";
      match += "_background:none;\n";
      match += ie6hack;
      return match;
    });
    return input;
  };

  /**
  将某个文件上传到CDN
  @method uploadFile
  @static
  @param {String} file 本地文件路径
  @param {String} output 输出文件路径，该参数此处无意义
  @param {Function} callback 上传后的回调函数
  @param {Object} 上传过程中的配置参数
  **/
  this.uploadFile = function(file, callback, options){
    var opts = attutil.merge(this.options, options);
    var minify = att.load('minify');
    var basename = path.basename(file);
    var fileNewName;
    var outputPath;
    var dirInTmp;
    var filepath = this.getDirectory(file, opts.workspace, opts.topDirectories, opts.pathPrefix);
    var UUID_MODE_PATH = '/x';
   
    //开始上传到CDN
    var startUpload = function(){
      this.copyToServer(outputPath, function(e){
        if(!e){
          var cdnHost = host ? host : 'http://CDN';
          var url = host + (filepath || UUID_MODE_PATH) + "/" + fileNewName;
          att.log.debug('file in CDN: '+url);
        }
        callback(e);
      }, opts);
    }.bind(this);
    
    //上传前，执行压缩优化
    var beforeUpload = function(){
      if(fileutil.exist(outputPath)){
        fileutil.delete(outputPath);
      }
      var isCSS = file.match(/\.css$/i);
      //移动到新路径
      if(opts.css2absolute && opts.workspace && isCSS){
        var filecontent = fileutil.read(file);
        var basedir = path.dirname(file);
        filecontent = this.transformCSSToAbsoluteURL(filecontent, basedir, opts.workspace, opts.pathPrefix);
        if(host){
          filecontent = this.transformCSSToIE6Filter(filecontent, host);
        }
        fileutil.mkdir(path.dirname(outputPath));
        fileutil.write(outputPath, filecontent);
      }else{
        fileutil.copy(file, dirInTmp, fileNewName);
      }
      //如果忽略压缩，则提取版本号然后上传
      if(opts.ignoreMinify){
        //转换成绝对路径
        startUpload();
      }else{
        //先压缩，再上传

        var minifyOptions = {
          workspace: opts.workspace,
          host: host,
          pathPrefix: opts.pathPrefix
        };
        if(opts.datauri !== undefined){
          minifyOptions.datauri = opts.datauri;
        }
        minify.minifyFile(outputPath, outputPath, function(e, data){
          if(e){
            callback(e)
          }else{
            startUpload();
          }
        }.bind(this), minifyOptions);
      }
    }.bind(this);

    //如果不在workspace中，使用UUID模式上传文件，文件上传到/x/目录下
    if(!filepath){
      att.ask("file " + file.red + " is not under workspace, upload to " + "/x".green + " directory?", function(yes){
        fileNewName = require('node-uuid').v1() + path.extname(file);
        opts.workspace = null;
        opts.filepath = UUID_MODE_PATH;
        opts.topDirectories = null;

        if(opts.upload){
          outputPath = file;
          return startUpload();
        }
        dirInTmp = path.normalize(tmpDir + path.sep + "x");
        outputPath = dirInTmp + path.sep + fileNewName;
        beforeUpload();
      });
    }else{
      opts.filepath = filepath;
      basename = path.basename(file);
      dirInTmp = path.normalize(tmpDir + path.sep + filepath);
      if(opts.upload){
        outputPath = file;
        fileNewName = basename;
        return startUpload();
      }
      try{
        fileNewName = this.getVersionName(file);
      }catch(err){
        return callback(err);
      }
      
      outputPath  = dirInTmp + path.sep + fileNewName;
      beforeUpload();
    }

    
    
  }
  /**
  执行cdn，上传静态资源到CDN
  @method execute
  @static
  @param {String} argv 使用optimist模块解析出来的对象
  @param {Function} callback 执行完的回调函数
  @example
    
  **/
  this.execute = function(argv, callback){
    if(!this.options.workspace){
      throw new Error("workspace not defined.");
    }
    if(!this.options.flags){
      throw new Error("CDN flags not defined");
    }
    var opts = {
      matchFunction: function(name){
        if(!fileutil.isFile(name)){
          return false;
        }
        var supportedFile = this.options.supportedFile;
        if(!supportedFile){
          return true;
        }
        var extname = fileutil.extname(name).toLowerCase();
        return supportedFile.indexOf(extname) != -1;
      }.bind(this),
      question: function(name){
        return 'transfer to ' + opts.flag + ' cdn ' + name + '? ';
      },
      silent: argv.i || argv.silent
    }
    //flag
    if(argv.flag){
      opts.flag = argv.flag
    }else{
      if(argv.p || argv.production){
        opts.flag = 'production';
      }else{
        opts.flag = 'test';
      }
    }

    var datauri = argv.d || argv.datauri;
    if(datauri !== undefined){
      opts.datauri = attutil.toBoolean(datauri);
    }else{
      opts.datauri = true;
    }
    //是否略过压缩、文件名加版本号等预处理
    if(argv.upload){
        opts.upload = true;
    }
    //是否略过minify
    if(argv.ignore || argv['ingore-minify']){
      opts.ignoreMinify = true;
    }else{
      opts.ignoreMinify = false;
    }
    //逐个查找文件
    att.find(argv, function(input, output, callback, options){
      this.uploadFile(input, callback, options);
    }.bind(this), callback, opts);

  }
}