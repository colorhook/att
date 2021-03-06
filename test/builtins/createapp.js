var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var createapp = att.load('createapp')

describe('[plugin] createapp is a att plugin for create app', function(){
  
  it("help, execute should be defined", function(){
    createapp.help.should.be.a("function");
    createapp.execute.should.be.a("function");
  });

  it('it can create an app project', function(done){
    createapp.execute({
      _: ['createapp', 'testapp']
    }, function(e){
      var hasApp = att.file.exist('testapp');
      att.file.delete('testapp');
      hasApp.should.be.true;
      done();
    })
  });

});