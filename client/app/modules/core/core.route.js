(function () {
    'use strict';

    angular
        .module('app.core')
        .run(appRun);

    /* @ngInject */
    function appRun(routerHelper) {
        var otherwise = '/404';
        routerHelper.configureStates(getStates(), otherwise);
    }

    function getStates() {
        return [
            {
                state: '404',
                config: {
                    url: '/404',
                    templateUrl: 'app/modules/core/404.html',
                    title: '404',
					parent: 'shell',
					data: {
						bodyClass: 'body-bg404'
					}
                }
            },			
            {
                state: '403',
                config: {
                    url: '/403',
                    templateUrl: 'app/modules/core/403.html',
                    title: '403',
					parent: 'shell',
					data: {
						bodyClass: 'body-bg'
					}
                }
            }
        ];
    }
})();
