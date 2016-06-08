(function () {
	'use strict';

	angular
		.module('app.user')
		.directive('passwordMatch', passwordMatch);

	passwordMatch.$inject = [];
	function passwordMatch() {
		// Usage:
		//
		// Creates:
		//
		var directive = {
			link: link,
			restrict: 'A',
			scope: {
				otherModelValue: '=passwordMatch'
			},
			require: 'ngModel'
		};
		return directive;

		function link(scope, element, attrs) {
			ngModel.$validators.compareTo = function (modelValue) {
				return modelValue === scope.otherModelValue;
			};
			scope.$watch('otherModelValue', function () {
				ngModel.$validate();
			});
		}
	}
})();