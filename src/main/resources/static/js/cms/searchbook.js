var searchBook=searchBook ||{};
searchBook.searchBook=(function () {
 var
     STATUS_STATUS_PUBLISHED="6",
     _root=null,
     _currentPage=0,
    _conf={
     SearchBook_URL:"cms/searchSub.do",
    },
     _init=function (conf) {
         $.extend(_conf,conf);
         _root =$("#warpper");
         _root.container=$("#container");
         _root.find("#searchButton").click(function ()
         {
               _searchBook();
         });
     },
     _searchBook=function () {

         //alert('绑定上事件了sada');
         var searchText=$("#searchText").val();
         if(searchText !="")
         {
             $.get(_conf.SearchBook_URL,{
                 bookName:searchText
              },function (data) {
                // alert(data.length);
                 if(data.length==0)
                 {
                     //layer.msg("书本不存在");
                     $('#container').html("")
                     return;
                 }
                 var dom=$(data);
                 var myshowText = "";
                 var colorArray=new Array('#FDF6EC','#E6FEFE','#D3F1FE','#FCFDE9');
                 var j=1;
                 for (var i=0;i<dom.length;i++)
                 {
                     var status="";
                     if(data[i].status==6)
                     {
                          status="可识别";
                     }
                     else {
                          status="不可识别";
                     }
                     myshowText = myshowText + '<div class="list-group"  >'+
                         '<li href="#">' +"书名："+data[i].name+'</li>'+
                         '<li href="#">'+"作者："+data[i].author+'</li>'+
                         '<li href="#">'+"状态："+status+'</li>'+
                         '</div>';

                 }
                 $('#container').html(myshowText);
                 var arr=$('#container').find('.list-group');
                 for (var i=0;i<arr.length;i++)
                 {
                     arr[i].style.backgroundColor=colorArray[j];
                     j++;
                     if(j>3)
                     {
                         j=0;
                     }
                 }



             });
         }
         else {
             alert('请输入书名');
         }
     };



    return{
        init:function (conf) {
           _init(conf);
        }
    };

})();