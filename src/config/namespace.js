'use strict';

var config = require('npmConfig')(__dirname);
var scaffolding = require(config.paths.src + '/scaffolding');

// parse current working directory into namespace
var ns = scaffolding.ns('.') || [];

module.exports = {
    prefix: config.bower.project.angular.prefix,
    ns: ns,
    nsString: ns.join('.'),
    module: {
        prefix: config.bower.project.angular.prefix,
        ns: ns.join('.')
    }
};
