(function() {
    'use strict';
    var thisName = 'pie_sideNav';

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

        $rootScope[thisName] = $scope;

        $scope.menus = [{
            name: '我的首页',
            icon: 'fa fa-bomb',
            ctrlr: 'pie_welcome',
        }]

        $(window).ready(function() {
            setTimeout(function() {
                //载入完毕后执行
            }, 1000)
        });

        $scope.goHome = function() {
            window.location.href = 'http://m.xmgc360.com';
        };

        $scope.name = thisName;

        //获取App列表，显示在左侧栏
        $scope.getMyAppList = function() {
            var api = 'http://m.xmgc360.com/pie/api/getMyApps';
            $.post(api, undefined, function(res) {
                console.log('POST', api, undefined, res);
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


        //从侧栏打开app编辑器
        $scope.editApp = function(appname) {
            var str = 'http://m.xmgc360.com/pie/web/?page=pie_editor&app=' + appname;
            str = encodeURI(str);
            location.href = str;
        };









        //end
    }
})();
