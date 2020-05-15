
var wantong = wantong || {};
wantong.messageCenter = (function () {
  var _conf = {
        LOAD_DATE_URL: GlobalVar.contextPath + "/system/messageList.do",
        DELETE_ITEM_URL: GlobalVar.contextPath + "/system/deleteMessage.do",
        CREATE_DATA_URL:"/system/createData.do",
        UPDATE_DATA_URL:"/system/updateData.do",
        CHANGE_DATA_INDEX_UEL:"/system/changeDataIndex.do"
      },
      _reg = /^\s*$/,
      // vue 视图模型
      viewModel = null,
      pagination = {},
      _init = function (conf) {
        $.extend(_conf, conf);
        _initData();
        console.log(viewModel);
        _initVue();
        _initPanelDate();
      },
      //初始化vue对象
      _initVue = function () {
        let app = new Vue({
          el: "#messageBody",
          data: viewModel,
          methods: {
            createMessage: _createMessageMethod,
            edit: _editMessageMethod,
            deleteItem: _deleteMessageMethod,
            saveMessageCenterData:_saveMessageCenter,
            change (e) {
              this.$forceUpdate()
            },
            handleClose(){
              viewModel.dialogFormVisible = false;
            }
          },
          updated:function () {
            _initSortTable();
          }
        });

      },
      //初始化数据结构
      _initData = function () {
        viewModel = {};
        pagination = {
          currentPage: 1,
          pageSize: 10
        };
        viewModel.isShowMessage = true;
        viewModel.tableData = {};
        viewModel.head = [{
          name: "序号",
          width: "10",
          align: "center",
          vAlign: "middle",
          noWrap: "nowrap",
          bgColor: "#f6f7fb",
          style: ""
        }, {
          name: "标题",
          width: "15",
          align: "center",
          vAlign: "middle",
          noWrap: "nowrap",
          bgColor: "#f6f7fb",
          style: ""
        }, {
          name: "链接",
          width: "25",
          align: "center",
          vAlign: "middle",
          noWrap: "nowrap",
          bgColor: "#f6f7fb",
          style: ""
        }, {
          name: "创建部门",
          width: "10",
          align: "center",
          vAlign: "middle",
          noWrap: "nowrap",
          bgColor: "#f6f7fb",
          style: ""
        }, {
          name: "发布时间",
          width: "20",
          align: "center",
          vAlign: "middle",
          noWrap: "",
          bgColor: "#f6f7fb",
          style: ""
        }, {
          name: "操作",
          width: "20",
          align: "center",
          vAlign: "middle",
          noWrap: "nowrap",
          bgColor: "#f6f7fb",
          style: ""
        }];
        viewModel.align = "center";
        viewModel.body = [];

        viewModel.dialogFormVisible=false;
        viewModel.title="新增公告";
        viewModel.form=[];
        viewModel.formLabelWidth = '80px';
        viewModel.isEdit = true;
      },
      //获取界面数据渲染
      _initPanelDate = function () {
        $.get(_conf.LOAD_DATE_URL, {
          currentPage: pagination.currentPage
        }, function (data) {
          if (data.code == 0) {
            let tableBody = [];
            for (let i = 0; i < data.data.list.length; i++) {
              tableBody.push(data.data.list[i]);
            }
            viewModel.body = [];
            viewModel.body = tableBody;

            let paginationParam = {
              currentPage: pagination.currentPage,
              totalPages: data.data.pagination.pages,
              parentElement: '#messageCenter_pagination',
              callback: function (index) {
                pagination.currentPage = index;
                _initPanelDate();
              }
            };
            util.makePagination(paginationParam)
          } else {

          }
        });
      },
      //创建公告 界面数据渲染
      _createMessageMethod = function () {
         viewModel.title="新增公告";
         viewModel.form={};
         viewModel.isEdit = false;
         viewModel.dialogFormVisible = true;
      },
      //编辑按钮事件
      _editMessageMethod = function (data) {
          viewModel.title="编辑";
          viewModel.form={};
          viewModel.form.id = data.id;
          viewModel.form.title = data.title;
          viewModel.form.href = data.href;
          viewModel.form.departmnt = data.departmnt;
          viewModel.isEdit = true;
          viewModel.dialogFormVisible = true;
      },
      //删除按钮事件
      _deleteMessageMethod = function (data) {
        let index = layer.confirm('您确认要删除此公告吗？', {title: '信息', btn: ['确定', '取消']},
            function () {
                $.get(_conf.DELETE_ITEM_URL,{
                  id:data.id
                },function (data) {
                  if(data.code == 0){
                    layer.close(index);
                    layer.msg("删除成功");
                    _initPanelDate();
                  }else {
                    layer.msg("错误");
                  }
                });
            }, function () {
                layer.close(index);
            });
      },
      //保存数据
      _saveMessageCenter = function (isEdit) {
        let vo = {
           number:0,
           id:0,
           title:"",
           href:"",
           departmnt:"",
           createTime:""
        };
        //编辑
        if(isEdit){
          vo.id = viewModel.form.id;
          vo.title = viewModel.form.title;
          vo.href = viewModel.form.href;
          vo.departmnt = viewModel.form.departmnt;
          _updateDataMethod(vo);
        }else {
          //创建
          vo.title = viewModel.form.title;
          vo.href = viewModel.form.href;
          vo.departmnt = viewModel.form.departmnt;

          _createDataMethod(vo);
        }
      },
      //创建数据保存
      _createDataMethod = function (vo) {

        if(vo.title == undefined || vo.title == ""  || _reg.test(vo.title)){
          layer.msg("标题不可为空");
          return;
        }
        if(vo.href == undefined || vo.href == ""  || _reg.test(vo.href)){
          layer.msg("链接不可为空");
          return;
        }
        if(vo.departmnt == undefined || vo.departmnt == ""  || _reg.test(vo.departmnt)){
          layer.msg("部门不可为空");
          return;
        }
        $.ajax({
          type:"POST",
          url: _conf.CREATE_DATA_URL,
          data: JSON.stringify(vo),
          contentType:"application/json",
          dataType:'json',
          async:false,
          success:function (data) {
            if(data.code == 0){
              layer.msg("创建成功");
              _initPanelDate();
              viewModel.dialogFormVisible = false;
            }else {
              layer.msg(data.msg);
            }
          },
          error: function () {
            layer.msg("服务异常");
          }
        });
      },
      //更新数据保存
      _updateDataMethod = function (vo) {
        if(vo.title == "" || _reg.test(vo.title)){
          layer.msg("标题不可为空");
          return;
        }
        if(vo.href == ""  || _reg.test(vo.href)){
          layer.msg("链接不可为空");
          return;
        }
        if(vo.departmnt == ""  || _reg.test(vo.departmnt)){
          layer.msg("部门不可为空");
          return;
        }
        $.ajax({
          type: "POST",
          url: _conf.UPDATE_DATA_URL,
          data: JSON.stringify(vo),
          contentType:"application/json",
          dataType:'json',
          async:false,
          success:function (data) {
            if(data.code == 0){
              layer.msg("保存成功");
              _initPanelDate();
              viewModel.dialogFormVisible = false;
            }else {
              layer.msg(data.msg);
            }
          },
          error:function () {
            layer.msg("服务异常");
          }
        });
      },
      //拖拽的注册
      _initSortTable = function () {
        $('.text-block-con tbody').sortable({
          animation: 150,
          draggable: '.anno-item',
          onUpdate:_dragUpdate
        });
      },
      //拖拽回调
      _dragUpdate = function (event) {
        let rows = $('.text-block-con tbody').find(".anno-item");
        rows.each(function (index) {
          var rowIndex = 1 + index;
          let id = $(this).attr("keyId");
          for (let i in viewModel.body) {
            if(viewModel.body[i].id == id){
              viewModel.body[i].number = rowIndex;
            }
          }
          if (index == rows.length-1){
            var changeId  = $(event.item).attr("keyId");
            var prevId = 0;
            var nextId = 0;
            if($(event.item).prev().length > 0){
              prevId = $(event.item).prev().attr("keyId");
            }else {
              nextId= $(event.item).next().attr("keyId");
            }
            //修改数据排序
            _changeDataIndex(changeId,prevId,nextId);
          }
        });


      },
      //改变拖拽后的顺序
      _changeDataIndex = function (changeId,prevId,nextId) {
        $.ajax({
          type:"POST",
          url:_conf.CHANGE_DATA_INDEX_UEL,
          data:{
            changeId:changeId,
            prevId:prevId,
            nextId:nextId
          },
          async:true,
          success:function (data) {
            if(data.code != 0){
              layer.msg("更新排序失败");
            }
          } ,error:function () {
              layer.msg("服务异常");
          }
        });
      };
     
  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();