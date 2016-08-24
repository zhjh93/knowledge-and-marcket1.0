(function () {
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
        $scope.goto = function (key) {
            $location.hash(key);
            $anchorScroll();
        };


        //获取我的App列表
        $scope.getMyAppList = function () {
            var api = 'http://m.xmgc360.com/pie/api/getMyApps';
            $.post(api, undefined, function (res) {
                console.log('POST', api, undefined, res);
                if (res.code == 1) {
                    _fns.applyScope($scope, function () {
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

        _fns.promiseRun(function (tm) {
            $scope.getMyAppList();
        }, function () {
            return _pie.myInfo;
        });


        //跳转到App首页
        $scope.openApp = function (appname) {
            var str = _cfg.qn.BucketDomain + $rootScope.myInfo.id + '/' + appname + '/index.html';
            str = encodeURI(str);
            location.href = str;
        };

        //跳转到App首页
        $scope.editApp = function (appname) {
            var str = 'http://m.xmgc360.com/pie/web/?page=pie_editor&app=' + appname;
            str = encodeURI(str);
            location.href = str;
        };

        //弹出提示窗口输入App名称
        $scope.openCreateDialog = function () {
            $mdDialog.show({
                contentElement: '#createDialog',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };

        $scope.cancelCreateDialog = function () {
            $mdDialog.hide();
        };


        //弹出提示窗口输入App名称
        $scope.newApp = {};
        $scope.newApp.name = 'A' + Number(new Date()).toString(36);
        $scope.doCreateApp = function () {
            if (!_cfg.regx.appName.test($scope.newApp.name)) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('APP名称格式错误')
                    .position('top right')
                    .hideDelay(3000)
                );
                return;
            };
            if (!_cfg.regx.appAlias.test($scope.newApp.alias)) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('APP标识名格式错误')
                    .position('top right')
                    .hideDelay(3000)
                );
                return;
            };

            $scope.createApp($scope.newApp.name, $scope.newApp.alias);
        };


        //自动随机标识名
        function randAppName() {
            return 'a' + Math.random().toString(36).substr(2,11).toLowerCase();
        };

        //创建一个应用
        $scope.newApp.alias = '';
        $scope.newApp.name = randAppName();
        $scope.createApp = function (appname, appalias) {
            var api = 'http://m.xmgc360.com/pie/api/createApp';
            var dat = {
                appName: appname,
                appAlias: appalias,
            }
            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getMyAppList();
                    try {
                        _xdat.ctrlrs['pie_sideNav'][0].getMyAppList();
                    } catch (err) {}
                    $mdDialog.hide();
                    $scope.newApp.alias = '';
                    $scope.newApp.name = randAppName();
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


        //修改app的别名
        $scope.renameApp = function (appid) {
            //先弹窗输入新名字
            var confirm = $mdDialog.prompt()
                .title('请输入新的APP名称(使用中文或数字)')
                .textContent('3~32个字符.')
                .placeholder('App name')
                .ariaLabel('App name')
                .ok('确定')
                .cancel('取消');
            $mdDialog.show(confirm).then(function (ipt) {
                if (appid && ipt && _cfg.regx.appAlias.test(ipt)) {
                    //发送修改请求
                    $scope.dorenameApp(appid, ipt);
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('App名称格式错误')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            })
        };


        //执行修改名字的请求
        $scope.dorenameApp = function (id, alias) {
            var api = 'http://m.xmgc360.com/pie/api/renameApps';
            var dat = {
                appId: id,
                appAlias: alias,
            }
            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getMyAppList();
                    try {
                        _xdat.ctrlrs['pie_sideNav'][0].getMyAppList();
                    } catch (err) {}
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




        //弹出提示窗口提示移除app
        $scope.doRemoveApp = function (appname) {
            var confirm = $mdDialog.confirm()
                .title('您确定要移除 ' + appname + '应用吗?')
                .textContent('移除后将无法恢复.')
                .ariaLabel('remove app')
                .ok('确定移除')
                .cancel('取消');
            $mdDialog.show(confirm).then(function () {
                $scope.removeApp(appname);
            });
        };


        //创建一个应用
        $scope.removeApp = function (appname) {
            var api = 'http://m.xmgc360.com/pie/api/removeApp';
            var dat = {
                appName: appname,
            }
            $.post(api, dat, function (res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getMyAppList();
                    try {
                        _xdat.ctrlrs['pie_sideNav'][0].getMyAppList();
                    } catch (err) {}
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



        //根据项目id计算项目的背景
        $scope.genCardBg = function (n) {
            var len = _cfg.themeImgs.length;
            var url = _cfg.themeImgs[n % len].sm;
            var css = {
                'background-image': 'url(' + url + ')',
            };

            return css;
        };

        //根据用户的颜色项目的背景
        $scope.genCardBg2 = function (n) {
            var css = {
                'background-color': _pie.myUsrInfo.color,
            };

            return css;
        };






        //end
    }
})();
