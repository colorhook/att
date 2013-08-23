var config = process.env.JSCOV ? require('../lib-cov/config') : require('../lib/config');

describe('config is a static object represent the `att.json` configuration', function(){
  
  it('config should be a hash object indicate the configuration', function(){
    config.set.should.be.a('function');
    config.get.should.be.a('function');
    config.load.should.be.a('function');
    config.save.should.be.a('function');
  });

  it('get & set value', function(){
    var value = config.get('name') == null;
    value.should.be.ok;

    config.set('name', 'att');
    var value = config.get('name') == 'att';
    value.should.be.ok;
    
    config.set('name', null);
    var value = config.get('name') == null;
    value.should.be.ok;
  });
});