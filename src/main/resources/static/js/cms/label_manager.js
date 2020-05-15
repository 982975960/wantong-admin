wantong.bookLabelManager = (function () {
  var CREATE_Label_URL = GlobalVar.contextPath + "/cms/createLabel.do",
      UPDATE_Label_URL = GlobalVar.contextPath + "/cms/updateLabel.do",
      List_Label_URL = GlobalVar.contextPath + "/cms/labelManager.do",
      DELETE_Label_URL=GlobalVar.contextPath+"/cms/deleteLabel.do",

      DISCARDANDRESTORELABEL_URL = GlobalVar.contextPath+"/cms/discardAndRestoreLabel.do",
      _root = null,
      _conf = {},
      index = null,
      partnerId = 0,
      tabSelect = null,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#bookLabelManager");
        _initDeleteBtn();
        _initSecondAndThirdDel();
        _initCreateBtn();
        _initAddSecondaryLabelBtn();
        _initAddThirdLableBtn();
        _initEditBtn();
        _initDiscardAndRestoreLabelBtn();
        _initSelectEnabledTab();
        // _searchLabels();
        _initPagination($("#bookLabelManager").find("#pagination"));
        _initTabPartnerAndWt();
      },
      _initTabPartnerAndWt = function() {
        var tabSelect = _root.find(".layui-tab-title").attr("tabSelect");
        if (tabSelect == "wt"){
          $("#wt").addClass("layui-this");
          $("#partner").removeClass("layui-this");
          partnerId = 1;
        }
        _root.find("#partner").click(function () {
          partnerId = 0;
          _refreshList();
          tabSelect = "partner";
        });
        _root.find("#wt").click(function () {
          partnerId = 1;
          _refreshList();
          tabSelect = "wt";
        });
      },
      _initSecondAndThirdDel = function(){
        _root.on("click","img[order='secondDel']",function () {
          var thisObject = $(this);
          //判断不是新加的
         if(parseInt($(this).parents(".label-box:eq(0)").find("input[type='text']").attr("labelid")) != 0){
          var index = layer.confirm('您确认要删除这个标签吗？删除后，之前打过此标签的书本都会清除此标签。', {
             title:"确定删除标签",
             btn: ['确认','取消'] //按钮
           }, function(){
             thisObject.parents(".label-box:eq(0)").remove();
             layer.close(index);
           }, function(){
           });
         }else {
           thisObject.parents(".label-box:eq(0)").remove();
         }
        });
        _root.on("click","img[order='thirdDel']",function () {

         var thisObject = $(this);
          if(parseInt($(this).parents(".label-box:eq(0)").find("input[type='text']").attr("labelid")) != 0){
           var index = layer.confirm('您确认要删除这个标签吗？删除后，之前打过此标签的书本都会清除此标签。', {
              title:"确定删除标签",
              btn: ['确认','取消'] //按钮
            }, function(){
              thisObject.parents(".label-box:eq(0)").remove();
              layer.close(index);
            }, function(){
            });
          }else {
            thisObject.parents(".label-box:eq(0)").remove();
          }
        });
      },
      _initAddThirdLableBtn = function(){
        _root.on("click",".addThirdLable",function () {
          addThirdThml($(this));
        });
      },
      addThirdThml = function(e){
        var html = '';
        html += '<div class="label-box third-label" style="margin-top: 20px">\n' +
            '              <span class="label-name-b label-b-l">三级标签</span>\n' +
            '              <span class="label-con">\n' +
            '                <input name="text" type="text" labelId="0" id="text" value="" maxlength="15" class="popups-line label-l-w" /><span class="label-img"><img src="/static/images/ico-gb.jpg" width="13" height="12" order="thirdDel" /></span>\n' +
            '              </span>\n' +
            '            </div>';

        e.parent().before(html);
      },
      //切换书本状态获得列表
      _initSelectEnabledTab = function(){
          $("#changeLabelStateList").change(function () {
            var selectVal = $(this).val();
            $("#enabled").val(selectVal);
            _refreshList();
          });
      },
      _refreshList = function (page) {
        if(page == undefined)
        {
          page = 1;
        }
        var enabled = $("#enabled").val();
        $.ajax({
          type: "get",
          url: List_Label_URL,
          data: {page: page,enabled:enabled,partnerId:partnerId},
          dataType: "text",
          async: false,
          success: function (data) {
            $("#moduleBodyDiv").html(data);
            if (enabled == 0) {
              $(".content-r-path").text("图书管理 / 标签管理 / 正在使用");
            }else {
              $(".content-r-path").text("图书管理 / 标签管理 / 已废弃");
            }
            $("#changeLabelStateList").find("option[value='"+enabled+"']").attr("selected",true);
            $("#enabled").val(enabled);
            var dom = $(data);
          },
          error: function (data) {
            layer.alert("error");
          }
        });
      },
      _initPagination = function (paginationDom) {
        var currentPage = parseInt(paginationDom.attr("currentPage"));
        var totalPages = parseInt(paginationDom.attr("pages"));
        //初始化页码
        paginationDom.html('');
        if (0 == totalPages) {
          return;
        } else {
          var lastPageAppend = 0;
          for (var i = 1; i < totalPages + 1; i++) {
            if (totalPages > 4 && Math.abs(currentPage - i) > 1 && i != 1 && i
                != totalPages) {
              continue;
            }

            if (lastPageAppend + 1 != i) {
              paginationDom.append(
                  '<li class="page-back-b2" class="disabled"><a href="#" onclick="return false;">...</a></li>');
            }
            //&& currentPage != 1
            if (i == 1) {
              paginationDom.append(
                  '<li page="-1" class="page-back"><a href="#" aria-label="Previous"><img src="static/images/ico9_03.png"></a></li>');
            }

            if (i == currentPage) {
              paginationDom.append(
                  '<a href="#"><li class="active" page="' + i + '">' + i
                  + '</li></a>');
            } else {
              paginationDom.append(
                  '<li class="page-back-b2" page="' + i + '"><a href="#">' + i + '</a></li>');
            }

            if (i == totalPages) {
              paginationDom.append(
                  '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
          }
          paginationDom.append('<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
        }
        paginationDom.find("#jumpButton").on("click",function () {
          var jumpPage = paginationDom.find("#jumpPage").val();
          var jumpPage2 = parseInt(jumpPage);
          if (jumpPage2!=NaN && jumpPage2 > 0 && jumpPage2 <= totalPages){
            $("html,body").animate({scrollTop:0},10);
            _refreshList(jumpPage2);
          }else {
            layer.msg("请输入正确页数");
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13){
            paginationDom.find("#jumpButton").click();
          }
        });
        paginationDom.delegate("li", "click", function (event) {
          var paginationTag = $(event.currentTarget);
          var page = paginationTag.attr("page");
          var currentPage = parseInt(paginationDom.attr("currentPage"));
          var totalPages = parseInt(paginationDom.attr("pages"));
          if (page == "-1") {
            var prevPage = currentPage - 1;
            if (prevPage >= 1) {
              _refreshList(prevPage);
            }
          } else if (page == "0") {
            var nextPage = currentPage + 1;
            if (nextPage <= totalPages) {
              _refreshList(nextPage);
            }
          } else {
            if(page!=undefined) {
              _refreshList(page);
            }
          }
        });

      },
      _initCreateBtn = function () {
        _root.find("#showBookLabel").find("#createlabelbtn").click(function () {
          $(this).blur();
          _showCreateDialog();
        });
        _root.find("#showBookLabel").find("#createlabel").click(function () {
          $(this).blur();
          _showCreateDialog();
        });
      },
      _initAddSecondaryLabelBtn = function () {
        var _createLabel = _root.find("#createBookLabel");
        _createLabel.find("#addSecondLable").click(function () {
          $(this).blur();
          _addSecondaryInput();
        });
      },
      _addSecondaryInput = function () {
        _addhtml(0);
      },
      _createLabelSave = function () {
        var _createBookLabel = _root.find("#createBookLabel");
        // var _primaryLabel = _createBookLabel.find("#createSupplierForm").find("#primaryLabel").val();
        var _saveBtn = _createBookLabel.find("#saveBtn");
        var _closeBtn = _createBookLabel.find("#closeBtn");
        var data = _getData();
        if(data == 1){
          layer.msg("一级标签不能为空");
          return;
        }
        if(data == 2){
          layer.msg("至少有一个二级标签");
          return;
        }
        if(data == 3){
          layer.msg("请在标签输入框里输入内容");
          return;
        }
        if(data == 4){
          layer.msg("重复的二级标签");
          return;
        }
        if(data == 5){
          layer.msg("重复的三级标签");
          return;
        }
        var dataJson = JSON.stringify(data);
        $.post(CREATE_Label_URL,{data:dataJson}, function (data) {
          if (data.code == 0) {
            layer.msg("保存成功");
            setTimeout(function () {
              layer.close(index);
            }, 1000);
            _saveBtn.removeAttr("disabled");
            _refreshList();
            // wantong.frame.refreshPage();
          } else {
            layer.msg("保存失败：" + data.msg);
            _saveBtn.removeAttr("disabled");
          }
        });

      },
      _initEditBtn = function () {
        _root.find(".btn-edit").click(function () {
          _showUpdateDialog();
          var labels = new Array();
          //列表一级标签
          var firstDom = $(this).parents("tr").find("td:eq(1)");
          //列表二级标签和三级标签tr集合
          var trDoms = $(this).parents("tr").find("td:eq(2)").find("tr");
          if (trDoms.length >= 1){
            for (var i=0;i<trDoms.length;i++){
              var obj = {
                secondLableId:-1,
                secondLableName:null,
                thirdLabelIds:null,
                thirdLableNames:null
              };
              var tds = $(this).parents("tr").find("td:eq(2)").find("tr").eq(i).find("td");

              obj.secondLableId = tds.eq(0).attr("labelid").trim();
              obj.secondLableName = tds.eq(0).text().trim();
              obj.thirdLabelIds = tds.eq(1).attr("allthirdid").trim();
              obj.thirdLableNames = tds.eq(1).text().trim();
              labels.push(obj);
            }
          }

          _root.find("#createBookLabel").find("input:eq(0)").val(firstDom.text().trim()).attr("labelId",firstDom.attr("labelid"));

          if (labels.length>0){
            $.each(labels,function (i,item) {
              _addhtml();
              _root.find("#createBookLabel").find(".second-label").eq(i).find("span:eq(1) input").val(item.secondLableName).attr("labelid",item.secondLableId);

              if(item.thirdLableNames != "" && item.thirdLableNames != null ){
                var thirdLableNames = item.thirdLableNames.split("/");
                var thirdLabelIds = item.thirdLabelIds.split("/");
                for (var k = 0; k < thirdLableNames.length; k++) {
                  var thirdSpanDom = _root.find("#createBookLabel").find(".second-label").eq(i).find(".addThirdLable");
                  addThirdThml(thirdSpanDom);
                  thirdSpanDom.parent().prev().find("input").val(thirdLableNames[k].trim()).attr("labelid",thirdLabelIds[k].trim());
                }

              }
            });
          }
        });
      },
      _initDeleteBtn=function(){
        _root.find(".btn-del").click(function () {
          $(this).blur();
          var  thisBtn=$(this);
          var id=parseInt(thisBtn.attr("labelId"));
          layer.confirm('您确定要删除这组标签吗?删除后，这组标签内的一级二级三级标签会全部删除，之前打过这组标签的书本都会清除这组标签。',{btn:['确认','取消']},function () {
            $.get(DELETE_Label_URL,{id:id},function (data) {
              if(data.code==0) {
                _refreshList($("#pagination").attr("currentPage"));
                layer.msg("删除成功");
              }else {
                layer.msg("删除失败");
              }
            });
          });

        });
      },
      _showDialog = function (titl) {
        var _createLabel = _root.find("#createBookLabel");
        index = layer.open({
          title: titl,
          type: 1,
          maxmin: false,
          resize: false,
          area: ['600px', '600px'],
          scrollbar: false,
          content: _createLabel,
          cancel: function () {
            var _secondary = _createLabel
            .find("#createSupplierForm").find("#secondary");
            _secondary.find(".form-control").each(function () {
              _closeSecondary($(this));
            });
            _clearPri();
            layer.close(index);
            _refreshList($("#pagination").attr("currentPage"));
          },
          end:function () {
            layer.closeAll();
          },
          success: function (layero) {
            var mask = $(".layui-layer-shade");
            mask.appendTo(layero.parent());
            //其中：layero是弹层的DOM对象
          }
        });
      },
      _addhtml = function (index) {
        var html = "";
        html += '<div class="label-box second-label">\n' +
            '<span class="label-name label-l">二级标签：</span>\n' +
            '<span class="label-con">\n' +
            '<input name="text" type="text" labelId ="0" value="" maxlength="15" class="popups-line p-width"  /><span class="label-img"><img src="/static/images/ico-gb.jpg" width="13" height="12" order="secondDel" /></span>\n' +
            '</span>\n' +
            '<div class="label-box" style="margin-top: 10px">\n' +
            '<span class="label-b-img addThirdLable"><img src="static/images/ico13.png" width="13" height="13" />添加三级标签</span>\n' +
            '</div>\n' +
            '</div>';
        _root.find("#addSecondLable").parent().before(html);
      },
      _showUpdateDialog = function () {
        var _createLabel = _root.find("#createBookLabel");
        _showDialog("修改标签");
        var _saveBtn = _createLabel.find("#saveBtn");
        var _closeBtn = _createLabel.find("#closeBtn");
        _saveBtn.click(function () {
          _undateLabbel();
        });
        _closeBtn.click(function () {
          _createLabel.find("#createSupplierForm").find("#secondary").find(
              ".form-control").each(function () {
            _closeSecondary($(this));
          });
          layer.close(index);
          _refreshList($("#pagination").attr("currentPage"));
          _clearPri();
        });

      },
      _undateLabbel = function (id) {
        var _createBookLabel = _root.find("#createBookLabel");
        var _saveBtn = _createBookLabel.find("#saveBtn");
        var _closeBtn = _createBookLabel.find("#closeBtn");
        var objectData = _getData();

        if(objectData == 1){
          layer.msg("一级标签不能为空");
          return;
        }
        if(objectData == 2){
          layer.msg("至少有一个二级标签");
          return;
        }
        if(objectData == 3){
          layer.msg("请在标签输入框里输入内容");
          return;
        }
        if(objectData == 4){
          layer.msg("重复的二级标签");
          return;
        }
        if(objectData == 5){
          layer.msg("重复的三级标签");
          return;
        }
        var data = JSON.stringify(objectData);

        $.get(UPDATE_Label_URL, {data:data
        }, function (data) {
          if (data.code == 0) {
            layer.msg("保存成功");
            layer.close(index);
            _clearPri();
            _refreshList($("#pagination").attr("currentPage"));
            _saveBtn.removeAttr("disabled");
          } else {
            layer.msg("保存失败：" + data.msg);
            _saveBtn.removeAttr("disabled");
          }
        });
      },
      _checkRepeatLabel = function (object) {
    console.log("1222");
        var array = object.childLabels;
        var hash = {};
        for (var i in array) {
          if (hash[array[i].labelName] && array[i].labelName != "") {

            return true;
          }
          hash[array[i].labelName] = true;
        }
        return false;
      },
      _clearPri = function () {
        var _createBookLabel = _root.find("#createBookLabel");
        _createBookLabel.find("#createSupplierForm").find(
            "#primaryLabel").val("");
      },
      _closeSecondary = function (obj) {
        obj.parent('.input-group').remove();
      },
      _showCreateDialog = function () {
        var _createLabel = _root.find("#createBookLabel");
        var _saveBtn = _createLabel.find("#saveBtn");
        var _closeBtn = _createLabel.find("#closeBtn");
        _saveBtn.click(function () {
          _createLabelSave();
        });
        _closeBtn.click(function () {
          _createLabel.find("#createSupplierForm").find("#secondary").find(
              ".form-control").each(function () {
            _closeSecondary($(this));
          });
          layer.close(index);
          _refreshList($("#pagination").attr("currentPage"));
          _clearPri();

        });
        _showDialog("创建标签");
      },
      //1 是一级标签没有内容 2 是没有二级标签，或者二级标签为空 3 说明标签里有每填的
      _getData = function () {
        var labelData = {
          id:0,
          labelName:"",
          childLabels:new Array()
        };
        var _createBookLabel = _root.find("#createBookLabel");
        var _primaryLabelValue = _createBookLabel.find(".primary-label input").val();
        var _primaryLabelId = _createBookLabel.find(".primary-label input").attr("labelId");
        if(_primaryLabelValue.replace(/\s+/g, "") == ""){

          //一级标签为空
          return 1;
        }
        labelData.id =parseInt(_primaryLabelId);
        labelData.labelName = _primaryLabelValue;
        var _secondLabel = _createBookLabel.find(".second-label");

        if(_secondLabel.length == 0){
          //没有二级标签
          return 2;
        }
        var errorCode = 0;
        _createBookLabel.find("input").each(function () {
          if($(this).val().replace(/\s+/g,"") == ""){
            errorCode = 3;
          }
        });
        if(errorCode == 3)
        {
          return errorCode;
        }
        var secondLabelArr = new Array();


        _secondLabel.each(function () {
          var secondLabel = {
              id:0,
             labelName:"",
             childLabels:new Array()
          };
          secondLabel.id = parseInt($(this).find("input").attr("labelId"));
          secondLabel.labelName = $(this).find("input").val();

          var thirdLabelArr = new Array();
          $(this).find(".third-label").each(function () {
            var thirdLabel = {
              id:0,
              labelName:"",
              childLabels:new Array()
            };
            thirdLabel.id = parseInt($(this).find("input").attr("labelId"));
            thirdLabel.labelName = $(this).find("input").val();
            thirdLabelArr.push(thirdLabel);
          });
          secondLabel.childLabels = thirdLabelArr;
          //检查3级标签是否重复
          secondLabelArr.push(secondLabel);
        });
           labelData.childLabels = secondLabelArr;
           //检查二级标签是否重复
          if(_checkRepeatLabel(labelData)) {
            return 4;
          }
          for (var i in labelData.childLabels){
            if(_checkRepeatLabel(labelData.childLabels[i])){
              return 5;
            }
          }

           return labelData;
      },
      _initDiscardAndRestoreLabelBtn = function () {

        _root.on("click","button[order='discardAndRestoreLabel']",function () {

          var labelid = $(this).parent().siblings("td[labelid]").attr("labelid");
          $.post(DISCARDANDRESTORELABEL_URL,{
            id : labelid
          },function(data){
            if (data.code==0){
              _refreshList($("#pagination").attr("currentPage"));
            }
          });
        });

      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };
})();