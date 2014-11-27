var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
canvas,
objectWidth = 150,
objectHeight = 100;

function deleteActiveObjectOrGroup() {
	var selected = canvas.getActiveObject();
	if (selected !== null) {
		if (selected.hasOwnProperty("firstPoints")) {
			//Verwijder alle lijnen die aan geheugenmodel object gekoppeld zijn
			for (var i = 0; i < selected.firstPoints.length; i++) {
				canvas.fxRemove(selected.firstPoints[i][0]);
			}
			for (var i = 0; i < selected.secondPoints.length; i++) {
				canvas.fxRemove(selected.secondPoints[i][0]);
			}
		}
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
		var shadow = {
			color: 'rgba(0,0,0,0.6)',
			blur: 10,    
			offsetX: 5,
			offsetY: 5,
			opacity: 0.6,
			fillShadow: true, 
			strokeShadow: true,
			evented: false
		}

		var object = new fabric.Rect({
			width: objectWidth,
			height: objectHeight,
			rx: 10,
			ry: 10,
			fill: "white",
			stroke: "black",
			evented: false
		});
		var title = new fabric.Rect({
			width: objectWidth,
			height: objectHeight/5,
			fill: "transparent",
			evented: false
		});
		var titleText = new fabric.Text("Title", {
			width: objectWidth,
			height: objectHeight/5,
			fontFamily: 'verdana',
			fontSize: 14,
			fontWeight: 'bold',
			left: objectWidth/20,
			evented: false
		});
		var objectText = new fabric.Text("Variable name", {
			width: objectWidth,
			height: objectHeight,
			top: titleText.height*1.5,
			fontFamily: 'verdana',
			fontSize: 12,
			left: objectWidth/20,
			evented: false
		});
		var seperator = new fabric.Line([5, (objectHeight/5), objectWidth-5, (objectHeight/5)], {
			stroke: "black"
		});
		object.setShadow(shadow);
		canvas.add(new fabric.Group([object, title, titleText, objectText, seperator], {
			top: 50,
			left: 75,
			hasControls: false,
			padding: 15,
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
			secondPoint = [],
			previewLine = null;

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
							//Preview lijn maken en tekenen
							previewLine = new fabric.Line([firstPoint[0], firstPoint[1], firstPoint[0], firstPoint[1]], {
								strokeWidth: 2,
								fill: "black",
								stroke: "black",
								selectable: false,
								evented: false,
								opacity: 0.5
							});
							canvas.add(previewLine);
						} else if (object2 === null && firstPoint.length === 2 && secondPoint.length === 2) {
							canvas.fxRemove(previewLine);
							previewLine = null;
							object2 = event.target;
							var points = [firstPoint[0], firstPoint[1], secondPoint[0], secondPoint[1]];
							var line = new fabric.Line(points, {
								strokeDashArray: [5, 5],
								strokeWidth: 2,
								fill: "black",
								stroke: "black",
								lockMovementY: true,
								lockMovementX: true,
								selectable: false,
								evented: false
							});
							object1.firstPoints.push([line, object1.left, object1.top]);
							object2.secondPoints.push([line, object2.left, object2.top]);
							canvas.add(line);
							object1 = null;
							object2 = null;
							$scope.addingConnections = false;
						}
					}
				}
				latestClick = now;
			}
		});

		//Preview line trekken naar huidige muispositie
		canvas.on("mouse:move", function(event) {
			if (previewLine !== null) {
				previewLine.set({
					"x2": event.e.layerX,
					"y2": event.e.layerY
				});
				canvas.renderAll();
			}
		});
};

$scope.addSeperateLine = function () {
	var seperateLine = new fabric.Line([ window.innerWidth / 2 - 5, -5, window.innerWidth / 2 - 5, window.innerHeight ], {
		stroke: '#222',
		strokeWidth: 10,
		selectable: false,
		hasControls: false,
		evented: false
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
