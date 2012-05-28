var path = require("path"),
	AttUtil = require("../core/AttUtil.js");

exports.transform = function(from, to){
	var basename = path.basename(to).replace(/\..+/, ""),
		extname = path.extname(to),
		dirname = path.dirname(to);

	if(extname.toLowerCase().indexOf(["js", "css"]) != -1){
		return to;
	}
	var	version = AttUtil.readCommentInFile('version', from),
		output;

	if(!version){
		return to;
	}
	output = dirname + "/" + basename + "-" + version + extname;
	return path.resolve(output);
};