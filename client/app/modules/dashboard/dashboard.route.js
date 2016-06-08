(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .run(appRun);

    appRun.$inject = ['routerHelper', 'authHelper'];
    /* @ngInject */
    function appRun(routerHelper, authHelper) {
        routerHelper.configureStates(getStates(authHelper));
    }

    function getStates(authHelper) {
        return [
            {
                state: 'dashboard',
                config: {
                    url: '/',
                    templateUrl: 'app/modules/dashboard/dashboard.html',
                    parent: 'master',
                    controller: 'DashboardController',
                    controllerAs: 'vm',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        title: 'Dashboard',
						icon: 'images/icons/home-gray.png'
                    },
                    loginRequired: true,
					data: {
						bodyClass: 'dasboard-background'
					}
                }
            }
        ];
    }
})();
