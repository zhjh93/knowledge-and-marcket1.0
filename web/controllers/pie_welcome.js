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


        //测试创建App
        $scope.createApp = function() {
            var api = 'http://m.xmgc360.com/pie/api/createApp';
            var dat = {
                appName: 'test',
            }
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
            });
        };
        $scope.createApp();


        //测试获取上传token
        $scope.getUploadToken = function() {
            var api = 'http://m.xmgc360.com/pie/api/getUploadToken';
            var dat = {
                fpath: 'test/index.html',
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
            });
        };
        $scope.getUploadToken();







        //end
    }
})();
