exports.onActive = function(project, options){
	
	options = options || {};

	var log = function(msg){
		if(!options.disabled){
			console.log("[ATT:Log] " + msg);
		}
	};
	project.on("complete", function(){
		log("project complete");
	});
	project.on("file_start", function(item){
		//log("handling file: " + item.fullName);
	});
	project.on("file_complete", function(item){
		//log("file handled: " + item.fullName);
	});
};
exports.onDeactive = function(project){
	
}