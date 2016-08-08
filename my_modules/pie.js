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

        var uid = yield _fns.getUidByCookieCo(ctx);

        //检查是否已经存在同名app，如果存在则终止
        var usrAppsKey = _rds.k.usrApps(uid);
        var isExist = yield _ctnu([_rds.cli, 'zscore'], usrAppsKey, appName);
        if (isExist) throw Error('同名App已经存在，无法创建.');

        //获取appid
        var appId = yield _ctnu([_rds.cli, 'hincrby'], _rds.k.map_cls2id, 'app', 1);
        var appKey = _rds.k.app(appId);

        //向七牛添加一个index.html文件
        var qnres = yield _qn.uploadDataCo('Hello world!', uid + '/' + appName + '/index.html');

        //存储为app-aid键
        var mu = _rds.cli.multi();
        var dat = {
            id: appId,
            'name': appName,
            'uid': uid,
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



//导出模块
module.exports = _pie;
