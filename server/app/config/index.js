process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var _ = require('lodash');

var env_config = process.env.CONFIG
	? require('./' + process.env.CONFIG)
	: require('./' + process.env.NODE_ENV);

module.exports = _.assign(require('./default.js'), env_config);