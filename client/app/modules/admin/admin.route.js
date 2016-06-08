(function () {
    'use strict';

    angular
        .module('app.admin')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'admin',
                config: {
                    url: '/admin',
                    templateUrl: 'app/modules/admin/admin.html',
                    parent: 'master',
                    controller: 'AdminController',
                    controllerAs: 'vm',
                    title: 'Admin',
                    settings: {
                        nav: 2,
                        title: 'Admin',
						icon: 'images/icons/settings.png'
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
