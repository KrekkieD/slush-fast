'use strict';

var gulp = require('gulp');

module.exports = function () {

    // register task 'application' as main init task
    gulp.task('init', ['application']);

};