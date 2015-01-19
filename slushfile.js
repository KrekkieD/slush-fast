'use strict';

var config = require('npmConfig')(__dirname),
    globule = require('globule'),
	gulp = require('gulp');

// add gulp release tasks
require('gulp-release-tasks')(gulp);


// Settings
var settings = {
	gulp: gulp,
	bower: config.bower,
	slush: {
		npm: config.slushNpm
	},
	slushNpm: config.slushNpm,
	src: __dirname + '/src',
	slushtasks: __dirname + '/slushtasks',
	applications: './src/applications',
	modules: './src/modules',
	templates: __dirname + '/templates',
	docs: __dirname + '/docs',
	prettify: config.prettify
};

// Load all task files
globule.find(__dirname + '/src/slushtasks/*')
	.map(function (file) {
		require(file)(settings);
	});

// register task 'application' as main init task
gulp.task('default', ['application']);
