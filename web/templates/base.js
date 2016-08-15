/*代码派基础模板，fa+jquery+bootstrap+angular
自动设置angularjs初始化
*/

//屏蔽顶部导航栏
if (!_xmgc) _xmgc = {};
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

    //全页面angularjs功能
    _app.run(function angularRun($rootScope, $timeout, $mdSidenav, $log) {
        [{rootScopeCode}]
    });
    //end
})();
