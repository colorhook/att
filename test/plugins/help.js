var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var help = att.load('help');
describe('help is a plugin to give more infomation for a specific command', function(){
  
  it('att help COMMAND', function(done){
    help.execute({
      _: ['help', 'minify']
    }, function(e, data){
      done();
    });

  });

});