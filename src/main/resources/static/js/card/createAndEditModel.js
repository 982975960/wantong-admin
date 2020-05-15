wantong.createAndEditModel = (function () {
    var
        _conf = {
            SAVE_MODEL_URL: "card/saveModel.do",
            EDIT_MODEL_URL: "card/editModel.do"
        },
        _root = null,
        _index = 0,
        _partnerId = 0,
        _init = function (conf) {
            $.extend(_conf, conf);
            _root=$("#createAndEditModel");
            _index = layer.index;
            _partnerId = _conf.partnerId;
            _initBtnEvent();
            _initSearchSelect();
            _initEditDom();
        },
        _initEditDom = function () {
            if (_conf.modelId > 0){

                _root.find(".chosen-single").removeClass("chosen-default");
                _root.find(".chosen-single").find("span").html(_conf.partnerName);

                $("#createModelName").val(_conf.modelName);
            }
        },
        _initBtnEvent = function () {
            $("#selectPartner").on("change",function () {
                _partnerId = $("#selectPartner option:selected").val();
            });
            $("#saveBtn").on("click",function () {
                if (_conf.modelId == 0){
                    _saveCardModel();
                } else {
                    _editCardModel();
                }
            });
            $("#closeBtn").on("click",function () {
                layer.close(_index);
            });
        },
        _editCardModel = function(){
            var modelName = $("#createModelName").val();
            if (_partnerId == ""){
                layer.msg("请选择合作商");
                return;
            }
            if (modelName == ""){
                layer.msg("请输入卡片库名称");
                return;
            }
            $.post(_conf.EDIT_MODEL_URL,{
                "id": _conf.modelId,
                "partnerId":_partnerId,
                "modelName":modelName,
            },function (data) {
                if (data.code==0){
                    layer.msg("保存成功");
                    layer.close(_index);
                    // $("a[name='图库管理']").click();
                    wantong.modelManage.refreshCurrentPage();
                } else {
                    layer.msg(data.msg);
                }
            });
        },
        _saveCardModel = function(){
            var partnerId = $("#selectPartner option:selected").val();
            var modelName = $("#createModelName").val();

            if (partnerId == ""){
                layer.msg("请选择合作商");
                return;
            }
            if (modelName == ""){
                layer.msg("请输入卡片库名称");
                return;
            }
            $("#saveBtn").attr("disabled","disabled");
            $("#saveBtn").text("保存中···");
            $("#saveBtn").css("background","#e9f6fe");
            $("#saveBtn").css("color","#3dbeed");
            $.post(_conf.SAVE_MODEL_URL,{
                "partnerId":partnerId,
                "modelName":modelName
            },function (data) {
                if (data.code==0){
                    layer.msg("保存成功");
                    layer.close(_index);
                    // $("a[name='图库管理']").click();
                    wantong.modelManage.refreshCurrentPage();
                } else {
                    layer.msg(data.msg);
                }
            }).always(function(){
                $("#saveBtn").attr("disabled",false);
                $("#saveBtn").text("保存");
                $("#saveBtn").css("background","#3dbeed");
                $("#saveBtn").css("color","#ffffff");
            });
        },
        _initSearchSelect = function () {
            $('#selectPartner').chosen({
                allow_single_deselect: true,
                width: '100%',
                search_contains: true
            });
        };

    return {
        init: function (conf) {
            _init(conf);
        }
    }
})();
