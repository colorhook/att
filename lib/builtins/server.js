/**
@module att
**/

/**
开启att server
    
    att server

@class server
@namespace att.builtins
@static
**/
module.exports = function(att){
  
  att.register('server', 'startup a simple server', function(){

    var express = require('express');
    /**
    @method help
    @static
    **/
    this.help = function(){
      var str = ['Options:',
        ' -port, --port       指定端口，默认从80端口依次递增查找',
        ' --dir               指定目录，默认为process的当前目录',
        '',
        'Examples:',
        ' att server',
        '',
        ' #指定端口',
        ' att server --port=8080'].join("\n").green;

      require('util').puts(str);
    }

    this.initialize = function(){
    }

    /**
    @method execute
    @static
    **/
    this.execute = function(argv){
      var port = argv.p || argv.port;
      var dir = argv.dir;
      var app = express();
      if(dir && !att.fileutil.isDirectory(argv.dir)){
        return att.log.error("please specify a valid directory by --dir");
      }
      if(!dir){
        dir = process.cwd();
      }
      //log requests
      app.use(express.logger('dev'));
      
      var gzip = false;
      // static
      var ecstatic = require('ecstatic')({
        root: dir, 
        showDir: true,
        autoIndex: true,
        gzip : gzip
      });
      //app.use(app.router);
      
      app.use(ecstatic);

      // listen
      var portscanner = require('portscanner');
      var onPortFound = function(port){
        require('util').puts('server started, listening on port ' + port);
        app.listen(port);
      }
      if(port){
        portscanner.checkPortStatus(port, 'localhost', function(error, status){
          if(error || status != 'closed'){
            return att.log.error("The port " + port + " is not available.");
          }
          onPortFound(port);
        });
      }else{
        portscanner.findAPortNotInUse(80, 9999, 'localhost', function(error, port){
          if(error){
              return att.log.error(error);
          }
          onPortFound(port);
        });
      }
    }

  });
}