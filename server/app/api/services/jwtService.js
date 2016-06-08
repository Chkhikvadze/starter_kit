var jwt = require('jsonwebtoken');
var config;

module.exports = function (configuration) {
	config = configuration;

	return {
		sign: sign,
		decode: decode,
		verify: verify
	};
};

function sign(payload) {
	return jwt.sign(payload, config.secret, config);
}

function decode(token) {
	return jwt.decode(token);
}

function verify(token) {
	return jwt.verify(token, config.secret, config);
}