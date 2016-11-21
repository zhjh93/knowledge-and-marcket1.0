/**
 * Created by 佟煜荣 on 2016/10/19.
 */
$.post('../api/sellcourse',function (res) {
    if(res.length!=0){
        document.getElementById("nocourse").style.display="none";
    }
    else{
        document.getElementById("course_info").style.display="none";
        document.getElementById("nocourse").style.visibility="visible";
    }
        for (var i = 0; i < res.length; i++) {
            var usrjo = $('#course_info').clone(true, true);
            $('#recourse_info').append(usrjo);
            usrjo.find(' #course_info_name').html(res[i].CourseName);
            //usrjo.find(' #courseprice2').html(res[i].CoursePrice);
            usrjo.find('#myimg').attr('src', res[i].CourseImgURL);
            usrjo.find('#coursetime').html(res[i].inserttime);
            usrjo.find('#courseperson').html(res[i].count);
        }
        $('#course_info').remove();

});
$.post('../api/informationnum',function(res){

    for (var i = 0; i < res.length; i++) {
        var usrjo = $('#num').clone(true, true);
        $('#renum').append(usrjo);
        usrjo.find('#information').html( res[i].count);
    }
    $('#num').remove();
})
$.post('../api/applysellcourse',function (res) {
    if(res.length!=0){
        document.getElementById("noapplycourse").style.display="none";
    }
    else{
        document.getElementById("applysellcourse").style.display="none";
        document.getElementById("noapplycourse").style.visibility="visible";
    }
        for (var i = 0; i < res.length; i++) {
            var usrjo = $('#applysellcourse').clone(true, true);
            $('#reapplysellcourse').append(usrjo);
            usrjo.find(' #applycoursename').html(res[i].CourseName);
            //usrjo.find(' #courseprice2').html(res[i].CoursePrice);
            usrjo.find('#myimg1').attr('src', res[i].CourseImgURL);
           
        }
        $('#applysellcourse').remove();

});