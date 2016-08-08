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

        var uid = yield _pie.getUidByCookieCo(ctx);

        //数据库创建app-id键存app信息，创建uidapp放置用户的app列表



        var dat = {
            uid: uid,
        };

        //返回数据
        ctx.body = __newMsg(1, 'ok', dat);
        return ctx;
    });
    return co;
};

/**
 * 函数，通过request请求获取uid
 * @param   {ctx} ctx请求的上下文
 * @returns {uid} 用户的id
 */
_pie.getUidByCookieCo = function(ctx) {
    var co = $co(function * () {

        //通过cookie从主服务器获取uid
        var ukey = ctx.cookies.get('m_ukey');
        if (!ukey || !_cfg.regx.ukey.test(ukey)) throw Error('您还没有注册和登陆，不能创建App.');

        var path = '/start/api/getUidByUkey';

        var opt = {
            hostname: 'm.xmgc360.com',
            port: 80,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        var dat = {
            ukey: ukey,
        };

        var res = yield _fns.httpReqPrms(opt, dat);
        var msg = JSON.safeParse(res.body);
        if (msg.code != 1) throw Error('获取用户信息失败，请稍后再试:' + msg.text);
        return msg.data.uid;

    });
    return co;
};





//导出模块
module.exports = _pie;
