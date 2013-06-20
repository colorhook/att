var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var alias = att.load('alias');
describe('alias is a plugin to set alias name for att plugins', function(){
  
  it('att alias setter and delete', function(done){
    var hasMin = function(){
      return att.loadCommand('min') != null;
    }

    hasMin().should.be.false;

    alias.execute({
      _: ['alias', 'minify', 'min']
    }, function(e, data){
      hasMin().should.be.true;
      alias.execute({
        _: ['alias', 'minify'],
        d: true
      }, function(e, data){
        hasMin().should.be.false;
        done();
      });
    });

  });

});