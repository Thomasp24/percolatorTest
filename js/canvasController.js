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

    $scope.initializeCanvas = function () {
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
                    textBackgroundColor: "lightgrey"
                });
                canvas.add(editIText);

                editIText.enterEditing();
                editIText.selectAll();

                editIText.on("editing:exited", function (e) {
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
        /*    Checkt op double click (minder dan 50 meer dan 200ms), checkt of click
         plaatsvond in de titel of variabelen, zo ja roept edit() aan */
        canvas.on("mouse:down", function (event) {
            var now = new Date().getTime();
            if (now - latestClick < 200 && now - latestClick > 50) {
                if (event.target.hasOwnProperty("firstPoints")) {
                    if (event.e.clientX > event.target.left &&
                        event.e.clientX < event.target.left + objectWidth) {
                        if (event.e.clientY < event.target.top + objectHeight / 1.33) {
                            edit(event, 2); //Titel editen
                        } else if (event.e.clientY >= event.target.top + objectHeight / 1.33) {
                            edit(event, 3); //Variabelen editen
                        }
                    }
                }
            }
            latestClick = now;
        });

        function moveLinesAlongWithObject(movedObject, positionVar) {
            var i,
                currentLine,
                movedX,
                movedY,
                forLoopLimit = parseInt(movedObject.firstPoints.length) +
                    parseInt(movedObject.secondPoints.length);
            /*  Één for loop voor first- en secondPoints, berekend verschil tussen
             vorige positie object en huidige positie en past dit verschil toe
             op de gekoppelde lijnen */
            for (i = 0; i < forLoopLimit; i = i + 1) {
                var firstOrSecond, left, top;
                if (i < movedObject.firstPoints.length) {
                    firstOrSecond = "first";
                    currentLine = movedObject.firstPoints[i];
                } else {
                    firstOrSecond = "second";
                    currentLine = movedObject.secondPoints[i-movedObject.firstPoints.length];
                }

                var x1, x2, y1, y2;
                if (!positionVar) {
                    left = movedObject.left,
                        top = movedObject.top;
                } else {
                    left = positionVar[0] + movedObject.left,
                        top = positionVar[1] + movedObject.top;
                }

                x1 = currentLine[0].x1 + (left - currentLine[1]),
                    y1 = currentLine[0].y1 + (top - currentLine[2]);
                x2 = currentLine[0].x2 + (left - currentLine[1]),
                    y2 = currentLine[0].y2 + (top - currentLine[2]);

                if (firstOrSecond === "first") {
                    currentLine[0].set({
                        "x1": x1,
                        "y1": y1
                    });
                } else {
                    currentLine[0].set({
                        "x2": x2,
                        "y2": y2
                    });
                }

                currentLine[1] = left;
                currentLine[2] = top;
            }
            canvas.renderAll();
        }

        var latestMove = new Date().getTime();
        canvas.on("object:moving", function (event) {
            var now = new Date().getTime();
            //45 keer per seconde toestaan om positie te updaten
            if (now - latestMove > 41) {
                var objectToBeMoved = event.target;
                if (objectToBeMoved.hasOwnProperty("firstPoints")) {
                    moveLinesAlongWithObject(objectToBeMoved, false);
                }
                if (objectToBeMoved.hasOwnProperty("_objects")) {
                    for (var i = 0; i < objectToBeMoved._objects.length; i++) {
                        if (objectToBeMoved._objects[i].hasOwnProperty("firstPoints")) {
                            moveLinesAlongWithObject(objectToBeMoved._objects[i],
                                [objectToBeMoved.left, objectToBeMoved.top]);
                        }
                    }
                }
                latestMove = now;
            }
        });
    };
});
