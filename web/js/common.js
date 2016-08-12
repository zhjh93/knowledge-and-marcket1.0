/*提供通用函数和全局变量
全局相关的设置也在这里修改
*/

var _cfg = {}; //最高全局变量，功用设置
var _fns = {}; //最高全局变量，公用函数
var _xdat = {}; //共享变量
if (!_xmgc) var _xmgc = {};

(function() {
    'use strict';

    //初始页面,
    _xmgc.useNavBar = 'top';
    _cfg.startPage = 'pie_welcome';


    _cfg.qn = {
        getUploadTokenApi: 'http://m.xmgc360.com/pie/api/getUploadToken', //上传到指定目录
        getUploadTokenApi2: 'http://m.xmgc360.com/pie/api/getUploadToken2', //上传到随机文件名
        BucketDomain: 'http://mfiles.xmgc360.com/'
    };


    //正则表达式
    _cfg.regx = {
        phone: /^1\d{10}$/,
        phoneCode: /^\d{6}$/,
        pw: /^[0-9a-zA-Z]{32}$/, //md5之后的格式
        nick: /^[a-zA-Z\u0391-\uFFE5]+[0-9a-zA-Z\u0391-\uFFE5\.]{2,17}$/, //昵称，非数字开头3~18位
        color: /^#[a-fA-F0-9]{6}$/, //颜色值，#开头十六进制
        icon: /^fa-[\w-]{1,32}$/, //fa图标值
        ukey: /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/, //user.ukey的格式
        appName:/^[a-zA-Z\u0391-\uFFE5]+[0-9a-zA-Z\u0391-\uFFE5\.]{2,17}$/,//app名称格式，非数字开头3~18位
        fileName: /^[0-9a-zA-Z\u0391-\uFFE5]+\.(js|css|html|json|txt)$/, //文件名，中英文数字加点加2~4位字母数字
    };

    //支持打开编辑的文件类型
    _cfg.editFileTypes = ['html', 'js', 'css', 'txt', 'json'];

    //全部mimetype
    _cfg.mimeTypes = {
        'html': 'text/html',
        'js': 'application/javascript',
        'css': 'text/css',
        'txt': 'text/html',
        'json': 'Application'
    };


    //获取扩展名对应的mimetype
    _fns.getMimeByExt = function(ext) {
        ext = ext.replace('.', '');
        return _cfg.mimeTypes[ext];
    };


    //如果地址栏传递page参数进来，那么 autoStartPage 函数会覆盖startPage
    _fns.autoStartPage = function() {
        var pname = _fns.getUrlParam('page');
        if (pname) {
            _cfg.startPage = pname;
        }
    };

    //设置相对路径，适配测试和正式
    _cfg.home = 'http://' + window.location.host + '/web/';
    if (window.location.host == 'm.xmgc360.com') {
        _cfg.home = 'http://' + window.location.host + '/pie/web/'
    };

    //设置获取ctrlr路径方法
    _fns.getCtrlrUrl = function(ctrlrname, ext) {
        if (!ext) ext = '.html';
        return _cfg.home + 'controllers/' + ctrlrname + ext;
    };

    //添加控制器的js文件
    _fns.addCtrlrJs = function(ctrlrname) {
        var all_js = document.getElementsByTagName("script");
        var cur_js = $(all_js[all_js.length - 1]);

        var url = './controllers/' + ctrlrname + '.js';
        cur_js.prev().append('<script src="' + url + '"><\/script>');
    };

    //向_xdat添加控制器，便于根据名称或Dom的id获取控制器的scope
    _fns.initCtrlr = function(scope, element, name, solo) {
        scope.ctrlrName = scope.ctrlrName || name;

        //获取父层传来的参数，写入scope.xargs;
        _fns.getCtrlrXags(scope, element);

        //记录到xdat的ctrlrs，名称数组［］可以放置多个同名控制器
        if (scope.ctrlrName) {
            if (!_xdat.ctrlrs) _xdat.ctrlrs = {};
            if (solo || !_xdat.ctrlrs[scope.ctrlrName]) _xdat.ctrlrs[scope.ctrlrName] = [];
            _xdat.ctrlrs[scope.ctrlrName].push(scope);
        };

        //记录到xdat的id2ctrlr,dom的id到ctrlr的映射;id不能重名
        if (scope.xargs.id) {
            if (!_xdat.id2ctrlr) _xdat.id2ctrlr = {};
            _xdat.id2ctrlr[scope.xargs.id] = scope;
        };
    };

    /*ctrlr获取上层传来的参数，首先使用地址栏参数，其次使用xdat[ctrlr],最后使用dom的属性
    需要具有scope.ctrlrName属性
    写入到$scope.args
     */
    _fns.getCtrlrXags = function(scope, element) {
        var res;
        if (scope) {
            if (!scope.xargs) scope.xargs = {};

            //提取dom传来的属性参数放到scope.args
            if (element) {
                var hargs = element.getParentAttr();
                for (var attr in hargs) {
                    scope.xargs[attr] = hargs[attr];
                };
            };

            //提取xdat的参数放到scope.args
            var xargs = _xdat[scope.ctrlrName] || {};
            for (var attr in xargs) {
                scope.xargs[attr] = xargs[attr];
            };

            //获取地址栏的参数放到scope.args
            var uargs = _fns.getUrlParams();
            for (var attr in uargs) {
                scope.xargs[attr] = uargs[attr];
            };

            res = scope.xargs;
        };
        return res;
    };



    /*根据地址栏跳转到指定控制器,实际是根据地址栏规则修改scope的属性
    规则##id#attr#url
     */
    _fns.changeCtrlrByHash = function() {

        //拆解地址栏hash
        var hasharr = unescape(window.location.hash).split('#');
        if (hasharr.length < 4) return false;

        //获取scope和url
        var id = hasharr[1].substr(1);
        var scope = _xdat.id2ctrlr[id];

        if (!scope) return false;

        var attr = hasharr[2];
        var url = hasharr[3];
        if (hasharr.length > 4) {
            url += hasharr.slice(4).join('#');
        } else if (!url || url == '') return false;

        var res = {
            scope: scope,
            attr: attr,
            url: url,
        };

        //兼容传递@ctrlrName
        if (url[0] == '@') {
            res.ctrlr = url;
            url = _fns.getCtrlrUrl(url.substr(1));
        };
        if (!url || url == '') return false;

        //刷新应用
        _fns.applyScope(scope, function() {
            scope[attr] = url;
        })
        return;
    };


    /*获取地址栏参数
     */
    _fns.getUrlParam = function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    /*获取地址栏全部参数
     */
    _fns.getUrlParams = function(url) {
        var res;
        url = (url) ? url : window.location.search;
        url = String(url);
        var parts = unescape(url).split('?');
        if (parts.length > 1) {
            var arr = parts[1].split('&');
            var args = {};
            arr.forEach(function(seg, i) {
                var segarr = seg.split('=');
                if (segarr.length > 1) {
                    args[segarr[0]] = segarr[1];
                };
            });
            res = args;
        };
        return res;
    };


    /*扩展$,获取父层的参数
    控制器用来获取由页面传来的参数，这些值都设定在模版父层<div ng-include='aa' name='jack'>，得到{ng-include:'aa',name:'jack'}
    */
    $.fn.getParentAttr = $getParentAttr;

    function $getParentAttr() {
        var res = {};
        var jo = this;
        if (jo && jo[0] && jo.parent()[0]) {
            var attrs = jo.parent()[0].attributes;
            for (var i = 0; i < attrs.length; i++) {
                var attr = attrs[i];
                res[attr.name] = attr.value;
            };
        };
        return res;
    };

    /*重新应用scope
     */
    _fns.applyScope = function(scope, fn) {
        if (scope && scope.$root && scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
            scope.$apply(fn);
        };
    };


    /*扩展JSON.safeParse*/
    JSON.safeParse = JSON.sparse = function(str) {
        try {
            return JSON.parse(str);
        } catch (err) {
            return undefined;
        };
    };




    /**
     * 上传到七牛存储，必须已经获得uploadtoken,最后的key必须与token匹配，如果没有key则使用随机文件名
     * @param   {str} token    已经获取的上传凭证
     * @param   {obj} file     需要上传的文件数据
     * @param   {fn} progress 上传过程中更新的函数,一个参数obj包含lengthComputable,total,loaded
     * @param   {fn} success  上传成功后的函数,三个参数,分别是返回信息(包含name,type,key),state('success'),xhr对象(带有file对象和domain)
     * @param   {fn} error    上传失败后的函数
     * @param   {fn} complete 上传完成后的函数
     * @param   {fn} domain   上传到哪个存储空间，默认mfile.xmgc360.com
     * @returns {xhr} 上传的xhr对象，带有file和domain属性
     */
    _fns.uploadFileQn2 = function(token, file, progress, success, error, complete, domain, key) {
        var useargs = (token.constructor != String);

        if (useargs) token = arguments.token;
        if (!token) {
            __errhdlr(new Error('_fns.uploadFileQn:token undefined.'))
            return;
        };

        if (useargs) file = arguments.file;
        if (!file) {
            __errhdlr(new Error('_fns.uploadFileQn:file undefined.'))
            return;
        };

        if (useargs) domain = arguments.domain || _cfg.qn.BucketDomain;

        //准备fromdata
        var formdata = new FormData();
        formdata.append('token', token);
        formdata.append('file', file);
        formdata.append('key', key);

        //发起上传
        var set = {
            url: "http://up.qiniu.com",
            data: formdata,
            type: 'POST',
            processData: false, //屏蔽掉ajax自动header处理
            contentType: false, //屏蔽掉ajax自动header处理
        };

        //监听事件
        if (useargs) progress = arguments.progress;
        if (progress) {
            set.xhr = function() {
                //为ajax添加progress事件监听
                var xhr = $.ajaxSettings.xhr();
                if (!xhr.file) xhr.file = file;
                xhr.upload.addEventListener("progress", progress, false);
                return xhr;
            };
        };

        //添加各种监听函数
        if (useargs) success = arguments.success;
        if (success) set.success = success;
        if (useargs) error = arguments.error;
        if (error) set.error = error;
        if (useargs) complete = arguments.complete;
        if (complete) set.complete = complete;

        var xhr = $.ajax(set);
        xhr.file = file;
        xhr.domain = domain;

        return xhr;
    };

    //根据key先获取指定token，然后上传
    _fns.uploadFileQn = function(key, file, progress, success, error, complete, domain) {
        var api = _cfg.qn.getUploadTokenApi;
        var dat = {
            fpath: key,
        };
        $.post(api, dat, function(res) {
            console.log('POST', api, dat, res);
            if (res.code == 1) {
                _fns.uploadFileQn2(res.data.uptoken, file, progress, success, error, complete, domain, res.data.path);
            } else {
                __errhdlr(Error('_fns.uploadFileQn2:get uploadtoken failed.'));
            }
        });
    };




    /*最基本的上传按钮
    progress(evt),//添加evt.percent
    successfn(res),//增加res.url
    返回一个uniqID，最终的xhr存储在_cfg.xhrs[uploadid][xhrid]，用于取消上传
    */
    _cfg.xhrs = {};

    /**
     * 上传一个或多个文件，指定目录版本
     * @param   {str} path      存储的路径，后无斜杠，不包含uid，例如 myapp/folder1
     * @param   {jquery对象} btnjo      点击的按钮对象，隐身ipt将跟在这个jo后面
     * @param   {function} beforefn 在发起上传之前执行的函数,fn(f,xhr)
     * @param   {function} progressfn 上传过程中的函数，fn(f,evt),上传百分比进度evt.percent
     * @param   {function} successfn  上传成功后执行的函数，fn(f,res)，上传的文件地址res.url
     * @param   {function} abortfn    取消上传后执行的函数
     * @param   {function} errorfn    出错执行的函数,fn(f,err)，标准xhr参数
     * @param   {function} completefn 上传完成执行的函数,fn(f,xhr,status),标准xhr参数
     * @param   {string} domain     上传到指定的bucket，默认http://pubfiles.10knet.com/
     * @param   {boolean} multi     同时上传多个文件
     * @returns {int} uploadId整数，指向一个数组包含所有文件的xhr，数组存放在_cfg.xhrs[uploadId]
     */
    _fns.uploadFile = function(path, btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain, multi) {
        if (!btnjo) {
            __errhdlr(new Error('_fns.uploadFile:button undefined.'));
            return;
        };

        //如果按钮已经有uploadid，那么直接使用，否则就重新创建
        var uploadId = btnjo.attr('uploadId') || _fns.uuid();
        btnjo.attr('uploadId', uploadId);
        if (!_cfg.xhrs[uploadId]) _cfg.xhrs[uploadId] = {};

        //创建file数据,隐身input放在btn之后
        var filejo = btnjo.siblings('#uploadFileInput');
        filejo.remove();
        filejo = $('<input id="uploadFileInput" type="file" style="display:none"></input>').appendTo(btnjo);
        if (multi) filejo.attr('multiple', "multiple");
        btnjo.after(filejo);

        //给file input添加监听
        filejo.bind('change', function() {
            var fileobjs = filejo.get(0).files;
            if (!domain) domain = _cfg.qn.BucketDomain;

            for (var i = 0; i < fileobjs.length; i++) {
                var f = fileobjs[i];

                //执行上传之前的动作,预先放置一个空的xhr，带有file信息
                var xhrid = _fns.uuid();
                var xhr = {};
                xhr.file = f;
                xhr.id = xhr.file.id = xhrid;
                _cfg.xhrs[uploadId][xhrid] = xhr;
                if (beforefn) beforefn(f, xhr);

                var fname = f.name;

                //开始上传
                xhr = _fns.uploadFileQn(path + '/' + fname, f,
                    function(evt) {
                        //添加evt.percent,为了避免abort之后progress会多运行一次，所以使用f.abort做判断
                        if (progressfn && !f.abort) {
                            if (evt.lengthComputable) {
                                evt.percent = (100 * evt.loaded / evt.total).toFixed(0);
                                f.percent = evt.percent;
                            };
                            progressfn(f, evt);
                        };
                    },
                    function(res) {
                        //把七牛的返回结果转为标准格式
                        res['success'] = true;
                        f.url = res.url = res['file_path'] = domain + res.key;
                        res['msg'] = 'upload ok.';
                        if (successfn) successfn(f, res);
                    },
                    function(f, err) {
                        if (errorfn) errorfn(f, err);
                    },
                    function(xhr, status) {
                        filejo.remove();
                        if (completefn) completefn(f, xhr, status);
                    }, domain);

                if (xhr && abortfn) xhr['abortfn'] = abortfn;
                if (xhr) xhr.id = xhrid;
                if (xhr) _cfg.xhrs[uploadId][xhrid] = xhr;
            }
        });

        //激活按钮点击事件
        filejo.click();

        return uploadId;
    };


    /**
     * 上传多个文件，与uploadFile单个文件相同
     * 指定目录版本
     */
    _fns.uploadFiles = function(btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain) {
        return _fns.uploadFile(btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain, true);
    };


    /**
     * 上传一个或多个文件，随机文件名版
     * @param   {jquery对象} btnjo      点击的按钮对象，隐身ipt将跟在这个jo后面
     * @param   {function} beforefn 在发起上传之前执行的函数,fn(f,xhr)
     * @param   {function} progressfn 上传过程中的函数，fn(f,evt),上传百分比进度evt.percent
     * @param   {function} successfn  上传成功后执行的函数，fn(f,res)，上传的文件地址res.url
     * @param   {function} abortfn    取消上传后执行的函数
     * @param   {function} errorfn    出错执行的函数,fn(f,err)，标准xhr参数
     * @param   {function} completefn 上传完成执行的函数,fn(f,xhr,status),标准xhr参数
     * @param   {string} domain     上传到指定的bucket，默认http://pubfiles.10knet.com/
     * @param   {boolean} multi     同时上传多个文件
     * @returns {int} uploadId整数，指向一个数组包含所有文件的xhr，数组存放在_cfg.xhrs[uploadId]
     */
    _fns.uploadFile2 = function(btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain, multi) {
        if (!btnjo) {
            __errhdlr(new Error('_fns.uploadFile:button undefined.'));
            return;
        };

        //如果按钮已经有uploadid，那么直接使用，否则就重新创建
        var uploadId = btnjo.attr('uploadId') || _fns.uuid();
        btnjo.attr('uploadId', uploadId);
        if (!_cfg.xhrs[uploadId]) _cfg.xhrs[uploadId] = {};

        //创建file数据,隐身input放在btn之后
        var filejo = btnjo.siblings('#uploadFileInput');
        filejo.remove();
        filejo = $('<input id="uploadFileInput" type="file" style="display:none"></input>').appendTo(btnjo);
        if (multi) filejo.attr('multiple', "multiple");
        btnjo.after(filejo);


        //给file input添加监听
        filejo.bind('change', function() {
            var fileobjs = filejo.get(0).files;
            if (!domain) domain = _cfg.qn.BucketDomain;

            //获取随机文件名token
            $.get(_cfg.qn.getUploadTokenApi2, function(res) {
                for (var i = 0; i < fileobjs.length; i++) {
                    var f = fileobjs[i];

                    //执行上传之前的动作,预先放置一个空的xhr，带有file信息
                    var xhrid = _fns.uuid();
                    var xhr = {};
                    xhr.file = f;
                    xhr.id = xhr.file.id = xhrid;
                    _cfg.xhrs[uploadId][xhrid] = xhr;
                    if (beforefn) beforefn(f, xhr);

                    //开始上传
                    xhr = _fns.uploadFileQn(res.uptoken, f,
                        function(evt) {
                            //添加evt.percent,为了避免abort之后progress会多运行一次，所以使用f.abort做判断
                            if (progressfn && !f.abort) {
                                if (evt.lengthComputable) {
                                    evt.percent = (100 * evt.loaded / evt.total).toFixed(0);
                                    f.percent = evt.percent;
                                };
                                progressfn(f, evt);
                            };
                        },
                        function(res) {
                            //把七牛的返回结果转为标准格式
                            res['success'] = true;
                            f.url = res.url = res['file_path'] = domain + res.key;
                            res['msg'] = 'upload ok.';
                            if (successfn) successfn(f, res);
                        },
                        function(f, err) {
                            if (errorfn) errorfn(f, err);
                        },
                        function(xhr, status) {
                            filejo.remove();
                            if (completefn) completefn(f, xhr, status);
                        }, domain);

                    if (xhr && abortfn) xhr['abortfn'] = abortfn;
                    xhr.id = xhrid;
                    if (xhr) _cfg.xhrs[uploadId][xhrid] = xhr;
                }
            });
        });

        //激活按钮点击事件
        filejo.click();

        return uploadId;
    };


    /**
     * 上传多个文件，与uploadFile单个文件相同
     * 随机文件名版本
     */
    _fns.uploadFiles2 = function(btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain) {
        return _fns.uploadFile2(btnjo, beforefn, progressfn, successfn, abortfn, errorfn, completefn, domain, true);
    };


    /**
     * 取消上传，同时适用指定文件名版本和随机文件名版本
     * @param {int} xhrid 最终xhr将存放在_cfg.xhrs[xhrid]
     */
    _fns.abortUpload = function(xhrid) {
        for (var upid in _cfg.xhrs) {
            var ups = _cfg.xhrs[upid];
            for (var xid in ups) {
                var xhr = ups[xid];
                xhr.file.abort = true;
                xhr.abort();
                delete ups[xid];
                if (xhr.abortfn) xhr.abortfn(xhr.file);
            }
        };
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



    /*创建唯一的id
     */
    _fns.uuid = function uniqueId(prefix) {
        var ts = Number(new Date()).toString(36)
        var rd = Number(String(Math.random()).replace('.', '')).toString(36);
        var res = ts + '-' + rd;
        if (prefix) res = prefix + '-' + res;
        return res;
    };





    //获取目录地址的文件名
    _fns.getFileName = function(url) {
        return url.substring(url.lastIndexOf('/') + 1);
    };

    //获取目录地址的文扩展名
    _fns.getFileExt = function(url) {
        return url.substring(url.lastIndexOf('.') + 1);
    };


    /*自动运行的函数*/
    _fns.autoStartPage();

    //end
})();


//全局变量
/*专用err处理函数,适合co().then()使用*/
function __errhdlr(err) {
    console.xerr(err.stack);
};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
function __nullhdlr(res) {};

/*专用空函数，只输出不做额外处理,适合co().then()使用*/
function __infohdlr(res) {
    console.xinfo(res);
};

/*专用空函数，只纪录日志不做额外处理,适合co().then()使用*/
function __loghdlr(res) {
    console.xlog(res);
};
