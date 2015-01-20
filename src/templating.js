'use strict';

var gulp = require('gulp');
var template = require('gulp-template');
var conflict = require('gulp-conflict');
var prettify = require('gulp-jsbeautifier');
var rename = require('gulp-rename');
var config = require('npmConfig')(__dirname);

module.exports.createConfig = createConfig;
module.exports.createConstant = createConstant;
module.exports.createController = createController;
module.exports.createDirective = createDirective;
module.exports.createFactory = createFactory;
module.exports.createModule = createModule;
module.exports.createProvider = createProvider;
module.exports.createRoutes = createRoutes;
module.exports.createRun = createRun;
module.exports.createService = createService;
module.exports.createValue = createValue;

function createConfig (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.config.src,
        transport: transport,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createConstant (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.constant.src,
        transport: transport,
        name: transport.constant.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createController (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.controller.src,
        transport: transport,
        name: transport.controller.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createDirective (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.directive.src,
        transport: transport,
        name: transport.directive.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createFactory (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.factory.src,
        transport: transport,
        name: transport.factory.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createModule (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.module.src,
        transport: transport,
        name: transport.module.slug,
        prefixFilesWithModuleName: false,
        target: (transport.target || '.') + '/' + transport.module.slug + '/'
    };

    console.log(scaffoldConfig);

    return _commonPipes(scaffoldConfig);

}

function createProvider (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.provider.src,
        transport: transport,
        name: transport.provider.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createRoutes (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.routes.src,
        transport: transport,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createRun (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.run.src,
        transport: transport,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createService (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.service.src,
        transport: transport,
        name: transport.service.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}

function createValue (transport) {

    var scaffoldConfig = {
        src: config.globs.scaffolding.value.src,
        transport: transport,
        name: transport.value.slug,
        prefixFilesWithModuleName: config.fast.prefixFilesWithModuleName,
        target: './'
    };

    return _commonPipes(scaffoldConfig);

}


function _commonPipes (scaffoldConfig) {

    return gulp.src(scaffoldConfig.src)
        .pipe(rename(function (path) {

            // change 'module.directive.js' into 'booger.directive.js'
            // or change 'module.run.js' into 'run.js'
            path.basename = path.basename.replace('module.', scaffoldConfig.name ? scaffoldConfig.name + '.' : '');

            if (scaffoldConfig.prefixFilesWithModuleName !== false) {
                // change 'booger.directive.js' into 'bing.booger.directive.js'
                // or run.js into 'bing.run.js'
                path.basename = scaffoldConfig.transport.module.name + '.' + path.basename;
            }

        }))
        .pipe(template(scaffoldConfig.transport))
        .pipe(prettify(config.prettify))
        .pipe(conflict(scaffoldConfig.target))
        .pipe(gulp.dest(scaffoldConfig.target));

}