var os = require("os");
/**
 * plugin name
 */
exports.name = "sys";

/**
 * plugin description
 */
exports.description = "print the system variables";

/**
 * plugin action
 */
exports.action = function(){
	var path = process.env.PATH.split(";"),
		mem = Math.round(os.freemem()/os.totalmem() * 10000)/100 + "%"  +  "\t" + os.freemem() + "/" + os.totalmem();
	path.forEach(function(item){
		console.log(item);
	});
	console.log("Used Mem: " + mem);
};