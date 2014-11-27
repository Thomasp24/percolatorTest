app.controller("canvasController", function ($scope) {

    $scope.initializeCanvas = function () {
        var graph = new joint.dia.Graph;

        var paper = new joint.dia.Paper({
            el: $('#myholder'),
            width: window.innerWidth,
            height: window.innerHeight,
            model: graph
        });
    }
});
