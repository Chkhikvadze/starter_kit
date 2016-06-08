(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['logger', 'authHelper', '$rootScope'];
    function HeaderController(logger, authHelper, $rootScope) {
        var vm = this;
        vm.user = authHelper.getUser();

        activate();

        ////////////////

        function activate() {
            logger.info('Activated Header View');

            $rootScope.$on('LocalStorageModule.notification.setitem', function (event, args) {
                if (args.key === 'user') {
                    vm.user = authHelper.getUser();
                }
            });
        }
    }
})();