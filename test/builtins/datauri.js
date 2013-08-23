var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var datauri = att.load('datauri')

describe('[plugin] datauri is a att plugin for css datauri', function(){
  
  it("help, execute should be defined", function(){
    datauri.help.should.be.a("function");
    datauri.execute.should.be.a("function")
  });

  it("regexp can match url in css", function(){
    var regexp = /([\w-]+\s*:\s*)(url\s*\(["']?(.+)["']?\)\s*[\w\s,-]*)+(;|(?=\}))/gi;
    var cases = [
      'button{background:url(icon.png)}',
      'button(background:url("icon.png")}',
      'button(background:url(\'icon.png\')}',
      'button{background: url ( icon.png ) }',
      'button(background: url ( "icon.png" ) }',
      'button(background: url ( \'icon.png\' ) }',
      'button{background: url ( icon.png ); }',
      'button(background: url ( "icon.png" ); }',
      'button(background: url ( \'icon.png\' ); }',
      'button{background: url ( assets/icon.png ) }',
      'button(background: url ( "assets/icon.png" ) }',
      'button(background: url ( \'assets/icon.png\' ) }',
      'button(background: url ( \'icon.png\' ); }',
      'button{background-image: url ( assets/icon.png ) }',
      'button(background-image: url ( "assets/icon.png" ) }',
      'button(-webkit-background-image: url ( \'assets/icon.png\' ) }',
      '.cursor{cursor: url ( assets/icon.cur ) }',
      '.cursor(cursor: url ( "assets/icon.cur" ) }',
      '.cursor(bcursor: url ( \'assets/icon.cur\' ) }',
      '.canvas{background-image: url(url.png), url(two.png)}',
      '.canvas{background-image: url(one.png), url(two.png);}',
      '.canvas{background: url(one.png) center bottom no-repeat, url(two.png) left top no-repeat;}',
      '.canvas{color:#fff;background: url(one.png) center bottom no-repeat, url(two.png) left top no-repeat}'
      ];

    cases.forEach(function(item){
      var matches = item.match(regexp);
      matches.should.be.ok;
    });
  })


  it("transformFile method transform css from file & save to file", function(){
    var file = __dirname + "/test.css";
    var fileTmp = __dirname + "/test.datauri.css";
    datauri.transformFile(file, fileTmp);
    var content = att.file.read(fileTmp);
    var match = content.match(/url\(\"data:.+;base64,(.+)\"\);/);
    match[1].should.be.ok;
    var base64 = require('fs').readFileSync(__dirname + "/m.gif").toString('base64');
    base64.should.be.equal(match[1]);
    att.file.delete(fileTmp);
  });

});