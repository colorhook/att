var minimatch = require("minimatch");
/**
 * @name mapper;
 */
exports.type = "glob";
/**
 * @transform
 */
exports.transform = function(input, options){
	if(options.from){
		if(!minimatch(input, options.from, options)){
			return null;
		}
		
		return input;
	}
	return input;
}