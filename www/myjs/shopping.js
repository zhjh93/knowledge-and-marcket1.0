/**
 * Created by 佟煜荣 on 2016/10/20.
 */
(function (){
    var shopCart=Cookies.get("ShopCate");
    var CatArr=shopCart.split(',');
    console.log(CatArr);
    //alert(CatArr);
var data={
    CatArr:CatArr,
}
    $.post('../api/shopping',data,function (res) {

        if(data.CatArr.lenth!=0){

            document.getElementById("nogoods").style.display="none";}
        else{
                document.getElementById("goods1").style.display="none";
                document.getElementById("nogoods").style.visibility="visible";
            }
            for (var i = 0; i < res.length; i++) {
                var usrjo = $('#goods1').clone(true, true);

                usrjo.find('#goodsname').html(res[i][0].CourseName);
                usrjo.find('#goodsid').html(res[i][0].CourseID);
                usrjo.find('#goodsprice').html(res[i][0].CoursePrice);
                usrjo.find('#goodsimg').attr('src',res[i][0].CourseImgURL);
                $('#regoods').append(usrjo);
            }
            $('#goods1').remove();


    });
    $(document).ready(function(){
        $('#payfor').click(function(){
            var money=$('#money').html();
            //alert(money);
            $('#payfor').attr('href','./buy_page.html?money='+money);
        })
    })
});

