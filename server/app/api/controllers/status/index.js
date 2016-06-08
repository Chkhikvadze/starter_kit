var PingController = require('./pingController.v1');

module.exports = {
	'/v1': {
		'/ping': {
			all: PingController.ping
		}
	}
};