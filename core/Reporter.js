var Reporter = function(project){
	this.project = project;
	this.initialize();
};
Reporter.prototype.initialize = function(){
	var project = this.project,
		startTime,
		timeCost = function(){
			var diff = new Date() - startTime;
			return diff/1000 + " second(s)";
		};
	project.on("beforeStart", function(){
		var name = project.name || "<missing project name>",
			description = project.description || "<missing project description>";
		console.log("================================================================");
		console.log("ATT start build %s: %s", name, description);
		console.log("================================================================");
		startTime = new Date();
	});
	project.on("start", function(){
	});
	project.on("finish", function(project, error){
		console.log("================================================================");
		var info = error ? "failed" : "successful";
		console.log("ATT build %s, elapsed Time: %s.", info, timeCost());
	});
	project.on("targetNotFound", function(project, name, error){
		if(error){
			console.log("\n!Error: %s\n", error.message);
		}
	});
	project.on("beforeFinish", function(){
	});
	project.on("targetStart", function(target){
		var name = target.name,
			description = target.description;
		console.log("task %s: %s\n", name, description);
	});

	project.on("targetFinish", function(target){
		console.log("----------------------------------------------------------------");
	
		console.log("Task %s elapsed time: %s\n", target.name, timeCost());
	});
	project.on("targetItem", function(target, err, commandName, data){
		if(err){
			return console.log("\n!Error: %s\n", err.message);
		}
		if(data){
			console.log(data);
		}
	});
};

exports.Reporter = Reporter;