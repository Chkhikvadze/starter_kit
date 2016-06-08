var ProfileController = require('./profileController.v1');
var isAuthenticated = require('../../policies/isAuthenticated');

module.exports = {
    '/v1/profile': {
        '/me': {
            get: [isAuthenticated, ProfileController.me],
            post: [isAuthenticated, ProfileController.save],
        }
    }
};