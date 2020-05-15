<@script src="/js/cms/searchLabel.js"/>
<script src="/static/js/3rd-party/xlsx.mini.min.js"></script>
<script src="/static/js/common/excel.js"></script>
<div id="labelWarpper" >
    <div id="addLabelTab" style="margin-top: 15px">
        <#-- 输入框数据       -->
        <div class="title-label-input" style="margin-left: 2%">
            <span class="title-input" style="font-size: 15px;color: black">标签名:</span>
            <input class="" placeholder="请输入完整标签名" style="line-height: 19px">
            <span class="hint-text">(您可以通过标签名精准搜索)</span>
        </div>
        <div id="labelTab" style="height: 675px">
            <ul class="nav nav-tabs" id="tabUl" partnerId="${partnerId}">
                <li class="voiceTabItem active" index="0" role="presentation"><a href="#">客户标签</a></li>
                <li class="voiceTabItem" index="1" role="presentation"><a href="#">玩瞳标签</a></li>
            </ul>
            <div id="partnerLabels" style="border: 1px solid #ddd;width: 100%;float: left;border-top: none;padding: 2%;">
                <#if partnerLabels?size<=0>
                    暂无书本标签！
                </#if>
                <#list partnerLabels as father>
                    <div class="label-container row" style="margin-top: 10px;width: 98%;margin-left: 10px">
                        <div class="father-label" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 14px;color: #343434;">
                            <input type="button" order="firstBtn" class="cho-down" style=" width: 18px; padding-bottom: 5px; border: none;">
                            <input type="checkbox" order="first" lid="${father.id}" time="${father.createTime?string('yyyyMMddhhmmss')}" lname="${father.labelName}" class="label-${father.id}">
                            ${father.labelName}
                        </div>
                        <#list father.childLabels as secondChild>
                            <div class="father-label" style="margin-left: 30px;width: 100%;float: left">
                                <input type="button" order="secondBtn" class="cho-down" style=" width: 18px; height: 15px; border: none;margin-top: 3px">
                                <input type="checkbox" order="second" lid="${secondChild.id}" time="${secondChild.createTime?string('yyyyMMddhhmmss')}" lname="${secondChild.labelName}" class="label-${secondChild.id}">
                                ${secondChild.labelName}
                            </div>
                            <div class="child-label" style="margin-left: 60px;">
                                <#list secondChild.childLabels as thirdChild>
                                    <div class="col-md-3" style="margin-top: 5px;margin-bottom: 2px">
                                        <input type="checkbox" order="third" lid="${thirdChild.id}" time="${thirdChild.createTime?string('yyyyMMddhhmmss')}" lname="${thirdChild.labelName}" class="label-${thirdChild.id}" style="float: left;margin-top: 2px"><span style="width: 120px;text-align: left;margin-left: 10px;line-height: 17px">${thirdChild.labelName}</span>
                                    </div>
                                </#list>
                            </div>
                        </#list>
                    </div>
                </#list>
            </div>
            <div style="display: none;border: 1px solid #ddd;width: 100%;float: left;border-top: none"  id="wtLabels">
                <#if wtLabels?size<=0>
                    <hr></hr>
                    暂无书本标签！
                </#if>
                <#list wtLabels as father>
                    <div class="label-container row" style="margin-top: 10px;width: 98%;margin-left: 10px">
                        <div class="father-label" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 14px;color: #343434;">
                            <input type="button" order="firstBtn" class="cho-down" style=" width: 18px; padding-bottom: 5px; border: none;">
                            <input type="checkbox" order="first" lid="${father.id}" time="${father.createTime?string('yyyyMMddhhmmss')}" lname="${father.labelName}" class="label-${father.id}">
                            ${father.labelName}
                        </div>
                        <#list father.childLabels as secondChild>
                            <div class="father-label" style="margin-left: 30px;width: 100%;float: left">
                                <input type="button" order="secondBtn" class="cho-down" style=" width: 18px; height: 15px; border: none;margin-top: 3px">
                                <input type="checkbox" order="second" lid="${secondChild.id}" time="${secondChild.createTime?string('yyyyMMddhhmmss')}" lname="${secondChild.labelName}" class="label-${secondChild.id}">
                                ${secondChild.labelName}
                            </div>
                            <div class="child-label" style="margin-left: 60px;">
                                <#list secondChild.childLabels as thirdChild>
                                    <div class="col-md-3" style="margin-top: 5px;margin-bottom: 2px">
                                        <input type="checkbox" order="third" lid="${thirdChild.id}" time="${thirdChild.createTime?string('yyyyMMddhhmmss')}" lname="${thirdChild.labelName}" class="label-${thirdChild.id}" style="float: left;margin-top: 2px"><span style="width: 110px;text-align: left;margin-left: 10px;line-height: 17px;word-wrap: break-word;float:left;">${thirdChild.labelName}</span>
                                    </div>
                                </#list>
                            </div>
                        </#list>
                    </div>
                </#list>
            </div>
        </div>
    </div>

    <div class="modal-footer" style="width: 94%;float: left;margin-left: 2%;padding-right: 0;">
        <span class="hint" style="text-align: left;float: left;margin-top: 1%;">注：当输入了标签也选择了标签，那么将会以选择的标签来进行搜索</span>
        <button class="pop-padding frame-Button-b" id="saveBtn" style="margin-left:95px;">保存</button>
        <button class="pop-padding frame-Button" id="closeBtn">关闭</button>
    </div>
</div>

<style>
    .cho-down {
        background-image: url(../static/images/hide.png);
    }
    .cho-up {
        background-image: url(../static/images/show.png);
    }
    #labelTab {
        padding-left: 2%;
        padding-right: 2%;
        font-size: 110%;
        margin-top: 2%;
        width: 100%;
        height: 93%;
        overflow-y: scroll;
        overflow-x: hidden;
    }
</style>
<script>
    wantong.cms.searchLabel.init(
        {
            partnerId:${partnerId}
        }
    );
</script>