var att = require("../att.js"),
	AttUtil = require("../core/AttUtil.js");
/**
 * plugin name
 */
exports.name = "workspace";
/**
 * plugin description
 */
exports.description = "list or manage your workspace";
/**
 * plugin action
 */
exports.action = function () {
	var conf = att.configuration,
		workspaces = att.configuration.workspaces || {},
		command = process.argv[3] || "list",
		commands = ["add", "delete", "list", "set", "goto"],
		info = (process.argv[4] || "").split("="),
		ws = info[0].trim(),
		value = (info[1] || "").trim();
	

	function list(){
		var current =  AttUtil.storage('currentWorkspace'),
			spaces = AttUtil.storage('workspaces');
		console.log("  *> current workspace is: %s", current);
		for(var i in spaces){
			console.log("  -> %s = %s", i, spaces[i]);
		};
	}
	switch(command){
		case "list":
			list();
			break;
		case "delete":
			if(!ws){
				console.log("please specify the workspace need to be delete.");
			}else if(workspaces[ws] === undefined){
				console.log("the workspace %s is not exists.", ws);
			}else{
				delete workspaces[ws];
				AttUtil.storage('workspaces', workspaces);
				list();
			}
			break;
		case "add":
			if(!ws){
				console.log("please specify the workspace need to be add.");
			}else if(workspaces[ws]){
				console.log("the workspace %s is existed.", ws);
			}else{
				workspaces[ws] = value;
				AttUtil.storage('workspaces', workspaces);
				list();
			}
			break;
		case "set":
			if(!ws){
				console.log("please specify the workspace need to be set.");
			}else if(!workspaces[ws]){
				console.log("the workspace %s is not exists.", ws);
			}else{
				workspaces[ws] = value;
				AttUtil.storage('workspaces', workspaces);
				list();
			}
			break;
		
		case "goto":
			if(!workspaces[ws]){
				console.log("the workspace %s is not exists.", ws);	
			}else{
				AttUtil.storage('currentWorkspace', ws);
				list();
			}
			break;
	}	
};