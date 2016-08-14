(function() {
    'use strict';
    var thisName = 'pie_editor';
    console.log(thisName + '.js is loading...');

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
        $scope.tagPart = function(str, val) {
            if (!$mdMedia('gt-xs')) {
                $scope.hideList = true;
                $scope.hideEditor = true;
                $scope.hidePreview = true;
                if (val === undefined) {
                    $scope[str] = !$scope[str];
                } else {
                    $scope[str] = val;
                }
            } else {
                if (val === undefined) {
                    $scope[str] = !$scope[str];
                } else {
                    $scope[str] = val;
                }
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
            }else{
               $scope.appName= decodeURI($scope.appName);
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
            var xhr = _fns.uploadFileQn(fname, blob, function(arg1, arg2, arg3) {
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


        $scope.cmModes = ['html', 'css', 'javascript'];

        //codemirror选项
        $scope.cmOpt = {
            mode: "xml",
            htmlMode: true,
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            lineWrapping: true,
            extraKeys: {
                //alt折叠当前行开始的代码块
                'Alt': function(cm) {
                    cm.foldCode(cm.getCursor());
                },
            },
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter", "CodeMirror-lint-markers"],
            autoCloseBrackets: true,
            lint: true,
        };


        //codemirror运行前设置
        $scope.cmLoaded = function(cm) {
            $scope.cm = cm;
            var doc = $scope.cmDoc = cm.getDoc();
            var editor = $scope.cmEditor = doc.getEditor();

            var hei = $(window).height() - 78;
            editor.setSize('100%', hei + 'px');

            $(window).resize(function() {
                var hei = $(window).height() - 78;
                editor.setSize('100%', hei + 'px');
            });

            editor.getWrapperElement().style["font-size"] = "1.8rem";
            editor.getWrapperElement().style["font-family"] = "monospace";
            editor.refresh();

            var selstr;
            editor.on('keydown', function(cm, event) {
                selstr = editor.doc.getSelection();
            });

            editor.on("keyup", function(cm, event) {
                //结合anyword和javascript两个提示器
                var char = String.fromCharCode(event.keyCode);

                //对于非字母数字点或者按下ctrlalt的，忽略
                if (!cm.state.completionActive && /[0-9A-Za-z\.\¾]/.test(char) && !event.altKey && !event.ctrlKey) {
                    CodeMirror.showHint(cm, function(edtr, opts) {

                        //根据模式自适应提示引擎
                        var mod = $scope.cmOpt.mode;
                        if (mod == 'xml') mod = 'html';
                        var res = CodeMirror.hint[mod](edtr, opts);

                        res = CodeMirror.hint.anyword(edtr, {
                            list: (res && res.list) ? res.list : []
                        });
                        return res;
                    }, {
                        completeSingle: false
                    });
                };
            });
        };


        /*打开一个文件，将文件内容显示到编辑器
         */
        $scope.doOpenFile = function(fkey) {
            //只能打开指定类型的文件
            var ext = _fns.getFileExt(fkey);

            if (_cfg.editFileTypes.indexOf(ext) == -1) {
                $mdDialog.show($mdDialog.confirm()
                    .title('编辑器不支持您的文件类型')
                    .textContent('只能打开html,css,js或txt格式文件')
                    .ariaLabel('App name')
                    .ok('关闭'));
            } else if (!fkey) {
                $mdDialog.show($mdDialog.confirm()
                    .title('找不到文件地址，请刷新后再试')
                    .textContent('这可能是由于网络不稳定引起的')
                    .ariaLabel('App name')
                    .ok('关闭'));
            } else {
                var url = _cfg.qn.BucketDomain + fkey;
                $scope.openFile(url, fkey);
            };
        };


        /*打开文件显示到cm的函数,都使用html读取，否则没有回调
        url为绝对完整地址
        延迟100毫秒执行
        */
        $scope.openFile = function(url, fkey) {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;
            if (!url) url = _cfg.qn.BucketDomain + uid + '/' + appName + '/index.html';
            if (!fkey) fkey = uid + '/' + appName + '/index.html';

            //添加时间戳强制刷新
            var urlp = url + '?=' + (new Date()).getTime();

            $.get(urlp, function(res) {
                console.log('GET', urlp, null, String(res).substr(0, 100));
                _fns.applyScope($scope, function() {
                    $scope.curFileUrl = url;
                    $scope.curFileKey = fkey;
                    $scope.curFileName = _fns.getFileName(url);
                    $scope.curFileExt = _fns.getFileExt(url);
                    $scope.curFileData = res;
                    $scope.tagPart('hideEditor',false);

                    //自动切换编辑器提示引擎
                    if ($scope.cmModes.indexOf($scope.curFileExt) != -1) {
                        $scope.cmOpt.mode = $scope.curFileExt;
                    } else {
                        $mdToast.show(
                            $mdToast.simple()
                            .textContent('编辑器不支持您的文件格式.')
                            .position('top right')
                            .hideDelay(3000)
                        );
                    };

                    setTimeout(function() {
                        $scope.curFileData += ' ';
                    }, 100)
                });
                var fname = url.substring(url.lastIndexOf('/') + 1);
                $mdToast.show(
                    $mdToast.simple()
                    .textContent('读取文件' + fname + '成功，已经载入编辑器！')
                    .position('top right')
                    .hideDelay(3000)
                );
            }, "html");
        };

        $scope.openFile();



        /*保存当前编辑器内容到当前文件url
         */
        $scope.doSaveFile = function() {

            //截取uid/后面的部分
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;
            var fkey = $scope.curFileKey.substr(uid.length + 1);
            var data = $scope.cmDoc.getValue();

            if (!fkey || !data) {
                $mdDialog.show($mdDialog.confirm()
                    .title('找不到文件地址或数据为空，保存取消')
                    .textContent('这可能是由于网络不稳定引起的')
                    .ariaLabel('App name')
                    .ok('关闭'));
            } else {
                $scope.saveFile(fkey, data);
            };
        };

        /*保存文件，fkey前不带uid不带斜杠格式myapp/index.html，data为字符串
         */
        $scope.saveFile = function(fkey, data) {
            var ext = _fns.getFileExt($scope.curFileKey);
            var mime = _fns.getMimeByExt(ext);

            var blob = new Blob([data], {
                type: mime
            });

            var xhr = _fns.uploadFileQn(fkey, blob, function() {
                //存储完成后刷新数据
                $scope.refreshFile(fkey);

                //更新本地数据
                _fns.applyScope($scope, function() {
                    $scope.curFileData = data;
                });
            });
        };

        /*上传之后刷新文件,fkey带uid不带斜杠格式1/myapp/index.html，data为字符串
         */
        $scope.refreshFile = function(fkey) {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;
            var ext = _fns.getFileExt($scope.curFileKey);
            var mime = _fns.getMimeByExt(ext);

            var api = 'http://m.xmgc360.com/pie/api/refreshFile';
            var dat = {
                key: uid + '/' + fkey,
            };
            $.post(api, dat, function(res) {
                console.log('POST', api, dat, res);
                if (res.code == 1) {
                    //成功提示
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('文件更新成功！')
                        .position('top right')
                        .hideDelay(3000)
                    );
                } else {
                    $mdToast.show(
                        $mdToast.simple()
                        .textContent('文件更新失败:' + res.text)
                        .position('top right')
                        .hideDelay(3000)
                    );
                };
            });
        };

        //打开新页面访问app的index页面
        $scope.gotoApp = function() {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;
            var url = _cfg.qn.BucketDomain + uid + '/' + appName + '/index.html?=' + (new Date()).getTime();
            window.open(url);
        };

        //显示页面的二维码
        $scope.showQrcode = function() {
            var appName = $scope.getAppArg();
            var uid = $rootScope.myInfo.id;
            $scope.appFullUrlP = _cfg.qn.BucketDomain + uid + '/' + appName + '/index.html?=' + (new Date()).getTime();
            $scope.appFullUrl = _cfg.qn.BucketDomain + uid + '/' + appName + '/index.html';
            $mdDialog.show({
                contentElement: '#qrcodeDialog',
                parent: angular.element(document.body),
                clickOutsideToClose: true
            });
        };







        //ctrlr end
    }
})();









//end
