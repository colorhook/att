#!/usr/bin/env node

var att = require('./att.js'),
	util = require('util');

var responses = {
	error: function (message) {
		util.puts('Error occurred: ' + message);
	},
	help: function () {
		util.puts([
			'Usage: att filepath --basedir=src --bulddir=build',
			'used for enhancing the performance of your website by compresings js, css and image files.',
			'',
			'(Note: due to the way the args are parsed, two hyphens -- are required after',
			' binary flags if they appear before file paths)',
			'',
			'Options:',
			'',
			' General:',
			'  -v, --verbose		verbose mode',
			'',
			' Traversing:',
			'  -R, --recursive	scan directories recursively',
			'',
			' Other:',
			'  -h, --help		print this help page',
			'  --version		print program version',
			'',
			' Examples:',
			'   Single File',
			'    att image.png',
			'    att *.js',
			'    att *',
            '',
			'   Single Directory',
			'    att /var/www/websit',
            '',
			'   Recursive Directory',
			'    att -R -- /var/www/mysite.com/images',
			''
		].join('\n'));
	},
	report: function () {

	},
	version: function () {
		util.puts('ATT v0.1.0');
	}
};

function respond (type) {
	responses[type].call();
}

var argv = require('optimist').argv;

if (argv.help || argv.h) {
	respond('help');
} else if (argv.version) {
	respond('version');
} else if (argv._.length) {
	var settings = {};

	if (argv.R || argv.recursive) {
		settings.recursive = true;
	}

	if (argv.v || argv.verbose) {
		settings.verbose = true;
	}

	if(argv.i || argv.ignore){
		settings.ignoreConfirm = true;
	}

	if(argv.c || argv.config){
		settings.config = argv.c;
	}
	if(argv.b || argv.basedir){
		settings.basedir = argv.b || argv.basedir;
	}
	if(argv.b || argv.builddir){
		settings.builddir = argv.b || argv.builddir;
	}

	if(argv.rule){
		settings.rule = argv.rule
	}

	att.run(argv._, settings);

} else {
	respond('help');
}