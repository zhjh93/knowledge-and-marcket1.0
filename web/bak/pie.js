/*这个脚本将激活页面的编辑模式
创建更大的 bigbody ，然后在内部创建 piediter ;

把原来的页面 body 放到 bigbody 内部 piediter 右侧；
把全页面的代码放到 piediter 里面可以进行编辑；

piediter 可以直接修改全页面代码，也可以只是往里面添加 js 片段；
如果页面属于 pie 站点， piediter 可以另存修改后的代码；
*/

'use strict';

var _PIEJS = {};

console.log('pie.js is loading.');

//提供通用函数--------------------------------------------------
(function() {

    //依赖的js库，jquery除外
    _PIEJS.reqlibs = [{
        url: '//cdn.bootcss.com/bootstrap/3.3.6/css/bootstrap.min.css',
        regx: /bootstrap[\.min]*\.css/,
        type: 'css',
    }, {
        url: '//cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js',
        regx: /bootstrap[\.min]*\.js/,
        type: 'js',
    }, {
        url: '//cdn.bootcss.com/codemirror/5.17.0/codemirror.min.css',
        regx: /codemirror[\.min]*\.css/,
        type: 'css',
    }, {
        url: '//cdn.bootcss.com/codemirror/5.17.0/codemirror.min.js',
        regx: /codemirror[\.min]*\.js/,
        type: 'js',
    }, {
        url: '//cdn.bootcss.com/codemirror/5.17.0/mode/javascript/javascript.min.js',
        regx: /codemirror[\.]*javascript[\.min]*\.js/,
        type: 'js',
    }];





    /**
     * 载入脚本文件，自动根据test(dom)函数进行检测
     * 载入后自动运行
     * @param {str} url  脚本文件地址
     * @param {str} regx 脚本文件地址正则表达式检测
     * @returns {dat} 返回promise,参数为读取的数据
     */
    _PIEJS.loadJs = function(url, regx) {
        return new Promise(function(resolve, reject) {

            //搜索全局并根据src字段检测
            var hasload = false;
            if (regx && ((regx instanceof RegExp) || (typeof regx == 'string')) && regx == '') {
                $('script').each(function(i, item) {
                    var src = item.attr('src');
                    if (src && regx.test(src)) {
                        hasload = true;
                    };
                });
            };
            if (hasload) throw Error('_PIEJS.loadJs:ALREADY EXISTS:' + url);

            //载入脚本文件
            $.ajax({
                url: url,
                dataType: "script",
                success: function(dat) {
                    resolve(dat);
                },
                error: function(xhr, msg, err) {
                    reject([xhr, msg, err]);
                },
            });
        });
    };


    /**
     * 载入css文件，自动根据test(dom)函数进行检测
     * 载入后自动添加到dom标签
     * @param {str} url  脚本文件地址
     * @param {str} regx 脚本文件地址正则表达式检测
     * @returns {jo} 返回promise,参数为jo节点
     */
    _PIEJS.loadCss = function(url, regx) {
        return new Promise(function(resolve, reject) {

            //搜索全局并根据href字段检测
            var hasload = false;
            if (regx && ((regx instanceof RegExp) || (typeof regx == 'string')) && regx == '') {
                $('link').each(function(i, item) {
                    var href = item.attr('href');
                    if (href && regx.test(href)) {
                        hasload = true;
                    };
                });
            };
            if (hasload) throw Error('_PIEJS.loadCss:ALREADY EXISTS:' + url);

            //创建jo标签并且添加到PIELIBS
            var jo = $('<style></style>').appendTo($('head'));

            //载入css文件，并直接填充到#PIELIBS
            jo.load(url, function(dat, status, txt) {
                if (!dat) {
                    reject([dat, status, txt]);
                } else {
                    resolve(dat);
                }
            });

        });
    };



    //end
})();



//初始化设置--------------------------------------------------
(function() {

    /*初始化,会在页面加载都完成后被调用
     这个时候jquery和bootstrap已经就绪
     重新布局页面，添加piediter
     */
    _PIEJS.init = function() {

        //重新组织页面层次
        var jo_doc = $('html') || $(document);
        var jo_bigbody = $('<bigbody></bigbody>').appendTo(jo_doc);
        var jo_pieditor = $('<pieditor>PIEDITER</pieditor>').appendTo(jo_bigbody);
        var jo_body = $('body').appendTo(jo_bigbody);

        //变量设置
        var editorSize = 38.2;

        //调整为flex样式布局
        jo_doc.css({
            'height': '100%'
        });
        jo_bigbody.css({
            'background': '#000',
            'display': 'flex',
            'flex-direction': 'row',
            'position': 'fixed',
            'height': '100%',
            'width': '100%',
        });
        jo_pieditor.css({
            'background': '#AAA',
            'display': 'flex',
            'flex-basis': editorSize + '%',
            'overflow-y': 'auto',
        });
        jo_body.css({
            'background': '#FFF',
            'display': 'flex',
            'flex-basis': (100 - editorSize) + '%',
            'overflow-y': 'auto',
        });

        //调整bs可见性visible


        //向pieditor加载codemirror


        //返回promise以便后续
        return new Promise(function(resolve, reject) {
            resolve();
        });
    };
    //end
})();




//逐个载入必备的脚本和样式，然后启动初始化函数----------------------------------------
(function() {
    //先加载jquery,全部完成后加载其他文件
    window.jQuery || document.write('<script src="//cdn.bootcss.com/jquery/2.2.4/jquery.min.js"><\/script>');

    //自动载入函数
    var libs = _PIEJS.reqlibs;
    var libid = 1;

    function loadlib() {
        libid++;
        if (libid >= libs.length) return new Promise(function(resolve, reject) {
            resolve();
        });
        var lib = libs[libid];
        if (lib.type == 'css') {
            return _PIEJS.loadCss(lib.url, lib.regx);
        } else if (lib.type == 'js') {
            return _PIEJS.loadJs(lib.url, lib.regx);
        };
    };

    window.addEventListener('load', function() {
        //逐个加载
        var promise = _PIEJS.loadCss(libs[0].url, libs[0].regx)
            .then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                return loadlib();
            }).then(function() {
                _PIEJS.init();
            }).then(function() {
                console.log('pie.js init ok!');
            }).catch(function(err) {
                console.log('pie.js init failed:', err);
            });
    })
})();




//end









//end
