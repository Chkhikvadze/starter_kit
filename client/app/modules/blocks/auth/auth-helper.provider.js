(function () {
    'use strict';

    angular
        .module('blocks.auth')
        .provider('authHelper', authHelperProvider);

    authHelperProvider.$inject = ['API_ENDPOINT', '$authProvider'];

    /* @ngInject */
    function authHelperProvider(API_ENDPOINT, $authProvider) {

        this.configure = function () {
            $authProvider.baseUrl = API_ENDPOINT;
            $authProvider.loginUrl = '/v1/auth/sign_in';
            $authProvider.signupUrl = '/v1/auth/sign_up';
            $authProvider.tokenName = 'access_token';
            $authProvider.tokenRoot = 'data';
            $authProvider.tokenPrefix = '';
            $authProvider.authToken = '';
        };

        this.$get = AuthHelper;
        function AuthHelper($auth, localStorageService) {
            var service = {
                isAuthenticated: isAuthenticated,
                getUser: getUser,
                setUser: setUser
            };

            return service;
            
            /////////////////////            
            function isAuthenticated() {
                return $auth.isAuthenticated();
            };

            function getUser() {
                return localStorageService.get('user');
            };

            function setUser(user) {
                localStorageService.set('user', user);
            };
        };
    };
} ());
