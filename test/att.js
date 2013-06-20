var att = process.env.JSCOV ? require('../lib-cov/att') : require('../lib/att');

describe('att is a static utility class', function(){
  

  it("fileutil, glob, async, config, event, util should be objects", function(){
    att.fileutil.should.be.eql(require('fileutil'));
    att.glob.should.be.eql(require('glob'));
    att.async.should.be.eql(require('async'));
    att.read.should.be.eql(require('read'));
    att.util.should.be.eql(require('../lib/util'));
    att.config.should.be.eql(require('../lib/config'));
    att.log.should.be.eql(require('../lib/log'));
  });

  it("version property should be equal to the version in package.json", function(){
    var pkg = att.fileutil.read(__dirname + '/../package.json');
    var version = JSON.parse(pkg).version;
    att.version.should.equal(version);
  });

  it('att contain some buint-in plugins', function(){
    att.plugins.should.be.a('object');
    att.load('datauri')
    att.load('hint')
    att.plugins.should.have.property('minify');
    att.plugins.should.have.property('datauri');
    att.plugins.should.have.property('hint');
  });

  it("plug method can load plugins by path", function(){
    if(att.plugins.test){
      att.plugins.test = null;
    }
    att.load({
      name: 'test',
      module: __dirname + '/test.plugin'
    });
    att.plugins.should.have.property('test');
  });

  it("execute method can execute a plugin", function(done){
    if(!att.plugins.test){
      att.load({
        name: 'test',
        module: __dirname + '/test.plugin'
      });
    }
    att.execute('test', {a: 1, b:2}, function(e, result){
      result.should.equal(3);
      done();
    });
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