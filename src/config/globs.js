'use strict';

var config = require('npmConfig')(__dirname);

module.exports = {
    scaffolding: {
        config: {
            src: [config.paths.templates + '/module/**/module.config*.js']
        },
        constant: {
            src: [config.paths.templates + '/module/**/module.constant*.js']
        },
        controller: {
            src: [config.paths.templates + '/module/**/module.controller*.js']
        },
        directive: {
            src: [config.paths.templates + '/module/**/module.directive*']
        },
        factory: {
            src: [config.paths.templates + '/module/**/module.factory*.js']
        },
        module: {
            src: [
                config.paths.templates + '/module/**/module.module.js',
                config.paths.templates + '/module/**/module.scenario.js'
            ]
        },
        provider: {
            src: [config.paths.templates + '/module/**/module.provider*.js']
        },
        routes: {
            src: [config.paths.templates + '/module/**/module.routes*.js']
        },
        run: {
            src: [config.paths.templates + '/module/**/module.run*.js']
        },
        service: {
            src: [config.paths.templates + '/module/**/module.service*.js']
        },
        value: {
            src: [config.paths.templates + '/module/**/module.value*.js']
        }
    },
    bootstrap: {
        src: config.paths.templates + '/application/*/bootstrap.js'
    },
    index: {
        src: config.paths.templates + '/application/*/index.html'
    },
    gulpfile: {
        src: config.paths.templates + '/application/gulpfile.js'
    },
    npm: {
        src: config.paths.templates + '/application/package.json',
        target: './package.json'
    },
    bower: {
        src: config.paths.templates + '/application/bower.json',
        target: './bower.json'
    },
    fast: {
        src: config.paths.templates + '/application/fast.json',
        target: './fast.json'
    },
    docs: {
        readme: {
            includes: {
                src: config.paths.docs + '/**/*.md'
            },
            project: {
                src: config.paths.docs + '/README.project.md',
                dest: './README.md'
            },
            generator: {
                src: config.paths.docs + '/README.generator.md',
                dest: './README.md'
            }
        }
    }
};