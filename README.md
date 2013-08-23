att - Auto Task Tool
=====
集成化的、易扩展的前端开发工具


单元测试
------
[![travis build status](https://api.travis-ci.org/colorhook/att.png)](https://www.travis-ci.org/colorhook/att)


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


* 从npm库安装一个lib作为插件

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
- 保证安装了yuidoc，如果没有请在命令行中执行`npm install yuidoc -g`进行安装
- 启动命令行，进入att目录，执行`yuidoc --server .`
- 在浏览器中打开 http://localhost:3000 查看文档


★Timeline
----------------

### 4.1.0
* 加入createapp創建項目插件
* 加入beautify格式化代碼插件
* 加入server插件
* 重构att的插件机制

### 4.0.0 (2013-3-12)
* 插件延迟初始化
* 安装卸载插件功能
* 插件取别名的功能
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