var util = process.env.JSCOV ? require('../lib-cov/util') : require('../lib/util');

describe('util is a static utility class', function(){
  
  it('util.type can get the type of a variable', function(){
    util.type(1).should.equal('number');
    util.type('util').should.equal('string');
    util.type([]).should.equal('array');
    util.type({}).should.equal('object');
    util.type(undefined).should.equal('undefined');
    util.type(true).should.equal('boolean');
    util.type(false).should.equal('boolean');
    util.type(/\./).should.equal('regexp');
    util.type(Date.now).should.equal('function');
    util.type(Date.now()).should.equal('number');
    util.type(new Error()).should.equal('error');
  });

  it('util.isNumber can verify number type', function(){
    util.isNumber(NaN).should.be.false;
    util.isNumber(Number.MAX_VALUE).should.be.true;
    util.isNumber(Number.MIN_VALUE).should.be.true;
    util.isNumber(Infinity).should.be.false;
    util.isNumber("0").should.be.false;
  });

  it('util.isBoolean can verify boolean type', function(){
    util.isBoolean(true).should.be.true;
    util.isBoolean(false).should.be.true;
    util.isBoolean('').should.be.false;
    util.isBoolean(0).should.be.false;
    util.isBoolean(1).should.be.false;
    util.isBoolean('a').should.be.false;
  });

  it('util.isString can verify string type', function(){
    util.isString('').should.be.true;
    util.isString('a').should.be.true;
  });

  it('util.isArray can verify array type', function(){
    util.isArray([]).should.be.true;
    (function(){
      util.isArray(arguments).should.be.false;
    });
    util.isArray({'0':0, '1':1}).should.be.false;
    util.isArray('abc').should.be.false;
  });

  it('util.isFunction can verify function type', function(){
    util.isFunction(setTimeout).should.be.true;
    util.isFunction(util.isFunction).should.be.true;
    util.isFunction(util).should.be.false;
  });

  it('util.isDate can verify date type', function(){
    util.isDate(new Date()).should.be.true;
    util.isDate(Date).should.be.false;
  });

 
  it('util.isRegExp can verify regexp type', function(){
    util.isRegExp(/^\s$/).should.be.true;
    util.isRegExp(new RegExp("util")).should.be.true;
    util.isRegExp(util).should.be.false;
  });

  it('util.isError can verify error type', function(){
    util.isError(new Error()).should.be.true;
    util.isError(util).should.be.false;
  });

  it('util.toBoolean can convert the string user input to boolean', function(){
    util.toBoolean("").should.be.false;
    util.toBoolean("yes").should.be.true;
    util.toBoolean("Yes").should.be.true;
    util.toBoolean("yEs").should.be.true;
    util.toBoolean("1").should.be.true;
    util.toBoolean("0").should.be.false;
    util.toBoolean("OK").should.be.true;
    util.toBoolean("ok").should.be.true;
    util.toBoolean("true").should.be.true;
    util.toBoolean("t").should.be.false;
    util.toBoolean("2").should.be.false;
  });

  it('util.merge can merge multi objects to one', function(){
    var a = util.merge({a: 0}, {a: 1});
    a.a.should.equal(1);
    a = util.merge({}, {a: 2}, null);
    a.a.should.equal(2);
    a = util.merge({a: 2}, {a: 1});
    a.a.should.equal(1);
    a = util.merge(null, {a: 1}, {a: 2}, {a: 3})
    a.a.should.equal(3);
  });

  it('util.substitute method can substitute string by an object dictionary', function(){
    var s = 'Her name is ${name}, like ${hobby}';
    var str = util.substitute(s, {});
    str.should.equal(s);
    str = util.substitute(s, {name: 'niaoniao', hobby: 'smile'});
    str.should.equal('Her name is niaoniao, like smile');
  });

  it('util.comment get the info form notation', function(){
    var content = "/**\n *@version 1-0-0  @date: 20121219 **/";
    var version = util.comment('version', content);
    version.should.equal('1-0-0');
    var date = util.comment('date', content);
    date.should.equal('20121219');
  });

  it('util.request can send get & post request', function(done){
    var http = require('http');
    var https = require('https');

    var server = http.createServer(function(request, response){
      response.end('yeah')
    }).listen(3232, 'localhost');
    util.request("http://localhost:3232", function(e, response){
      response.should.equal('yeah');
      server.close();
      done();
    });

    /*
    server = https.createServer(function(request, response){
      response.end('yeah')
    }).listen(3233, 'localhost');
    util.request("https://localhost:3233", function(e, response){
      response.should.equal('yeah');
      server.close();
      done();
    });
    */
  });

});