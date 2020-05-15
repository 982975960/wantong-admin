<head>
    <meta charset="utf-8">
    <@script src="/js/app/sdkNewManage.js"/>
    <@link href="/css/app/sdkManage.css" rel="stylesheet"/>
</head>
<div id="sdk-list" class="content-pro">

    <#if ( "${platform}" == "1" )>
        <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;" role="alert">如有需要，请联系商务</div>
        </div>
    <#elseif ( "${platform}" == "3" )>
        <div class="text-block-con row-t">
            <div class="alert alert-info" style="margin-top: 20px;" role="alert">如有需要，请联系商务</div>
        </div>
    <#else>

        <div class="con-r-top" style="clear:both;margin-bottom:40px">
            <div class="con-r-top-r">
                <#if sdk ??>
                    <input hidden="hidden" id="downloadUrl" name="downloadUrl" type="text" value="${sdk.downloadUrl}">
                    <input hidden="hidden" id="oldVsersion" name="oldVsersion" type="text" value="${sdk.version}">
                    <p style="font-family:verdana;font-size:120%;color:black">
                        版本：${sdk.version}
                    </p>
                </#if>
            </div>
        </div>

        <#-- ios权限控制 -->
        <#if ( "${platform}" == "2" )>

            <div style="clear:both;both;">
                <div class="con-r-top-r">
                    <#if sdk ??>
                        <@checkPrivilege url = "/app/iosSdkDownload.do">
                            <button class="frame-Button-b Button-left" id="downloadSdk" name="downloadSdk">下载SDK</button>
                        </@checkPrivilege>
                    </#if>
                </div>
            </div>

            <div style="clear:both;padding-top:10px">
                <div class="con-r-top-r">
                    <@checkPrivilege url = "/app/iosSdkUpload.do">
                        <button class="frame-Button-b Button-left" id="createSdk" name="createSdk">上传SDK</button>
                    </@checkPrivilege>
                </div>
            </div>

        <#-- Android权限控制 -->
        <#elseif ( "${platform}" == "0" )>

            <div style="clear:both;">
                <div class="con-r-top-r">
                    <#if sdk ??>
                        <@checkPrivilege url = "/app/androidSdkDownload.do">
                            <button class="frame-Button-b Button-left" id="downloadSdk" name="downloadSdk">下载SDK</button>
                        </@checkPrivilege>
                    </#if>
                </div>
            </div>

            <div style="clear:both;;padding-top:10px">
                <div class="con-r-top-r">
                    <@checkPrivilege url = "/app/androidSdkUpload.do">
                        <button class="frame-Button-b Button-left" id="createSdk" name="createSdk">上传SDK</button>
                    </@checkPrivilege>
                </div>
            </div>

        </#if>


        <#-- 描述 -->
        <#if sdk ??>
            <div class="text-block-con row-t">
                <div class="alert alert-info" style="margin-top: 20px;" role="alert">${sdk.description}</div>
            </div>
        </#if>

    </#if>

    <!--创建SDK-->
    <div id="createSdkDom" style="display: none;width: 96%;margin: 3%;">
        <!--上部分-->
        <div>
            <div style="display:inline-block;width: 50%">

                <div class="form-group leftDiv" >
                    <label class="leftLable">平台:</label>
                    <input type="text" class="form-control" id="createSdkPlatform" style="width: 290px;border-radius: 0;" readonly="readonly">
                </div>

                <div class="form-group leftDiv" >
                    <label class="leftLable">版本号:</label>
                    <input type="text" class="form-control" placeholder="不能小于或等于所需最低版本号" id="sdkVersion" style="width: 290px;border-radius: 0;">
                </div>
            </div>
            <div style="display:inline-block;float: right;width: 47%;">
                <label style="font-weight: normal;margin-bottom: 10px;">上传SDK文件:</label>
                <div style="float: left;width: 100%;">
                    <div id="uploadFilePicker">
                        <img src="/static/images/sdk_upload.jpg" alt="上传SDK文件" style="width: 30%;margin-top: 20px;">
                    </div>
                    <div id="uploadFileName" class="uploadFileName"></div>
                </div>
            </div>
        </div>
        <!--上部分结束-->
        <!--下部分开始-->
        <div>
            <div class="form-group" style="width: 100%;float: left;">
                <label class="textareaLable">更新说明:</label>
                <textarea id="description" class="form-control" style="resize: none;width: 90%;height: 200px;"></textarea>
            </div>
        </div>
        <!--下部分结束-->
        <div class="modal-footer" style="width: 100%;float: left;">
            <button type="button" id="saveSdkBtn" class="pop-padding frame-Button-b">保存</button>
            <button type="button" id="closeSdkBtn" class="pop-padding frame-Button">关闭</button>
        </div>
    </div>
    <!--创建SDK结束-->

</div>

