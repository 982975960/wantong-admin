<script>
    layui.use(['layer', 'form'], function () {
        var layer = layui.layer,
                form = layui.form;
    });
</script>
	<style>
        .layui-unselect span {
            height: 38px;
        }
    </style>
<div id="grantAuth" style="padding: 15px;">
    <form class="grant-auth-form" id="grantAuthFrom" action="" method="post">
        <input type="hidden" name="roleId" value="${role.id}"/>
        <div class="top" style="overflow-y: scroll;margin-bottom: 20px;">
            <#list topLevelAuthorities as topLevel>
                <#assign id = topLevel.id>
                <div class="topLevel_${id}">
                  <div class="panel">
                    <div class="panel-heading" style="width: 99%;float: left;background: #f6f7fb;padding: 8px 15px;font-size: 16px;color: #343434;margin-bottom: 10px;">
                        <input type="button"
                               style="background-image: url(static/images/hide.png);width: 18px;height:18px;border:none;margin-right: 10px"
                               order="0" authid="${topLevel.id}">
                        <input type="checkbox" levelType="topLevel" url="${topLevel.url}" value="${topLevel.id}"
                               order="0"<#if topLevel.checked == 1>
                            checked="checked" </#if> >&nbsp;&nbsp;${topLevel.name}
                    </div>
                  </div>
                    <#if secondLevelAuthorities["${id}"]??>
                        <#assign item = secondLevelAuthorities["${id}"]>
                        <div class="secondLevel_${id}" style="display: inline;width: 100%;float: left;padding-left: 7%">
                            <#list item as secondLevel>
                                <div class="second">
                                    <div class="level_${secondLevel.id}" style="width: 100%;float: left;">
                                        <div class="panel-body" style="padding:2% 0 10px 0px;width: 100%;float: left;font-size: 14px">
                                            <input type="button"
                                                   style="background-image: url(static/images/hide.png);width: 18px;height:18px;border:none;"
                                                   order="1" authid="${secondLevel.id}">
                                            <input type="checkbox" levelType="secondLevel" value="${secondLevel.id}"
                                                   topId="${id}" order="1"<#if secondLevel.checked == 1>
                                                checked="checked" </#if> >&nbsp;&nbsp;${secondLevel.name}
                                        </div>
                                    </div>
                                </div>
                                <#if thirdLevelAuthorities["${secondLevel.id}"]??>
                                    <#assign item2 = thirdLevelAuthorities["${secondLevel.id}"]>
                                    <div class="thirdLevel_${secondLevel.id}" style="display: inline;width: 100%;float: left;padding-left: 2%;">
                                        <#list item2 as thirdLevel>
                                            <div class="panel-body" style="width: 33%;float: left;line-height: 19px;padding: 2px 0;padding-left: 15px;height: 40px;">
                                                <input type="checkbox" levelType="thirdLevel" value="${thirdLevel.id}"
                                                       secondId="${secondLevel.id}" topId="${id}"
                                                       order="2"<#if thirdLevel.checked == 1>
                                                    checked="checked" </#if> >&nbsp;&nbsp;${thirdLevel.name}
                                            </div>
                                        </#list>
                                    </div>
                                </#if>
                            </#list>
                        </div>
                    </#if>

                </div>
            </#list>
        </div>

        <div class="modal-footer" style="width:100%;float: left;">
            <button type="button" id="saveBtn" class="pop-padding frame-Button-b">保存</button>
            <button type="button" id="closeBtn" class="pop-padding frame-Button" data-dismiss="modal">关闭</button>
        </div>
    </form>
<@script src="/js/auth/grantAuthority.js"/>
    <script>
        $(function () {
            wantong.grantAuthority.init();
        });
    </script>
</div>
