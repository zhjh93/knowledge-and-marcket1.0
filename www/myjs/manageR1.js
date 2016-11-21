/**
 * Created by 佟煜荣 on 2016/10/20.
 */
//身份审核申请
$(document).ready(function(){
    $("#tongguo").hide();
$.post('../api/manageR1',function (res) {

    if(res.length!=0){
        document.getElementById("noide").style.display="none";
        for (var i = 0; i < res.length; i++) {
            var usrjo = $('#card').clone(true, true);
            $('#reide').append(usrjo);
            usrjo.find(' #idename').html(res[i].CourseName);
            usrjo.find(' #ideid').html(res[i].UserId);
            usrjo.find(' #ideid1').html(res[i].UserapplyId);
            //usrjo.find(' #courseprice2').html(res[i].CoursePrice);
            usrjo.find('#idenum').html(res[i].IDnum);
            usrjo.find('#iderelation').html(res[i].contactnum);
            usrjo.find('#idepay').html(res[i].gathernum);
        }
        $('#card').remove();
    }
    else{
        document.getElementById("card").style.display="none";
        document.getElementById("noide").style.visibility="visible";
    }
});

    $('.btn btn-info').click(function(){

    })
    $("#tableapply").each(function(){
        $('#acceptapply').click(function(){

            $("#tongguo").show();
            var ideid=$('#ideid').html();
            var ideid1=$('#ideid1').html();
            var idename=$('#idename').html();
            var idenum=$('#idenum').html();
            var iderelation=$('#iderelation').html();
            var idepay=$('#idepay').html();
            var data={
                ideid:ideid,
                ideid1:ideid1,
                idename:idename,
                idenum:idenum,
                iderelation:iderelation,
                idepay:idepay,
            }
            //alert(data.ideid);
            $.post('../api/manageR1accept',data,function (res) {

            })
            window.location.reload();
        })

        $('#refuseapply').click(function(){
            $("#tongguo").show();
            var ideid=$('#ideid').html();
            var ideid1=$('#ideid1').html();
            var idename=$('#idename').html();
            var idenum=$('#idenum').html();
            var iderelation=$('#iderelation').html();
            var idepay=$('#idepay').html();
            var data={
                ideid:ideid,
                ideid1:ideid1,
                idename:idename,
                idenum:idenum,
                iderelation:iderelation,
                idepay:idepay,
            }
            //alert(data.ideid);
            $.post('../api/manageR1refuse',data,function (res) {

            })
            window.location.reload();
        })
    })

})