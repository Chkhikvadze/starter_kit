(function () {
    'use strict';

    angular
        .module('app.api')
        .factory('Users', usersResource);

    usersResource.$inject = ['$resource', 'API_ENDPOINT'];
    /* @ngInject */
    function usersResource($resource, API_ENDPOINT) {
        return $resource('', {}, {
            me: {
                url: API_ENDPOINT + '/v1/profile/me'
            },
            updateProfile: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/profile/me'
            },
            signin: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_in'
            },
            signup: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/sign_up'
            },
            refreshToken: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/refresh_token'
            },
            requestReset: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/request_reset'
            },
            resetPassword: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/reset_password'
            },
            activate: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/activate'
            },
            changePassword: {
                method: 'POST',
                url: API_ENDPOINT + '/v1/auth/change_password'
            },
        });
    }
})();
