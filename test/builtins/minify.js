var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var should = require('should');
var minify = att.load('minify');

describe('[plugin] minify is a att plugin for code review', function(){
  
  it('minify is a object', function(){
    should.exist(minify);
  });


  it("name, description, help, execute should be defined", function(){
    minify.help.should.be.a("function");
    minify.execute.should.be.a("function")
  });

  it("minifyJS method minify js file", function(){
    minify.minifyJS.should.be.a('function')
  });

  it("minifyCSS method minify css file", function(){
    minify.minifyCSS.should.be.a('function')
  });

  it("minifyHTML method minify css file", function(){
    minify.minifyHTML.should.be.a('function')
  });

  it("minifyImage method minify image file", function(){
    minify.minifyImage.should.be.a('function')
  });

  it("minifyFile method minify file by file extensition", function(){
    minify.minifyFile.should.be.a('function')
  });


});