var path = require("path");

exports.transform = function (from, to) {
    var basename = path.basename(to).replace(/\..+/, ""),
        extname = path.extname(to),
        dirname = path.dirname(to),
        output;

    if (extname.toLowerCase().indexOf(["js", "css"]) != -1) {
        output = dirname + "/" + basename + "-min" + extname;
        return path.resolve(output);
    } else {
        return to;
    }
};