(function() {
    'use strict';
    var thisName = 'pie_editor';

    _app.controller(thisName, thisFn);

    function thisFn(
        $rootScope,
        $scope,
        $location,
        $anchorScroll,
        $element,
        $mdToast,
        $mdDialog,
        $mdMedia
    ) {
        console.log(thisName + '.js is loading...');
        _fns.initCtrlr($scope, $element, thisName, false);


        //锚点
        $scope.goto = function(key) {
            $location.hash(key);
            $anchorScroll();
        };


        $scope.appName = $scope.xargs.app;


        //end
    }
})();
