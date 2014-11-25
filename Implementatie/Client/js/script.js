var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
    canvas,
    objectWidth = 100,
    objectHeight = 100;

function deleteActiveObjectOrGroup() {
  var selected = canvas.getActiveObject();
  if (selected !== null) {
    console.log("e");
    canvas.remove(selected);
    canvas.dispose(selected);
  } else {
    selected = canvas.getActiveGroup();
    if (selected !== null) {
      console.log("g");
      canvas.remove(selected);
      canvas.dispose(selected);
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
            fill: "white",
            stroke: "black"
        });
        var title = new fabric.Rect({
            width: objectWidth / 1.5,
            height: objectHeight / 4,
            top: -objectHeight / 4,
            left: objectWidth / 6,
            fill: "white",
            stroke: "black"
        });
        var titleIText = new fabric.IText("Tap and type", {
            width: objectWidth / 1.5,
            height: objectHeight / 4,
            top: -objectHeight / 4,
            left: objectWidth / 6,
            fontSize: 12
        });
        var objectIText = new fabric.IText("Tap and type", {
            width: objectWidth,
            height: objectHeight,
            fontSize: 12
        });
        canvas.add(new fabric.Group([object, title, titleIText, objectIText], {
            top: 50,
            left: 75,
            hasControls: false
        }));
    };

    $scope.deleteObject = function() {
      deleteActiveObjectOrGroup();
    };

    $scope.exportToPNG = function () {
        var dataURL = canvas.toDataURL('image/png'),
            exportLink = document.getElementById('exportPNG');

        exportLink.setAttribute('href', dataURL);
        exportLink.setAttribute('download', 'image.png');
    };
});

app.controller("canvasController", function ($scope) {
    function fullscreenCanvas() {
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(window.innerHeight);
    }

    function handleKeyDowns(e) {
      if (e.keyCode === 46) {
        deleteActiveObjectOrGroup();
      }
    }

    $scope.initializeCanvas = function() {
		canvas = new fabric.Canvas("geheugenModel");
		fullscreenCanvas();
		window.onresize = fullscreenCanvas;
    window.onkeydown = handleKeyDowns;

		/*	Zet de echte IText op onzichtbaar en maakt een editable IText aan.
				Wanneer je stopt met editen van de editable IText vervangt hij de inhoud
				van de echte IText door de inhoud van de editable IText en verwijderd
				hij de editable IText */
		function edit(event, objectNumber) {
			if (editing === null && editIText === null) {
				editing = event.target._objects[objectNumber];
				event.target._objects[objectNumber].visible = false;

				//Hackje om bij variabelen goede Y positie te krijgen
				var topOffset = 0;
				if (objectNumber === 3) {
					topOffset = 25;
				}

				editIText = new fabric.IText(event.target._objects[objectNumber].text, {
					top: event.target.top + topOffset,
					left: event.target.left + editing.originalLeft,
					fontSize: 12,
					hasControls: true,
					lockMovementY: true,
					lockMovementX: true,
					textBackgroundColor: "green"
				});
				canvas.add(editIText);

				editIText.enterEditing();

				editIText.on("editing:exited", function(e) {
					editing.text = editIText.text;
					editing.visible = true;
					canvas.fxRemove(editIText);
					editIText = editing = null;
				});
			}
		}

		var latestClick,
        editing = null,
        editIText = null;
		/*    Checkt op double click (minder dan 50 meer dan 500ms), checkt of click
          plaatsvond in de titel of variabelen, zo ja roept edit() aan */
		canvas.on("mouse:down", function(event) {
			var now = new Date().getTime();
			if (now - latestClick < 500 && now - latestClick > 50) {
				if (typeof event.target === "object") {
					if (typeof event.target._objects === "object") {
						if (event.e.clientX > event.target.left &&
                event.e.clientX < event.target.left + objectWidth) {
							if (event.e.clientY < event.target.top + objectHeight/1.33) {
								edit(event, 2); //Titel editen
							} else if (event.e.clientY >= event.target.top + objectHeight/1.33) {
								edit(event, 3); //Variabelen editen
							}
						}
					}
				}
			}
			latestClick = now;
		});
	};
});
