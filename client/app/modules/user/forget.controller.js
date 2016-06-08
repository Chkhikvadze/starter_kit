(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('ForgetController', ForgetController);

    ForgetController.$inject = ['$auth', 'toastr', '$state', 'Users'];
    function ForgetController($auth, toastr, $state, Users) {
        var vm = this;
        vm.forget = forget;
        vm.user = {
            username: ''
        };
        vm.requestSent = false;
        vm.error = '';

        activate();

        ////////////////

        function activate() {

        }

        function forget() {
            Users.requestReset({
                username: vm.user.username
            }, function (response) {
                vm.error = '';
                vm.requestSent = true;
            }, function (error) {
                vm.error = 'no user found with such username or password';
                toastr.error(error.data.message, error.status);
            });
        }
    }
})();