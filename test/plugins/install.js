var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var install = att.load('install');
describe('install is a plugin for install att plugins', function(){
  
  it('install att-formatjson', function(done){
    install.execute({
      _: ['install', 'att-formatjson'],
      alias: 'jsonf'
    }, function(){
      att.load('att-formatjson').should.be.a('object');
      att.plugins.should.have.property('att-formatjson');
      done();
    })
  });

});