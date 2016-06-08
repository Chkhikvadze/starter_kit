(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('LoginController', LoginController);

    LoginController.$inject = ['$auth', 'toastr', '$state', '$location', 'authHelper'];
    function LoginController($auth, toastr, $state, $location, authHelper) {
        var vm = this;
        vm.login = login;
        vm.user = {
            username: '',
            password: '',
            rememberMe: false
        };
        vm.error = '';

        activate();

        ////////////////

        function activate() {

        }

        function login() {
            $auth.login(vm.user)
                .then(function (response) {
                    authHelper.setUser(response.data.data.user);
                    toastr.success('You have successfully signed in!');
                    $location.url('/');
                })
                .catch(function (error) {
                    if (error.status == 403) {
                        // not active account
                        vm.error = 'your account is not yet activated';
                    } else {                        
                        // username or password invalid
                        vm.error = 'username or password is not correct';
                    }
                    toastr.error(error.data.message, error.status);
                });
        }
    }
})();