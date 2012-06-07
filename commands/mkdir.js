var fs = require('fs'),
    path = require('path'),
    Project = require('../core/Project.js').Project,
    wrench = require('wrench');

/**
 * command name
 */
exports.name = "mkdir";

/**
 * @option target {String}
 */
exports.execute = function (options, callback) {
    options = options || {};
    var target = options.target;

    if (!target) {
        return callback(new Error("In mkdir task the target options is required."));
    }
    if (Project.currentProject) {
        target = path.resolve(Project.currentProject.basedir, target);
    }
    try {
        wrench.mkdirSyncRecursive(target, options.permission || 0777);
    } catch (err) {
        return callback(err);
    }
    return callback();
};