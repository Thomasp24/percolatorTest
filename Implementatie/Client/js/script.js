var app = angular.module("Percolator", ["ngRoute", "ngTouch", "mobile-angular-ui"]),
    canvas,
    objectWidth = 100,
    objectHeight = 100;

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

    $scope.exportToPNG = function () {
        var dataURL = canvas.toDataURL('image/png');
        var exportLink = document.getElementById('exportPNG');

        exportLink.setAttribute('href', dataURL);
        exportLink.setAttribute('download', 'image.png');
    }
});

app.controller("canvasController", function ($scope) {
    function fullscreenCanvas() {
        canvas.setWidth(window.innerWidth);
        canvas.setHeight(window.innerHeight);
    }

    $scope.initializeCanvas = function () {
        canvas = new fabric.Canvas("geheugenModel");
        fullscreenCanvas();
        window.onresize = fullscreenCanvas;
        canvas.on({
            //Making moved / selected object transparent for a nice effect
            'mouse:down': function (e) {
                if (e.target) {
                    e.target.opacity = 0.5;
                    canvas.renderAll();
                }
            },
            'mouse:up': function (e) {
                if (e.target) {
                    e.target.opacity = 1;
                    canvas.renderAll();
                }
            },
            'object:moved': function (e) {
                e.target.opacity = 0.5;
            },
            'object:modified': function (e) {
                e.target.opacity = 1;
            }
        });
        function log(eventName) {
            console.log(eventName);
        }

        function observe(eventName) {
            canvas.on(eventName, function () {
                log(eventName)
            });
        }

        observe('object:selected');
    };
});
