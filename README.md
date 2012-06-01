ATT - Auto Task Tool
====

ATT is a terminal tool for develop & deploy web project easier and faster.

Usage
----

```
att <plugin> <...args>
```

* att jshint `*/**/*.js` 检查所有js文件
* att minify index.html  压缩html
* att minify icon.png  压缩png
* att minify app.js  压缩js
* att minify style.css  压缩css
* att datauri style.css  对css中的图片进行datauri编码

Plugins
----

* jslint
* jshint
* csslint
* minify
* datauri
* build

### att jslint/jshint

> check javascript syntax.

### att csslint

> check css syntax.

### att minify

> minify html, css, js & images.

## att datauri

> base64 the image in css.

### att build

> build a task by configuration file.

+ Define a build configuration file named att.xml.

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
#or
att build -t taskname
#or
att build -t taskname -f your-custom-config-file-name
```

Licence
----

ATT is free to use under MIT license. 

Bugs & Feedback
----

Please feel free to report bugs or feature requests.
You can send me private message on `github`, or send me an email to: [colorhook@gmail.com]