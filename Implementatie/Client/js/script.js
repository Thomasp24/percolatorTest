var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]);

app.controller("MainController", function($scope) {
	$scope.toolbarToggled = true;
	$scope.changeToggle = function() {
		if (!$scope.toolbarToggled) {
			$scope.toolbarToggled = true;
		} else {
			$scope.toolbarToggled = false;
		}
	};
	$scope.toggleIcon = function() {
		if ($scope.toolbarToggled) {
			return true;
		} else {
			return false;
		}
	};
});
