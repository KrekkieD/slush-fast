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
        path.resolve(templates, 'module/module.js'),
        path.resolve(templates, 'module/module.scenario.js')
    ];

    var target = transport.module.name + '/';

    return gulp.src(src)
        // would be nice to make this config dependent
        .pipe(rename(function (path) {
            path.basename = transport.module.name + '.' + path.basename;
        }))
        .pipe(template(transport))
        .pipe(prettify(global.config.prettify))
        .pipe(conflict(target))
        .pipe(gulp.dest(target));

}