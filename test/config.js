var config = process.env.JSCOV ? require('../lib-cov/config') : require('../lib/config');

describe('config is a static object represent the `att.json` configuration', function(){
  
  it('config should be a hash object indicate the configuration', function(){
    config.should.be.ok;
  });

  it('force, logLevel, plugins, external-configs, external-plugins', function(){
    var content = require('fs').readFileSync(__dirname + '/../conf/att.json', 'utf-8');
    var configParsed = JSON.parse(content);
    config.force.should.be.a('boolean');
    config.force.should.equal(configParsed.force);
    config.logLevel.should.be.a('number');
    config.logLevel.should.equal(configParsed.logLevel);
    config.plugins.should.be.a('object');
  });
});