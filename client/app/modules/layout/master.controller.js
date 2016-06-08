(function () {
    'use strict';

    angular
        .module('app.layout')
        .controller('MasterController', MasterController);

    MasterController.$inject = ['$rootScope', '$timeout', 'config', 'logger'];
    /* @ngInject */
    function MasterController($rootScope, $timeout, config, logger) {
        var vm = this;
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        showSplash();
        vm.navline = {
            title: config.appTitle,
            text: 'Created by John Papa',
            link: 'http://twitter.com/john_papa'
        };

        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
            hideSplash();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function () {
                $rootScope.showSplash = false;
            }, 1000);
        }

        function showSplash() {
            $rootScope.showSplash = true;
        }
    }
})();
