/*创建和管理App
 */
var _pie = {};

//预先读取模板文件
var templates = {
    baseHtml: $fs.readFileSync(__path + '/web/templates/base.html', 'utf-8').replace(/\[\{codeHere_*\w*\}\]/g, ''),
    baseJs: $fs.readFileSync(__path + '/web/templates/base.js', 'utf-8').replace(/\[\{codeHere_*\w*\}\]/g, ''),
};


/**
 * 接口：创建App，存储一个模板index.html文件到七牛存储，返回App的ID
 * @returns {appid} 创建的app的id
 */
_rotr.apis.createApp = function() {
    var ctx = this;

    var co = $co(function * () {

        var appName = ctx.query.appName || ctx.request.body.appName;
        if (!appName || !_cfg.regx.appName.test(appName)) throw Error('App标识名格式错误.');

        var appAlias = ctx.query.appAlias || ctx.request.body.appAlias;
        if (!appAlias || !_cfg.regx.appAlias.test(appAlias)) throw Error('App名称格式错误.');

        var uid = yield _fns.getUidByCtx(ctx);

        //检查是否已经存在同名app，如果存在则终止
        var usrAppsKey = _rds.k.usrApps(uid);
        var isExist = yield _ctnu([_rds.cli, 'zscore'], usrAppsKey, appName);
        if (isExist) throw Error('已经存在相同标识名的APP，无法创建.');

        //获取appid
        var appId = yield _ctnu([_rds.cli, 'hincrby'], _rds.k.map_cls2id, 'app', 1);
        var appKey = _rds.k.app(appId);

        //向七牛添加一个index.html文件
        var qnres1 = yield _qn.uploadDataCo(templates.baseHtml, uid + '/' + appName + '/index.html');
        var qnres2 = yield _qn.uploadDataCo(templates.baseJs, uid + '/' + appName + '/index.js');
        //var qnres3 = yield _qn.uploadDataCo('body {\n \n \n}', uid + '/' + appName + '/index.css');

        //存储为app-aid键
        var mu = _rds.cli.multi();
        var dat = {
            'id': appId,
            'name': appName,
            'alias': appAlias,
            'uid': uid,
            'pkey': __uuid(),
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
 * 接口：通过appauthorid和appName获取app的基本信息，可以读取其他用户的app信息
 * @req {appUid} 创建的app的作者id
 * @req {appName} app的name
 * @returns {appid} 创建的app的id
 */
_rotr.apis.getAppInfo = function() {
    var ctx = this;

    var co = $co(function * () {

        var uid = yield _fns.getUidByCtx(ctx);

        var appUid = ctx.query.appUid || ctx.request.body.appUid;
        if (appUid && !/^\d*$/.test(appUid)) throw Error('App作者ID格式错误.');
        if(!appUid){
            //尝试使用cookie的token兑换uid
            appUid=uid;
        };

        var appName = ctx.query.appName || ctx.request.body.appName;
        if (!appName || !_cfg.regx.appName.test(appName)) throw Error('App标识名格式错误.');

        //从用户的app列表获取appid
        var uAppsKey = _rds.k.usrApps(appUid);
        var appid=yield _ctnu([_rds.cli, 'zscore'], uAppsKey, appName);
        if(!appid) throw Error('找不到对应的App.');

        //读取app的全部信息
        var appkey=_rds.k.app(appid);
        var dat=yield _ctnu([_rds.cli, 'hgetall'], appkey);

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
            count: apps.length / 2,
            apps: _fns.arr2obj(apps, true, true),
        };

        //读取每个app的数据
        var mu = _rds.cli.multi();
        for (var attr in dat.apps) {
            var app = dat.apps[attr];
            mu.hgetall('app-' + app.val);
        };

        var infos = yield _ctnu([mu, 'exec']);
        infos.forEach(function(info) {
            dat.apps[info.name].info = info;
        });

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


/**
 * 修改我一个的App别名alias；限定自己的app
 * @param {appId} app的id
 * @param {appAlias} 新的app别名
 * @returns {}
 */

_rotr.apis.renameApps = function() {
    var ctx = this;

    var co = $co(function * () {

        var uid = yield _fns.getUidByCtx(ctx);

        var appId = ctx.query.appId || ctx.request.body.appId;
        if (appId === undefined) throw Error('App ID不能为空.');
        appId = Number(appId);
        if (!appId || !Number.isInteger(appId)) throw Error('App ID格式错误.');

        var appAlias = ctx.query.appAlias || ctx.request.body.appAlias;
        if (!appAlias || !_cfg.regx.appAlias.test(appAlias)) throw Error('App新名称格式错误.');

        //检查app是否存在
        var appKey = _rds.k.app(appId);
        var hasexsit = yield _ctnu([_rds.cli, 'exists'], appKey);
        if (!hasexsit) throw Error('App不存在，修改失败');

        //检查appid是否在用户的app列表中
        var uAppsKey = _rds.k.usrApps(uid);
        var ismine = yield _ctnu([_rds.cli, 'zrangebyscore'], uAppsKey, appId, appId);
        if (!ismine || ismine.length == 0) throw Error('修改失败，您只能修改自己创建的app');

        //修改alias
        var res = yield _ctnu([_rds.cli, 'hset'], appKey, 'alias', appAlias);

        //返回数据
        ctx.body = __newMsg(1, 'ok');
        return ctx;
    });
    return co;
};






//导出模块
module.exports = _pie;
