/**
 * Created by 佟煜荣 on 2016/10/20.
 */
$(document).ready(function() {
    $.post('../api/manageR2', function (res) {
        if (res.length != 0) {
            document.getElementById("noapply").style.display = "none";
            for (var i = 0; i < res.length; i++) {
                var usrjo = $('#applycourse1').clone(true, true);
                $('#reapplycourse1').append(usrjo);
                usrjo.find(' #applyid').html(res[i].UserId);
                usrjo.find(' #applycourseid').html(res[i].CourseapplyId);
                usrjo.find(' #applycoursename').html(res[i].CourseName);
            }
            $('#applycourse1').remove();
        }
        else {
            document.getElementById("applycourse1").style.display = "none";
            document.getElementById("noapply").style.visibility = "visible";
        }
    });
    $("li").click(function () {
        var id=$(this).children().find('#applycourseid').html();
        var name=$(this).children().find('#applycoursename').html();


       //var data={
       //    id:id,
       //}
        $("#ide2").load('./manageR21.html?id='+id);
        var path='../api/manageR21?id='+id;
        var path1='../api/manageR211?name='+name;
        $.post(path, function (res) {
            for (var i = 0; i < res.length; i++) {
                var usrjo = $('#mytable').clone(true, true);
                $('#remytable').append(usrjo);
                usrjo.find(' #tableid').html(res[i].UserId);
                usrjo.find(' #tablename').html(res[i].UserName);
                usrjo.find(' #tabletimes').html(res[i].CourseTimes);
                usrjo.find(' #tablecourseclassify').html(res[i].Courseclassify);
                usrjo.find(' #tablecourseclassifydetail').html(res[i].CourseclassifyDetail);
                usrjo.find(' #tablecoursename').html(res[i].CourseName);
                usrjo.find(' #tablebrief').html(res[i].Coursebrief);
                usrjo.find(' #tableprice').html(res[i].CoursePrice);
                usrjo.find(' #tableimg').attr('src',res[i].CourseImgURL);
                //usrjo.find(' #applycourseid').html(res[i].CourseapplyId);
            }
            $.post(path1, function (res) {
                for (var i = 0; i < res.length; i++) {
                    var usrjo = $('#tabledetail').clone(true, true);
                    $('#retabledetail').append(usrjo);
                    usrjo.find(' #tabledetailname').html(res[i].CourseEachName);
                    usrjo.find(' #tabledetaillong').html(res[i].CourseEachTime);
                    usrjo.find(' #tablevideoview').attr('src',res[i].CourseEachURL);
                    //usrjo.find(' #applycourseid').html(res[i].CourseapplyId);
                }
                $('#tabledetail').remove();
            });
            $('#mytable').remove();
        });

    })



})
