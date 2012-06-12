# ATT - Auto Task Tool
ATT is a terminal tool for develop & deploy web project easier and faster.

## Install

...prepare publish to npm

## Usage
```shell
att <plugin> <...args>
```

* att jshint `*/**/*.js` 检查所有js文件
* att minify index.html  压缩html
* att minify icon.png  压缩png
* att minify app.js  压缩js
* att minify style.css  压缩css
* att smushit icon.png 压缩图片并替换原有图片
* att datauri style.css  对css中的图片进行datauri编码

## Plugins

#### att jshint
> 检查JavaScript预发

#### att csslint
> 检查CSS语法

#### att minify
> 压缩HTML, CSS, JavaScript和图片

#### att datauri
> 对CSS文件中的图片进行Base64编码

#### att workspace
>添加、查看、删除、修改工作目录。

+ 查看工作目录列表和当前的工作目录
```shell
att workspace list
```

+ 添加一个工作目录
```shell
att workspace add workSVN="D:\work\svn"
```

+ 修改工作目录
```shell
att workspace set workSVN="D:\work\svn"
```

+ 删除工作目录
```shell
att workspace delete workSVN
```

+ 设置当前工作目录
```shell
att workspace goto workSVN
```

#### att cdn
> 传输本地文件到CDN服务器上
* 首先，使用CDN上传功能需要在CDN服务器上部署一个HTTP service, 通过一个API接口来让att控制台和CDN服务器进行文件传输。
* 其次，在att的配置文件att.json中需要配置当前的工作目录，该目录一般为某个版本库的根路径，可以配置多个工作目录。
+ 上传到测试CDN

```shell
att cdn /product/project/*/**/*.js
```

+ 上传到测试CDN的同时上传到线上CDN

```shell
att cdn /product/project/*/**/*.js -p
```

#### att build
> 根据XML配置文件来build工程

+ 先定义一个att.xml配置文件

```xml
<?xml version="1.0" encoding="utf-8"?>
<project name="att-project" description="att-project-description" default="build" basedir=".">

	<property name="src" value="src"/>
	<property name="build" value="build"/>

	<target name="echo">
		<echo>hello, att</echo>
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

	<target name="build" depends="echo,clear,create,minify,ftp,notify">
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

## Licence

ATT is free to use under MIT license. 

## Bugs & Feedback

Please feel free to [report bugs](http://github.com/colorhook/att/issues) or feature requests.
You can send me private message on `github`, or send me an email to: [colorhook@gmail.com]