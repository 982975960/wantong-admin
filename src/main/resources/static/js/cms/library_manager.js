wantong.bookLibraryManager = (function () {
  var SAVE_LIB_URL = GlobalVar.contextPath + "/cms/saveLib.do",
      LIST_LIB_URL = GlobalVar.contextPath + "/cms/libraryManager.do",
      _root = null,
      _conf = {},
      index = null,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root = $("#libraryManagerPanel");
        _initPagination(_root.find("#pagination"));
        _initCreateBtn();
        _initEditBtn();
      },
      _clearInput = function () {
        _root.find('#libId').val('');
        _root.find('#libName').val('');
        _root.find('#saveBtn').val('保存').removeAttr("disabled");
      },
      _initCreateBtn = function () {
        _root.find("#createLibraryBtn").click(function () {
          $(this).blur();
          _showCreateDialog();
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
                  '<li class="page-back-b2" page="' + i + '"><a href="#">' + i
                  + '</a></li>');
            }

            if (i == totalPages) {
              paginationDom.append(
                  '<li page="0" class="page-back"><a href="#" aria-label="Next"><img src="static/images/ico9_05.png"></a></li>');
            }
            lastPageAppend = i;
          }
          paginationDom.append(
              '<Li>到第</Li><Li><input type="text" id="jumpPage" class="page-box page-back"/></Li><Li>页</Li><button type="button" class="page-input" id="jumpButton">跳转</button>');
        }
        paginationDom.find("#jumpButton").on("click", function () {
          var jumpPage = paginationDom.find("#jumpPage").val();
          var jumpPage2 = parseInt(jumpPage);
          if (jumpPage2 != NaN && jumpPage2 > 0 && jumpPage2 <= totalPages) {
            $("html,body").animate({scrollTop: 0}, 10);
            _refreshList(jumpPage2);
          } else {
            layer.msg("请输入正确页数");
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
            paginationDom.find("#jumpButton").click();
          }
        });
        paginationDom.delegate("li", "click", function (event) {
          $(this).blur();
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
            if (page != undefined) {
              _refreshList(page);
            }
          }
        });

      },
      _createLabelSave = function (id, partnerId) {
        var libId = _root.find('#libId').val();
        var libName = _root.find('#libName').val().replace(/(^\s*)|(\s*$)/g,
            "");
        var libPartnerId = 0;
        if (partnerId == undefined) {
          libPartnerId = _root.find("#createLibrary").find(
              "#partnerType").val();
          if (libPartnerId == -1) {
            layer.msg("请选择合作商");
            return;
          }
          if (libName == "") {
            layer.msg("请输入书库名称");
            return;
          }
        } else {
          if (libName == "") {
            layer.msg("请输入书库名称");
            return;
          }
          libPartnerId = partnerId;
        }
        var encrypt = document.getElementById("encrypt").checked ? 1 : 0;
        console.log("save");
        var saveBtn = _root.find('#saveBtn');
        saveBtn.val("保存中...");
        saveBtn.attr("disabled", "disabled");
        $.post(SAVE_LIB_URL, {
          id: libId,
          name: libName,
          partnerId: libPartnerId,
          encrypt: encrypt
        }, function (data) {
          saveBtn.removeAttr("disabled");
          if (data.code == 0) {
            layer.msg("保存成功")
            layer.close(index);
            saveBtn.removeAttr("disabled");
            if (partnerId == undefined) {
              _refreshList(
                  parseInt(_root.find("#pagination").attr("currentPage")));
              _clearInput();
            } else {
              _refreshList(
                  parseInt(_root.find("#pagination").attr("currentPage")));
              _clearInput();
            }
          } else {
            if (data.msg == "same") {
              layer.msg("同一合作商，书库名不能相同");
              saveBtn.removeAttr("disabled");
            } else {
              layer.msg("保存失败:" + data.msg);
              saveBtn.removeAttr("disabled");
            }
          }
        });

      },
      _initEditBtn = function () {
        _root.find(".edit-btn").click(function () {
          $(this).blur();
          var id = $(this).attr("lid");
          var name = $(this).attr("lname");
          var partnerId = $(this).attr("lpartnerId");
          var encrypt = $(this).attr("lencrypt");
          _showUpdateDialog(id, name, partnerId, encrypt);
        });
        _root.find("#encrypt").click(function () {
          if ($(this).get(0).checked) {
            $("#noEncrypt").prop("checked", false);
          } else {
            $("#noEncrypt").prop("checked", true);
          }
        });
        _root.find("#noEncrypt").click(function () {
          if ($(this).get(0).checked) {
            $("#encrypt").prop("checked", false);
          } else {
            $("#encrypt").prop("checked", true);
          }
        });
      },
      _showDialog = function (titl) {
        var _createLabel = _root.find("#createLibrary");
        if (titl == "编辑书库") {
          _createLabel.find("#partnerType").css("display", "none");
        } else {
          _createLabel.find("#partnerType").css("display", "block");
        }
        index = layer.open({
          title: titl,
          type: 1,
          maxmin: false,
          resize: false,
          area: ['400px', '260px'],
          scrollbar: false,
          content: _createLabel,
          cancel: function () {
            console.log("close");
            // wantong.frame.refreshPage();
            _refreshList(
                parseInt(_root.find("#pagination").attr("currentPage")));
          },
          end: function () {
            layer.closeAll();
          },
          success: function (layero) {
            var mask = $(".layui-layer-shade");
            mask.appendTo(layero.parent());
            //其中：layero是弹层的DOM对象
          }
        })
      },
      _showUpdateDialog = function (id, name, partnerId, encrypt) {
        console.log(id + ',' + name);
        var _createLibForm = _root.find("#createLibrary");
        var _saveBtn = _createLibForm.find("#saveBtn");
        var _closeBtn = _createLibForm.find("#closeBtn");
        if (encrypt == 1) {
          _createLibForm.find("#encrypt").attr("checked", "checked");
          _createLibForm.find("#noEncrypt").removeAttr("checked");
        } else {
          _createLibForm.find("#encrypt").removeAttr("checked");
          _createLibForm.find("#noEncrypt").attr("checked", "checked");
        }

        _showDialog("编辑书库");
        _createLibForm.find("#libName").val(name);
        _createLibForm.find("#libId").val(id);

        _saveBtn.click(function () {
          _createLabelSave(id, partnerId);
        });
        _closeBtn.click(function () {
          _createLibForm.find("#libName").val('');
          _createLibForm.find("#libId").val('');
          layer.close(index);
          // wantong.frame.refreshPage();
          _refreshList(parseInt(_root.find("#pagination").attr("currentPage")));
          _clearInput();
        });
      },
      _showCreateDialog = function () {
        var _createLabel = _root.find("#createLibrary");
        var _saveBtn = _createLabel.find("#saveBtn");
        var _closeBtn = _createLabel.find("#closeBtn");
        _saveBtn.click(function () {
          _createLabelSave();
        });
        _closeBtn.click(function () {
          // wantong.frame.refreshPage();
          _refreshList(parseInt(_root.find("#pagination").attr("currentPage")));
          layer.close(index);
          console.log("close btn");
        });
        _clearInput();
        _showDialog("创建书库");
      },
      _refreshList = function (page) {
        if (page == undefined) {
          page = 1;
        }
        $.get(LIST_LIB_URL, {
          page: page
        }, function (data) {
          // var dom = $(data);
          $("#moduleBodyDiv").html(data);
          // var pagination = dom.find("#pagination");
          // if (pagination.length > 0) {
          //   _initPagination(pagination);
          // }
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  };
})();