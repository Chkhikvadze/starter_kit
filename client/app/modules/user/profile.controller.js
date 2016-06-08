(function () {
    'use strict';

    angular
        .module('app.user')
        .controller('ProfileController', ProfileController);

    ProfileController.$inject = ['logger', 'Users', 'authHelper'];
    function ProfileController(logger, Users, authHelper) {
        var vm = this;
        vm.profile = (authHelper.getUser() || {}).profile;
        vm.save = save;

        activate();

        ////////////////
        function activate() {
            logger.info('Activated Profile View');
        }

        function save() {
            Users.updateProfile(vm.profile,
                function (response) {
                    authHelper.setUser(response.data);
                }, function (error) {

                    toastr.error(error.data, error.status);
                });
        };
    }
})();