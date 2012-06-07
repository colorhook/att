var vm = require("vm"),
    Project = require("../core/Project.js").Project;

/**
 * command name
 */
exports.name = "code";

/**
 * @option value
 */
exports.execute = function (options, callback) {
    var code = options.value,
        pname = options.output,
        output, project = Project.currentProject;

    options.project = project;
    if (!code) {
        return callback(new Error("In code task the code value must be specified."));
    }
    try {
        eval(code);
    } catch (e) {
        return callback(e);
    }
    Project.currentProject.addProperty(pname, output);
    return callback();
};