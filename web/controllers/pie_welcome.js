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

        //弹出提示窗口输入App名称
        $scope.doCreateApp = function() {
            var confirm = $mdDialog.prompt()
                .title('请输入APP名称(只能使用中文或数字)')
                .textContent('3~32个字符.')
                .placeholder('App name')
                .ariaLabel('App name')
                .ok('确定')
                .cancel('取消');
            $mdDialog.show(confirm).then(function(ipt) {
                console.log('>appname',ipt);
                console.log('>appname2',_cfg.regx.appName.test(ipt));
                if (ipt && _cfg.regx.appName.test(ipt)) {
                    $scope.createApp(ipt);
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('App名称格式错误')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };



        //创建一个应用
        $scope.createApp = function(appname) {
            var api = 'http://m.xmgc360.com/pie/api/createApp';
            var dat = {
                appName: appname,
            }
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getMyAppList();
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('创建APP失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });
        };


        //弹出提示窗口提示移除app
        $scope.doRemoveApp = function(appname) {
            var confirm = $mdDialog.confirm()
                .title('您确定要移除 ' + appname + '应用吗?')
                .textContent('移除后将无法恢复.')
                .ariaLabel('remove app')
                .ok('确定移除')
                .cancel('取消');
            $mdDialog.show(confirm).then(function() {
                $scope.removeApp(appname);
            });
        };


        //创建一个应用
        $scope.removeApp = function(appname) {
            var api = 'http://m.xmgc360.com/pie/api/removeApp';
            var dat = {
                appName: appname,
            }
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getMyAppList();
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('移除APP失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });
        };




        $scope.getMyAppList();


        //end
    }
})();
