var Q = require('q'),
	inquirer = require('inquirer'),
	wrap = require('./q-utils')
	.wrap;

var prompts = {
	// new
	moduleName: wrap(_moduleName),
	controllerName: wrap(_controllerName),
	providerName: providerName,
	directiveName: wrap(_directiveName),
	serviceName: wrap(_serviceName),
	factoryName: wrap(_factoryName),
	constantName: wrap(_constantName),
	valueName: wrap(_valueName)
};

module.exports = prompts;

// new
function _moduleName(transport) {
	var module = transport.module;
	if (!module) {
		throw new Error('transport.module expected');
	} else {
		if (module.newNs) {
			return Q(transport);
		} else {
			return promptForModuleName(transport);
		}
	}
}

function promptForModuleName(transport) {
	var module = transport.module;
	// existingNamespace
	var deferred = Q.defer();

	var createModuleMessage =
		'Module name (for example \'freak\' or \'tif\' or \'freak.foo.bar.snafu\')';
	if (module.existingNamespace) {
		createModuleMessage = 'Module name in ' + module.existingNamespace +
			' namespace: ' + module.existingNamespace + '.';
	}
	inquirer.prompt([{
			type: 'input',
			name: 'moduleName',
			message: createModuleMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this module?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.module.newNs = answers.moduleName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _controllerName(transport) {
	var controller = transport.controller;
	if (!controller) {
		throw new Error('transport.controller expected');
	} else {
		if (controller.newName) {
			return Q(transport);
		} else {
			return promptForControllerName(transport);
		}
	}
}

function promptForControllerName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createControllerMessage =
		'Controller name (for example \'FooBar\' or \'Snafu\' or \'YourController\')';

	inquirer.prompt([{
			type: 'input',
			name: 'controllerName',
			message: createControllerMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this controller?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.controller.newName = answers.controllerName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function providerName(transport) {
	var current = transport.provider;
	// existingNamespace
	var deferred = Q.defer();

	var createProviderMessage =
		'Provider name';
	var prompts = [{
		type: 'list',
		name: 'partSubName',
		message: 'Create a provider for a service or a factory?',
		choices: ['service', 'factory']
				}, {
		type: 'confirm',
		name: 'confirmed',
		message: 'Create this provider?'
				}];
	if (!transport.provider.newName) {
		prompts.unshift({
			type: 'input',
			name: 'providerName',
			message: createProviderMessage
		});
	}


	inquirer.prompt(prompts,
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {
				transport.provider.newName = transport.provider.newName || answers.providerName;
				transport.provider.partSubName = answers.partSubName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _directiveName(transport) {
	var directive = transport.directive;
	if (!directive) {
		throw new Error('transport.directive expected');
	} else {
		if (directive.newName) {
			return Q(transport);
		} else {
			return promptForDirectiveName(transport);
		}
	}
}

function promptForDirectiveName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createDirectiveMessage =
		'Directive name (for example \'FooBar\' or \'Snafu\' or \'YourDirective\')';

	inquirer.prompt([{
			type: 'input',
			name: 'directiveName',
			message: createDirectiveMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this directive?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.directive.newName = answers.directiveName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _serviceName(transport) {
	var service = transport.service;
	if (!service) {
		throw new Error('transport.service expected');
	} else {
		if (service.newName) {
			return Q(transport);
		} else {
			return promptForServiceName(transport);
		}
	}
}

function promptForServiceName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createServiceMessage =
		'Service name (for example \'FooBar\' or \'Snafu\' or \'YourService\')';

	inquirer.prompt([{
			type: 'input',
			name: 'serviceName',
			message: createServiceMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this service?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.service.newName = answers.serviceName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _factoryName(transport) {
	var factory = transport.factory;
	if (!factory) {
		throw new Error('transport.factory expected');
	} else {
		if (factory.newName) {
			return Q(transport);
		} else {
			return promptForFactoryName(transport);
		}
	}
}

function promptForFactoryName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createFactoryMessage =
		'Service name (for example \'FooBar\' or \'Snafu\' or \'YourFactory\')';

	inquirer.prompt([{
			type: 'input',
			name: 'factoryName',
			message: createFactoryMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this factory?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.factory.newName = answers.factoryName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _constantName(transport) {
	var constant = transport.constant;
	if (!constant) {
		throw new Error('transport.constant expected');
	} else {
		if (constant.newName) {
			return Q(transport);
		} else {
			return promptForConstantName(transport);
		}
	}
}


function promptForConstantName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createConstantMessage =
		'Constant name (for example \'FooBar\' or \'Snafu\' or \'YourConstant\')';

	inquirer.prompt([{
			type: 'input',
			name: 'constantName',
			message: createConstantMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this constant?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.constant.newName = answers.constantName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}

function _valueName(transport) {
	var value = transport.value;
	if (!value) {
		throw new Error('transport.value expected');
	} else {
		if (value.newName) {
			return Q(transport);
		} else {
			return promptForValueName(transport);
		}
	}
}

function promptForValueName(transport) {
	// existingNamespace
	var deferred = Q.defer();

	var createValueMessage =
		'Value name (for example \'FooBar\' or \'Snafu\' or \'YourValue\')';

	inquirer.prompt([{
			type: 'input',
			name: 'valueName',
			message: createValueMessage
		}, {
			type: 'confirm',
			name: 'confirmed',
			message: 'Create this value?'
		}],
		function (answers) {

			if (!answers.confirmed) {
				deferred.reject('Cancelled');
			} else {

				transport.value.newName = answers.valueName;
				deferred.resolve(transport);
			}
		});

	return deferred.promise;
}
