/*扩展系统对象功能或者提供新功能
 JSON.safeParse/JSON.sparse;
 */
var $crypto = require('crypto');
var _fns = {};


//基础函数扩充---------------------------------------
/*扩展JSON.safeParse*/
JSON.safeParse = JSON.sparse = function(str) {
    try {
        return JSON.parse(str);
    } catch (err) {
        return undefined;
    };
};

/*扩展一个方法或对象*/
function extend(Child, Parent) {
    var F = function() {};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.uber = Parent.prototype;
};


/*重新封装console的函数*/
var cnslPreStr = '>';
console.xerr = function() {
    var args = arguments;
    console.info(cnslPreStr, 'ERR:');
    console.error.apply(this, args);
};
console.xlog = function() {
    var args = arguments;
    console.info(cnslPreStr, 'LOG:');
    console.log.apply(this, args);
};
console.xinfo = function() {
    var args = arguments;
    console.info(cnslPreStr, 'INFO:');
    console.info.apply(this, args);
};
console.xwarn = function() {
    var args = arguments;
    console.info(cnslPreStr, 'WARN:');
    console.xwarn.apply(this, args);
};


/*专用err处理函数,适合co().then()使用*/
global.__errhdlr = __errhdlr;

function __errhdlr(err) {
    console.xerr(err.stack);
};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global.__nullhdlr = __nullhdlr;

function __nullhdlr(res) {};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
global.__infohdlr = __infohdlr;

function __infohdlr(res) {
    console.xinfo(res);
};

/*专用空函数，只纪录日志不做额外处理,适合co().then()使用*/
global.__loghdlr = __loghdlr;

function __loghdlr(res) {
    console.xlog(res);
};

/*生成不重复的key*/
global.__uuid = __uuid;

function __uuid() {
    return $uuid.v4();
};

/*md5加密
 如果str为空，自动生成一个uuid
 digest类型，hex默认,base64
 */
global.__md5 = __md5;

function __md5(str, dig) {
    if (!str) str = __uuid();
    if (!dig) dig = 'hex';
    return $crypto.createHash('md5').update(str).digest(dig)
};


/*sha1加密
 如果str为空，自动生成一个uuid
 digest类型，hex默认,base64
 */
global.__sha1 = __sha1;

function __sha1(str, dig) {
    if (!str) str = __uuid();
    if (!dig) dig = 'hex';
    return $crypto.createHash('md5').update(str).digest(dig)
};



/*生成标准的msg*/
global.__newMsg = __newMsg;

function __newMsg(code, text, data) {
    var info;
    if (text.constructor == Array) {
        if (text.length >= 2) {
            info = text[1];
        };
        text = text[0];
    };
    return {
        code: code,
        text: text,
        info: info,
        data: data,
        time: Number(new Date()),
    };
};


//重要函数------------------------------------
/*服务端向其他地址发起http请求的promise
 成功执行resolvefn({headers:{...},body:'...'})
 options应包含所有必需参数如hostname，port,method等等,例如
 {
 hostname: 'rsf.qbox.me',
 port: 80,
 path: optpath,
 method: 'POST',
 headers: {
 'Content-Type': 'application/x-www-form-urlencoded',
 'Authorization': '',
 },
 };
 */
_fns.httpReqPrms = httpReqPrms;

function httpReqPrms(options, bodydata) {
    var prms = new Promise(function(resolvefn, rejectfn) {
        var req = $http.request(options, (res) => {
                if (res.statusCode != 200) {
            rejectfn(new Error('Target server return err:' + res.statusCode));
        } else {
            res.setEncoding('utf8');
            var dat = {
                headers: res.headers,
                body: '',
            };
            res.on('data', (dt) => {
                dat.body += dt;
        });
            res.on('end', () => {
                resolvefn(dat);
        })
        };
    });

        req.on('error', (e) => {
            rejectfn(new Error('Request failed:' + e.message));
    });

        if (bodydata) {
            req.write(JSON.stringify(bodydata));
        };

        req.end();
    });

    return prms;
};


/**
 * 函数，通过request请求获取uid
 * @param   {ctx} ctx请求的上下文
 * @returns {uid} 用户的id
 */
_fns.getUidByCtx = function(ctx) {
    var co = $co(function * () {

        //通过cookie从主服务器获取uid
        var ukey = ctx.cookies.get('m_ukey');
        //if (!ukey || !_cfg.regx.ukey.test(ukey)) throw Error('您还没有注册和登陆，不能创建App.');

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
//调用登录接口方法
_fns.getUidByLogin = function(ctx) {
    var co = $co(function * () {

        //通过cookie从主服务器获取uid
        //var ukey = ctx.cookies.get('m_ukey');
        //if (!ukey || !_cfg.regx.ukey.test(ukey)) throw Error('您还没有注册和登陆，不能创建App.');

        var path = '/start/api/loginByPhone';

        //拿到和验证数据
        var phone = ctx.query.phone || ctx.request.body.phone;
        if (!phone ) throw Error('你的姓名格式不合法！');

        var pw = ctx.query.pw || ctx.request.body.pw;
        if (!pw ) throw Error('你的密码格式不合法！');

        var opt = {
            hostname: 'm.xmgc360.com',
            port: 80,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        var password =  __md5(pw);
        var dat = {
            phone: phone,
            pw:password
        };

        var res = yield _fns.httpReqPrms(opt, dat);
        var msg = JSON.safeParse(res.body);
        if (msg.code != 1) throw Error('获取用户信息失败，请稍后再试:' + msg.text);
        console.log(msg);
        return msg.data.id;
    });
    return co;
};
/**
 * 讲一个数组转化为对象
 * @param   {array}   arr    需要转换的数组
 * @param   {boolean} keyval 是否是[key,val,key,val]模式,默认为真,keyobj转换为'key':{'key':key,'val':val}
 * @returns {Object}   转换结果，可能是空对象
 */

_fns.arr2obj = function(arr, keyval, keyobj) {
    if (keyval === undefined) keyval = true;
    var res = {};
    if (!arr || !Array.isArray(arr)) return res;
    if (!keyval) {
        for (var i = 0; i < arr.length; i++) {
            res[String(i)] = arr[i];
        };
    } else {
        for (var i = 0; i < arr.length; i += 2) {
            if ((i + 1) < arr.length) {
                if (keyobj) {
                    res[String(arr[i])] = {
                        key: String(arr[i]),
                        val: arr[i + 1]
                    };
                } else {
                    res[String(arr[i])] = arr[i + 1];
                }
            };
        };
    };
    return res;
}








//导出模块
module.exports = _fns;
