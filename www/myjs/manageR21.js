
$(document).ready(function(){

    //alert("hello");
$("#passapply").click(function(){
    //alert("hello!");
    var userid=$("#tableid").html();
    var tablename=$("#tablename").html();
    var tabletimes=$("#tabletimes").html();
    var tablecoursename=$("#tablecoursename").html();
    var tablecourseclassify=$("#tablecourseclassify").html();
    var tablecourseclassifydetail=$("#tablecourseclassifydetail").html();
    var tablebrief=$("#tablebrief").html();
    var tableprice=$("#tableprice").html();
    var tableimg=$("#tableimg").attr('src');
    var tableTime='';
    var tableName='';
    var tableUrl='';
    $('#retabledetail').each(function () {
        //alert($(this).html);
        var tablename = $(this).children().find('#tabledetailname').html();
        var tabletime = $(this).children().find('#tabledetaillong').html();
        var tableurl = $(this).children().find('#tablevideoview').attr('src');
        tableTime =tableTime+ ',' + tabletime.toString();
        tableName =tableName+ ',' + tablename.toString();
        tableUrl=tableUrl+',' + tableurl.toString();

        //alert(tableurl);
    });
    data={
        userid:userid,
        tablename:tablename,
        tabletimes:tabletimes,
        tablecoursename:tablecoursename,
        tablecourseclassify:tablecourseclassify,
        tablecourseclassifydetail:tablecourseclassifydetail,
        tablebrief:tablebrief,
        tableprice:tableprice,
        tableimg:tableimg,
        tableTime:tableTime,
        tableName:tableName,
        tableUrl:tableUrl,

    }
    $.post('../api/passapply',data,function(){

    })
    alert("同意消息已发送到用户信箱");
})
    $("#stopapply").click(function(){
        alert("hello");
        var userid=$("#tableid").html();
        var tablename=$("#tablename").html();
        var tabletimes=$("#tabletimes").html();
        var tablecoursename=$("#tablecoursename").html();
        var tablecourseclassify=$("#tablecourseclassify").html();
        var tablecourseclassifydetail=$("#tablecourseclassifydetail").html();
        var tablebrief=$("#tablebrief").html();
        var tableprice=$("#tableprice").html();
        var tableimg=$("#tableimg").html();
        var tableTime='';
        var tableName='';
        var tableUrl='';
        $('#retabledetail').each(function () {
            //alert($(this).html);
            var tablename = $(this).children().find('#tabledetailname').html();
            var tabletime = $(this).children().find('#tabledetaillong').html();
            var tableurl = $(this).children().find('#tablevideoview').attr('src');
            tableTime =tableTime+ ',' + tabletime.toString();
            tableName =tableName+ ',' + tablename.toString();
            tableUrl=tableUrl+ ','+ tableurl.toString();

            //alert(tableurl);
        });
        data={
            userid:userid,
            tablename:tablename,
            tabletimes:tabletimes,
            tablecoursename:tablecoursename,
            tablecourseclassify:tablecourseclassify,
            tablecourseclassifydetail:tablecourseclassifydetail,
            tablebrief:tablebrief,
            tableprice:tableprice,
            tableimg:tableimg,
            tableTime:tableTime,
            tableName:tableName,
            tableUrl:tableUrl,

        }
        $.post('../api/stopapply',data,function(){

        })
        alert("拒绝消息已发送到用户信箱");
    })
    $("#applyback").click(function(){
         window.location.reload();
    })
})
