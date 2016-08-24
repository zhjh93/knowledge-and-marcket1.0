/*每个App提前引入的js通用功能
应该在header的jquery后引入
*/
console.log('pie/_commond.js:loading...');
if (!_pie) {
    var _pie = {};
};

(function() {
    'use strict';

    /*获取地址栏参数
     */
    _pie.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    //强制刷新页面，用于开发阶段或特殊情况，默认刷新
    if (_pie.forceRefresh == true || _pie.forceRefresh === undefined) {
        var ts = _pie.getUrlParam('_');
        var hst = (window.location.hostname == 'files.m.xmgc360.com');
        if (!ts && hst) location.href = location.href + '?_=' + Math.random();
    };


})();
