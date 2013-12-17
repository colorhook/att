att - Auto Task Tool
=====
集成化的、易扩展的前端开发工具


单元测试
------
[![travis build status](https://api.travis-ci.org/colorhook/att.png)](https://www.travis-ci.org/colorhook/att)

安装
------

```shell
npm install att -g
```

★使用方法
--------

```shell
~>att

Usage: att COMMAND[:NAMESPACE] [ARGS] [--silent]

   beautify     format the code to be beautiful
   createapp    create app by template
   datauri      datauri the css or image
   help         for more infomation on a specific command
   hint         code syntax validation
   install      install att plugin by npm module
   minify       minify html, css, js and image files
   namespace    set a command running without :namespace by default
   server       startup a simple server
   uninstall    uninstall att plugin

```

* `att hint */**/*.js` 检查所有js文件
* `att minify index.html`  压缩html
* `att minify icon.png`  压缩png
* `att minify app.js`  压缩js
* `att minify style.css`  压缩css
* `att minify icon.png` 压缩图片并替换原有图片
* `att datauri style.css`  对css中的图片进行datauri编码



### att install


* 从npm库安装一个library作为插件

```
att install att-formatjson
```


* 指定特定的npm环境

```
att install xxx --registry=http://registry.npm.taobao.net
```

### att minify

```
att minify **/*.js

#and
att minify **/*.css

#and
att minify **/*.png
```

### att datauri

```
att datauri **/*.css
```

★文档
--------
- 确保安装了yuidoc，如果没有请在命令行中执行`npm install yuidoc -g`进行安装
- 启动命令行，进入att目录，执行`yuidoc --server .`
- 在浏览器中打开 http://localhost:3000 查看文档


★Timeline
----------------
### 4.1.4 (2013-12-17)
* `node-minifier` 更新至0.1.3，[`UglifyJS2`](https://github.com/mishoo/UglifyJS2)存在[变量名混淆的bug](https://github.com/mishoo/UglifyJS2/issues/242)，在未发布修复版本之前使用hack的方式规避。

### 4.1.3 (2013-11-26)
* `node-minifier` 更新至0.1.2，增强压缩png图片的功能，依次使用`optipng`, `pngcrush`, `pngquant`, `advpng`优化png图片。

### 4.1.2 (2013-9-3)
* `node-minifier` 更新至0.1.1，压缩JS时，默认将中文转成Unicode

### 4.1.1 (2013-8-26)
* 文档更新
* 代码检查，代码优化
* minify 增加参数 `--remove-console`, `--copyright`
* hint 增加参数 `--node`
* bugfix

### 4.1.0 (2013-8-25)
* 加入createapp創建項目插件
* 加入beautify格式化代碼插件
* 加入server插件，插件存储到att/plugins目录
* 重构att的插件机制
* js压缩使用UglifyJS2
* 图片压缩优先使用本地native包压缩

### 4.0.0 (2013-3-12)
* 插件延迟初始化
* 安装卸载插件功能
* 插件取别名的功能 (deprecated)
* 支持npm模块作为插件安装
* 移除了att build功能

### 3.3.0 （2013-1-30)

* 更灵活的配置
* 协同化的插件机制

### 3.2.0 (2012-12-30)

* 基础插件
* 压缩
* 代码检查
* datauri
* 上传CDN

### 3.1.0 (2012-12-15)

* 基础框架
* 插件机制