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
            name: '我的APP列表',
            icon: 'fa fa-list',
            ctrlr: 'pie_welcome',
        }, {
            name: '代码编辑器',
            icon: 'fa fa-code',
            ctrlr: 'pie_editor',
        }, {
            name: '接口测试',
            icon: 'fa fa-plug',
            ctrlr: 'pie_temp',
        }]

        $(window).ready(function() {
            setTimeout(function() {
                console.log('>>>', $rootScope.lastCtrlr);
            },1000)
        });

        $scope.name = thisName;
    }
})();
