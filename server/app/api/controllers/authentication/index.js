var AuthController = require('./authController.v1');
var isAuthenticated = require('../../policies/isAuthenticated');

module.exports = {
    '/v1/auth': {
        '/sign_in': {
            post: AuthController.sign_in
        },
        '/sign_up': {
            post: AuthController.sign_up
        },
        '/refresh_token': {
            post: AuthController.refresh_token
        },
        '/request_reset': {
            post: AuthController.request_reset_password
        },
        '/reset_password': {
            post: AuthController.reset_password
        },
        '/activate': {
            post: AuthController.activate_account
        },
        'change_password': {
            post: [isAuthenticated, AuthController.change_password]
        }
    }
};