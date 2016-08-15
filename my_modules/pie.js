/*创建和管理App
 */
var _pie = {};

/**
 * 接口：创建App，存储一个模板index.html文件到七牛存储，返回App的ID
 * @returns {appid} 创建的app的id
 */
_rotr.apis.createApp = function() {
    var ctx = this;

    var co = $co(function * () {

        var appName = ctx.query.appName || ctx.request.body.appName;
        if (!appName || !_cfg.regx.appName.test(appName)) throw Error('App名称格式错误.');

        var uid = yield _fns.getUidByCtx(ctx);

        //检查是否已经存在同名app，如果存在则终止
        var usrAppsKey = _rds.k.usrApps(uid);
        var isExist = yield _ctnu([_rds.cli, 'zscore'], usrAppsKey, appName);
        if (isExist) throw Error('同名App已经存在，无法创建.');

        //获取appid
        var appId = yield _ctnu([_rds.cli, 'hincrby'], _rds.k.map_cls2id, 'app', 1);
        var appKey = _rds.k.app(appId);

        //向七牛添加一个index.html文件
        var qnres1 = yield _qn.uploadDataCo('<h1>Hello world!</h1>', uid + '/' + appName + '/index.html');
        var qnres2 = yield _qn.uploadDataCo('(function () {\n "use strict";\n//coding here.\n\n})()', uid + '/' + appName + '/index.js');
        var qnres3 = yield _qn.uploadDataCo('body {\n\n}', uid + '/' + appName + '/index.css');

        //存储为app-aid键
        var mu = _rds.cli.multi();
        var dat = {
            'id': appId,
            'name': appName,
            'uid': uid,
            'pkey':__uuid(),
            'time': (new Date()).getTime(),
            'url': _qn.cfg.BucketDomain + uid + '/' + appName + '/',
        };
        for (var attr in dat) {
            mu.hset(appKey, attr, dat[attr]);
        };
        mu.zadd(usrAppsKey, appId, appName);

        var res = yield _ctnu([mu, 'exec']);

        //返回数据
        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
};


/**
 * 获取我的App列表
 * @returns {obj} {count:3,apps:[{name:'xxx',...}]}
 */

_rotr.apis.getMyApps = function() {
    var ctx = this;

    var co = $co(function * () {

        var uid = yield _fns.getUidByCtx(ctx);

        //获取appid列表
        var uAppsKey = _rds.k.usrApps(uid);
        var apps = yield _ctnu([_rds.cli, 'zrange'], uAppsKey, 0, -1, 'WITHSCORES');

        var dat = {
            count: apps.length/2,
            apps: _fns.arr2obj(apps),
        };

        //返回数据
        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
};


/**
 * 移除自己的一个APP，只是从列表里面移除，并没有删除app键，也不删除响应的七牛文件，所以是可以恢复的
 * @param {appName} app名称
 * @returns {null}
 */

_rotr.apis.removeApp = function() {
    var ctx = this;

    var co = $co(function * () {

        var uid = yield _fns.getUidByCtx(ctx);

        var appName = ctx.query.appName || ctx.request.body.appName;
        if (!appName || !_cfg.regx.appName.test(appName)) throw Error('App名称格式错误.');

        //从appid列表中移除
        var uAppsKey = _rds.k.usrApps(uid);
        var res = yield _ctnu([_rds.cli, 'zrem'], uAppsKey, appName);

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};









//导出模块
module.exports = _pie;
