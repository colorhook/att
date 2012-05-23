var email = require("mailer");

/**
 * @name mail
 */
exports.name = "mail";

/**
 * @option host
 * @option to
 * @option subject
 */
exports.execute = function(options, callback){

	
	if(!options.host || !options.to || !options.subject){
		return callback(new Error("The host, to and subject options are required"));
	}

	var mailOptions = {
      host : options.host,              // smtp server hostname
      ssl: Boolean(options.ssl),        // for SSL support - REQUIRES NODE v0.3.x OR HIGHER
      domain : options.domain,          // domain used by client to identify itself to server
      to : options.to,
      from : options.from,
      subject : options.subject,
      body: options.body,
      authentication : options.authentication,    // auth login is supported; anything else is no auth
      username : options.username,        // username
      password : options.password         // password
    }
	var base64 = function(s){
		return (new Buffer(s)).toString("base64");
	}
	if(options.port){
		mailOptions.port = options.port;
	}
	if(!options.body && options.value){
		mailOptions.body = options.value;
	}
	if(options.base64){
		mailOptions.username = base64(mailOptions.username);
		mailOptions.password = base64(mailOptions.password);
	}
	email.send(mailOptions, function(err, result){
      callback(err);
    });
};