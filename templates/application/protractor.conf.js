exports.config = {
	allScriptsTimeout: 11000,
	rootElement: '#<%= module.newNs %>-app',
	specs: [
	'src/**/*scenario.js'
	],
	capabilities: {
		browserName: 'chrome',
		'chromeOptions': {
			args: ['--test-type']
		}
	},
	/*
	capabilities: {
	browserName: 'phantomjs',
	version: '',
	platform: 'ANY'
},
*/
	// chromeOnly: true,

	baseUrl: 'http://localhost:8885/',

	framework: 'jasmine',

	jasmineNodeOpts: {
		defaultTimeoutInterval: 30000,
		// isVerbose: true,
		// showColors: true,
		includeStackTrace: true
	}
};
