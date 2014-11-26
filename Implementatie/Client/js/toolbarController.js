var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
	canvas,
	objectWidth = 150,
	objectHeight = 100;

function deleteActiveObjectOrGroup() {
	var selected = canvas.getActiveObject();
	if (selected !== null) {
		canvas.fxRemove(selected);
	} else {
		selected = canvas.getActiveGroup();
		if(selected !== null){
			canvas.getActiveGroup().forEachObject(function(o){ canvas.fxRemove(o) });
			canvas.discardActiveGroup().renderAll();
		}
	}
}

app.controller("toolbarController", function ($scope) {
	$scope.toolbarToggled = true;
	$scope.changeToggle = function () {
		if (!$scope.toolbarToggled) {
			$scope.toolbarToggled = true;
		} else {
			$scope.toolbarToggled = false;
		}
	};
	$scope.toggleIcon = function () {
		if ($scope.toolbarToggled) {
			return true;
		} else {
			return false;
		}
	};

	$scope.addObject = function () {
		var object = new fabric.Rect({
			width: objectWidth,
			height: objectHeight,
			rx: 10,
			ry: 10,
			fill: "white",
			stroke: "black"
		});
		var title = new fabric.Rect({
			width: objectWidth,
			height: objectHeight/5,
			fill: "transparent"
		});
		var titleIText = new fabric.IText("Title", {
			width: objectWidth,
			height: objectHeight/5,
			fontFamily: 'verdana',
			fontSize: 14,
			fontWeight: 'bold',
			left: objectWidth/20
		});
		var objectIText = new fabric.IText("Variable name", {
			width: objectWidth,
			height: objectHeight,
			top: titleIText.height*1.5,
			fontFamily: 'verdana',
			fontSize: 12,
			left: objectWidth/20
		});
		var seperator = new fabric.Line([5, (objectHeight/5), objectWidth-5, (objectHeight/5)], {
			stroke: "black"
		});
		canvas.add(new fabric.Group([object, title, titleIText, objectIText, seperator], {
			top: 50,
			left: 75,
			hasControls: false,
			firstPoints: [],
			secondPoints: []
		}));
		canvas.selection = true;//enable grouping selection
		canvas.observe('selection:created', function (e)//disable rotation/scling on selected group
		{
			if (e.target.type === 'group') {
				e.target.hasControls = false;
			}
		});
	};

	$scope.canvasToJSON = function () {
		console.log(canvas.toJSON());
	}

	$scope.deleteObject = function() {
		deleteActiveObjectOrGroup();
	};

	$scope.clearCanvas = function() {
		canvas.setActiveGroup(new fabric.Group(canvas.getObjects())).renderAll();
		canvas.getActiveGroup().forEachObject(function(o){ canvas.fxRemove(o) });
		canvas.discardActiveGroup().renderAll();
	};

	$scope.addingConnections = false;
	var latestClick = new Date().getTime();
	$scope.addConnection = function () {
		$scope.addingConnections = !$scope.addingConnections;
		var object1 = null,
			object2 = null,
			firstPoint = [],
			secondPoint = [];

		canvas.on("mouse:down", function (event) {
			var now = new Date().getTime();
			if (now - latestClick > 50) {
				if ($scope.addingConnections === true) {
					if (event.target.hasOwnProperty("firstPoints")) {
						if (firstPoint.length === 0 || firstPoint.length === 2 && secondPoint.length === 2) {
							firstPoint[0] = event.e.layerX;
							firstPoint[1] = event.e.layerY;
							secondPoint.splice(0, 2);
						} else if (secondPoint.length === 0) {
							secondPoint[0] = event.e.layerX;
							secondPoint[1] = event.e.layerY;
						}
						if (object1 === null) {
							object1 = event.target;
						} else if (object2 === null && firstPoint.length === 2 && secondPoint.length === 2) {
							object2 = event.target;
							var points = [firstPoint[0], firstPoint[1], secondPoint[0], secondPoint[1]];
							var line = new fabric.Line(points, {
								strokeWidth: 2,
								fill: "black",
								stroke: "black",
								lockMovementY: true,
								lockMovementX: true,
								selectable: false
							});
							object1.firstPoints.push([line, object1.left, object1.top]);
							object2.secondPoints.push([line, object2.left, object2.top]);
							canvas.add(line);
							canvas.off("object:selected");
							object1 = null;
							object2 = null;
							$scope.addingConnections = false;
						}
					}
				}
				latestClick = now;
			}
		});
	};

	$scope.addSeperateLine = function () {
		var seperateLine = new fabric.Line([ window.innerWidth / 2 - 5, -5, window.innerWidth / 2 - 5, window.innerHeight ], {
			stroke: '#222',
			strokeWidth: 10,
			selectable: true
		});
		seperateLine.lockScalingX = seperateLine.lockScalingY = seperateLine.lockRotation = seperateLine.lockMovementY = true;
		canvas.add(seperateLine);
	};

	$scope.addText = function () {
		var stackIText = new fabric.IText("Stack", {
				width: objectWidth,
				height: objectHeight,
				fontFamily: 'verdana',
				fontSize: 16,
				fontWeight: 'bold',
				top: 50,
				left: 75,
				hasControls: false
			});
		canvas.add(stackIText);
	};

	$scope.exportToPNG = function () {
		var dataURL = canvas.toDataURL('image/png'),
			exportLink = document.getElementById('exportPNG');

		exportLink.setAttribute('href', dataURL);
		exportLink.setAttribute('download', 'image.png');
	};
});
