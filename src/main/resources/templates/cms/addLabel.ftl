<script>
  layui.use(['layer', 'form'], function () {
    var layer = layui.layer,
            form = layui.form;
  });
</script>
<@script src="/js/cms/labeladd.js"/>

<@link href="/css/cms/label.css" rel="stylesheet"/>
<style>
  .layui-unselect span {
    height: 38px;
  }
</style>
<div id="labelWarpper" style="float: left">
  <div id="addLabelTab" style="float: left;padding: 0 3%;margin-top: 10px">
    <div style="color: #737373;text-align: center">注意：如果您为书本勾选添加了玩瞳标签，当玩瞳对标签有修改时，您之前勾选了玩瞳标签的书本也会随之更新标签信息。</div>
    <div>
        <ul class="nav nav-tabs" id="tabUl" partnerId="${partnerId}" style="margin-top: 10px">
            <li class="voiceTabItem active" index="0" role="presentation"><a href="#">客户标签</a></li>
            <li class="voiceTabItem" index="1" role="presentation"><a href="#">玩瞳标签</a></li>
        </ul>
        <div id="partnerLabels" style="border: 1px solid #ddd;width: 100%;float: left;border-top: none;padding: 2%;">
            <#if partnerLabels?size<=0>
                暂无书本标签，请先在标签管理模块创建书本标签！
            </#if>
            <#list partnerLabels as father>
                <div class="label-container row" style="margin-top: 10px;width: 98%;margin-left: 10px">
                    <div class="father-label" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 14px;color: #343434;">
                        <input type="button" order="firstBtn" class="cho-down" style=" width: 18px; padding-bottom: 5px; border: none;">
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
                暂无书本标签，请先在标签管理模块创建书本标签！
            </#if>
            <#list wtLabels as father>
                <div class="label-container row" style="margin-top: 10px;width: 98%;margin-left: 10px">
                    <div class="father-label" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 14px;color: #343434;">
                        <input type="button" order="firstBtn" class="cho-down" style=" width: 18px; padding-bottom: 5px; border: none;">
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

    <div class="modal-footer" style="width: 94%;float: left;margin-left: 2%;margin-top: 10px;padding-right: 0;">
        <button class="pop-padding frame-Button-b" id="saveBtn" style="margin-left:95px;">保存</button>
        <button class="pop-padding frame-Button" id="closeBtn">关闭</button>
    </div>
</div>

<script>
  $(function () {
    wantong.labelAdd.init({
        partnerBookLabels: '${partnerBookLabels}',
        wtBookLabels: '${wtBookLabels}',
        bookId:'${bookId}',
        isMakePic: '${isMakePic?c}'
    });
  });
</script>
