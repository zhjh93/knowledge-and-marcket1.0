/*http路由分发
接口模式server/:app/:api
*/

var _rotr = {};

//http请求的路由控制
_rotr = new $router();

//访问的请求
_rotr.get('api', '/api/:apiname', apihandler);
_rotr.post('api', '/api/:apiname', apihandler);

/*所有api处理函数都收集到这里
必须是返回promise
各个api处理函数用promise衔接,return传递ctx
*/
_rotr.apis = {};

/*处理Api请求
默认tenk的api直接使用
每个app的独立api格式appname_apiname
*/
function * apihandler(next) {
    var ctx = this;
    var apinm = ctx.params.apiname;

    console.log('API RECV:', apinm);

    //匹配到路由函数,路由函数异常自动返回错误,创建xdat用来传递共享数据
    var apifn = _rotr.apis[apinm];
    ctx.xdat = {
        apiName: apinm
    };

    if (apifn && apifn.constructor == Function) {
        yield apifn.call(ctx, next).then(function() {

            //所有接口都支持JSONP,限定xx.x.xmgc360.com域名
            var jsonpCallback = ctx.query.callback || ctx.request.body.callback;
            if (jsonpCallback && ctx.body) {
                if (_cfg.regx.crossDomains.test(ctx.hostname)) {
                    ctx.body = ctx.query.callback + '(' + JSON.stringify(ctx.body) + ')';
                };
            };

        }, function(err) {
            ctx.body = __newMsg(__errCode.APIERR, [err.message, 'API proc failed:' + apinm + '.']);
            __errhdlr(err);
        });
    } else {
        ctx.body = __newMsg(__errCode.NOTFOUND, ['服务端找不到接口程序', 'API miss:' + apinm + '.']);
    };

    yield next;
};

/*测试接口,返回请求的数据
 */
