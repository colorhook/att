var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var hint = att.load('hint');

describe('[plugin] hint is a att plugin for code review', function(){
  
  it("name, description, help, execute should be defined", function(){
    hint.help.should.be.a("function");
    hint.execute.should.be.a("function")
  });

  it("hintJS method verify js file", function(){
    hint.hintJS.should.be.a('function')
  });

  it("hintCSS method verify css file", function(){
    hint.hintCSS.should.be.a('function')
  });

});