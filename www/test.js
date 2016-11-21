console.log('>>>>>>>>>>>>>>XXXXXX');

//$(function(){
//    var res = {
//        'u1': {
//            name: 'wangxiaomao',
//            age: '32',
//            avatar: 'http://files.m.xmgc360.com/FjH73D-t9eHykJvt6dsE-XUHvImT'
//        },
//        'u2': {
//            name: 'lixiaogou',
//            age: '28',
//            avatar: 'http://files.m.xmgc360.com/FjH73D-t9eHykJvt6dsE-XUHvImT'
//        },
//        'u3': {
//            name: 'zhaoxiaoyang',
//            age: '23',
//            avatar: 'http://files.m.xmgc360.com/FjH73D-t9eHykJvt6dsE-XUHvImT'
//        }
//    };
//
//    for (var attr in res) {
//        //var usr = res[i];
//        var usr=res[attr];
//        var usrjo = $('#mingpian').clone(true, true);
//        usrjo.find('#xm').html(usr.name);
//        usrjo.find('#nl').html(usr.age);
//        usrjo.find('#tx').attr('src', usr.avatar);
//
//        $('#mpbox').append(usrjo);
//    }









    $('#shangchuan').click(function () {
        alert('hello')

        _fns.uploadFile2($('#shangchuan'), function (f) {
            console.log('>>>>before:', f);
        }, function (f) {
            console.log('>>>>progressAAAA:', f);
            $('#wancheng').css('width', f.percent + '%');
            $('#wancheng').html(f.percent + '%');
            console.log('>>>>>AAAA');
        }, function (f) {
            console.log('>>>>successXXXX:', f);
            $('#wenjian').html(f.url);
            $('#wenjian').attr('href', f.url);
        });
    });



    //$('#shangchuan2').click(function () {
    //    _fns.uploadFile('test-A', $('#shangchuan'), function (f) {
    //        console.log('>>>>before2:', f);
    //    }, function (f) {
    //        console.log('>>>>progress2:', f);
    //        $('#wancheng').css('width', f.percent + '%');
    //        $('#wancheng').html(f.percent + '%');
    //    }, function (f) {
    //        console.log('>>>>success2:', f);
    //        $('#wenjian').html(f.url);
    //        $('#wenjian').attr('href', f.url);
    //    });
    //});

//})