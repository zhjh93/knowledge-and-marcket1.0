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


        //获取我的App列表
        $scope.getMyAppList = function() {
            var api = 'http://m.xmgc360.com/pie/api/getMyApps';
            var dat = {
                appName: 'test',
            }
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    _fns.applyScope($scope, function() {
                        $scope.myApps = res.data;
                    });
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('读取App列表失败，请稍后再试:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });
        };
        $scope.getMyAppList();


        //跳转到App首页
        $scope.openApp = function(appname) {
            var str = 'http://mfiles.xmgc360.com/' + $rootScope.myInfo.id + '/' + appname + '/index.html';
            str = encodeURI(str);
            location.href = str;
        };

        //跳转到App首页
        $scope.editApp = function(appname) {
            var str = 'http://m.xmgc360.com/pie/web/?page=pie_editor&app=' + appname;
            str = encodeURI(str);
            location.href = str;
        };



        //end
    }
})();
