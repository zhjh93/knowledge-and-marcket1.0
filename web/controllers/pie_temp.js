(function() {
    'use strict';
    var thisName = 'pie_temp';

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


        //从info.json获取各个接口信息
        $scope.getApis = function() {
            var api = 'http://m.xmgc360.com/pie/web/info.json';
            $.get(api, function(res) {
                var res = JSON.parse(res);
                console.log('POST', api, undefined, res);
                _fns.applyScope($scope, function() {
                    $scope.apis = res.apis;
                    //每个api都增加senDat和sendPost方法
                    if ($scope.apis) {
                        $scope.apis.forEach(function(item, i) {
                            item.sendDat = {};
                            item.sendPost = function() {
                                var sendapi = 'http://m.xmgc360.com/pie/api/' + item.name + '/';
                                $.post(sendapi, item.sendDat, function(sendres) {
                                    console.log('POST', sendapi, item.sendDat, sendres);
                                    _fns.applyScope($scope, function() {
                                        item.recvDat = sendres;
                                    });
                                });
                            };
                        })
                    };
                });
            }, 'html');
        };
        $scope.getApis();


        $scope.uploader = {};
        $scope.uploadFile = function() {
            var xhr = _fns.uploadFileQn2($scope.uploader.file.name, $scope.uploader.file, function(arg1, arg2, arg3) {
                console.log('procing:', arg1, arg2, arg3);
            }, function(arg1, arg2, arg3) {
                console.log('success:', arg1, arg2, arg3);
            })
        };


        $scope.uploadData = function() {
            var blob = new Blob([$scope.uploader.data], {
                type: "text/html"
            });
            var xhr = _fns.uploadFileQn2('hahaha3.html', blob, function(arg1, arg2, arg3) {
                console.log('procing-bb:', arg1, arg2, arg3);
            }, function(arg1, arg2, arg3) {
                console.log('success-bb:', arg1, arg2, arg3);
            });
        };






        //end
    }
})();
