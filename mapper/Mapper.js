var mapper = {};
var getMapper = exports.getMapper = function(type){
	return mapper[type];
};

var addMapper = exports.addMapper = function(m){
	mapper[m.type] = m;
}


/**
 * @name mapper;
 */
exports.type = "mapper";
/**
 * @transform
 */
exports.transform = function(input, options, type){
	var mapper = mapper[type];
	return mapper.transform(input, options);
}

addMapper(require("./IdentityMapper.js"));
addMapper(require("./FlattenMapper.js"));
addMapper(require("./GlobMapper.js"));
addMapper(require("./RegExpMapper.js"));