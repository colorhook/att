/**
 * @name mapper;
 */
exports.type = "flatten";
/**
 * @transform
 */
exports.transform = function(input, options){
	return path.basename(input) + path.extname(input);
}