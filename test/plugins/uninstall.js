var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var uninstall = att.load('uninstall');
describe('uninstall is a plugin for uninstall att plugins', function(){
  
  xit('uninstall att-formatjson', function(done){
    uninstall.execute({
      _: ['uninstall', 'att-formatjson']
    }, function(){
      var noFormatJson = att.load('att-formatjson') == null;
      noFormatJson.should.be.true;
      done();
    });
  });

});