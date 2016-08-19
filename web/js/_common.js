/*每个App提前引入的js通用功能
应该在header的jquery后引入
*/
console.log('pie/_commond.js:loading...');
if (!_xmgc) {
    var _xmgc = {};
};

(function() {
    'use strict';

    /*获取地址栏参数
     */
    _xmgc.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    //强制刷新页面，用于开发阶段或特殊情况，默认刷新
    if (_xmgc.forceRefresh == true || _xmgc.forceRefresh === undefined) {
        var ts = _xmgc.getUrlParam('_');
        var hst = (window.location.hostname == 'files.m.xmgc360.com');
        if (!ts && hst) location.href = location.href + '?_=' + Math.random();
    };


})();
