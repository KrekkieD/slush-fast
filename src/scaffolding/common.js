'use strict';

var gulp = require('gulp');
var template = require('gulp-template');
var conflict = require('gulp-conflict');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var path = require('path');

module.exports = commonPipes;


function commonPipes (data) {

    return data
        .pipe(rename(function (path) {
            path.basename = transport.module.name + '.' + path.basename;
            path.basename = path.basename.replace('module', transport.constant.slug);
        }))
        .pipe(template(transport))
        .pipe(prettify(global.config.prettify))
        .pipe(conflict(target));

    var templates = global.config.paths.templates;

    var src = [
        path.resolve(templates, 'module/module.js'),
        path.resolve(templates, 'module/module.scenario.js')
    ];

    var target = transport.module.name + '/';

    return gulp.src(src)
        // would be nice to make this config dependent

        .pipe(gulp.dest(target));

}