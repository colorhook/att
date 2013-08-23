var att = process.env.JSCOV ? require('../lib-cov/att') : require('../lib/att');

describe('att is a static utility class', function(){
  

  it("fileutil, glob, async, config, event, util should be objects", function(){
    att.file.should.be.eql(require('fileutil'));
    att.glob.should.be.eql(require('glob'));
    att.async.should.be.eql(require('async'));
    att.read.should.be.eql(require('read'));
    att.util.should.be.eql(require('../lib/util'));
    att.config.should.be.eql(require('../lib/config'));
    att.log.should.be.eql(require('../lib/log'));
  });

  it("version property should be equal to the version in package.json", function(){
    var pkg = att.file.read(__dirname + '/../package.json');
    var version = JSON.parse(pkg).version;
    att.version.should.equal(version);
  });

  it('att contain some builtin plugins', function(){
    att.builtins.should.be.a('object');
    att.load('datauri');
    att.load('hint');
    att.builtins.should.have.property('minify');
    att.builtins.should.have.property('datauri');
    att.builtins.should.have.property('hint');
  });


  it('each method can loop directory', function(done){
    var argv = {
      _: [],
      glob: __dirname
    }
    att.each(argv, function(item, callback){
      callback();
    }, function(){
      done();
    });
  });

  it('find method can loop directory', function(done){
    var argv = {
      _: [],
      glob: __dirname
    }
    att.find(argv, function(input, output, callback){
      callback();
    }, function(){
      done();
    });
  });

});