(function () {
    'use strict';

    angular
        .module('app.core', [
            'app.layout',
            'blocks.exception', 
            'blocks.logger', 
            'blocks.router' 
        ]);
})();
