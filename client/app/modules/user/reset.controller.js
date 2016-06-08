(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('ResetController', ResetController);

    ResetController.$inject = ['$auth', 'toastr', '$state', '$stateParams', 'Users'];
    function ResetController($auth, toastr, $state, $stateParams, Users) {
        var vm = this;
        vm.reset = reset;
        vm.user = {
            password: ''
        };

        activate();

        ////////////////

        function activate() {

        }

        function reset() {
            Users.resetPassword({
                token: $stateParams.token,
                password: vm.user.password
            }, function (response) {

                $state.go('login');
            }, function (error) {

                toastr.error(error.data.message, error.status);
            });
        }
    }
})();