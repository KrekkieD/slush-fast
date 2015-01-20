'use strict';

var config = require('npmConfig')(__dirname);
var path = require('path');
var exec = require('child_process').exec;

var timestamp = new Date().getTime();
var tmpFolder = path.resolve(config.paths.root, 'target/tests/slush-fast-test-' + timestamp);

var answers = [
    // proj name
    'projectName',
    // description
    'My awesome project',
    // prefix
    'project-prefix',
    // bootstrap module
    'project-bootstrap',
    // version
    '0.0.0',
    // author name
    'Exec Test',
    // author email
    'exec@email.node',
    // github user name
    'execgithub',
    // repo url
    'localhost/repo.git',
    // mark as private
    'y',
    // install npm
    'n',
    // create
    'y'
];

var child = exec('mkdir ' + tmpFolder + ' && cd ' + tmpFolder + ' && slush fast');
child.stdin.setEncoding = 'utf-8';
child.stdout.pipe(process.stdout);

child.stdin.write(answers.join('\n') + '\n');
child.stdin.end();


return child;