wantong.labelAdd = (function () {
 var
  _root = null,
  _index = null,
  _bookLabels = {},
  _conf = {
     SAVB_LABEL_URL:"cms/saveBookLabel.do"
  },
  _init = function (bookLabels) {
    $.extend(_conf,bookLabels);
    _index = layer.index;
    _bookLabels = bookLabels;
    _root = $("#labelWarpper");
    _showAndHide();
    _initData();
    _initBtn();
    _initClose();
    _initTabSelect();
  },
  _initTabSelect = function () {
      var partnerId = _root.find("#tabUl").attr("partnerId");
      if (partnerId == 1){
          _root.find("li[index=0]").css("display","none");
          _root.find("#partnerLabels").css("display","none");
          _root.find("#wtLabels").css("display","inline");
          _root.find("#tabUl .voiceTabItem").addClass("active");
      }
     _root.find("li[role='presentation']").click(function () {
         $(this).siblings().removeClass("active");
         $(this).addClass("active");
         var index = $(this).attr("index");
         if (index == 0){
             _root.find("#partnerLabels").css("display","inline");
             _root.find("#wtLabels").css("display","none");
         }else{
             _root.find("#wtLabels").css("display","inline");
             _root.find("#partnerLabels").css("display","none");
         }
     });
  },
  _initData = function () {
    //_bookLabels = wantong.cms.bookAdd.getCurLabelDatas();
    var partnerBookLabels = _bookLabels.partnerBookLabels;
    var partnerBookLabelsObj = JSON.parse(partnerBookLabels);
    var wtBookLabels = _bookLabels.wtBookLabels;
    var wtBookLabelsObj = JSON.parse(wtBookLabels);
    for (l in partnerBookLabelsObj) {
      var checkedDom = $('.label-' + partnerBookLabelsObj[l].id);
      var order = checkedDom.attr("order");
      if (order == "second"){
          checkedDom.prop("checked",true);
      } else if (order == "third"){
          checkedDom.prop("checked",true);
          checkedDom.parents(".child-label").prev().find("input[order='second']").prop("checked",true);
      }
    }
    for (l in wtBookLabelsObj) {
      var checkedDom = $('.label-' + wtBookLabelsObj[l].id);
      var order = checkedDom.attr("order");
      if (order == "second"){
          checkedDom.prop("checked",true);
      } else if (order == "third"){
          checkedDom.prop("checked",true);
          checkedDom.parents(".child-label").prev().find("input[order='second']").prop("checked",true);
      }
    }
  },
  _initBtn = function() {
    function sortTimeAndId(a ,b){
      return a.createTime != b.createTime ? Number(a.createTime) - Number(b.createTime) : a.id - b.id;
    }

      _root.find('#saveBtn').on('click', function() {
          var labelIds = new Array();
          var labelNames = new Array();
          $("input[order='third']").each(function (e) {
              if ($(this).prop('checked')) {
                  var id = $(this).attr('lid');
                  labelIds.push(id);
                  var labelName = $(this).next().text();
                  labelNames.push(labelName);
              }
          });
          $("input[order='second']").each(function (e) {
              if ($(this).prop('checked')) {
                  var thirdSize = $(this).parent().next().find("input[type='checkbox']:checked").length;
                  if (thirdSize==0){
                      var id = $(this).attr('lid');
                      labelIds.push(id);
                      var labelName = $(this).parent().text();
                      labelNames.push(labelName);
                  }
              }
          });
      // labels.sort(sortTimeAndId);
          for (var i =0;i < labelNames.length; i++){
              for (var j = labelNames.length -1; j > i ; j-- ){
                  if (labelNames[i] == labelNames[j]){
                      layer.msg("不可同时勾选相同标签名的标签，请注意检查");
                      return;
                  }
              }
          }
          if(JSON.parse(_conf.isMakePic)){
            wantong.base.bookAdd.loadLabels(labelIds);
          }else {
            wantong.cms.bookAdd.loadLabels(labelIds);
          }

          var labels = "";
          for (var i=0;i<labelIds.length;i++){
            labels=labels+labelIds[i]+",";
          }

        _saveLabel(labels,_conf.bookId,_conf.isMakePic);

    });
    _root.find("input[order='third']").on("click",function () {
        if ($(this).prop('checked')) {
            var inputDom = $(this).parents(".child-label").prev().find("input[order='second']");
            if (!inputDom.prop("checked")){
                inputDom.prop("checked",true);
            }
        }
    });
      _root.find("input[order='second']").on("click",function () {
          if (!$(this).prop('checked')) {
              var secondDomLength = $(this).parent().next().find("input[type='checkbox']:checked").length;
              if (secondDomLength == 0){
                  $(this).prop('checked',false);
              } else {
                  $(this).prop('checked',true);
                  layer.msg("存在三级标签时，不能勾选掉二级标签");
              }
          }
      });

  },
     _saveLabel = function(labels,bookId,isMakePic){
       $.get(_conf.SAVB_LABEL_URL, {
         bookId:bookId,
         labels:labels,
         isMakePic:isMakePic
       }, function (data) {
         if(data.code==0){
           layer.close(_index);
           layer.msg("保存成功");
         }else {
           layer.msg("保存失败")
         }
       });
     },
  _showAndHide = function () {
   console.log("111");
      _root.find("input[order='secondBtn']").on("click",function () {
          if ($(this).attr('class') == 'cho-up') {
              $(this).removeClass('cho-up').addClass('cho-down');
              $(this).parent('.father-label').next().css('display', 'block');
          } else {
              $(this).removeClass('cho-down').addClass('cho-up');
              $(this).parent('.father-label').next().css('display', 'none');
          }
      });
      _root.find("input[order='firstBtn']").on("click",function () {
          if ($(this).attr('class') == 'cho-up') {

              $(this).removeClass('cho-up').addClass('cho-down');
              console.log("up");
              var isShow =false ;
              $(this).parent('.father-label').siblings().each(function () {
                var thisObject = $(this);

                if(thisObject.attr("class") == "father-label"){
                  thisObject.css("display","block");
                  if(thisObject.find("input[type='button']").attr("class")=="cho-down"){
                    isShow = true;
                  }else {
                    isShow = false;
                  }
                }else {
                  if(isShow){
                    thisObject.css("display","block");
                  }
                }
              });
          } else {
              $(this).removeClass('cho-down').addClass('cho-up');
              $(this).parent('.father-label').siblings().css("display","none");
          }
      });
  },
    _initClose = function () {
        _root.find("#closeBtn").click(function () {
            layer.close(_index);
        });
    };

  return {
    init: function (bookLabels) {
      _init(bookLabels);
    }
  }
})();