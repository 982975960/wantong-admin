

wantong.base.searchLabel = (function () {
    var
    _root = null,
    _config = {},
    _init = function (config) {
        $.extend(_config,config);
        _root = $("#labelWarpper");
        _initPanel();
        _showAndHide();
        _initBtn();
    },

    _initPanel = function () {
        if(_config.partnerId == 1){
            _root.find("#tabUl").find("li[index=0]").css("display","none");
            _root.find("#partnerLabels").css("display","none");
            _root.find("#tabUl").find("li[index=1]").addClass("active");
            _root.find("#wtLabels").css("display","block");
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
    _initBtn = function() {
        function sortTimeAndId(a ,b){
            return a.createTime != b.createTime ? Number(a.createTime) - Number(b.createTime) : a.id - b.id;
        }
        _root.find("input[order='third']").on("click",function () {
            if ($(this).prop('checked')) {
                var inputDom = $(this).parents(".child-label").prev().find("input[order='second']");
                if (!inputDom.prop("checked")){
                    inputDom.prop("checked",true);
                }
                var firstDom = inputDom.parents(".father-label").prevAll().find("input[order='first']");
                if (!firstDom.prop("checked")){
                    firstDom.prop("checked",true);
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
            } else {
                var firstDom = $(this).parents(".father-label").prevAll().find("input[order='first']");
                if (!firstDom.prop("checked")){
                    firstDom.prop("checked",true);
                }
            }
        });
        _root.find("input[order='first']").on("click",function () {
            if (!$(this).prop('checked')) {
                var firstDomLength = $(this).parent().nextAll(".father-label").find("input[type='checkbox']:checked").length;
                if (firstDomLength == 0){
                    $(this).prop('checked',false);
                } else {
                    $(this).prop('checked',true);
                    layer.msg("存在二级标签时，不能勾选掉一级标签");
                }
            }
        });

        _root.find("#saveBtn").off("click").on("click", function() {
            let labelIds = new Array();
            let labelNames = new Array();
            $("input[order='third']").each(function(){
                if($(this).prop("checked")){
                    var id = $(this).attr("lid");
                    labelIds.push(id);
                    var labelName = $(this).next().text();
                    labelNames.push(labelName);
                }
            });
            $("input[order='second']").each(function() {
                if($(this).prop("checked")){
                    var thirdSize = $(this).parent().next().find("input[type='checkbox']:checked").length;
                    if (thirdSize==0){
                        var id = $(this).attr('lid');
                        labelIds.push(id);
                        var labelName = $(this).parent().text();
                        labelNames.push(labelName);
                    }
                }
            });
            $("input[order='first']").each(function () {
                if($(this).prop("checked")){
                    var secondsSzie = $(this).parent().nextAll(".father-label").find("input[type='checkbox']:checked").length;
                    if(secondsSzie == 0){
                        let id = $(this).attr("lid");
                        let labelName = $(this).parent().text();
                        labelIds.push(id);
                        labelNames.push(labelName);
                    }
                }
            });
            let inputLabelName = $(".title-label-input").find("input").val();
            for (var i =0;i < labelNames.length; i++){
                for (var j = labelNames.length -1; j > i ; j-- ){
                    if (labelNames[i] == labelNames[j]){
                        layer.msg("不可同时勾选相同标签名的标签，请注意检查");
                        return;
                    }
                }
            }
        //  设置label名称  和Id 切关闭layer
            let labelNameAll = "";
            for (var i = 0; i<labelNames.length; i++){
                if(i == 0){
                    labelNameAll = labelNames[i].replace(/(^\s*)|(\s*$)/g, "")
                } else {
                    labelNameAll = labelNameAll +"," + labelNames[i].replace(/(^\s*)|(\s*$)/g, "");
                }

            }
            let  labelIdAll = "";
            for (var i = 0 ;i< labelIds.length; i++){
                if(i == 0){
                    labelIdAll = labelIds[i];
                } else {
                    labelIdAll = labelIdAll + "," + labelIds[i];
                }
            }
            if(labelIds.length <= 0){
                wantong.base.booklist.search.closeLabelLayer(labelIdAll,labelNameAll,inputLabelName);
            } else {
                wantong.base.booklist.search.closeLabelLayer(labelIdAll,labelNameAll,"");
            }

        });
        //关闭layer
        _root.find("#closeBtn").off("click").on("click",function () {
            wantong.base.booklist.search.closeLabelLayer();
        });
     },
    _initChecked = function(ids) {
        if(""!=ids){
            let arr = ids.split(",");
            for (let i = 0; i < arr.length; i++) {
                _root.find("input[lid='"+arr[i]+"']").click();
            }
        }
    },
    _showAndHide = function () {
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
    };
    return{
        init:function(conf) {
            _init(conf);
        },
        initChecked:function(ids) {
            _initChecked(ids);
        }
    }
}) ();