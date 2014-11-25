var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
		canvas;

app.controller("toolbarController", function($scope) {
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

	$scope.addObject = function() {
		canvas.add(
			new fabric.Rect({
				width:100,
				height:100,
				top:50,
				left:50,
				fill: "white",
				hasControls: false,
				stroke: "black"
			})
		);
	};
});

app.controller("canvasController", function($scope) {
	$scope.initializeCanvas = function() {
		canvas = new fabric.Canvas("geheugenModel");
		canvas.on({
			//Making moved / selected object transparent for a nice effect
			'mouse:down': function(e) {
				if (e.target) {
					e.target.opacity = 0.5;
					canvas.renderAll();
				}
			},
			'mouse:up': function(e) {
				if (e.target) {
					e.target.opacity = 1;
					canvas.renderAll();
				}
			},
			'object:moved': function(e) {
				e.target.opacity = 0.5;
			},
			'object:modified': function(e) {
				e.target.opacity = 1;
			}
		});
	};
});
