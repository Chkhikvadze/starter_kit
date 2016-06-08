(function () {
    'use strict';

    angular.module('blocks.auth', [
        'app.api',
        'ui.router',
        'satellizer',
        'LocalStorageModule'
    ]);
})();