var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var install = att.load('install');

describe('[plugin] install is a plugin for install att plugins', function(){
  
  it('install att-formatjson', function(done){

    att.unloadPlugin('att-formatjson');

    install.execute({
      _: ['install', 'att-formatjson']
    }, function(){

      att.load('formatjson').should.be.a('object');
      
      att.load('uninstall').execute({_:['uninstall', 'att-formatjson']}, function(){
         (att.load('formatjson')==null).should.be.ok;
         done();
      });
      
    })
  });

});