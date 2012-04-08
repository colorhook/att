var fs = require("fs"),
	url = require('url'),
	http = require('http'),
	smushit = require('node-smushit/lib/smushit');

var saveBinary = function(binaryUrl, path, success, fail){
	var urlObj = url.parse(binaryUrl),
		options = {
			host: urlObj.host
		  , port: urlObj.port
		  , path: urlObj.pathname
		}

	var request = http.get(options, function(res){
		var data = '';
		res.setEncoding('binary')
		res.on('data', function(chunk){
			data += chunk;
		})
		res.on('end', function(){
			fs.writeFile(path, data, 'binary', function(err){
				if (err){
					fail && fail();
				}else{
					success && success();
				}
			})
		})
	});

	if(fail){
		request.on("error", fail);
	}
};
/**
 * @option input {String|Optional}
 * @option inputFileName {String|Optional}
 * @option outputFileName {String|Optional}
 * @option charset {String|Optional} default 'utf-8'
 */
exports.execute = function(options, success, fail){
	var fileContent,
		charset = options.charset || "utf-8";
	

	if(options.inputFileName){
		if(!options.outputFileName){
			options.outputFileName = options.inputFileName;
		}
		
		smushit.smushit(options.inputFileName, function(response){

			try{
				response = JSON.parse(response);
			}catch(err){
				fail && fail();
				return;
			}
			if(response.error){
				fail && fail();
				return;
			}
			saveBinary(response.dest, options.outputFileName, function(){
				success && success();
			}, function(){
				fail && fail();
			});

		}, function(error){
			fail && fail();
		});
	}else{
		fail && fail();
	}
};