var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
	canvas,
	objectWidth = 150,
	objectHeight = 100;

function deleteActiveObjectOrGroup() {
	var selected = canvas.getActiveObject();
    var selected1;
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
		var seperator = new fabric.Line([5, (objectHeight/5), objectWidth-5, (objectHeight/5)], {
			stroke: "black"
		});
		var titleIText = new fabric.IText("Title", {
			width: objectWidth,
			height: objectHeight,
			fontFamily: 'verdana',
			fontSize: 14,
			textAlign: 'right',
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
		canvas.add(new fabric.Group([object, title, seperator, titleIText, objectIText], {
			top: 50,
			left: 75,
			hasControls: false
		}));
		canvas.selection = true;//enable grouping selection
		canvas.observe('selection:created', function (e)//disable rotation/scling on selected group
		{
			if (e.target.type === 'group') {
				e.target.hasControls = false;
			}
		});
	};

	$scope.deleteObject = function() {
		deleteActiveObjectOrGroup();
	};

    $scope.addConnection = function () {
        var object1 = null;
        var object2 = null;

        canvas.on('object:selected', function (event) {
            if (object1 === null) {
                object1 = event.target;
            } else {
                object2 = event.target;
                var points = [object1.left, object1.top, object2.left, object2.top];

                line = new fabric.Line(points, {
                    strokeWidth: 5,
                    fill: 'black',
                    stroke: 'black'
                });
                canvas.add(line);
                canvas.off('object:selected');
            }
        });
    };
    $scope.addSeperateLine = function () {
        var seperateLine = new fabric.Line([ window.innerWidth / 2 - 5, -5, window.innerWidth / 2 - 5, window.innerHeight ], {
            stroke: '#222',
            strokeWidth: 10,
            selectable: true
        });
        seperateLine.setShadow({ color: 'rgba(0,0,0,0.3)' });
        seperateLine.lockScalingX = seperateLine.lockScalingY = seperateLine.lockRotation = seperateLine.lockMovementY = true;
        canvas.add(seperateLine);
    };

	$scope.exportToPNG = function () {
		var dataURL = canvas.toDataURL('image/png'),
			exportLink = document.getElementById('exportPNG');

		exportLink.setAttribute('href', dataURL);
		exportLink.setAttribute('download', 'image.png');
	};
});
