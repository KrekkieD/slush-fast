'use strict';

var config = require('npmConfig')(__dirname),
    _ = require('lodash'),
	_s = require('underscore.string'),
	concat = require('gulp-concat'),
	extend = require('extend'),
	globule = require('globule'),
	fs = require('fs'),
	install = require('gulp-install'),
	jeditor = require('gulp-json-editor'),
	path = require('path'),
	Q = require('Q'),
    gulp = require('gulp'),
    seq = require('gulp-sequence').use(gulp),
    gutil = require('gulp-util'),
    templating = require(config.paths.src + '/templating');

var template = require('gulp-template');
var conflict = require('gulp-conflict');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');

module.exports = function (options) {

	var src = path.resolve(__dirname, '..');
	var scaffolding = require(src + '/scaffolding');
	var prompts = require(src + '/prompts');

	var globs = config.globs;
	var defaults = createDefaults();

    // transports holds the merged default + answer config
    var transport;

	gulp.task('readme', function () {

        var readme = extend({}, defaults, defaults.bower);
        gutil.log('Preparing README files');
        prepareReadme(readme, function () {
            gulp.src(globs.docs.readme.project.src)
                .pipe(template(readme))
                .pipe(concat(globs.docs.readme.project.dest))
                .pipe(conflict(globs.docs.readme.project.dest))
                .pipe(gulp.dest('./'))
                .on('end', function (err) {
                    if (err) {
                        gutil.log(gutil.colors.red('Failed to create project readme.'));
                    } else {
                        gutil.log('Project readme created.');
                    }
                });

        });

    });

	gulp.task('application', function (done) {

		// prompt for app specific values
		prompts.application(defaults)
			.then(function (answers) {
				//transport = extend({}, defaults, {
				//	install: answers.install,
				//	description: answers.appDescription,
				//	version: answers.appVersion,
				//	authors: [{
				//		name: answers.authorName,
				//		email: answers.authorEmail
				//	}],
				//	repository: {
				//		type: 'git',
				//		url: answers.appRepository
				//	},
                 //   project: {
                 //       name: {
                 //           full: answers.appName,
                 //           slug: _s.slugify(answers.appName)
                 //       }
                 //   }
				//});

                var angularPrefix = scaffolding.prefixName(answers.appPrefix);
                var bootstrapModuleName = angularPrefix + '.' + answers.bootstrapModule;

                var answerConfig = {
                    description: answers.appDescription,
                    version: answers.appVersion,
                    authors: [{
                        name: answers.authorName,
                        email: answers.authorEmail
                    }],
                    install: answers.install,
                    repository: {
                        type: 'git',
                        url: answers.appRepository
                    },
                    project: {
                        name: {
                            full: answers.appName,
                            slug: _s.slugify(answers.appName)
                        },
                        angular: {
                            prefix: angularPrefix,
                            bootstrap: {
                                module: bootstrapModuleName,
                                element: _s.slugify(bootstrapModuleName.split('.')
                                    .join('-')) + '-app'
                            }
                        }
                    },
                    module: {
                        prefix: angularPrefix,
                        ns: '',
                        newNs: answers.bootstrapModule
                    }
                };

				transport = extend(true, defaults, answerConfig);

                // waterfall that shit to the next promise
				return Q.resolve(transport);

			})
            // update transport with addition module name properties
			.then(scaffolding.moduleName)
			.then(function () {
                // these probably shouldn't be gulp tasks as that makes them available through cli and slush.
                // might be better to simply queue the gulp streams
				seq(
					[
						'create-bower-json',
						'create-package-json',
                        'create-fast-json'
					], [
						'update-bower-json',
						'update-package-json',
                        'update-fast-json'
					], [
						'copy-files',
						'copy-special-files'
					],
					'readme', [
						'create-module',
						'create-readme'
					],
					'install-npm-modules',
					'show-help',
					done);
			});
	});

	gulp.task('copy-files', function () {

		var butNot = [
            globs.bootstrap.src,
            globs.index.src,
            globs.gulpfile.src,
			globs.bower.src,
			globs.fast.src,
            globs.npm.src
		].map(function (glob) {
            return '!' + glob;
        });

		return gulp.src([options.templates + '/application/**/*'].concat(butNot))
			.pipe(template(transport))
			.pipe(rename(function (file) {
				if (file.basename[0] === '_') {
					file.basename = '.' + file.basename.slice(1);
				}
			}))
			.pipe(conflict('./'))
			.pipe(gulp.dest('./'));

	});

	gulp.task('copy-special-files', function () {

		return gulp.src([globs.bootstrap.src, globs.index.src, globs.gulpfile.src])
			.pipe(conflict('./'))
			.pipe(gulp.dest('./'));

	});

    gulp.task('readme', function (done) {

        var readme = extend({},
            transport,
            { slushNpm: options.slushNpm },
            transport.bower
        );

        gutil.log('Preparing README files', readme);

        prepareReadme(readme, function () {
            gulp.src(globs.docs.readme.project.src)
                .pipe(template(readme))
                .pipe(concat(globs.docs.readme.project.dest))
                .pipe(conflict(globs.docs.readme.project.dest))
                .pipe(gulp.dest('./'))
                .on('end', function (err) {
                    if (err) {
                        gutil.log(gutil.colors.red('Failed to copy files'));
                    } else {
                        gutil.log('Files copied');
                    }

                    done(err, true);
                });

        });

    });

	gulp.task('create-module', function () {

        var subTransport = {
            module: transport.module,
            target: './src/app'
        };

        return scaffolding.moduleName(subTransport)
            .then(function () {
                return templating.createModule(subTransport);
            });

	});

	gulp.task('create-readme', function (done) {
		// references transport
		done();
	});

	gulp.task('create-bower-json', function (done) {
		if (!fs.existsSync(globs.bower.target)) {
			gulp.src(globs.bower.src)
				.pipe(gulp.dest('./'))
				.on('finish', function () {
					done();
				});
		} else {
			done();
		}
	});

	gulp.task('update-bower-json', function () {

		return gulp.src(globs.bower.target)
			.pipe(jeditor(function (json) {
				extend(json, {
					name: transport.project.name.slug, // string
					description: transport.description, // string
					version: transport.version, // string
					authors: transport.authors, // array or object, in our case an array
					repository: transport.repository,
					project: {
						name: transport.project.name,
						angular: transport.project.angular,
						includes: transport.project.includes
					}
				});

				return json;
			}))
			.pipe(gulp.dest('./'));

	});

    gulp.task('create-fast-json', function (done) {
        if (!fs.existsSync(globs.fast.target)) {
            gulp.src(globs.fast.src)
                .pipe(gulp.dest('./'))
                .on('finish', function () {
                    done();
                });
        } else {
            done();
        }
    });

    gulp.task('update-fast-json', function () {

        return gulp.src(globs.fast.target)
            .pipe(jeditor(function (json) {
                extend(json, {
                    angular: transport.project.angular,
                    includes: transport.project.includes,
                    appRoot: '.' + path.sep + 'src' + path.sep + 'app'
                });

                return json;
            }))
            .pipe(gulp.dest('./'));

    });

	// package.json
	gulp.task('create-package-json', function (done) {

		if (!fs.existsSync(globs.npm.target)) {
			gulp.src(globs.npm.src)
				.pipe(gulp.dest('./'))
				.on('finish', function () {
					done();
				});
		} else {
			done();
		}

	});

	gulp.task('update-package-json', function () {
		return gulp.src(globs.npm.target)
			.pipe(jeditor(function (json) {
				extend(json, {
					name: transport.project.name.slug, // string
					description: transport.description, // string
					version: transport.version, // string
					contributors: transport.authors, // array
					repository: transport.repository // object
				});

				return json;
			}))
			.pipe(gulp.dest('./'));

	});

	gulp.task('install-npm-modules', function (done) {
		if (!transport.install) {
			done();
		} else {
			return gulp.src('./package.json')
				.pipe(install());
		}
	});

	gulp.task('show-help', function () {
		gutil.log(gutil.colors.bgYellow(gutil.colors.green(
				'Your project has been generated, type gulp help for usage information.'
			))

		);
	});

	function prepareReadme(answers, callback) {

		answers.readme = {};

		globule.find(globs.docs.readme.includes.src)
			.map(function (file) {
				var value = fs.readFileSync(file, 'utf8');
				var key = path.basename(file, '.md');
				answers.readme[key] = _.template(value)(answers);
			});

		callback();

	}

	function createDefaults() {

		var bower = config.bower;

		var templateBower = scaffolding.findBower(config.paths.templates + '/application/');

		var workingDirName = scaffolding.getWorkingDirName();
		var repositoryUrl = scaffolding.getGitRepositoryUrl();
		var gitUser = scaffolding.getGitUser();

		gitUser = gitUser || {};
		var bootstrapModule = '';
		var project = bower.project || templateBower.project;
		extend(project.name, {
			full: workingDirName,
			slug: _s.slugify(workingDirName)
		});

		var defaults = {
			authors: bower.authors,
			appName: project.name.slug,
			description: bower.description || '',
			version: bower.version || '0.0.0',
			userName: format(gitUser.name), // TODO: where did this come from? -> || osUserName,
			authorEmail: gitUser.email || '',
			mainFile: bower.main || '',
			appRepository: repositoryUrl ? repositoryUrl : '',
			bootstrapModule: bootstrapModule,
			appPrefix: project.angular.prefix,
			bower: bower,
			slush: options.slush,
			project: project
		};

		if (gitUser) {
			if (gitUser.name) {
				defaults.authorName = gitUser.name;
			}
			if (gitUser.email) {
				defaults.authorEmail = gitUser.email;
			}
		}

		return defaults;
	}
};

function format(string) {
	if (string) {

		var username = string.toLowerCase();
		return username.replace(/\s/g, '');
	}
}
