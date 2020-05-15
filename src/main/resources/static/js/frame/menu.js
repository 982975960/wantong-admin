wantong.frame.menu = (function () {
  var _root = null,

      _init = function () {
        _initCheckUrl();
      },
      _initClickBookBtn=function(obj){
       obj.on("click",function () {
         $("#myTabContent").css("display","");
       });
      },
      _initClickOtherBtn=function(obj){
        obj.on("click",function () {
          $("#myTabContent").css("display","none");
        });
      },
      _initCheckUrl = function () {
        $("#myTabContent").css("display","none");
        $(".menuItem").each(function () {
          if($(this).attr("name")=="绘本管理"){
              // $("#myTabContent").css("display","");
            _initClickBookBtn($(this));
          }
          else {
            _initClickOtherBtn($(this));
          }
        });


      };
  return {
    init: function () {
      _init();
    }
  };
})();