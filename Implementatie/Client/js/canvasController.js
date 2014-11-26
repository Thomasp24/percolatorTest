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
                    fontFamily: 'verdana',
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
            if (now - latestClick < 200 && now - latestClick > 50) {
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

        canvas.on("object:moving", function(event) {
            var movedObject = event.target;
            if (movedObject.hasOwnProperty("_objects")) {
                for (var i = 0; i < movedObject.firstPoints.length; i++) {
                    currentLine = movedObject.firstPoints[i];
                    var movedX = movedObject.left - currentLine[1],
                        movedY = movedObject.top - currentLine[2];

                    currentLine[0].set({
                        "x1": currentLine[0].x1 + movedX,
                        "y1": currentLine[0].y1 + movedY
                    });
                    currentLine[1] = movedObject.left;
                    currentLine[2] = movedObject.top;
                }

                for (var i = 0; i < movedObject.secondPoints.length; i++) {
                    currentLine = movedObject.secondPoints[i];
                    var movedX = movedObject.left - currentLine[1],
                        movedY = movedObject.top - currentLine[2];

                    currentLine[0].set({
                        "x2": currentLine[0].x2 + movedX,
                        "y2": currentLine[0].y2 + movedY
                    });
                    currentLine[1] = movedObject.left;
                    currentLine[2] = movedObject.top;
                }
                canvas.renderAll();
            }
        });
    };
});