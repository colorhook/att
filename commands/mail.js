var email = require("mailer");

/**
 * command name
 */
exports.name = "mail";

/**
 * @option host
 * @option to
 * @option subject
 */
exports.execute = function (options, callback) {

    if (!options.host || !options.$to || !options.subject) {
        return callback(new Error("In mail task the host, to and subject options are required"));
    }

    var mailOptions = {
        host: options.host,
        ssl: Boolean(options.ssl),
        domain: options.domain,
        to: options.$to,
        from: options.$from,
        subject: options.subject,
        body: options.value,
        authentication: options.authentication,
        username: options.username,
        password: options.password 
    };

    var base64 = function (s) {
            return (new Buffer(s)).toString("base64");
        };
    if (options.port !== undefined) {
        mailOptions.port = options.port;
    }
    if (!options.body && options.value) {
        mailOptions.body = options.value;
    }
    if (options.base64) {
        mailOptions.username = base64(mailOptions.username);
        mailOptions.password = base64(mailOptions.password);
    }
    email.send(mailOptions, function (err, result) {
        callback(err);
    });
};