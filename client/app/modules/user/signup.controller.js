(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('SignupController', SignupController);

    SignupController.$inject = ['$auth', 'toastr', '$state'];
    function SignupController($auth, toastr, $state) {
        var vm = this;
        vm.signup = signup;
        vm.user = {
            username: '',
            email: '',
            password: ''
        };
        vm.error = '';

        activate();

        ////////////////

        function activate() {

        }

        function signup() {
            $auth.signup(vm.user)
                .then(function () {
                    vm.error = '';
                    toastr.success('You have successfully signed up!');
                    $state.go('signup_success');
                })
                .catch(function (error) {
                    if (error.status == 400) {
                        // user already exists
                        vm.error = 'user with same username or email is already registered';
                    } else {
                        // generic error message
                        vm.error = 'user with same username or email is already registered';
                    }
                    toastr.error(error.data, error.status);
                });
        }
    }
})();