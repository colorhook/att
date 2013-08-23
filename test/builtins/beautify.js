var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var beautify = att.load('beautify');
var fileutil = require('fileutil');

describe('[plugin] beautify is a att plugin for create app', function(){
  
  it("help, execute should be defined", function(){
    beautify.help.should.be.a("function");
    beautify.execute.should.be.a("function")
  });

  it('format js', function(done){
    var file = __dirname + '/__test_js__';
    var data = "var s=1";
    fileutil.write(file, data);
    beautify.beautifyJS(file, file, function(){
       var content = fileutil.read(file);
       fileutil.delete(file);
       content.should.not.equal(data);
       done();
    });
   
  });

  it('format css', function(done){
    var file = __dirname + '/__test_css__';
    var data = 'body {font-size:12px}';
    fileutil.write(file, data);
    beautify.beautifyCSS(file, file, function(){
      var content = fileutil.read(file);
      fileutil.delete(file);
      content.should.not.equal(data);
      done();
    });
  });

  it('format html', function(done){
    var file = __dirname + '/__test_html__';
    var data = "<html><head></head><body></body></html>";
    fileutil.write(file, data);
    beautify.beautifyHTML(file, file, function(){
      var content = fileutil.read(file);
      fileutil.delete(file);
      content.should.not.equal(data);
      done();
    });
  });

  it('format json', function(done){
    var file = __dirname + '/__test_json__';
    var data = '{"hello":"beautifier"}';
    fileutil.write(file, data);
    beautify.beautifyJSON(file, file, function(){
      var content = fileutil.read(file);
      fileutil.delete(file);
      content.should.not.equal(data);
      done();
    });
  });

});