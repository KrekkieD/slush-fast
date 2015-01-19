'use strict';

var globule = require('globule'),
	gulp = require('gulp'),
	scaffolding = require('./src/scaffolding');

// add gulp release tasks
require('gulp-release-tasks')(gulp);


// set global config
global.config = {};
global.config.paths = require(__dirname + '/src/config/paths');
global.config.prettify = require(__dirname + '/src/config/prettify');
global.config.slushNpm = scaffolding.findNpm(__dirname + '/templates/application/');
global.config.bower = scaffolding.findBower('.');


// Settings
var settings = {
	gulp: gulp,
	bower: global.config.bower,
	slush: {
		npm: global.config.slushNpm
	},
	slushNpm: global.config.slushNpm,
	src: __dirname + '/src',
	slushtasks: __dirname + '/slushtasks',
	applications: './src/applications',
	modules: './src/modules',
	templates: __dirname + '/templates',
	docs: __dirname + '/docs',
	prettify: global.config.prettify
};

// Load all task files
globule.find(__dirname + '/src/slushtasks/*')
	.map(function (file) {
		require(file)(settings);
	});


gulp.task('default', ['init']);
