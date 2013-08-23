var plugin = process.env.JSCOV ? require('../lib-cov/plugin') : require('../lib/plugin');
var path = require('path');
var should =require('should');
describe('plugin is an internal object for managing plugins: ', function(){
  

  it('plugin.builtins() return all builtin module', function(){
    var data = plugin.builtins();
    data.should.be.a('object');
  });

  it('plugin.plugins() return all plugins', function(){
    var data = plugin.plugins();
    data.should.be.a('object');
  });

  it('plugin.install() can install plugin', function(done){
    var hasPlugin = function(name){
       var arr = plugin.plugins();
       for(var i=0, l = arr.length; i<l; i++){
        if(arr[i].name === name){
            return true;
        }
       }
       return false;
    }
    plugin.install(['att-formatjson'], function(){
        hasPlugin('att-formatjson').should.be.true;
        plugin.uninstall(['att-formatjson'], function(){
           hasPlugin('att-formatjson').should.be.false;
           done();
        });
    });
  });

});