//大家都在学
_rotr.apis.allstudy= function() {
    var ctx = this;
    var co = $co(function * () {
        //var userId=yield _fns.getUidByLogin(ctx);
        //var userName=ctx.query.userName||ctx.request.body.userName;
        //var sqlstr = "select UserId,UserName from UserInfo where UserId="+userId+" and UserName='"+userName+"'";
        //var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        //if (rows.length==0){
            var sqlstr="select * from CourseDetail c inner join (select CourseId,count(*) as count from BuyRecord group by CourseId order by count(*) desc) as b on c.CourseID=b.CourseId;";
            var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        //}
        ctx.body = rows;
        console.log(rows);
        return ctx;
    });
    return co;
};
_rotr.apis.test = function() {
    var ctx = this;
    var co = $co(function * () {

        var resdat = {
            query: ctx.query.nick,
            body: ctx.body,
        };

        ctx.body = __newMsg(1, 'ok', resdat);
        return ctx;
    });
    return co;
};
//个人中心头像与昵称显示
_rotr.apis.personCenter = function(){
    var ctx = this;
    var co = $co(function * () {

        var userId = ctx.query.id || ctx.request.body.id;
        var userName=ctx.query.nick || ctx.request.body.nick;
        console.log("测试id",userId);
        console.log(">>>nick",userName);
        var dat={};
        var sqlstr="select * from UserInfo where UserId="+userId+" and UserName='"+userName+"'";
        var rows = yield _ctnu([_mysql.conn,'query'],sqlstr);
        if (rows.length==0){
            var sqlstr2="call addUserInfo('"+userId+"','"+userName+"')";
            var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        console.log('返回数据',rows.length);
        dat.Usr = rows[0];
        ctx.body = dat;
        return ctx;
    });
    return co;
};
//申请卖家信息自动获取
_rotr.apis.applyInfo = function(){
    var ctx = this;
    var co = $co(function * () {

        var userId = ctx.query.nick || ctx.request.body.nick;
        var userPhone=ctx.query.phone || ctx.request.body.phone;
        console.log("测试id",userId);
        console.log(">>>phone",userPhone);
        var dat={
            userId:userId,
            userPhone,userPhone,
        };


        ctx.body = dat;
        return ctx;
    });
    return co;
};
//个人中心我的收藏
_rotr.apis.personCenterList1 = function(){
    var ctx = this;
    var co = $co(function * () {


        var userId = ctx.query.id || ctx.request.body.id;
        console.log(">>>id",userId);
        //var dat={};
        var collectsql="select * from Collection,CourseDetail where CourseDetail.CourseID=Collection.CourseId and UserId=("+userId+")";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//个人中心我的课程
_rotr.apis.personCenterList2 = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId = ctx.query.id || ctx.request.body.id;
        console.log(">>>id",userId);
        //var dat={};
        var collectsql="select * from BuyRecord,CourseDetail where CourseDetail.CourseID=BuyRecord.CourseId and UserId=("+userId+")";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//个人中心我的优惠券
_rotr.apis.onsale = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId = ctx.query.id || ctx.request.body.id;
        console.log(">>>id",userId);
        //var dat={};
        var collectsql="select * from Couton where UserId=("+userId+")";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//课程详情目录
_rotr.apis.detail = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>CourseId",CourseId);
        //var dat={};
        var collectsql="select * from CourseEach where CourseID=" + courseId;
        console.log('sql:' + collectsql);
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//视频连接
_rotr.apis.video = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>CourseId",CourseId);
        //var dat={};
        var collectsql="select * from CourseEach where CourseID= " + courseId;
        console.log('sql:' + collectsql);
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//课程详情课程简介
_rotr.apis.detailbrief = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>CourseId",CourseId);
        //var dat={};
        var collectsql="select Coursebrief from CourseDetail where CourseID=" + courseId;
        console.log('sql:' + collectsql);
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        console.log(ctx.body);
        return ctx;
    });
    return co;
};
//课程详情课程名称
_rotr.apis.detailname = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>CourseId",courseId);
        //var dat={};
        var collectsql="select * from CourseDetail where CourseID=" + courseId;
        console.log('sql:' + collectsql);
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//课程详情在学人数
_rotr.apis.detailstudynum = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>CourseId",courseId);
        //var dat={};
        var collectsql="select count(*) as count from BuyRecord where CourseId=" + courseId;
        console.log('sql:' + collectsql);
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        console.log(">>>count",ctx.body);
        return ctx;
    });
    return co;
};
//课程详情课程评论
_rotr.apis.detailpl = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseId = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>id",userId);
        //var dat={};
        var collectsql="select * from Reviews,UserInfo where UserInfo.UserId=Reviews.UserId and Reviews.CourseId="+courseId;
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//课程列表
_rotr.apis.select = function(){
    var ctx = this;
    var co = $co(function * () {
        var data = ctx.query.data || ctx.request.body.data;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail where CourseclassifyDetail='"+data+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
_rotr.apis.selectlow = function(){
    var ctx = this;
    var co = $co(function * () {
        var data = ctx.query.data || ctx.request.body.data;
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail where CourseclassifyDetail='"+data+"' order by CoursePrice asc;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
_rotr.apis.selecthigh = function(){
    var ctx = this;
    var co = $co(function * () {
        var data = ctx.query.data || ctx.request.body.data;
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail where CourseclassifyDetail='"+data+"' order by CoursePrice desc;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
_rotr.apis.selectmore = function(){

    var ctx = this;
    var co = $co(function * () {
        var data = ctx.query.data || ctx.request.body.data;
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail where CourseclassifyDetail='"+data+"' order by CourseTimes desc;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
_rotr.apis.selectlittle = function(){
    var ctx = this;
    var co = $co(function * () {
        var data = ctx.query.data || ctx.request.body.data;
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail where CourseclassifyDetail='"+data+"' order by CourseTimes asc;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//自动将用户名称记录到数据库
_rotr.apis.adduInfo= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByLogin(ctx);
        var userName=ctx.query.userName||ctx.request.body.userName;
        var sqlstr = "select UserId,UserName from UserInfo where UserId="+userId+" and UserName='"+userName+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2="call addUser("+userId+",'"+userName+"')";
            var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程详情收藏操作
_rotr.apis.detailcollect= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
        var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
        var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
       }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.detailcollect1= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程列表收藏操作
_rotr.apis.selectcollect= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.selectcollecthigh= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.selectcollectlow= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.selectcollectlittle= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.selectcollectmore= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from Collection where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert Collection (CourseId,UserId) values("+courseId +","+userId+")";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程详情立即购买操作
_rotr.apis.detailbuy= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select UserId,CourseId from BuyRecord where UserId="+userId+" and CourseId='"+courseId+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if (rows.length==0){
            var sqlstr2 = "insert BuyRecord (CourseId,UserId,ProductState) values("+courseId +","+userId+",0)";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        }
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//首页限时优惠
_rotr.apis.indexlimit = function(){
    var ctx = this;
    var co = $co(function * () {
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail,CourseInfo where CourseDetail.CourseID=CourseInfo.CourseId and CourseState='限时优惠';";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//首页精品推荐
_rotr.apis.indexwell = function(){
    var ctx = this;
    var co = $co(function * () {
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail,CourseInfo where CourseDetail.CourseID=CourseInfo.CourseId and CourseState='精品推荐';";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//首页即将开课
_rotr.apis.indexopen = function(){
    var ctx = this;
    var co = $co(function * () {
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from CourseDetail,CourseInfo where CourseDetail.CourseID=CourseInfo.CourseId and CourseState='即将开课';";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//提交评论
_rotr.apis.review= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var courseId=ctx.query.dat||ctx.request.body.dat;
        var text=ctx.query.review||ctx.request.body.review;
        console.log(">>>dat",courseId);
        console.log(">>>text",text);
        var sqlstr = "insert Reviews(CourseId,UserId,ReviewContent) values("+courseId+","+userId+",'"+text+"')";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        //if (rows.length==0){
        //    var sqlstr2 = "insert BuyRecord (CourseId,UserId) values("+courseId +","+userId+")";
        //    var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        //}
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//提交卖家申请
_rotr.apis.apply= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var applyname=ctx.query.applyname||ctx.request.body.applyname;
        var applyIdnumber=ctx.query.applyIdnumber||ctx.request.body.applyIdnumber;
        var applyUserTel=ctx.query.applyUserTel||ctx.request.body.applyUserTel;
        var applyshoukuan=ctx.query.applyshoukuan||ctx.request.body.applyshoukuan;
        console.log(">>>applyIdnumber",applyIdnumber);
        //console.log(">>>text",text);
        if(applyIdnumber!=null&&applyUserTel!=null&&applyshoukuan!=null){
            var sqlstr = "insert applyInfo(UserId,UserName,IDnum,contactnum,gathernum,applyState) values("+userId+",'"+applyname+"','"+applyIdnumber+"','"+applyUserTel+"','"+applyshoukuan+"',0)";
            var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        }

        //if (rows.length==0){
        //    var sqlstr2 = "insert BuyRecord (CourseId,UserId) values("+courseId +","+userId+")";
        //    var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        //}
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//提交商品申请
_rotr.apis.push= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var pushcoursename=ctx.query.pushcoursename||ctx.request.body.pushcoursename;
        var pushcoursetimes=ctx.query.pushcoursetimes||ctx.request.body.pushcoursetimes;
        var pushcourseprice=ctx.query.pushcourseprice||ctx.request.body.pushcourseprice;
        var pushbrief=ctx.query.pushbrief||ctx.request.body.pushbrief;
        var pushselA=ctx.query.pushselA||ctx.request.body.pushselA;
        var pushselB=ctx.query.pushselB||ctx.request.body.pushselB;
        var pushpicture=ctx.query.pushpicture||ctx.request.body.pushpicture;
        var muluTime=ctx.query.muluTime||ctx.request.body.muluTime;
        var muluName=ctx.query.muluName||ctx.request.body.muluName;
        var muluUrl=ctx.query.muluUrl||ctx.request.body.muluUrl;
        var Time=new Array();
        var Name=new Array();
        var Url=new Array();
        var Time=muluTime.split(",");
        var Name=muluName.split(",");
        var Url=muluUrl.split(",");
        //console.log(Name);
        //console.log(">>>applyIdnumber",applyIdnumber);
        //console.log(">>>text",text);
        var sqlstr = "select * from applyCourse where CourseName='"+pushcoursename+"'";
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        if(rows.length==0){
            var sqlstr1 = "insert applyCourse(CourseName,CourseTimes,CoursePrice,Coursebrief,Courseclassify,CourseclassifyDetail,CourseImgURL,UserId,State) values('"+pushcoursename+"','"+pushcoursetimes+"','￥"+pushcourseprice+"','"+pushbrief+"','"+pushselA+"','"+pushselB+"','"+pushpicture+"','"+userId+"',0)";
            var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr1);

            for(var i=1;i<Time.length;i++){
                console.log(">>>Time",Time);
                var sqlstr3="insert applyCourseEach(CourseName,CourseEachName,CourseEachTime,CourseEachURL) values('"+pushcoursename+"','"+Name[i]+"','"+Time[i]+"','"+Url[i]+"')";
                var rows3 = yield _ctnu([_mysql.conn, 'query'], sqlstr3);
                console.log("hello");
            }


        }
        //if (rows.length==0){
        //    var sqlstr2 = "insert BuyRecord (CourseId,UserId) values("+courseId +","+userId+")";
        //    var rows1 = yield _ctnu([_mysql.conn, 'query'], sqlstr2);
        //}
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//卖家中心我的商品
_rotr.apis.sellcourse = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var dat={};
        var collectsql="select * from (select * from applyCourse where  state=1 and UserId='"+userId+"') c,(select count(*) as count,CourseId from BuyRecord group by CourseId) a,(select CourseID,CourseName from CourseDetail) b where a.CourseId=b.CourseID and c.CourseName=b.CourseName;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//卖家中心待审核课程
_rotr.apis.applysellcourse = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var dat={};
        var collectsql="select * from applyCourse where state=0 and UserId='"+userId+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//管理员页面身份审核
_rotr.apis.manageR1 = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var dat={};
        var collectsql="select * from applyInfo where applyState=0";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//身份申请审核通过
_rotr.apis.manageR1accept = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var ideid=ctx.query.ideid||ctx.request.body.ideid;
        var ideid1=ctx.query.ideid1||ctx.request.body.ideid1;
        var idename=ctx.query.idename||ctx.request.body.idename;
        var idenum=ctx.query.idenum||ctx.request.body.idenum;
        var iderelation=ctx.query.iderelation||ctx.request.body.iderelation;
        var idepay=ctx.query.idepay||ctx.request.body.idepay;
        //var dat={};
        var sqlstr="update applyInfo set applyState=1 where UserapplyId='"+ideid1+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        var sqlstr1="insert bossUser(UserId,IDnum,contactnum,gathernum) values('"+ideid+"','"+idenum+"','"+iderelation+"','"+idepay+"')";
        var rows1=yield _ctnu([_mysql.conn,'query'],sqlstr1);
        var sqlstr2="insert information(UserId,informationtext,informationstate) values('"+ideid+"','恭喜你，成为卖家申请审核已通过，快去上传自己的课程吧！',0)";
        var rows2=yield _ctnu([_mysql.conn,'query'],sqlstr2);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//身份申请拒绝
_rotr.apis.manageR1refuse = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var ideid=ctx.query.ideid||ctx.request.body.ideid;
        var ideid1=ctx.query.ideid1||ctx.request.body.ideid1;
        var idename=ctx.query.idename||ctx.request.body.idename;
        var idenum=ctx.query.idenum||ctx.request.body.idenum;
        var iderelation=ctx.query.iderelation||ctx.request.body.iderelation;
        var idepay=ctx.query.idepay||ctx.request.body.idepay;
        //var dat={};
        var sqlstr="update applyInfo set applyState=2 where UserapplyId='"+ideid1+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        var sqlstr2="insert information (UserId,informationtext,informationstate) values('"+ideid+"','很遗憾，成为卖家申请审核已拒绝，如有疑问请联系管理员！',0)";
        var rows2=yield _ctnu([_mysql.conn,'query'],sqlstr2);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程审核第一步
_rotr.apis.manageR2 = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var dat={};
        var sqlstr="select CourseapplyId,UserId,CourseName from applyCourse where state=0";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程申请第二步
_rotr.apis.manageR21 = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var id=ctx.query.id||ctx.request.body.id;
        console.log(">>>id",id);
        //var dat={};
        var sqlstr="select * from UserInfo,applyCourse where UserInfo.UserId=applyCourse.UserId and applyCourse.CourseapplyId='"+id+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        console.log(rows);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//课程申请详细目录
_rotr.apis.manageR211 = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var name=ctx.query.name||ctx.request.body.name;
        console.log(">>>name",name);
        //var dat={};
        var sqlstr="select * from applyCourseEach where CourseName='"+name+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);

        //dat.Usr = writelist;

        ctx.body = rows;
        return ctx;
    });
    return co;
};
//购物车
_rotr.apis.shopping = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var CatArr=ctx.query.CatArr||ctx.request.body.CatArr;
        console.log(CatArr);
        //var Cat=new Array();
        //var Cat=CatArr.split(",");

        //var dat={};
        var U=new Array();
        for(var i=0;i<CatArr.length;i++){

            console.log(">>>CatArr",CatArr[i]);

            //console.log(">>>Time",Time);
            var sqlstr="select * from CourseDetail where CourseID='"+CatArr[i]+"'";
            var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);

             U[i]=rows;

        }
        //console.log(writelist);
        //dat.Usr = writelist;
        console.log(U);
        ctx.body =U;
        return ctx;
        //console.log(ctx)

    });
    return co;
};
//拒绝课程申请
_rotr.apis.stopapply = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var userid=ctx.query.userid||ctx.request.body.userid;
        var tablecoursename=ctx.query.tablecoursename||ctx.request.body.tablecoursename;
        //var dat={};
        var sqlstr="update applyCourse set State=2 where CourseName='"+tablecoursename+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        var sqlstr2="insert information (UserId,informationtext,informationstate) values('"+userid+"','很遗憾，您提交的课程申请审核已拒绝，如有疑问请联系管理员！',0)";
        var rows2=yield _ctnu([_mysql.conn,'query'],sqlstr2);
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//同意课程申请
_rotr.apis.passapply = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        var userid=ctx.query.userid||ctx.request.body.userid;
        var tablename=ctx.query.tablename||ctx.request.body.tablename;
        var tabletimes=ctx.query.tabletimes||ctx.request.body.tabletimes;
        var tablecoursename=ctx.query.tablecoursename||ctx.request.body.tablecoursename;
        var tablecourseclassify=ctx.query.tablecourseclassify||ctx.request.body.tablecourseclassify;
        var tablecourseclassifydetail=ctx.query.tablecourseclassifydetail||ctx.request.body.tablecourseclassifydetail;
        var tablebrief=ctx.query.tablebrief||ctx.request.body.tablebrief;
        var tableprice=ctx.query.tableprice||ctx.request.body.tableprice;
        var tableimg=ctx.query.tableimg||ctx.request.body.tableimg;
        var tableTime=ctx.query.tableTime||ctx.request.body.tableTime;
        var tableName=ctx.query.tableName||ctx.request.body.tableName;
        var tableUrl=ctx.query.tableUrl||ctx.request.body.tableUrl;
        var Time=new Array();
        var Name=new Array();
        var Url=new Array();
        var Time=tableTime.split(",");
        var Name=tableName.split(",");
        var Url=tableUrl.split(",");
        //var dat={};
        var sqlstr="update applyCourse set State=1 where CourseName='"+tablecoursename+"'";
        var rows=yield _ctnu([_mysql.conn,'query'],sqlstr);
        var sqlstr1="insert CourseDetail(CourseImgURL,CourseName,CoursePrice,CourseTimes,Courseclassify,CourseclassifyDetail,Coursebrief) values('"+tableimg+"','"+tablecoursename+"','"+tableprice+"','"+tabletimes+"','"+tablecourseclassify+"','"+tablecourseclassifydetail+"','"+tablebrief+"')";
        var rows1=yield _ctnu([_mysql.conn,'query'],sqlstr1);
        var sqlstr2="insert information(UserId,informationtext,informationstate) values('"+userid+"','恭喜你，提交的课程申请审核已通过，已经上架出售！',0)";
        var rows2=yield _ctnu([_mysql.conn,'query'],sqlstr2);
        var sqlstr3="select CourseID from CourseDetail where CourseName='"+tablecoursename+"'";
        var rows3=yield _ctnu([_mysql.conn,'query'],sqlstr3);
        console.log(rows3);
        for(var i=1;i<Time.length;i++){
            console.log(">>>Time",Time);
            var sqlstr4="insert applyCourseEach(CourseID,CourseEachName,CourseEachTime,CourseEachURL) values('"+rows3+"','"+Name[i]+"','"+Time[i]+"','"+Url[i]+"')";
            var rows4 = yield _ctnu([_mysql.conn, 'query'], sqlstr4);
            console.log("hello");
        }
        //console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//卖家付款
_rotr.apis.manageR3 = function(){
    var ctx = this;
    var co = $co(function * () {
        //var userId = ctx.query.id || ctx.request.body.id;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from (select CourseID,CourseName from CourseDetail) a,(select count(*) as count,CourseId from BuyRecord where ProductState=0 group by CourseId) b,(select CourseName,CoursePrice,UserId from applyCourse where State=1) c,(select UserId,gathernum from applyInfo where applyState=1) d where a.CourseID=b.CourseId and a.CourseName=c.CourseName and c.UserId=d.UserId;";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//卖家付款确认
_rotr.apis.manageR31 = function(){
    var ctx = this;
    var co = $co(function * () {
        var courseid = ctx.query.courseid || ctx.request.body.courseid;
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="update Buyrecord set ProductState=1 where CourseId='"+courseid+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//个人中心消息数量
_rotr.apis.informationnum = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select count(*) as count from information where informationstate=0 and UserId='"+userId+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//个人中心卖家申请权限
_rotr.apis.bossapply = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from applyInfo where (applyState=1 or applyState=0) and UserId='"+userId+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//个人中心卖家中心权限
_rotr.apis.bosscenter = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from bossUser where UserId='"+userId+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(collectsql);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//管理员入口权限
_rotr.apis.manage = function(){
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //console.log(">>>id",userId);
        ////var dat={};
        var collectsql="select * from manageUser where UserId='"+userId+"'";
        var writelist=yield _ctnu([_mysql.conn,'query'],collectsql);
        console.log(writelist);
        //dat.Usr = writelist;
        ctx.body = writelist;
        return ctx;
    });
    return co;
};
//未读消息
_rotr.apis.read_no= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select * from information where informationstate=0 and UserId="+userId;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//已读消息
_rotr.apis.read_yes= function() {
    var ctx = this;
    var co = $co(function * () {
        var userId=yield _fns.getUidByCtx(ctx);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "select * from information where informationstate=1 and UserId="+userId;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//标为未读
_rotr.apis.changeno= function() {
    var ctx = this;
    var co = $co(function * () {
        var changeno=ctx.query.changeno||ctx.request.body.changeno;
        console.log("消息ID",changeno);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "update information set informationstate=0 where informationId="+changeno;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//标为已读
_rotr.apis.changeyes= function() {
    var ctx = this;
    var co = $co(function * () {
        var changeyes=ctx.query.changeyes||ctx.request.body.changeyes;
        console.log("消息ID",changeyes);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "update information set informationstate=1 where informationId="+changeyes;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        console.log(sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//删除已读消息
_rotr.apis.yesdelete= function() {
    var ctx = this;
    var co = $co(function * () {
        var yesdelete=ctx.query.yesdelete||ctx.request.body.yesdelete;
        console.log("消息ID",yesdelete);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "update information set informationstate=3 where informationId="+yesdelete;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
//删除未读消息
_rotr.apis.nodelete= function() {
    var ctx = this;
    var co = $co(function * () {
        var nodelete=ctx.query.nodelete||ctx.request.body.nodelete;
        console.log("消息ID",nodelete);
        //var courseId=ctx.query.courseid||ctx.request.body.courseid;
        var sqlstr = "update information set informationstate=3 where informationId="+nodelete;
        var rows = yield _ctnu([_mysql.conn, 'query'], sqlstr);
        ctx.body = rows;
        return ctx;
    });
    return co;
};
_rotr.apis.login = function() {
    var ctx = this;
    var co = $co(function * () {
        var res = yield _fns.getUidByLogin(ctx);
        //返回结果
        ctx.body = res;
        return ctx;
    });
    return co;
};
module.exports = _rotr;
