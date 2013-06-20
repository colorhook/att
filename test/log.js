var log = process.env.JSCOV ? require('../lib-cov/log') : require('../lib/log');

describe('log is a static utility class', function(){
  
  it('log.level is a int indicate the LOG level', function(){
    log.level.should.be.a('number');
  });

  it('log.enabled shoud be a boolean indicate the LOG is enabled', function(){
    log.enabled.should.be.a('boolean');
  });
  
  it('log, info, debug, warn, error method', function(){
    log.log.should.be.a('function');
    log.info.should.be.a('function');
    log.debug.should.be.a('function');
    log.warn.should.be.a('function');
    log.error.should.be.a('function');
  });

});