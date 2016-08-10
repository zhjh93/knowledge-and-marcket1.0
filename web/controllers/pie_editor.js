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
                    .clickOutsideToClose(true)
                    .title('您还没有选定项目')
                    .textContent('您必须选定一个项目才能进行编辑.')
                    .ariaLabel('您还没有选定项目')
                    .ok('返回我的APP列表')
                $mdDialog.show(alrt).then(function() {
                    window.location.href = document.referrer;
                });
            };
            if (!$rootScope.myInfo.id) {
                var alrt = $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('您还没有登陆')
                    .textContent('您必须注册并登录之后才能使用编辑功能.')
                    .ariaLabel('您还没有登陆')
                    .ok('返回我的APP列表')
                $mdDialog.show(alrt).then(function() {
                    window.location.href = 'http://m.xmgc360.com/start/web/account/?page=login';
                });
            };
            return $scope.appName;
        };
        $scope.getAppArg();

        //获取app文件夹的列表
        $scope.getFileList = function() {
            var appName = $scope.getAppArg();

            var api = 'http://m.xmgc360.com/pie/api/getFileList';
            var dat = {
                path: appName + '/',
                limit: 100,
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    _fns.applyScope($scope, function() {
                        $scope.appFiles = res.data.items;
                        $scope.domain = res.data.domain;
                        $scope.appFolder = appName;
                    });
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
        $scope.getFileList();


        //增加一个新文件
        $scope.doAddNewFile = function() {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;

            //弹出窗口提示输入文件名
            var confirm = $mdDialog.prompt()
                .title('请输入文件的名称(如mypage.html)')
                .textContent('请不要使用字母数字以外的特殊符号.目前只可以创建.js,.css,.html,.json,.txt格式文件')
                .placeholder('file name')
                .ariaLabel('App name')
                .initialValue('myfile.html')
                .ok('确定')
                .cancel('取消');
            $mdDialog.show(confirm).then(function(ipt) {
                if (ipt && _cfg.regx.fileName.test(ipt)) {
                    //检查文件是否存在
                    var fpath = uid + '/' + appName + '/' + ipt;
                    $scope.chkFileExist(fpath, function() {
                        //提示错误
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('同名文件已经存在，不能创建')
                            .position('top right')
                            .hideDelay(3000)
                        );
                    }, function() {
                        $scope.addNewFile(appName + '/' + ipt);
                    });
                } else {
                    //提示错误
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('文件名格式错误')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }
            });
        };

        //增加一个新文件
        $scope.addNewFile = function(fname) {
            var fext = fname.substring(fname.lastIndexOf('.') + 1);
            var mime = _fns.getMimeByExt(fext);

            var blob = new Blob(['Hello pie!'], {
                type: mime
            });
            var xhr = _fns.uploadFileQn2(fname, blob, function(arg1, arg2, arg3) {
                //成功提示
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('创建成功！')
                    .position('top right')
                    .hideDelay(3000)
                );
                _fns.applyScope($scope, function() {
                    $scope.getFileList();
                });
            });
        };

        //检查文件是否存在，如果不存在就执行nofn，存在就执行yesfn
        $scope.chkFileExist = function(fpath, yesfn, nofn) {
            var appName = $scope.getAppArg();

            var api = 'http://m.xmgc360.com/pie/api/getFileInfo';
            var dat = {
                key: fpath,
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    if (yesfn && yesfn.constructor == Function) yesfn();
                } else {
                    if (nofn && nofn.constructor == Function) nofn();
                };
            });
        };

        //删除一个文件
        $scope.deleteFile = function(item) {
            var fpath = item.key;
            var fname = fpath.substring(fpath.lastIndexOf('/') + 1);

            var appName = $scope.getAppArg();
            if (!fname) {
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('文件名不能为空，删除取消！')
                    .position('top right')
                    .hideDelay(3000)
                );
            } else if (fname == 'index.html') {
                //禁止删除index.html文件
                $mdToast.show(
                    $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title('您不能删除index.html文件')
                    .textContent('这个文件是APP的首页，不能删除.')
                    .ok('我知道啦！')
                );
            } else {
                //弹窗确认
                console.log('3333');

                var confirm = $mdDialog.confirm()
                    .title('您确认要删除文件 ' + fname + ' 吗?')
                    .textContent('警告！删除后无法恢复.')
                    .ariaLabel('App name')
                    .ok('确定删除')
                    .cancel('取消');
                $mdDialog.show(confirm).then(function() {
                    $scope.doDeleteFile(item.key);
                });
            }
        };

        //执行删除一个文件
        $scope.doDeleteFile = function(fpath) {
            var appName = $scope.getAppArg();

            var api = 'http://m.xmgc360.com/pie/api/deleteFile';
            var dat = {
                key: fpath,
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('删除成功！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                    _fns.applyScope($scope, function() {
                        $scope.getFileList();
                    });
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('删除失败！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });
        };

        //模拟input弹窗选择文件并开始上传
        $scope.upFiles = {};
        $scope.doUploadFile = function(evt) {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;

            var btnjo = $(evt.target);
            if (btnjo.attr('id') != 'uploadBtn') btnjo = btnjo.parent();

            $scope.uploadId = _fns.uploadFile(appName, btnjo,
                function(f, res) {
                    //before,
                }, function(f, proevt) {
                    //progress,更新进度条
                    _fns.applyScope($scope, function() {
                        $scope.upFiles[f.id] = f;
                    });
                }, function(f, res) {
                    //sucess,从upFiles里面移除这个f
                    f.url = res.url;
                    $scope.removeUpFile(f);
                    //刷新列表，提示成功
                    _fns.applyScope($scope, function() {
                        $scope.getFileList();
                    });
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('上传成功！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }, function(f) {
                    //abort,从upFiles里面移除这个f
                    $scope.removeUpFile(f);
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('上传被取消')
                        .position('top right')
                        .hideDelay(3000)
                    );
                }, function(f, err) {
                    //error,从upFiles里面移除这个f
                    f.url = res.url;
                    $scope.removeUpFile(f);
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('上传失败:' + err.message)
                        .position('top right')
                        .hideDelay(3000)
                    );
                });
        };


        //从上传列表中移除
        $scope.removeUpFile = function(f) {
            _fns.applyScope($scope, function() {
                delete $scope.upFiles[f.id];
            });
        };









        //ctrlr end
    }
})();
