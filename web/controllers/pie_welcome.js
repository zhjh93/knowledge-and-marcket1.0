(function() {
    'use strict';
    var thisName = 'pie_welcome';

    _app.controller(thisName, thisFn);

    function thisFn(
        $rootScope,
        $scope,
        $location,
        $anchorScroll,
        $element,
        $mdToast,
        $mdDialog
    ) {
        console.log(thisName + '.js is loading...');
        _fns.initCtrlr($scope, $element, thisName, false);

        //锚点
        $scope.goto = function(key) {
            $location.hash(key);
            $anchorScroll();
        };


        //读取account的信息文件
        $scope.createApp = function() {
            var api = 'http://m.xmgc360.com/pie/api/createApp';
            var dat = {
                appName: 'test',
            }
            $.post(api, dat, function(res) {
                console.log('GET', api, dat, res);




            });
        };
        $scope.createApp();
    }
})();
