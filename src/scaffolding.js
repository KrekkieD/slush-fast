'use strict';

var fs = require('fs'),
	iniparser = require('iniparser'),
	path = require('path'),
	_s = require('underscore.string'),
	wrap = require('./q-utils')
	.wrap;

var scaffolding = {
	getHomeDir: getHomeDir,
	getWorkingDirName: getWorkingDirName,
	getGitUser: getGitUser,
	getGitRepositoryUrl: getGitRepositoryUrl,
	ns: ns,
	findFast: findFast,
	findBower: findBower,
	findNpm: findNpm,
	prefixName: _prefixName,
	moduleName: wrap(_moduleName),
	formatModuleName: _formatModuleName,
	controllerName: wrap(_partNameFactory('controller', 'Controller')),
	providerName: wrap(_partNameFactory('provider', 'Provider')),
	directiveName: wrap(_partNameFactory('directive', 'Directive')),
	serviceName: wrap(_partNameFactory('service', 'Service')),
	factoryName: wrap(_partNameFactory('factory', 'Factory')),
	valueName: wrap(_partNameFactory('value', '')),
	constantName: wrap(_partNameFactory('constant', 'Constant'))
};

module.exports = scaffolding;

function getHomeDir() {
	return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

function getWorkingDirName() {
	return process.cwd()
		.split('/')
		.pop()
		.split('\\')
		.pop();
}

function getGitUser() {
	var gitUser;
	var homeDir = getHomeDir();

	if (homeDir) {
		var configFile = homeDir + '/.gitconfig';


		if (fs.existsSync(configFile)) {
			var config = iniparser.parseSync(configFile);
			if (config && config.user) {
				gitUser = config.user;
			}
		}
	}
	return gitUser;
}

function getGitRepositoryUrl(remoteKey) {
	var repositoryUrl;
	var configFile = './.git/config';
	remoteKey = remoteKey || 'remote "origin"';

	if (fs.existsSync(configFile)) {
		var config = iniparser.parseSync(configFile);
		if (config && config[remoteKey] && config[remoteKey].url) {
			repositoryUrl = config[remoteKey].url;
		}
	}
	return repositoryUrl;
}

function ns(dir) {
	var srcAppDir = 'src' + path.sep + 'app';

	var currentDir = path.resolve(dir);
	var srcAppDirIndex = currentDir.indexOf(srcAppDir);
	if (srcAppDirIndex !== -1) {
		return currentDir.substring(srcAppDirIndex + srcAppDir.length + 1)
			.split(path.sep);
	} else {
        return false;
		throw new Error('Couldn\'t find src/app, you\'re not a in a source folder');
	}
}

// TODO: wrap all shared find-functionality in a single func for fast/bower/npm
function findFast (dir) {

    var fastConfig = 'fast.json';

    var currentDir = path.resolve(dir);
    var pathParts = currentDir.split(path.sep);
    var fast = {};

    while (pathParts.length) {

        var fastConfigAbsolute = path.resolve(pathParts.join(path.sep), fastConfig);
        if (fs.existsSync(fastConfigAbsolute)) {
            fast = require(fastConfigAbsolute);
            // log where we found it so we can create relative ptahs
            fast.fastPath = pathParts.join(path.sep);
            break;
        }
        pathParts.pop();
    }
    return fast;

}

function findBower(dir) {

	var bowerConfig = 'bower.json';

	var currentDir = path.resolve(dir);
	var pathParts = currentDir.split(path.sep);
	var bower = {};

	while (pathParts.length && !bower.name) {
		var bowerConfigAbsolute = path.resolve(pathParts.join(path.sep), bowerConfig);
		if (fs.existsSync(bowerConfigAbsolute)) {
			bower = require(bowerConfigAbsolute);
            break;
		}
		pathParts.pop();
	}
	return bower;
}

function findNpm(dir) {

	var npmConfig = 'package.json';

	var currentDir = path.resolve(dir);
	var pathParts = currentDir.split(path.sep);
	var npm = {};
	while (pathParts.length && !npm.name) {

		var npmConfigAbsolute = pathParts.join(path.sep) + path.sep + npmConfig;

		if (fs.existsSync(npmConfigAbsolute)) {
			npm = require(npmConfigAbsolute);
            break;
		}
		pathParts.pop();
	}
	return npm;
}

function _prefixName(prefix) {
	return _s.trim(prefix.toLowerCase()
			.replace(/[^a-zA-Z0-9]/g, ' ')
			.replace(/\s+/g, ' '))
		.split(' ')
		.join('.');
}

// extend transport with more module name specs
function _moduleName(transport) {

	var module = transport.module;
	if (!module) {
		throw new Error('transport.module missing');
	} else {

		module.prefixWithDot = module.prefix ? module.prefix + '.' : '';
		module.camelCasedPrefix = _s.camelize(module.prefix.split('.').join('-'));


		var ns = module.ns;
		if (!ns) {
			// new root module, expect module.newNs
			if (!module.newNs) {
				throw new Error('transport.module.newNs expected');
			} else {
				module.name = _formatModuleName(module.newNs);

				module.ns = '';
				module.fullNs = module.name;
			}
		} else {
			if (module.newNs) {
				// guess we have a new namespace to create

				module.name = _formatModuleName(module.newNs);
				module.fullNs = module.ns + '.' + module.name;
			} else {
                // this subtracts the current module name from an existing namespace?
				module.fullNs = module.ns;
				module.name = module.ns.split('.')
					.pop();
			}
		}

        // add slug for consistency
        module.slug = module.name;

		module.prefixedFullNs = module.prefixWithDot + module.fullNs;
		module.camelCasePrefixedFullNs = _s.camelize(module.prefixedFullNs.split('.').join('-'));
		module.path = 'app/' + module.fullNs.split('.').join('/');

	}

	module.fullNsCamelized = _s.camelize(module.fullNs.split('.')
		.join('-'));

	return transport;
}

function _formatModuleName(name) {
	return _s.slugify(name.replace(/\s+/g, ' ')
			.replace(/\.+/g, ' '))
		.replace(/\-+/g, '-');
}

function _partNameFactory(partName, partPostfix) {
	return function (transport) {
		var part = transport[partName];
		if (!part) {
			throw new Error('Expected transport.' + partName);
		}

		part.slug = _s.trim(_s.dasherize(part.newName), '-');
		part.partPostfix = partPostfix;
		part.upperCaseCamelizedPartSubName = part.partSubName ? _ucfirst(part.partSubName) :
			part.partSubName = part.partSubName ? part.partSubName : '';

		part.name = _s.camelize(part.newName);
		part.upperCaseCamelized = _ucfirst(part.name);
		part.lowerCaseCamelized = _lcfirst(part.name);
		part.camelizedPartName = part.name + partPostfix;
		part.upperCaseCamelizedPartName = _ucfirst(part.camelizedPartName);
		part.fullNsName = transport.module.camelCasePrefixedFullNs + _ucfirst(part.name);
		part.fullNsNamePartName = transport.module.camelCasePrefixedFullNs + part.upperCaseCamelizedPartName;
		part.fullNsNameSlug = _s.dasherize(part.fullNsName);
		return transport;
	};
}


function _ucfirst(str) {
	return str.substring(0, 1)
		.toUpperCase() + str.substring(1);
}

function _lcfirst(str) {
	return str.substring(0, 1)
		.toLowerCase() + str.substring(1);
}
