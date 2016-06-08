(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('ActivateController', ActivateController);

    ActivateController.$inject = ['$auth', 'toastr', '$state', '$stateParams', 'exception', 'Users'];
    function ActivateController($auth, toastr, $state, $stateParams, exception, Users) {
        var vm = this;

        activate();

        ////////////////

        function activate() {
            Users.activate({
                token: $stateParams.token
            }, function (response) {

                $state.go('login');
            }, function (error) {
                toastr.error(error.data, error.status);
                return exception.catcher('Failed activation')(error);
            });
        }
    }
})();