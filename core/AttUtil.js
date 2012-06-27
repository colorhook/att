var fs = require("fs"),
	url = require("url"),
	http = require("http"),
    path = require("path"),
    util = require("util"),
	minimatch = require("minimatch"),
	querystring = require("querystring"),
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
    matches[0].replace(/\*\s*@(\w+)\s*([^@\*]+)/g, function (match, v1, v2) {
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
				excludeDirectory: true,
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
};

/**
 * 寻找缓存文件
 */
exports.findTmpFile = function(glob, callback, ext){
	exports.findFile(__dirname + "/../tmp", function(file){
		var m = glob ? minimatch(file, glob, {nocase: true, matchBase: true}) : true;
		if(m){
			callback(path.resolve(file));
		}
	}, ext, true);
};
exports.getTmpFile = function(glob, callback, ext){
	var files = [];
	exports.findTmpFile(glob, function(file){
		files.push(file);
	}, ext);
	return files;
};

exports.post = function(endpoint, params, success, fail){
	var httpRequest,
		onRequestCompleted,
		options = url.parse(endpoint);

	options.path = options.pathname;
	options.method = "POST";
	
	onRequestCompleted= function(response) {
	  var resBody = '';
	  response.on('data', function(chunk) {
		resBody += chunk;
	  });
	  response.on('end', function() {
		  success && success(resBody);
	  });
	};
	for(var i in params){
		params[i] = encodeURIComponent(params[i]);
	}
	var postData = querystring.stringify(params);

	options.headers = {
		"Content-Type": "application/x-www-form-urlencoded",
		"Content-Length": postData.length
	}
	httpRequest = http.request(options, onRequestCompleted);
	httpRequest.write(postData);
	httpRequest.end();

	if(fail){
		httpRequest.on('error', fail);
	}
};


var	buildRequestBody = function(fullName, uploadIdentifier, params){
	var boundary = '------multipartformboundary' + (new Date).getTime();
	var dashdash = '--';
	var crlf     = '\r\n';

	/* Build RFC2388. */
	var builder = '';

	builder += dashdash;
	builder += boundary;
	builder += crlf;

	builder += 'Content-Disposition: form-data; name="'+ uploadIdentifier +'"';
	//支持文件名为中文
	builder += '; filename="' + encodeURIComponent(fullName.replace(/.+\//, '')) + '"';
	builder += crlf;

	builder += 'Content-Type: application/octet-stream';
	builder += crlf;
	builder += crlf;

	/* 写入文件 */
	builder += fs.readFileSync(fullName, "binary");
	builder += crlf;

	params = params || {};
	/* 传递额外参数 */
	for(var i in params){
		if(params.hasOwnProperty(i)){
			builder += dashdash;
			builder += boundary;
			builder += crlf;

			builder += 'Content-Disposition: form-data; name="'+ i +'"';
			builder += crlf;
			builder += crlf;
			//支持参数为中文
			builder += encodeURIComponent(params[i]);
			builder += crlf;
		}
	}


	/* 写入边界 */
	builder += dashdash;
	builder += boundary;
	builder += dashdash;
	builder += crlf;
	//console.log(builder);
	return {
		contentType: 'multipart/form-data; boundary=' + boundary,
		builder: builder
	}
}
exports.upload = function(endpoint, file, params, success, fail, identify){
	var httpRequest,
		onRequestCompleted,
		options = url.parse(endpoint);

	options.path = options.pathname;
	options.method = "POST";
	
	onRequestCompleted= function(response) {
	  var resBody = '';
	  response.on('data', function(chunk) {
		resBody += chunk;
	  });
	  response.on('end', function() {
		  success && success(resBody);
	  });
	};
	
	var postData = buildRequestBody(file, identify || "file", params);
	options.headers =  {
	  'Content-Type': postData.contentType,
	  'Content-Length': postData.builder.length
	}
	httpRequest = http.request(options, onRequestCompleted);
	httpRequest.write(postData.builder, "binary");
	httpRequest.end();
	
	if(fail){
		httpRequest.on('error', fail);
	}
	
};