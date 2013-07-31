/*!
* @version 1-0-0
*/
var att = process.env.JSCOV ? require('../../lib-cov/att') : require('../../lib/att');
var cdn = att.load('cdn');

describe('[plugin] cdn is a att plugin for code review', function(){
  
  it("help, execute should be defined", function(){
    cdn.help.should.be.a("function");
    cdn.execute.should.be.a("function")
  });

  it("upload method can upload assets", function(){
    cdn.uploadFile.should.be.a('function')
  });

  it("getDirectory method can return filepath", function(){
    var workspace = "D:/workspace";
    var topDirectories = ["a1","b1","c1"];
    var map = [
      ["C:/workspace/a1/b.png", false],
      ["D:/workspace/b.png", false],
      ["D:/a2/b.png", false],
      ["D:/workspace/a1/b.png", "/a1"],
      ["D:/workspace/b1/b.png", "/b1"],
      ["D:/workspace/c1/b.png", "/c1"],
      ["D:/workspace/a1/b2/c.png", "/a1/b2"]
    ]
    map.forEach(function(item){
      var p = cdn.getDirectory(item[0], workspace, topDirectories);
      p.should.equal(item[1]);
    });
  });

  it("getVersionName name method can return the version", function(){
    var filename = __filename;
    cdn.getVersionName(filename).should.equal("cdn-1-0-0.js");
  });

  it("transformCSSToAbsoluteURL method", function(){
    var css = [
      ".canvas{background:url(icon.png)}",
      ".canvas{background:url(\"icon.png\")}",
      ".canvas{background:url(\'icon.png\')}",
      ".canvas{background-image: url( \'icon.png\' ) }"
    ]
    var workspace = "D:/workspace"
    var map = [
      ["D:/workspace/product", "/product/icon.png"],
      ["D:/workspace/product/browser/", "/product/browser/icon.png"]
    ]

    css.forEach(function(item){
      map.forEach(function(mapItem){
        var result = cdn.transformCSSToAbsoluteURL(item,mapItem[0], workspace);
        var matches = result.match(/url\((.+)\)/i);
        matches.should.be.ok;
        var url = matches[1];
        url.should.equal(mapItem[1]);
      })
    });
  });

  it("transformCSSToIE6Filter method", function(){
    var css = [
      ".canvas{background:url(/icon.png) /*ie6*/} ",
      ".canvas{background:url(\"/icon.png\"); /*ie6*/}",
      ".canvas{background:url(\'/icon.png\') /*ie6*/}",
      ".canvas{background-image: url( \'/icon.png\' ); /*ie6*/ }"
    ]
    var host = 'http://y.alicdn.com';
    css.forEach(function(item){
      var result = cdn.transformCSSToIE6Filter(item, host);
      var matches = result.match(/AlphaImageLoader\(src='(.+)',/);
      matches.should.be.ok;
      matches[1].should.equal("http://y.alicdn.com/icon.png");
    });
  });

  it("uploadFile method", function(){
    cdn.uploadFile.should.be.a('function');
  });

});