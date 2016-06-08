//
// sample controller for admin modules
//

(function () {
    'use strict';

    angular
        .module('app.admin')
        .controller('AdminController', AdminController);

    AdminController.$inject = ['logger', 'adminHelper'];
    /* @ngInject */
    function AdminController(logger, adminHelper) {
        var vm = this;
        vm.title = 'Admin';

        vm.gridOptions = {};
        vm.gridOptions.columns = [
            { title: 'FirstName', field: 'first-name' },
            { title: 'Surname', field: 'surname' },
            { title: 'City', field: 'address' }
        ];

        vm.items = [{
            "first-name": "Beka",
            "surname": "Tomashvili",
            "address": "301 Dove Ave"
        },{
            "first-name": "Giga",
            "surname": "Chixkvadze",
            "address": "301 Dove Ave"
        },{
            "first-name": "Nika",
            "surname": "Nikabadze",
            "address": "301 Dove Ave"
        },{
            "first-name": "Goga ",
            "surname": "Abramishvili",
            "address": "301 Dove Ave"
        }];

        vm.create = create;


        activate();

        function activate() {
            logger.info('Activated Admin View');
        }

        function create() {
            console.log(vm.items[0]['address.city']);
        }
    }
})();
