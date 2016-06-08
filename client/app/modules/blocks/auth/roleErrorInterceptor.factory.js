(function () {
    'use strict';

    angular
        .module('blocks.auth')
        .factory('roleErrorInterceptor', roleErrorInterceptor)
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('roleErrorInterceptor');
        }]);

    roleErrorInterceptor.$inject = ['$q', '$injector'];
    function roleErrorInterceptor($q, $injector) {
        var service = {
            request: request,
            responseError: responseError
        };
        var $state;

        return service;

        ////////////////
        function request(request) {
            return request;
        }

        function responseError(response) {
            if (response.status === 403 && response.data.code == 'E_FORBIDDEN') {
                $state = $state || $injector.get('$state');
                return $state.go('403');
            }

            return $q.reject(response);
        }
    }
})();