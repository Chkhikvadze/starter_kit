(function () {
    'use strict';

    angular
        .module('app.layout')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'shell',
                config: {
                    url: '',
                    abstract: true,
                    views: {
                        layout: {
                            templateUrl: 'app/modules/layout/shell.html'
                        }
                    }
                }
            },
            {
                state: 'master',
                config: {
                    url: '',
                    abstract: true,
                    views: {
                        layout: {
                            templateUrl: 'app/modules/layout/master.html'
                        }
                    }
                }
            }
        ];
    }
})();
