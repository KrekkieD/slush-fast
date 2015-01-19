'use strict';

var config = require('npmConfig')(__dirname),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    scaffolding = require(config.paths.src + '/scaffolding'),
    templating = require(config.paths.src + '/templating'),
    prompts = require(config.paths.src + '/prompts');

module.exports = function () {

    gulp.task('config', configTask);
    gulp.task('constant', constantTask);
    gulp.task('controller', controllerTask);
    gulp.task('directive', directiveTask);
    gulp.task('factory', factoryTask);
    gulp.task('module', moduleTask);
    gulp.task('provider', providerTask);
    gulp.task('routes', routesTask);
    gulp.task('run', runTask);
    gulp.task('service', serviceTask);
    gulp.task('value', valueTask);

    function configTask (done) {

        // transport will be handed along all thennables
        var transport = {
            module: config.namespace.module
        };

        scaffolding.moduleName(transport)
            .then(function (transport) {

                return templating.createConfig(transport);

            })
            .then(function () {
                done();
            });
    }

    function constantTask (done) {

        var transport = {
            module: config.namespace.module,
            constant: {}
        };

        if (gulp.args.length) {
            transport.constant.newName = gulp.args.join(' ');
        }

        prompts.constantName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.constantName)
            .then(function (transport) {

                return templating.createConstant(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function controllerTask (done) {

        var transport = {
            module: config.namespace.module,
            controller: {}
        };

        if (gulp.args.length) {
            transport.controller.newName = gulp.args.join(' ');
        }

        prompts.controllerName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.controllerName)
            .then(function (transport) {

                return templating.createController(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function directiveTask (done) {

        var transport = {
            module: config.namespace.module,
            directive: {}
        };

        if (gulp.args.length) {
            transport.directive.newName = gulp.args.join(' ');
        }

        prompts.directiveName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.directiveName)
            .then(function (transport) {

                return templating.createDirective(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function factoryTask (done) {

        var transport = {
            module: config.namespace.module,
            factory: {}
        };

        if (gulp.args.length) {
            transport.factory.newName = gulp.args.join(' ');
        }

        prompts.factoryName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.factoryName)
            .then(function (transport) {

                return templating.createFactory(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function moduleTask (done) {

        var transport = {
            module: config.namespace.module
        };

        if (gulp.args.length) {
            transport.module.newNs = gulp.args.join(' ');
        }

        prompts.moduleName(transport)
            .then(scaffolding.moduleName)
            .then(function (transport) {

                return templating.createModule(transport);

            })
            .then(function () {
                done();
            });

    }

    function providerTask (done) {

        var transport = {
            module: config.namespace.module,
            provider: {}
        };

        if (gulp.args.length) {
            transport.provider.newName = gulp.args.join(' ');
        }

        prompts.providerName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.providerName)
            .then(function (transport) {
                var partSubName = transport.provider.partSubName;
                transport[partSubName] = transport.provider;

                return templating.createProvider(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function routesTask (done) {

        var transport = {
            module: config.namespace.module
        };

        scaffolding.moduleName(transport)
            .then(function (transport) {

                return templating.createRoutes(transport);

            })
            .then(function () {
                done();
            });

    }

    function runTask (done) {

        var transport = {
            module: config.namespace.module
        };

        scaffolding.moduleName(transport)
            .then(function (transport) {

                return templating.createRun(transport);

            })
            .then(function () {
                done();
            });

    }

    function serviceTask (done) {

        var transport = {
            module: config.namespace.module,
            service: {}
        };

        if (gulp.args.length) {
            transport.service.newName = gulp.args.join(' ');
        }

        prompts.serviceName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.serviceName)
            .then(function (transport) {

                return templating.createService(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                gutil.log(err);
            });
    }

    function valueTask (done) {

        var transport = {
            module: config.namespace.module,
            value: {}
        };

        if (gulp.args.length) {
            transport.value.newName = gulp.args.join(' ');
        }

        prompts.valueName(transport)
            .then(scaffolding.moduleName)
            .then(scaffolding.valueName)
            .then(function (transport) {

                return templating.createValue(transport);

            })
            .then(function () {
                done();
            })
            .catch(function (err) {
                console.log(err);
            });
    }

};
