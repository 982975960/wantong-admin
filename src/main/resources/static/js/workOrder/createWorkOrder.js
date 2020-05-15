wantong.createWorkOrder = (function () {
  var
      _conf = {
        //创建工单的URL 参数String-name Integer-modelId  返回APIResponse
        CREATE_WORK_ORDER: "/work/createWorkOrder.do",
        //更新工单的URL  long-id String-name  返回APIResponse
        UPDATE_WORK_ORDER: "/work/updateWorkOrder.do"
      },
      _root = null,
      _index = 0,
      _init = function (conf) {
        $.extend(_conf, conf);
        _root=$("#createWorkOrder");
        _index = layer.index;
        _initNameAndPartnerId();
        _initSearchSelect();
        _initCancel();
        _initSave();
        $(".layui-layer-content").css("overflow","visible");
      },
      _initSave = function (){
        _root.find(".confirm-button").click(function () {
          var thisBtn = $(this);
          thisBtn.blur();
          var nowTime = new Date().getTime();
          var clickTime = thisBtn.attr("ctime");
          if (clickTime != 'undefined' && (nowTime - clickTime
            < 5000)) {
            return false;
          } else {
            thisBtn.attr("ctime", nowTime);
          }

          var name = _root.find(".work-order-name").val();
          var partnerId = _root.find("#createWordOrderPartner").val();
          if(name === _conf.name && partnerId === _conf.partnerId){
            layer.msg("保存成功");
            setTimeout(function () {
              layer.close(_index);
            }, 500);
            return;
          }

          if(name == ""||name==undefined){
            layer.msg("请输入工单名称");
            return;
          }
          if(partnerId == ""||partnerId==undefined){
            layer.msg("请选择合作商");
            return;
          }

          if (_conf.id > 0){
            $.get(_conf.UPDATE_WORK_ORDER, {
              id: _conf.id,
              name: name,
              partnerId: partnerId
            }, function (data) {
              if (data.code == 0) {
                layer.msg("保存成功");
                setTimeout(function () {
                  layer.close(_index);
                  wantong.workOrderManager.workOrder.initWorkOrderList();
                }, 500);
              } else {
                layer.msg(data.msg);
              }
            })
          }else {
            $.get(_conf.CREATE_WORK_ORDER, {
              name: name,
              partnerId: partnerId,
              modelId: _conf.modelId
            }, function (data) {
              if (data.code == 0) {
                layer.msg("保存成功");
                setTimeout(function () {
                  layer.close(_index);
                  wantong.workOrderManager.workOrder.initWorkOrderList();
                }, 500);
              } else {
                layer.msg(data.msg);
              }
            })
          }
        });
      },
      _initNameAndPartnerId = function(){
        if (_conf.id > 0){
          _root.find(".work-order-name").val(_conf.name);
          _root.find("#createWordOrderPartner").val(_conf.partnerId).trigger("chosen:updated");
        }
      },
      _initCancel = function (){
        _root.find(".cancel-button").click(function () {
          layer.close(_index);
        });
      },
      _initSearchSelect = function () {
        $("#createWordOrderPartner").chosen({
          allow_single_deselect: true,
          search_contains: true,
          width: '100%'
        });
      };

  return {
    init: function (conf) {
      _init(conf);
    }
  }
})();