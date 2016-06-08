(function () {
	'use strict';

	angular
		.module('app.user')
		.controller('LogoutController', LogoutController);

	LogoutController.$inject = ['$auth', 'toastr', '$state'];
	function LogoutController($auth, toastr, $state) {
		var vm = this;
		vm.logout = logout;

		activate();

		////////////////

		function activate() {
			vm.logout();
		 }

		function logout() {			
			$auth.logout()
				.then(function () {
					toastr.info('You have been logged out');
					$state.go('login');
				});
		}
	}
})();