'use strict';

var gulp = require('gulp');

var scaffoldModule = require(global.config.paths.src + 'scaffolding/module');
var prompts = require(global.config.paths.src + '/prompts');
var scaffolding = require(global.config.paths.src + '/scaffolding');

module.exports = function (options) {

	gulp.task('module', function (done) {

		var ns = scaffolding.ns('.');
		var transport = {
			module: {
				prefix: options.bower.project.angular.prefix,
				ns: ns.join('.')
			}
		};

		if (gulp.args.length) {
			transport.module.newNs = gulp.args.join(' ');
		}

		prompts.moduleName(transport)
			.then(scaffolding.moduleName)
			.then(function (transport) {

                scaffoldModule(transport)
                    .on('end', function () {
                        done();
                    });

			});

	});
};
