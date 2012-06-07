var fs = require("fs"),
    path = require("path"),
    util = require("util"),
    FileUtil = require("./FileUtil.js");

/**
 * 顺序执行一些异步任务
 */
exports.doSequenceTasks = function (tasks, method, completed) {
    if (tasks.length === 0) {
        return completed();
    }
    method(tasks.shift(), function () {
        exports.doSequenceTasks(tasks, method, completed);
    });
};
/**
 * 并列执行一些异步任务
 */
exports.doParallelTasks = function (tasks, method, completed) {
    var total = tasks.length;
    if (total === 0) {
        return completed();
    }
    tasks.forEach(function (item) {
        method(item, function () {
            if (--total === 0) {
                completed();
            }
        });
    });
};
/**
 * 读取文本内容中的注释信息
 */
exports.readComment = function (key, content) {
    var matches = content.match(/\/\*[.\s\S]+?\*\//),
        map = {},
        ret;

    if (!matches || !matches[0]) {
        return null;
    }
    matches[0].replace(/\*\s*@(\w+)\s*([^@\*]+?)/g, function (match, v1, v2) {
        if (!ret && v1.trim() == key) {
            ret = v2.trim();
        }
    });
    return ret;
};
/**
 * 读取文件注释信息
 */
exports.readCommentInFile = function (key, file, charset) {
    charset = charset || "utf-8";
    return exports.readComment(key, fs.readFileSync(file, charset));
};
/**
 * 根据dict参数格式化带有${key}这种形式的字符串
 */
exports.format = function (str, dict) {

    if (typeof str !== "string") {
        var v = JSON.stringify(str);
        v = exports.format(v, dict);
        return JSON.parse(v);
    }

    var getValue = function (key) {
            if (util.isArray(dict)) {
                for (var i = 0, l = dict.length; i < l; i++) {
                    if (getValue(dict[i]) !== undefined) {
                        return getValue(dict[i]);
                    }
                }
                return undefined;
            } else {
                return dict[key];
            }
        };
    str = str.replace(/\$\{([a-zA-Z0-9\-\._]+)\}/g, function (match, key) {
        var s = getValue(key);
        if (s === undefined) {
            return match;
        }
        return s;
    });
    return str;
};
/**
 * 持久化存储
 */
exports.storage = function (key, value) {
    var data, configFile = __dirname + '/../att.json',
        charset = 'utf-8',
        save = function (o) {
            try {
                fs.writeFileSync(configFile, JSON.stringify(o, null, 4), charset);
            } catch (err) {}
			
        };

    try {
        data = fs.readFileSync(configFile, charset);
        data = JSON.parse(data);
    } catch (err) {
        data = {};
    }
    if (key === undefined) {
        return data;
    }
    if (value === undefined) {
        return data[key];
    } else if (value === null) {
        delete data[key];
    } else {
        data[key] = value;
    }
    save(data);
};
/**
 * 转换成布尔值
 */
exports.toBoolean = function (v) {
    if (!v) {
        return false;
    }
    v = v.toLownerCase();
    if (v == "1" || v == "true" || v == "ok" || v == "yes") {
        return true;
    }
    return false;
};

/**
 * 寻找文件
 */
exports.findFile = function (arr, callback, ext, recursive) {
    if (!arr) {
        return;
    }
    if (ext && !util.isArray(ext)) {
        ext = [ext];
    };
    if (util.isArray(ext)) {
        ext.forEach(function (item, index) {
            ext[index] = item.toLowerCase();
        })
    };
    if (util.isArray(arr)) {
        arr.forEach(function (item) {
            exports.findFile(item, callback);
        });
    } else {
        var stat = fs.statSync(arr);
        if (stat.isDirectory()) {
            FileUtil.each(arr, function (item) {
                callback(item.fullName);
            }, {
                recursive: recursive,
                matchFunction: function (item) {
                    var extName = path.extname(item.fullName).toLowerCase().replace(".", "");
                    if (!ext) {
                        return true;
                    }
                    return ext.indexOf(extName) != -1;
                }
            });
        } else if (stat.isFile()) {
            callback(arr);
        }
    }
}