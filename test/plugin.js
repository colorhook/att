var plugin = process.env.JSCOV ? require('../lib-cov/plugin') : require('../lib/plugin');
var path = require('path');
var should =require('should');
describe('plugin is an internal object for managing plugins: ', function(){
  
  it('plugin.PLUGIN_CONFIG_PATH equal %att%/conf/plugin.json', function(){
    var pluginFile = path.resolve(__dirname + "/../conf/plugins.json");
    plugin.PLUGIN_CONFIG_PATH.should.equal(pluginFile);
  });

  it('plugin.data can get plugins', function(){
    var data = plugin.data();
    data.should.be.a('object');
  });

  it('plugin.data can get & set plugins by key', function(){
    var key = '__test_key__';

    //get
    var data = plugin.data(key);
    should.not.exist(data);

    //set
    plugin.data(key, {command: 'test'});
    data = plugin.data(key);
    should.exist(data);

    //remove
    plugin.data(key, null);
    data = plugin.data(key);
    should.not.exist(data);
  });

  it('plugin can install plugin by npm module name', function(done){
    var name = 'att-formatjson';
    var command = 'att-formatjson';
    var data = plugin.data(command);
    should.not.exist(data);

    plugin.install([name], function(e){
      should.not.exist(e);
      data = plugin.data(command);
      should.exist(data);
    
      plugin.uninstall(name, function(e){
        should.not.exist(e);
        data = plugin.data(command);
        should.not.exist(data);
        
        done();
      });
   
    })
  });

});