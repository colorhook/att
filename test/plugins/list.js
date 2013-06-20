var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var list = att.load('list');
describe('list is a plugin for list att plugins', function(){
  
  xit('att list', function(done){
    list.execute({
      _: ['list']
    }, function(e, data){
      data.should.be.an.instanceOf(Array);
      done();
    });
  });

});