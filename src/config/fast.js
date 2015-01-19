'use strict';

var config = require('npmConfig')(__dirname);
var scaffolding = require(config.paths.src + '/scaffolding');

module.exports = scaffolding.findFast('.');