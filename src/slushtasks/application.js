'use strict';
/* global require,process,console,__dirname */
var _ = require('lodash'),
	_s = require('underscore.string'),
	async = require('async'),
	concat = require('gulp-concat'),
	extend = require('extend'),
	globule = require('globule'),
	gulp = require('gulp'),
	conflict = require('gulp-conflict'),
	fs = require('fs'),
	inquirer = require('inquirer'),
	install = require('gulp-install'),
	jeditor = require('gulp-json-editor'),
	multipipe = require('multipipe'),
	rename = require('gulp-rename'),
	path = require('path'),
	prettify = require('gulp-jsbeautifier'),
	Q = require('Q'),
	sh = require('shelljs'),
	template = require('gulp-template'),
	tap = require('gulp-tap'),
	util = require('gulp-util');

module.exports = function (options) {

	var src = options.src;
	var templates = options.templates;
	var scaffolding = require(src + '/scaffolding');
	var prompts = require(src + '/prompts');

	var gulp = options.gulp;
	var seq = require('gulp-sequence').use(gulp);

	var answers;


	var globs = {
		bootstrap: {
			src: options.templates + '/application/*/bootstrap.js'
		},
		index: {
			src: options.templates + '/application/*/index.html'
		},
		gulpfile: {
			src: options.templates + '/application/gulpfile.js'
		},
		npm: {
			src: options.templates + '/application/package.json',
			target: './package.json'
		},
		bower: {
			src: options.templates + '/application/bower.json',
			target: './bower.json'
		},
		docs: {
			readme: {
				includes: {
					src: options.docs + '/**/*.md'
				},
				project: {
					src: options.docs + '/README.project.md',
					dest: './README.md'
				},
				generator: {
					src: options.docs + '/README.generator.md',
					dest: './README.md'
				}
			}
		}
	};

	var defaults = createDefaults();

    // transports holds the merged default + answer config
    var transport;

	gulp.task('application', function (done) {

		// prompt for app specific values
		prompts.application(defaults)
			.then(function (answers) {

                var angularPrefix = scaffolding.prefixName(answers.appPrefix);
                var bootstrapModuleName = angularPrefix + '.' + answers.bootstrapModule;

                var answerConfig = {
                    description: answers.appDescription,
                    version: answers.appVersion,
                    authors: [{
                        name: answers.authorName,
                        email: answers.authorEmail
                    }],
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
						'create-package-json'
					], [
						'update-bower-json',
						'update-package-json'
					], [
						'copy-files',
						'copy-special-files'
					],
					'readme', [
						'create-module',
						'create-readme'
					],
					'install-npm-modules',
					done);
			});
	});

	gulp.task('copy-files', function () {

		var butNot = [
            globs.bootstrap.src,
            globs.index.src,
            globs.gulpfile.src,
			globs.bower.src,
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

	gulp.task('copy-special-files', function (done) {

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

        util.log('Preparing README files', readme);

        prepareReadme(readme, function () {
            gulp.src(globs.docs.readme.project.src)
                .pipe(template(readme))
                .pipe(concat(globs.docs.readme.project.dest))
                .pipe(conflict(globs.docs.readme.project.dest))
                .pipe(gulp.dest('./'))
                .on('end', function (err) {
                    if (err) {
                        util.log(util.colors.red('Failed to copy files'));
                    } else {
                        util.log('Files copied');
                    }

                    done(err, true);
                });

        });

    });

	gulp.task('create-module', function (done) {

		return gulp.src([
				options.templates + '/module/module.js'
				/*, templates + '/module/module.scenario.js' */
			])
			.pipe(rename(function (path) {
				path.basename = transport.module.name + '.' + path.basename;
			}))
			.pipe(template(transport))
			.pipe(prettify(options.prettify))
			.pipe(conflict('./src/app/' + transport.module.name + '/'))
			.pipe(gulp.dest('./src/app/' + transport.module.name + '/'));

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

				//extend(json.project.name, {}, transport.project.name);
				//extend(json.project.angular, transport.project.angular);

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

	gulp.task('update-package-json', function (done) {

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

		return gulp.src('./package.json')
			.pipe(install());

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

		var bower = scaffolding.findBower('./');
		var templateBower = scaffolding.findBower(options.templates +
			'/application/');
		var npm = scaffolding.findNpm('./');

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
			userName: format(gitUser.name) || osUserName,
			authorEmail: gitUser.email || '',
			mainFile: bower.main || '',
			appRepository: repositoryUrl ? repositoryUrl : '',
			bootstrapModule: bootstrapModule,
			appPrefix: project.angular.prefix,
			bower: bower,
			slush: options.slush,
			slushNpm: options.slushNpm,
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
