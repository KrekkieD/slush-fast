'use strict';

var path = require('path');

var _r = path.resolve;

var paths = {};
paths.root = _r(__dirname, '../..');

paths.src = _r(paths.root, 'src');
paths.templates = _r(paths.root, 'templates');
paths.slushTasks = _r(paths.root, 'slushtasks');
paths.modules = _r(paths.src, 'modules');
paths.docs = _r(paths.src, 'docs');

module.exports = paths;
