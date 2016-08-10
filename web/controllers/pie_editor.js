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

        //实时屏幕尺寸
        $scope.sizeGt = function(str) {
            return $mdMedia('gt-' + str);
        }

        //自动隐藏list和preview
        $scope.layoutInit = function() {
            if (!$mdMedia('gt-xs')) {
                $scope.hideList = true;
            };
            if (!$mdMedia('gt-sm')) {
                $scope.hidePreview = true;
            }
        }
        $scope.layoutInit();

        //低于xs各个部分solo显示
        $scope.tagPart = function(str) {
            if (!$mdMedia('gt-xs')) {
                $scope.hideList = true;
                $scope.hideEditor = true;
                $scope.hidePreview = true;
                $scope[str] = !$scope[str];
            } else {
                $scope[str] = !$scope[str];
            }
        };

        //检测Appname，如果没有那么后退
        $scope.getAppArg = function() {
            $scope.appName = $scope.xargs.app;
            if (!$scope.appName) {
                var alrt = $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('This is an alert title')
                    .textContent('You can specify some description text in here.')
                    .ariaLabel('Alert Dialog Demo')
                    .ok('Got it!')
                $mdDialog.show(alrt).then(function() {
                    window.location.href = document.referrer;
                });
            };
            return $scope.appName;
        };
        $scope.getAppArg();

        //获取app文件夹的列表，先获取权限
        $scope.doGetFileList = function() {
            var appName = $scope.getAppArg();

            var api = 'http://m.xmgc360.com/pie/api/getAccToken';
            //            var api = 'http://m.xmgc360.com/pie/api/getFileList';
            var dat = {
                path: appName + '/',
                limit: 100,
                marker: _fns.uuid(),
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //刷新列表
                    $scope.getAppFileList(res.data.fpath, res.data.token);
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('获取文件列表失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });

        };

        //获取文件夹的权限
        $scope.getAppFileList = function(path, token) {
            var appName = $scope.getAppArg();
            var url = 'http://rsf.qbox.me/list?bucket=daimapai&prefix=' + path;

            var set = {
                url: url,
                type: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': '',
                },
                dataType: 'JSONP',
                processData: false, //屏蔽掉ajax自动header处理
                contentType: false, //屏蔽掉ajax自动header处理
                success: function() {
                    console.log('>>ok', arguments);P
                },
                error: function() {
                    console.log('>>err', arguments);
                }
            };
            var xhr = $.ajax(set);
            console.log('>>>end', xhr);
        };

        $scope.doGetFileList();



        //



        //end
    }
})();
