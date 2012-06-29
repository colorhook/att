# ATT - Auto Task Tool
ATT is a terminal tool for front-end developers to make web project deployment easier and faster.

## Install

```shell
npm install att -g
```

## Usage
```shell
att <plugin> <...args>
```

* `att jshint */**/*.js` 检查所有js文件
* `att minify index.html`  压缩html
* `att minify icon.png`  压缩png
* `att minify app.js`  压缩js
* `att minify style.css`  压缩css
* `att smushit icon.png` 压缩图片并替换原有图片
* `att datauri style.css`  对css中的图片进行datauri编码
* `att cdn app.js` 上传文件到CDN
* `att build task` 根据XML文件build一个工程

## Plugins

#### att jshint
> 检查JavaScript语法

```shell
att jshint **/*.js
```

#### att csslint
> 检查CSS语法

```shell
att csshint **/*.css
```

#### att lint
> 检查JS, CSS语法

```shell
att lint **/*.*
```

#### att minify
> 压缩HTML, CSS, JavaScript和图片
压缩后的文件会存在于att的临时目录下，不会覆盖当前的文件。

```shell
att minify */**/*.*
```

#### att datauri
> 对CSS文件中的图片进行Base64编码
和`att minify`一样，图片经过Base64后的CSS文件会存在于att的临时目录下，不会覆盖当前的文件。

```shell
att datauri */**/*.css
```

#### att smushit
> 压缩图片。压缩后的图片会替换当前文件，默认使用Yahoo smush.it服务进行压缩，也可以搭建自己的smush服务。
 
查看：[`smush-server`](https://github.com/colorhook/smush-server)

```shell
att datauri */**/*.css
```

#### att tmp
>查看，清除att临时目录

+ 查看临时目录

```shell
att tmp
```
+ 清空临时目录

```shell
att tmp clear
```


#### att cdn
> 传输本地文件到CDN服务器上，这个命令可以将本机js, css, image等资源文件上传都CDN上。
- 首先，使用CDN上传功能需要在CDN服务器上部署一个HTTP service, 通过一个API接口来让att控制台和CDN服务器进行文件传输。
- 其次，在att的配置文件att.json中需要配置当前的工作目录，该目录一般为某个版本库的根路径，可以配置多个工作目录。

>上传的过程中，会对js，css和image进行压缩。如果js，css文件中的注释有定义版本号，它默认会在文件后面加上版本号。
例如一个名为`test.js`文件中顶部注释如下所示，那么上传后的文件名会变成`test-2-3-6.js`

```javascript
/*!
 * @version 2-3-6
 * @author ...
 * @description ...
 */
```

+ 上传到测试CDN

```shell
att cdn /product/project/*/**/*.js
```

+ 上传到测试CDN的同时上传到线上CDN

```shell
att cdn /product/project/*/**/*.js -p
```

#### att build
> 根据XML配置文件来build工程，在XML配置文件中，可以通过标签来表示一系列的动作，包括创建、删除，移动文件和文件夹，修改文件和文件夹名称，
合并文件，对CSS进行DataURI，压缩图片, HTML, CSS和JavaScript，合并成zip包，甚至上传到FTP和发邮件。

+ 先定义一个att.xml配置文件

```xml
<?xml version="1.0" encoding="utf-8"?>
<project name="att-project" description="att-project-description" default="build" basedir=".">

	<property name="src" value="src"/>
	<property name="build" value="build"/>

	<target name="echo">
		<echo>hello, att</echo>
	</target>
		
	<target name="test">
		<nodeunit>../../node-smushit/test</nodeunit>
	</target>

	<target name="clear">
		<delete target="/your/file/or/dir/need/to/delete"/>
	</target>
	
	<target name="create">
	    <mkdir target="${build}"/>
	    <touch target="${build}/README"/>
	</target>

	<target name="minify">
		<concat to="${build}/combo.js" split="\r\n">
			<fileset>
				<include file="${src}/lib/mvc.js"/>
				<include file="${src}/js/model.js"/>
				<include file="${src}/js/view.js"/>
				<include file="${src}/js/controller.js"/>
				<include file="${src}/js/app.js"/>
			</fileset>
		</concat>
		<minify from="${src}/style.css" to="${build}/style.css"/>
		<minify from="${build}/combo.js" to="${build}/combo-min.js"/>
	</target>

	<target name="ftp">
		<input name="ftp.password" label="ftp password:"/>
		<ftp host="your-ftp-host" username="root" password="${ftp.password}" port="21" 
			remotedir="/att">
			<upload>
				<fileset>
					<include file="${build}/combo-min.js"/>
				</fileset>
			</upload>
		</ftp>
	</target>

	<target name="notify">
		<input name="mail.password" label="mail password:" type="password"/>
		<mail host="smtp.gmail.com" ssl="true" port="465" authentication="login"
			from="colorhook@gmail.com" to="colorhook@gmail.com"
			username="colorhook@gmail.com" password="${mail.password}"  subject="att notification">
		<![CDATA[
		This is an email sent by att.
		]]>
		</mail>
	</target>

	<target name="build" depends="echo,test,clear,create,minify,ftp,notify">
	</target>
</project>
```

+ Run the command in terminal.

```shell
att build
```

+ Run the special task

```shell
att build -t taskname
```
+ Run the special task by special config file

```shell
att build -t taskname -f your-custom-config-file-name
```
> 如果要在`att.xml`中使用`zip`命令，需要操作系统的PATH路径下有zip命令，如果没有安装过zip包，可以从[这里](http://stahlworks.com/dev/index.php?tool=zipunzip)下载。


#### att html2pdf
> 将HTML页面转化成PDF，需要先安装`wkhtmltopdf`库，并把可执行文件加入到PATH路径下。

```shell
att html2pdf */**/*.html
```

## Licence

ATT is free to use under MIT license. 

## Bugs & Feedback

Please feel free to [report bugs](http://github.com/colorhook/att/issues) or [feature requests](http://github.com/colorhook/att/pulls).
You can send me private message on `github`, or send me an email to: [colorhook@gmail.com]