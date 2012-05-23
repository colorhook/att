/**
 * @name mapper;
 */
exports.type = "regexp";
/**
 * @transform
 */
exports.transform = function(input, options){
	if(options.from){
		var casesensitive = (options.casesensitive == undefined) ? true : options.casesensitive
		var reg = new RegExp(options.from, casesensitive ? "i" : null);
		if(reg.test(input)){
			return input;
		}
		return null;
	}
	return input;
}