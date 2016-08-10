(function () {
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
        $scope.goto = function (key) {
            $location.hash(key);
            $anchorScroll();
        };

        //实时屏幕尺寸
        $scope.sizeGt = function (str) {
            return $mdMedia('gt-' + str);
        }

        //自动隐藏list和preview
        $scope.layoutInit = function () {
            if (!$mdMedia('gt-xs')) {
                $scope.hideList = true;
            };
            if (!$mdMedia('gt-sm')) {
                $scope.hidePreview = true;
            }
        }
        $scope.layoutInit();

        //低于xs各个部分solo显示
        $scope.tagPart = function (str) {
            if (!$mdMedia('gt-xs')) {
                $scope.hideList = true;
                $scope.hideEditor = true;
                $scope.hidePreview = true;
                $scope[str] = !$scope[str];
            } else {
                $scope[str] = !$scope[str];
            }
        };




        //

        $scope.appName = $scope.xargs.app;


        //end
    }
})();
