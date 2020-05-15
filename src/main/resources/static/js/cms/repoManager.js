wantong.cms = {};
wantong.cms.repoManager = (function () {
  var
      _conf = {
        REPO_LIST_URL: "cms/listRepo.do",
        CREATE_REPO_URL: "cms/createRepo.do",
        UPDATA_REPO_URL: "cms/editRepo.do",
        OPEN_SET_ADMIN_URL: "cms/setRepoAdmin.do",
      },
      _root = null,
      _createPanael = null,
      _creteForUserPanel = null,
      _editPanel = null,
      editoVO = {
        id: 0,
        partnerId: 0,
        modelId: 27,
        name: "",
        encrypt: 1,
        language: 0,
        soundRay: 0,
      },
      _init = function (conf) {
        $.extend(_conf, conf);
        console.log("repoMana");
        _root = $(".content-wrap-w");

        _createPanael = $("#createRepo-panel");
        _creteForUserPanel = $("#createRepoforPartner-panel");
        _editPanel = $("#editRepo-panel");


        _initPartnersSelector();
        _initPanel();
        _initBtnEvent();
      },
      _checkNoRepo = function () {
        var size = $("table#repoPanel").children("tbody").children("tr").size();
        var _searchInput = _root.find("#searchInput").val();
        if (size == 0 && _searchInput == "") {
          layer.open({
            title: "提示",
            content: "您还未创建资源库，请先在“资源库管理下”，点击创建资源库按钮，创建资源库，再进行资源制作。"
          });
        }
      },
      _initPartnersSelector = function () {
        _root.find("#partner").chosen({
          search_contains: true,
          width: '95%'
        });
        _root.find("#partner").change(function () {
          _clearSearch();
          _refreshList();
        });
      },
      _initPanel = function () {
        _refreshList();

      },
      _refreshCurrentPage = function () {
        var page = $('#pagination').attr('currentpage');
        _refreshList(page);
      },
      _refreshList = function (page) {
        var partnerId = _root.find("#partner").val();
        var searchText = _root.find("#searchInput").val();
        if (page == undefined) {
          page = 1;
        }

        $.get(_conf.REPO_LIST_URL, {
          partnerId: partnerId,
          searchText: searchText,
          currentPage: page,
        }, function (data) {
          var dom = $(data);
          var pagination = dom.find("#pagination");
          if (pagination.length > 0) {
            _initPagination(pagination);
          }
          $("#repoPoolPanel").html(dom);
          _initEditRepoBtn();
          _checkNoRepo();
          _initSetAdminBtn();
        });
      },
      _initEditRepoBtn = function () {
        $(".set-repo-btn").on("click", function () {
          var id = $(this).attr("id");
          var modelId = $(this).attr("modelid");
          var encrypt = $(this).attr("encrypt");
          var name = $(this).attr("name");
          var partnerName = $(this).attr("partnerName");
          var partnerId = $(this).attr("partnerId");
          var language = $(this).attr("language");
          var soundRay = $(this).attr("soundRay");
          _editPanel.find("#user").html(partnerName);
          _editPanel.find("#libName").val(name);
          _editPanel.find("#language").val(language);
          _editPanel.find("#soundRay").val(soundRay);
          if (parseInt(encrypt) == 1) {
            _editPanel.find("#encrypt").prop("checked", true);
            _editPanel.find("#noEncrypt").prop("checked", false);
          } else {
            _editPanel.find("#noEncrypt").prop("checked", true);
            _editPanel.find("#encrypt").prop("checked", false);
          }
          if (parseInt(modelId) == 27) {
            _editPanel.find("#base-model label").html("绘本图像库");
          } else if (parseInt(modelId) == 28) {
            _editPanel.find("#base-model label").html("测试图像库");
          } else if (parseInt(modelId) == 29) {
            _editPanel.find("#base-model label").html("K12图像库");
          }
          editoVO.soundRay = parseInt(soundRay);
          editoVO.language = parseInt(language);
          editoVO.modelId = parseInt(modelId);
          editoVO.encrypt = parseInt(encrypt);
          editoVO.partnerId = parseInt(partnerId);
          editoVO.id = parseInt(id);
          _showEditPage(_editPanel);
        });
      },
      _initSetAdminBtn = function(){
        $(".set-repo-admin-btn").on("click", function () {
          var thisBtn = $(this);
          console.log("1111111111");
          $.get(_conf.OPEN_SET_ADMIN_URL + "?id=" + thisBtn.attr("repo_id"), {},
              function (data) {
                layer.open({
                  title: "指定操作用户",
                  type: 1,
                  maxmin: false,
                  area: ['970px', '850px'],
                  content: data,
                  end: function () {

                  },
                  cancel: function () {
                  },
                  error: function () {

                  },
                  success: function (layero) {
                    var mask = $(".layui-layer-shade");
                    mask.appendTo(layero.parent());
                    //其中：layero是弹层的DOM对象
                  }
                });
              });
        });
      },

      _initBtnEvent = function () {
        //编辑资源库按钮绑定的事件
        //给用户创建资源库按钮绑定事件
        $("#createRepoBtnforPartner").on("click", function (event) {
          $(this).blur();
          //1是给创
          _showCreatePage(_creteForUserPanel, "为客户创建资源库", 1);
        });
        //给创建资源库按钮绑定事件
        $("#createRepo").on("click", function (event) {
          $(this).blur();
          //0是创
          _showCreatePage(_createPanael, "创建资源库", 0);
        });
        $("#searchBtn").on("click", function () {
          $(this).blur();
          _refreshList();
        });
        $(".input-group").keydown(function (event) {

          if (event.keyCode == 13) {
            _refreshList();
          }
        });

      },
      _initCheckBoxClickEvent = function (layero, type) {
        $("input[type='checkbox']").on("click", function () {
          if ($(this).prop("checked")) {
            $(this).siblings("input[type='checkbox']").each(function () {
              if ($(this).prop("checked")) {
                $(this).attr("checked", false);
              }
            });
          }
        });

        var vo = {
          id: 0,
          partnerId: 0,
          modelId: 27,
          name: "",
          encrypt: 1,
          language: 0,
          soundRay: 0,
        };
        //创建的保存
        if (type == 0) {
          layero.find("#saveBtn").on("click", function () {
            vo.id = 0;
            vo.partnerId = _conf.partnerId;
            vo.name = layero.find("#libName").val().replace(/(^\s*)/g, "");
            var encrypt = layero.find("#encrypt").prop("checked");
            var noEncrypt = layero.find("#noEncrypt").prop("checked");

            if (encrypt && !noEncrypt) {
              vo.encrypt = 1;
            } else if (!encrypt && noEncrypt) {
              vo.encrypt = 0;
            } else {
              layer.msg("请选择加密方式");
              return;
            }
            vo.language = layero.find("#language").val();
            vo.soundRay = layero.find("#soundRay").val();

            var modelObj = layero.find("#models");
            if (modelObj.length == 0) {
              vo.modelId = 27;
            } else {
              vo.modelId = parseInt(modelObj.val());
            }

            _saveRepo(vo);
          });
        } else {
          layero.find("#saveBtn").on("click", function () {
            vo.partnerId = parseInt(layero.find("#partnerType").val());
            vo.name = layero.find("#libName").val().replace(/(^\s*)/g, "");
            var encrypt = layero.find("#encrypt").prop("checked");
            var noEncrypt = layero.find("#noEncrypt").prop("checked");

            if (encrypt && !noEncrypt) {
              vo.encrypt = 1;
            } else if (!encrypt && noEncrypt) {
              vo.encrypt = 0;
            } else {
              layer.msg("请选择加密方式");
              return;
            }
            var modelObj = layero.find("#models");
            if (modelObj.length == 0) {
              vo.modelId = 27;
            } else {
              vo.modelId = parseInt(modelObj.val());
            }
            vo.language = layero.find("#language").val();
            vo.soundRay = layero.find("#soundRay").val();

            _saveRepo(vo);
          });

        }
        layero.find("#closeBtn").on("click", function () {
          layer.closeAll();
        });
      },

      _initEditBtnClickEvent = function (lay, type) {
        $("input[type='checkbox']").on("click", function () {
          if ($(this).prop("checked")) {
            $(this).siblings("input[type='checkbox']").each(function () {
              if ($(this).prop("checked")) {
                $(this).attr("checked", false);
              }
            });
          }
        });

        lay.find("#saveBtn").on("click", function () {
          var name = $(this).parents("#editRepo-panel").find(
              "#libName").val().replace(/(^\s*)/g, "");

          if (name == "") {
            layer.msg("请输入资源库名称");
            return;
          }
          editoVO.name = name;
          var encrypt = lay.find("#encrypt").prop("checked");
          var noEncrypt = lay.find("#noEncrypt").prop("checked");

          if (encrypt && !noEncrypt) {
            editoVO.encrypt = 1;
          } else if (!encrypt && noEncrypt) {
            editoVO.encrypt = 0;
          } else {
            layer.msg("请选择加密方式");
            return;
          }
          editoVO.language = lay.find("#language").val();
          editoVO.soundRay = lay.find("#soundRay").val();

          _saveEditRepo(editoVO);
        });
        lay.find("#closeBtn").on("click", function () {
          layer.closeAll();
        })

      },
      _saveEditRepo = function (vo) {
        if (vo.partnerId <= 0) {
          layer.msg("请选择合作商");
          return;
        }
        if (vo.name == "") {
          layer.msg("请输入资源库名称");
          return;
        }
        $.ajax({
          type: "POST",
          url: _conf.UPDATA_REPO_URL,
          data: JSON.stringify(vo),
          dataType: "json",
          contentType: "application/json",
          async: false,
          success: function (data) {
            if (data.code == 0) {
              layer.msg("保存成功");
              layer.closeAll();
              _refreshList();
            } else {
              layer.msg(data.msg);
            }
          },
          error: function (data) {
            layer.msg("服务不可用");
          }
        });
      },
      _saveRepo = function (vo) {
        if (vo.partnerId <= 0) {
          layer.msg("请选择合作商");
          return;
        }
        if (vo.name == "") {
          layer.msg("请输入资源库名称");
          return;
        }
        $.ajax({
          type: "POST",
          url: _conf.CREATE_REPO_URL,
          data: JSON.stringify(vo),
          dataType: "json",
          contentType: "application/json",
          async: false,
          success: function (data) {
            if (data.code == 0) {
              layer.msg("创建成功");
              layer.closeAll();
              _refreshList();
            } else {
              layer.msg(data.msg);
            }
          },
          error: function (data) {
            layer.msg("服务不可用");
          }
        });
      },

      _showCreatePage = function (jqObject, title, type) {
        var obj = jqObject.html();
        var index = layer.open({
          title: title,
          type: 1,
          scrollbar: false,
          area: ["500px", "480px"],
          content: obj,
          end: function () {

          },
          cancel: function () {
          },
          success: function (layero) {
            _initCheckBoxClickEvent(layero, type);
          }
        });
      },
      _showEditPage = function (obj) {
        var index = layer.open({
          title: "编辑资源库",
          type: 1,
          scrollbar: false,
          area: ["500px", "470px"],
          content: obj,
          end: function () {

          },
          cancel: function () {

          },
          success: function (layero) {
            _initEditBtnClickEvent(layero, 1);
            var mask = $(".layui-layer-shade");
            mask.appendTo(layero.parent());
            //其中：layero是弹层的DOM对象
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
            layer.msg("请输入正确页数")
          }
        });
        paginationDom.keydown(function (event) {
          var i = event.keyCode;
          if (event.keyCode == 13) {
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
            if (page != undefined) {
              _refreshList(page);
            }
          }
        });
      },
      _clearSearch = function () {
        $("#repoPoolPanel").html("");
        $("#searchInput").val("");
      };

  return {
    init: function (conf) {
      _init(conf);
    },
    refreshCurrentPage: function () {
      _refreshCurrentPage();
    }
  }
})();