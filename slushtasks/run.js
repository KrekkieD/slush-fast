var gutil = require('gulp-util'),
	conflict = require('gulp-conflict'),
	prettify = require('gulp-jsbeautifier'),
	rename = require('gulp-rename'),
	template = require('gulp-template');

module.exports = function (options) {
	var bower = options.configs.bower;
	var src = options.src;
	var templates = options.paths.templates;
	var scaffolding = require(src + '/scaffolding');

	var gulp = options.require.gulp;

	gulp.task('run', function (done) {
		// transport will be handed along all thennables
		var transport = {
			module: {
				prefix: bower.project.angular.prefix,
				ns: scaffolding.ns('.')
					.join('.')
			}
		};
		scaffolding.moduleName(transport)
			.then(function (transport) {
				gulp.src([templates + '/module/**/module.run*.js'])
					.pipe(rename(function (path) {
						path.basename = path.basename.replace('module', transport.module.name);
					}))
					.pipe(template(transport))
					.pipe(prettify(options.settings.prettify))
					.pipe(conflict('./'))
					.pipe(gulp.dest('./'))
					.on('finish', function () {
						done();
					});
			});
	});

};
