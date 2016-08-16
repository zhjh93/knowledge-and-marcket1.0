/*代码派基础模板，fa+jquery+bootstrap+angular
自动设置angularjs初始化
*/

//屏蔽顶部导航栏
var _xmgc = {};
_xmgc.useNavBar = 'none';

//初始化angularjs数据绑定
var _app;
(function () {
    'use strict';

    //初始化
    _app = angular.module('app', ['app.factories', 'app.services', 'app.filters', 'app.directives', 'app.controllers']);

    //初始化各种功能
    angular.module('app.factories', []);
    angular.module('app.services', []);
    angular.module('app.filters', []);
    angular.module('app.directives', []);
    angular.module('app.controllers', []);

    //body部分控制器
    _app.controller('bodyCtrlr',function($rootScope, $scope) {
//----在下面开始编码----
[{rootScopeCode}]






//----到这里结束编码----
    });
})();



