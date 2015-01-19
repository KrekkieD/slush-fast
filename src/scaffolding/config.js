'use strict';

var gulp = require('gulp');
var template = require('gulp-template');
var conflict = require('gulp-conflict');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var path = require('path');

module.exports = createModule;

function createModule (transport) {

    var templates = global.config.paths.templates;

    // every module needs these files
    var src = [
        templates + '/module/**/module.config*.js'
    ];

    var target = './';

    return gulp.src(src)
        .pipe(rename(function (path) {
            path.basename = path.basename.replace('module', transport.module.name);
        }))
        .pipe(template(transport))
        .pipe(prettify(global.config.prettify))
        .pipe(conflict(target))
        .pipe(gulp.dest(target));

}