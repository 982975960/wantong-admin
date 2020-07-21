<@link href="/css/app/partnerdetail.css" rel="stylesheet"/>
<@script src="/js/app/partnerdetailpanel.js"/>
<@script src= "/js/app/operatingConfiguration.js"/>
<@script src="/js/3rd-party/qrcode.min.js" />

<@link href="/css/demo.css" rel="stylesheet" />
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet" />
<@script src="/js/3rd-party/chosen.jquery.js"/>

<@script src="/js/common/Sortable.js"/>
<@script src="/js/common/jquery-sortable.js"/>

<div class="main-w" xmlns="http://www.w3.org/1999/html">
  <div class="content-wrap-w">
    <div class="content-r-path">应用管理 / 应用列表</div>
    <div class="content-box partner-detail-panel" id="partnerDetailPanel">

      <form id="searchFrom" action="" method="get">
        <input type="hidden" name="currentPage" id="currentPage" value="${page.currentPage!}"
               partnerId="${currentPartnerId}"/>
        <input type="hidden" name="partnerId" id="partnerId" value="${currentPartnerId}"/>
        <input type="hidden" name="searchText" id="searchText" value="${searchText}">
      </form>

      <div class="con-r-top">
        <div id="partnerList" class="con-r-top-l" style="float: left;">
          <div class="form-group">
            <h3 class="con-list-title">选择合作商</h3>

            <input hidden type="text" id="partnerInput" placeholder="请输入应用名称开始搜索"/>
            <div style="width: 200px;float: left;margin-left: 10px;">
              <select id="partnerSelect" class="form-control form-control-chosen">
                <#list partners as par>
                  <option value="${par.id}">${par.name}</option>
                </#list>
              </select>
            </div>

            <input hidden type="text" id="searchInput" value="${searchText}" placeholder="请输入应用名称开始搜索"/>
            <div style="width: 200px;float: left;margin-left: 10px;">
              <select id="searchSelect" class="form-control form-control-chosen" data-placeholder="请输入应用名称开始搜索">
                <option value="">所有应用</option>
                <#list appNames as a>
                  <option value="${a}">${a}</option>
                </#list>
              </select>

            </div>

          </div>
        </div>

        <@isVTAdmin>
          <div class="con-r-top-r">
            <@checkPrivilege url="/app/createnew.do">
              <input name="提交" type="submit" class="frame-Button-b Button-left" value="创建应用" id="createNewAppBtn"/>
            </@checkPrivilege>
          </div>
        </@isVTAdmin>
      </div>

      <div class="content-pro">
        <div class="text-block-con row-t">
          <ul>
            <li>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" id="partnersListPanel">
                <thead>

                <#if ( "${showActiveNum}" == "1" )>
                  <tr class="text-block-head">
                    <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用名称
                    </td>
                    <td width="4%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用ID
                    </td>
                    <td width="4%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">客户ID
                    </td>
                    <td width="6%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">产品类型
                    </td>
                    <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">授权方式
                    </td>
                    <td width="7%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">装机量
                    </td>
                    <td width="7%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">已激活数量
                    </td>
                    <td width="7%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">未激活数量
                    </td>
                    <td width="11%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用最新版本
                    </td>
                    <td width="24%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">操作
                    </td>
                  </tr>
                <#else>
                  <tr class="text-block-head">
                    <td width="15%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用名称
                    </td>
                    <td width="4%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用ID
                    </td>
                    <td width="4%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">客户ID
                    </td>
                    <td width="6%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">产品类型
                    </td>
                    <td width="10%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">授权方式
                    </td>
                    <td width="10%" align="center" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">装机量
                    </td>

                    <td width="11%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">应用最新版本
                    </td>
                    <td width="35%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb"
                        style="border-bottom:none;">操作
                    </td>
                  </tr>
                </#if>


                </thead>
                <tbody>
                <#list page.data as app>
                  <tr>
                    <#assign authorityType=app.authorityType>
                    <#assign productType=app.appTypeId>
                    <td align="left" id="appNameSpan">
                      <span style="float: left;padding-right: 5px">${app.appName}</span>
                      <@checkPrivilege url="/app/getAppParam.do">
                        <div id="buttonContainer" class="editBtn-container" style="visibility:hidden">
                            <span id="editBtn" class="glyphicon glyphicon-edit" aria-hidden="true" style="float: left;"
                                  appId="${app.id}"></span>
                        </div>
                      </@checkPrivilege>

                    </td>
                    <td align="center">${app.id}</td>
                    <td align="center">${currentPartnerId}</td>
                    <td align="left">
                        <#if (productType==0)>绘本
                        <#elseif (productType==1)>拼音魔力岛
                        <#elseif (productType==2)>汉字总动员
                        <#elseif (productType==3)>数字城堡
                        <#elseif (productType==4)>魔卡世界
                        <#elseif (productType==5)>情景英语
                        <#elseif (productType==6)>七巧板
                        <#elseif (productType==7)>步步学画
                        <#elseif (productType==8)>字母王国
                        <#elseif (productType==9)>唱画古诗
                        <#elseif (productType==10)>K12英语
                        <#elseif (productType==11)>查词
                        <#elseif (productType==12)>卡片
                        </#if>
                    </td>
                    <td align="left"><#if (authorityType==0)>License授权-限定授权数量<#elseif (authorityType==1)>授权码<#elseif (authorityType==2)>License授权-限定设备ID</#if></td>
                    <td align="center">${app.usedAmount + app.unusedAmount}</td>

                    <#if ( "${showActiveNum}" == "1" )>
                      <td align="center">${app.usedAmount}</td>
                      <td align="center">${app.unusedAmount}</td>
                    </#if>

                    <td align="left">${app.version!'未上传APK'}</td>

                    <!-- 操作列开始  -->
                    <td align="left" id="controller">

                      <#if (authorityType==1)>
                        <#if (app.version)??>
                          <@checkPrivilege url="/app/showdownloadqrcode.do">
                            <button type="button" appId="${app.id}" appCode="${app.appCode}"
                                    partnerId="${currentPartnerId}"
                                    version="${app.version!'未上传应用'}"
                                    class="show-download-qrcode-button Button-line btn-info">查看下载二维码
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/viewAuthrizationCodeRecord.do">
                            <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                    unusedAmount="${app.unusedAmount}"
                                    class="download-qrcode-button Button-line btn-info">下载授权码
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/updatelicenseamount.do">
                            <button type="button" appId="${app.id}" authorityType="${app.authorityType}"
                                    usedAmount="${app.usedAmount}" unusedAmount="${app.unusedAmount}"
                                    qrcodeNum="${app.qrcodeAmount}"
                                    class="modify-license-button Button-line btn-info">
                              授权数量
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/qrcodeConsumptionDetails.do">
                            <button type="button" appId="${app.id}" appName="${app.appName}" authorityType="${app.authorityType}"
                                    class="qrcode-consumption-details Button-line btn-info">
                              付费详情
                            </button>
                          </@checkPrivilege>
                        </#if>
                      <#elseif (authorityType==0 || authorityType==2)>
                          <@checkPrivilege url="/app/downloadlicense.do">
                            <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                    class="download-license-button Button-line btn-info">下载License
                            </button>
                          </@checkPrivilege>
                          <#if (authorityType==2)>
                          <@checkPrivilege url="/app/showLeadDevice.do">
                            <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                    class="leadingin-deviceId-button Button-line btn-info">
                              导入设备ID
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/showBindDeviceId.do">
                            <button type="button" appId="${app.id}"
                                    class="show-bind-deviceId Button-line btn-info">
                              查看导入设备ID
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/getDeviceIdLoginException.do">
                            <button type="button" appId="${app.id}"
                                    class="show-bind-deviceId-excepition Button-line btn-info">
                              查看异常设备ID
                            </button>
                          </@checkPrivilege>
                        </#if>
                        <#if (authorityType==0)>
                          <@checkPrivilege url="/app/updatelicenseamount.do">
                            <button type="button" appId="${app.id}" authorityType="${app.authorityType}"
                                    usedAmount="${app.usedAmount}" unusedAmount="${app.unusedAmount}"
                                    qrcodeNum="${app.qrcodeAmount}"
                                    class="modify-license-button Button-line btn-info">
                              授权数量
                            </button>
                          </@checkPrivilege>
                          <@checkPrivilege url="/app/qrcodeConsumptionDetails.do">
                            <button type="button" appId="${app.id}" appName="${app.appName}" authorityType="${app.authorityType}"
                                    class="qrcode-consumption-details Button-line btn-info">
                              付费详情
                            </button>
                          </@checkPrivilege>
                        </#if>
                      </#if>
                      <@isVTAdmin>
                        <@checkPrivilege url="/app/uploadapk.do">
                          <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                  version="${app.version!'未上传APK'}"
                                  class="upload-apk-button Button-line btn-info">管理应用下载
                          </button>
                        </@checkPrivilege>

                        <@checkPrivilege url="/app/toUpdateResourcePage.do">
                          <button type="button" appId="${app.id}" appVersionId="${app.appVersionId}"
                                  partnerId="${currentPartnerId}" class="to-update-resource Button-line btn-info">
                            更新资源包
                          </button>
                        </@checkPrivilege>
                        <button type="button" style="display: none;" class="Button-line"> 下载xxxx
                        </button>
                      </@isVTAdmin>
                      <@checkPrivilege url="/app/operatingConfig.do">
                        <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                class="operating_config Button-line btn-info">
                          运营配置
                        </button>
                      </@checkPrivilege>
                      <@checkPrivilege url="/app/lookRelationRepo.do">
                        <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                class="lookRelationRepo Button-line btn-info">
                          查看应用关联信息
                        </button>
                      </@checkPrivilege>


                     <#-- <@checkPrivilege url="/app/downloadNoSourceBook.do">
                        <button type="button" appId="${app.id}" partnerId="${currentPartnerId}"
                                class="download-noSourceBook-button Button-line btn-info">
                          无资源书本清单下载
                        </button>
                      </@checkPrivilege>-->


                    </td>
                    <!-- 操作列结束  -->
                  </tr>
                </#list>
                </tbody>
              </table>
            </li>
          </ul>
        </div>
      </div>

      <!--分页-->
      <#if (page.totalPage>1)>
        <div id="pageline" class="con-page" style="border:none; margin-top:1%;">
          <ul>
            <#--<li><a href="#" page="${page.first}">首页</a></li>-->
            <li class="page-back"><a href="#" page="${page.prev}"><img src="/static/images/ico9_03.png"></a></li>
            <#list page.arrPage as p>
              <#if p==page.currentPage>
                <li class="page-back-b"><a page="0">${p}</a></li>
              <#elseif p==-1>
                <li class="disabled page-back-b2"><a href="#" onclick="return false;">...</a></li>
              <#else >
                <li class="page-back-b2"><a href="#" page="${p}">${p}</a></li>
              </#if>
            </#list>
            <li class="page-back"><a href="#" page="${page.next}"><img src="/static/images/ico9_05.png"></a></li>
            <Li>到第</Li>
            <Li><input type="text" id="pageText" class="page-box page-back"></Li>
            <Li>页</Li>
            <Li><input name="" type="submit" value="跳转" class="page-input" id="pageJump"
                       totalPage="${page.totalPage}"/></Li>
          </ul>
        </div>
      </#if>
      <!--分页-->

      <div id="createNewAppDialog" style="display: none;border-top:1px solid rgb(236,239,248);padding: 2%;" appId=""
           class="popups-con">
        <div class="tab-toggle">
          <label id="appSettingToggle" class="tab-unit active">设置应用属性</label>
          <label id="repoSettingToggle" class="tab-unit" style="display: none">关联资源库</label>
        </div>
        <!-- AppTab -->
        <div id="appSetting" class="tab-container" style="padding-bottom: 110px;height: 440px;">
          <div class="input-group short-input-group" style="width: 100%;margin-left: 0;">
            <span class="input-group-addon" id="basic-addon3" style="padding-left: 10px;">应用名称</span>
            <input type="text" class="form-control" id="name" style="width: 482px;margin-left: 9px;"
                   aria-describedby="basic-addon3" placeholder="不能大于50个字符">
            <input type="hidden" id="partnerId" value="${currentPartnerId}">
          </div>
          <div id="nbeSetting" style="width: 100%;float: left;margin-top: 10px;">
              <span class="input-group-addon" style="font-size:12px;padding-left: 4px; float: left;">是否包含NBE</span>
              <select class="con-r-top-l-frame frame-line" name="nbeOpen" id="nbeOpen"
                      style="margin-left: 71px;">
                    <option value="0">否</option>
                    <option value="1">是</option>
              </select>
          </div>
          <div id="appTypeList" style="margin-top: 50px;">
            <form class="form-inline">
              <div class="form-group" id="appTypeSelect">
                <span class="input-group-addon" id="basic-addon3" style="float: left;padding-left: 10px;">产品类型</span>
                <!--<label for="appTypeName">选择APP类型</label>-->
                <select class="con-r-top-l-frame frame-line" name="appTypeName" id="appTypeName"
                        style="margin-left: 65px;">
                  <option value="-1">请选择产品类型</option>
                  <#list appTypes as appType >
                    <option value="${appType.appTypeId }">${appType.typeName}</option>
                  </#list>
                </select>
              </div>

              <div class="form-group" style="display: none;float: left;margin-left: -80px;" id="shareTypeSelect">
              <span class="input-group-addon" id="basic-addon3"
                    style="float: left;padding-left: 10px;width: 62px;margin-left: 121px;">资源库选择</span>
                <select class="con-r-top-l-frame frame-line" name="shareType" id="shareType"
                        style="margin-left: 35px;width: 190px;">
                  <option id="selectBoth" value="2">使用共享资源库</option>
                  <option id="selectClient" value="1">不使用共享资源库</option>
                  <option id="selectWantong" value="3">仅使用共享资源库</option>
                </select>
              </div>
              <div style="clear: both;"></div>
            </form>
          </div>
          <div class="show-grid" id="authSelect" style="display: none;width: 100%;float: left;margin-bottom: 0px;">
            <div class="input-group short-input-group" style="width: 44%;float: left;margin-left: 0px;">
              <span class="input-group-addon" style="padding-left: 10px;">授权方式</span>
              <div class="form-group">
                <select class="con-r-top-l-frame frame-line" id="authorityTypeSelect" style="margin-left: 9px;">
                  <option value="0">License授权-限定授权数量</option>
                  <option value="2">License授权-限定设备ID</option>
                  <option value="1">授权码</option>
                </select>
              </div>

              <span class="input-group-addon" style="padding-left: 105px;">授信方式</span>
              <div class="form-group">
                <select class="con-r-top-l-frame frame-line" id="verifyTypeSelect"
                        style="width: 190px;margin-left: 18px;">
                  <option value="0">无须授信(旧版license)</option>
                  <option value="1">登录授信(新版license)</option>
                </select>
              </div>

            </div>
          </div>
          <div id="platformSelect" style="display: none;width: 100%;float: left;margin-top: 10px;">
            <div class="input-group short-input-group" style="margin-bottom: 10px;width: 44%;float: left;margin-left: 0;">
              <span class="input-group-addon" style="padding-left: 10px;">开发系统</span>
              <div class="platform-select mr-selector-wrapper" style="margin-left: 9px;">
              <span class="mr-selector" id="platformInput" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
                    title="">--请选择--</span>
                <span class="img-selector" style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 15px;"></span>
                <ul class="select" style="z-index: 7">
                  <li><input type="checkbox" value="0" />Android</li>
                  <li><input type="checkbox" value="1"/>Linux</li>
                  <li><input type="checkbox" value="2" />IOS</li>
                  <li><input type="checkbox" value="3" />Rtos</li>
                  <div style="width: 100%;float: left;border-top: 1px solid #eceff8;text-align: right;">
                    <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b"
                           style="padding: 1px 10px;margin: 12px 10px 7px 10px;height: 23px;line-height: 20px;"
                           value="确定"/>
                  </div>
                </ul>
              </div>


              <span class="input-group-addon" style="width: 100px;padding-left: 85px;">技能&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
              <div class="skill-select mr-selector-wrapper">
              <span class="mr-selector" id="skillInput" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
                    title="点读配音">--请选择--</span>
                <span class="img-selector"
                      style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 15px;"></span>
                <ul class="select" style="width: 300px;margin-left: -109px;">
                  <div id="bookSkill" class="product-skill" style="display: none;">
                    <li><input type="checkbox" value="0" checked="checked" disabled="disabled"/>领读</li>
                    <li><input type="checkbox" value="1" />点读</li>
                    <li><input type="checkbox" value="2"/>配音</li>
                    <li><input type="checkbox" value="3" />拍照</li>
                    <li><input type="checkbox" value="4" />评测</li>
                    <li><input type="checkbox" value="5" />手指查词</li>
                  </div>
                  <div id="k12Skill" class="product-skill" style="display: none">
                    <div style="width: 100%;height: 30px;border-bottom: 1px solid #cccccc">
                    <li><input type="checkbox" value="0"/>领读</li>
                    <li><input type="checkbox" value="4"/>评测</li>
                    <li><input type="checkbox" value="5" />手指查词</li>
                    </div>
                    <div class="point-read" style="float: left;width: 100%;">
                      <div style="display: inline-block; float: left;margin: 0 5px 0 15px;width: 10%;">点读:</div>
                      <div style="display: inline-block;width: 83%;float: left;">
                        <div style="width: 30%;float: left;">
                          <div><input id="pointReadNormal" name="pointRead" type="checkbox" value="1"/><span class="radio-check">常规点读</span></div>
                          <div><input id="pointReadHigh" name="pointRead" type="checkbox" value="6"/><span class="radio-check">高精点读</span></div>
                        </div>
                        <div style="width: 70%;float: left;background: #f6f7fb;border-left: 1px solid #cccccc;padding-left: 10px;">
                          <div id="onlineDiv">
                              <span>选择获取手指坐标的方式：</span>
                              <div style="width: 40px;display: inline-block;"><input type="checkbox" name="online" value="50"><span class="radio-check">在线</span></div>
                              <div style="width: 40px;display: inline-block;"><input type="checkbox" name="online" value="51"><span class="radio-check" >离线</span></div>
                            </div>
                          <div id="ocrSupport" style="display: none; width: 130px">
                            <span>选择OCR服务提供方</span>
                            <div style="width: 40px;display: inline-block;"><input type="checkbox" name="support" value="100" checked="checked"><span class="radio-check">玩瞳</span></div>
                            <div style="width: 40px;display: inline-block;"><input type="checkbox" name="support" value="101"><span class="radio-check" >有道</span></div>
                            <div style="width: 40px;display: inline-block;"><input type="checkbox" name="support" value="102"><span class="radio-check" >百度</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div id="wordSearch" class="product-skill" style="display: none">
                    <li><input type="checkbox" value="5" checked="checked" disabled="disabled"/>手指查词</li>
                  </div>
                  <div id="cardSkill" class="product-skill" style="display: none">
                    <li><input type="checkbox" value="0" checked="checked" disabled="disabled"/>识别</li>
                    <li><input type="checkbox" value="1" />点读</li>
                  </div>
                  <div style="width: 100%;float: left;border-top: 1px solid #eceff8;text-align: right;">
                    <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b"
                           style="padding: 1px 10px;margin: 12px 10px 7px 10px;height: 23px;line-height: 20px;"
                           value="确定"/>
                  </div>
                </ul>
              </div>
            </div>
          </div>

          <div id="functionSelect" style="display: none;width: 100%;float: left;margin-top: 10px;">
            <div class="input-group short-input-group"
                 style="margin-bottom: 10px;width: 44%;float: left;margin-left: 0;">
              <span class="input-group-addon" style="padding-left: 10px;">功能配置</span>
              <div class="function-select mr-selector-wrapper" style="margin-left: 9px;">
              <span class="mr-selector" id="functionInput" style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;"
                    title="">--请选择--</span>
                <span class="img-selector" style="float: right;background: url(static/images/ico6.png) no-repeat 97% center transparent;width: 25px;height: 20px;margin-top: -25px;margin-right: 15px;"></span>
                <ul class="select">
                  <li style="width: 120px"><input type="checkbox" value="0" />喜马听故事</li>
                  <div style="width: 100%;float: left;border-top: 1px solid #eceff8;text-align: right;">
                    <input type="button" id="stateSureBtn" class="pop-padding frame-Button-b"
                           style="padding: 1px 10px;margin: 12px 10px 7px 10px;height: 23px;line-height: 20px;"
                           value="确定"/>
                  </div>
                </ul>
              </div>
            </div>
          </div>

        </div>
        <!-- 资源库TAB -->
        <div class="show-grid tab-container" id="repoPriorityDiv" style="display: none">
          <div class="input-group short-input-group">
            <div id="repoDiv" style="width:720px;">

              <div id="clientRepoSet" class="repoSetDiv">
                <div style="color: black; width: 100%; height:15px; font-size: 15px; margin-top: 10px; margin-left: 10px;">
                  客户资源库
                </div>
                <div class="container">
                  <!-- 私库 list -->
                  <div class="book-repo-list repo-list">
                    <!-- title -->
                    <div class="table-title"
                         style="width:698px;height: 32px; background-color: #F6F7FB; margin:10px 0 10px 10px;">
                      <div style="width: 195px;height: 32px; float: left; line-height:32px; padding-left: 10px;">资源库名
                      </div>
                      <div style="width: 197px;height: 32px; float: left; line-height:32px; padding-left: 50px; float: right">
                      </div>
                    </div>
                      <#list clientRepoList as clientRepo >
                          <#assign n2 = clientRepo_index + 1 />
                        <div repoId="${clientRepo.id}" model="${clientRepo.modelId}" priority=${n2} class="oneRepo" style="margin-left: 10px;">
                          <div class="enableRepo"><input class="normalRepoCheck" type="checkbox"/></div>
                          <div class="repoName">${clientRepo.name}</div>
                          <div class="authorityTypeDiv" style="display: none; float: right">
                            <select name="authorityTypeDiv">
                              <option value="1" selected>应用授权</option>
                                <#--                    <option value="2">用户授权</option>-->
                            </select>
                          </div>
                        </div>
                      </#list>
                  </div>
                </div>

              </div>
              <div id="wantongRepoSet" class="repoSetDiv">
                <div style="color: black; width: 100%; height:15px; font-size: 15px; margin-left: 10px;">共享资源库</div>
                <div class="container">
                  <div class="book-repo-list repo-list">
                    <div class="table-title"
                         style="width:698px;height: 32px; background-color: #F6F7FB; margin:10px 0 10px 10px;">
                      <div style="width: 195px;height: 32px; float: left; line-height:32px; padding-left:10px;">资源库名</div>
                      <div style="width: 197px;height: 32px; float: right; line-height:32px;padding-left: 70px">授权类型</div>
                    </div>
                  <#list wantongRepoList as wantongRepo >
                    <#assign n = wantongRepo_index + 1 />
                  <#--                  不为Rtos-->
                    <div repoId="${wantongRepo.id}" model="${wantongRepo.modelId}" priority=${n} class="oneRepo">
                      <div class="enableRepo"><input class="normalRepoCheck" type="checkbox"/></div>
                      <div class="repoName">${wantongRepo.name}</div>
                      <div class="authorityTypeDiv" style="float: right">
                        <select name="authorityTypeDiv">
                          <option value="1">应用授权</option>
                          <option value="2">用户授权</option>
                        </select>
                      </div>
                    </div>
                  </#list>
                  </div>
                </div>
              </div>
              <!--  吉美私库  -->
              <#--<div id="jimeiRepoSet" class="repoSetDiv">
                <div
                        style="color: black; width: 100%; height:15px; font-size: 15px; margin-top: 10px; margin-left: 10px;">
                  吉美资源库
                </div>
                <div class="container">
                  <div class="table-title"
                       style="width:698px;height: 32px; background-color: #F6F7FB; margin:10px 0 10px 10px;">
                    <div style="width: 195px;height: 32px; float: left; line-height:32px; padding-left: 10px;">资源库名
                    </div>
                    <div
                            style="width: 197px;height: 32px; float: left; line-height:32px; padding-left: 50px; float: right"></div>
                  </div>

                  <#list jimeiRepoList as jimeiRepo >
                    <#assign n2 = jimeiRepo_index + 1 />
                    <div repoId="${jimeiRepo.id}" priority=${n2} class="oneRepo" style="margin-left: 10px;">
                      <div class="enableRepo"><input class="normalRepoCheck" type="checkbox"/></div>
                      <div class="repoName">${jimeiRepo.name}</div>
                      <div class="authorityTypeDiv" style="display: none; float: right">
                        <select name="authorityTypeDiv">
                          <option value="1" selected>应用授权</option>
                          &lt;#&ndash;                    <option value="2">用户授权</option>&ndash;&gt;
                        </select>
                      </div>
                    </div>
                  </#list>
                </div>

              </div>-->
              <!--  吉美私库  -->


            </div>
          </div>
        </div>
        <div class="modal-footer"
             style="border-top:1px solid #eceff8;float: left;width: 100%;padding-right: 0;margin-top: 5px;padding-bottom: unset;padding-top: 10px;">
          <button type="button" id="saveButton" class="pop-padding frame-Button-b">保存</button>
          <button type="button" id="closeButton" class="pop-padding frame-Button">关闭</button>
        </div>
      </div>

      <div style="display: none;padding: 20px" id="modifyLicenseAmountDialog">

        <div class="alert alert-info" role="alert" style="margin-top: 10px;width: 50%" hidden="hidden">
          已授权数量：<span id="totalAmount"></span>
          已激活：<span id="usedAmount"></span>
          未激活：<span id="unusedAmount"></span>
        </div>
        <div id="error" style="display:none" class="alert alert-danger" role="alert"></div>
        <div class="input-group row short-input-group" style="width: 100%">
          <span class="input-group-addon" id="authorizeAmount"
                style="width: 154px;float: left;text-align: left;background-color: #ffffff;border: none;">已授权数量</span>
          <input type="text" class="form-control" id="amount" aria-describedby="basic-addon3"
                 onkeyup="this.value=this.value.replace(/^0/,'')" style="width: 280px;margin-left: 20px">
          <input type="hidden" id="appId" value="">
          <input type="hidden" id="partnerId" value="${currentPartnerId}">
        </div>
        <div class="input-group row short-input-group" id="qrcodeAuth"
             style="display: table;width: 100%;margin-top: 15px;">
          <span class="input-group-addon" id="basic-addon3"
                style="width: 154px;background-color: #ffffff;border: none;">单个授权码可授权数量</span>
          <input type="text" class="form-control" id="authNum" aria-describedby="basic-addon3"
                 style="width: 280px;border-radius: 0;margin-left: 10px"
                 placeholder="5">
        </div>
        <div class="input-group row short-input-group" id="setExp" style="display: table;width: 100%;margin-top: 10px">
          <label
                  style="width: 164px;float: left;text-align: left;background-color: #ffffff;border: none;margin-top: 4px"
                  class="input-group-addon">设置有效期:</label>
          <div style="width: 60%;float: left;margin-top: 5px;margin-left: 10px">
            <div id="noLimitDiv" style="width: 30%;float: left;">
              <input type="checkbox" id="noLimit">
              <label
                      style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-top: 5px;">无限制</label>
            </div>
            <div style="width: 30%;float: left;">
              <input type="checkbox" id="limitCheck" style="margin-top: 5px">
              <label
                      style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-top: 5px;">有限制</label>
            </div>
            <div style="display: none;" id="limitDiv">
              <div id="limitDaysDiv">
                <label
                        style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-top: 5px">有效期</label>
                <input class="form-control" id="limitDays"
                       style="width: 43%;height: 22px;margin-left: 4px;background: #ffffff;margin: 0 5px;" maxlength="4"
                       onkeyup="this.value=this.value.replace(/^(0+)|[^\d]+/g,'');">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">天</label>
              </div>
              <div style="display: inline-block;margin-bottom: 7px;width: 100%;float: left;margin-left: 5px;">
                <input type="checkbox" id="openPay" style="margin-top: 5px">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">有效期到期后，开启付费</label>
              </div>
              <div>
                <label
                        style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-left: 18px;">付费金额</label>
                <input class="form-control" id="payment"
                       style="width: 43%;height: 22px;margin-left: 4px;background: #ffffff;margin: 0 5px;"
                       disabled="disabled">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">元</label>
              </div>
              <div style="margin-top: 10px;width: 100%;float: left;">
                <label
                        style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-left: 18px;">付费延期</label>
                <input class="form-control" id="extendYear"
                       style="width: 30px;height: 22px;margin-left: 4px;background: #ffffff;margin: 0 5px;padding: 0 1px;"
                       maxlength="3"
                       onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" disabled="disabled">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">年</label>
                <input class="form-control" id="extendMonth"
                       style="width: 30px;height: 22px;margin-left: 4px;background: #ffffff;margin: 0 5px;padding: 0 1px;"
                       maxlength="2"
                       onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" disabled="disabled">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">月</label>
                <input class="form-control" id="extendDay"
                       style="width: 30px;height: 22px;margin-left: 4px;background: #ffffff;margin: 0 5px;padding: 0 1px;"
                       maxlength="2"
                       onkeyup="this.value=this.value.replace(/[^0-9]+/,'');" disabled="disabled">
                <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;">日</label>
              </div>
              <div style="margin-top: 10px;width: 100%;float: left;">
                <label
                        style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-left: 18px;">　提示语</label>
                <textarea id="desc" class="form-control" disabled="disabled"
                          style="display: inline-block;width: 64%;margin-left: 4px;"></textarea>
              </div>
            </div>
          </div>


        </div>

        <div class="modal-footer" style="border-top: 1px solid #eceff8;margin-top: 20px">
          <button type="button" id="saveButton" class="pop-padding frame-Button-b">保存</button>
          <button type="button" id="closeButton" class="pop-padding frame-Button">关闭</button>
        </div>
      </div>

      <div style="display: none;margin-top: 20px;" id="downloadApkQrCode">
        <div class="modal-body create-dialog-body">
          <img src="" id="downloadApkImg">
          <div id="qrcode" style="margin-left: 15%"></div>
        </div>
      </div>

      <div style="display: none;margin: 20px;" id="uploadAPKDialog">
        <div style="height: 30px;">
          <span style="font-size: larger;background-color: #eee;line-height: normal;">
            如果您需要修改下载应用界面的信息（如应用图标、应用名、产品介绍或更新APK等），您可以在界面进行编辑，一旦保存，下载应用界面的信息会同步更新
          </span>
        </div>
        <div class="layui-tab layui-tab-brief" lay-filter="docDemoTabBrief" style="margin-top: 10px;">
          <ul class="layui-tab-title">
            <li class="layui-this" id="AndroidTab">上传Android APK</li>
            <li id="iOSTab">上传iOS链接</li>
          </ul>
        </div>
        <div id="androidDiv">
          <div style="float: left">
            <div class="form-group" style="margin-top: 20px;">
              <label for="updateAppName">应用名称：</label>
              <input type="text" id="updateAppName" class="form-control" placeholder="应用名称">
            </div>

            <div class="form-group">
              <label for="edition">版本号：</label>
              <input type="text" id="version" class="form-control" placeholder="不能小于或等于所需最低版本号">
              <input type="hidden" id="appId" value="">
            </div>

            <div class="form-group">
              <label for="edition">所需最低版本号：</label>
              <input type="text" id="lowestVersion" class="form-control" placeholder="不能大于15个字符">
            </div>
          </div>
          <div style="float: right">
            <div style="background: #cccccc;height: 90px;margin-top: 20px;">
              <img id="updateAppImage" src="static/images/updateAppImage.jpg" alt="请上传JPG格式的图标" style="width: 140px;height: 90px">
            </div>
            <div style="margin-top: 10px;width: 140px" id="changeAppImageBtn" >更换应用图标</div>
          </div>

          <div class="form-group" style="width: 100%; float: left;">
            <span>产品介绍：</span>
            <span style="float: right">
              <input type="checkbox" id="useVtIntroduce" style="width: 15px;height: 15px;margin-right: 10px;">使用玩瞳慧读伴侣介绍
            </span>
            <textarea class="form-control summary" style="height: 200px;" id="summaryNew" placeholder="不能超过2000字">
阅读是送给孩子最好的礼物，慧读伴侣是陪伴小朋友最好的伙伴。
【慧读使命】
在健康中成长，在快乐中阅读培养阅读兴趣，养成阅读习惯。
【慧读简介】
让小孩子脱离电子屏幕，感受真正阅读乐趣翻到哪里读哪里， 翻页响应毫秒级任意购买正版绘本， 主流绘本都能识别书库数量达到10000+， 每季度增加1000+实时合成智能TTS， 全新视觉黑科技旧手机不再闲置，即刻化身绘本阅读机器人。
【慧读功能】
人工智能--AI技术为小朋友打造智慧共读纯正发音--实时智能TTS就像身边陪读伙伴实时更新--为孩子提供海量阅读图书馆。</textarea>
            <textarea hidden class="ximaSummary">
“慧读故事”给小朋友带来阅读的乐趣，享受阅读美好时光。
【产品简介】
畅听绘本故事，养成阅读兴趣
AI技术智慧共读，秒翻即识别
喜马拉雅海量绘本，千万内容实时更新
任意购买正价绘本，主流绘本都能识别
【产品特色】
六大领域10000+绘本，每季更新1000+
孩子们挚爱的音频尽在喜马拉雅专区
迪士尼、西游记、小猪佩奇、海底小纵队
米小圈、父与子、宝宝巴士、爱探险的朵拉</textarea>
          </div>

          <div class="input-group row  short-input-group" style="margin-left: 0">
            <div id="uploader" class="wu-example">
              <div class="btns">
                <div id="uploadFilePicker" style="border-radius: 0;float: left;">上传APK包</div>
                <div id="uploadFileList" class="alert alert-success"
                     style="text-overflow:ellipsis;white-space:nowrap;overflow:hidden;border: 0;background: no-repeat;color: #737373;float: left;margin: 0;padding-top: 12px;"
                     role="alert">
                  还没有选择任何APK文件
                </div>
              </div>
            </div>

            <div id="uploadProgress" style="display:none;width: 100%;float: left;" class="toy-upload-progress progress">
              <div class="toy-upload-progress-bar progress-bar progress-bar-success" role="progressbar"
                   aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                <span class="sr-only">0% Complete (success)</span>
              </div>
            </div>
          </div>
          <div class="modal-footer" style="border-top: 1px solid #eceff8;margin-top: 20px;padding-right: 0;">
            <button type="button" id="saveButton" class="pop-padding frame-Button-b" style="margin-right: 10px">保存</button>
            <button id="closeButton" type="button" class="pop-padding frame-Button">关闭</button>
          </div>
        </div>
        <div id="iOSDiv" style="display: none;">
          <div class="form-group">
            <label for="edition" style="font-weight: normal;margin: 20px 0;width: 100%;">苹果App Store应用下载链接：</label>
            <input type="text" id="iOSLink" class="form-control" style="width: 100%">
          </div>

          <div class="modal-footer">
            <button type="button" id="saveButton2" class="pop-padding frame-Button-b">保存</button>
            <button id="closeButton" type="button" class="pop-padding frame-Button">关闭</button>
          </div>
        </div>


      </div>

      <div class="modal fade create-dialog" id="uploadResourceDialog" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                        aria-hidden="true">&times;</span></button>
              <h4 class="modal-title">更新资源包</h4>
            </div>
            <div class="modal-body create-dialog-body">
              <div id="error" style="display:none" class="alert alert-danger" role="alert"></div>
              <div class="input-group row short-input-group">
                <span class="input-group-addon" id="basic-addon3">版本号</span>
                <input type="text" class="form-control" id="version" aria-describedby="basic-addon3">
                <input type="hidden" id="appId" value="">
                <input type="hidden" id="appVersionId" value="">
              </div>
              <div class="input-group row  short-input-group">
                版本更新内容
                <textarea class="form-control" id="summary" rows="15"></textarea>
              </div>
              <div class="input-group row  short-input-group">
                <div id="uploader" class="wu-example">
                  <div class="btns">
                    <div id="uploadFilePicker">上传资源K包</div>
                    <div id="uploadFileList" class="alert alert-success"
                         style="display:inline;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;width:300px;"
                         role="alert">
                      还没有选择任何ZIP文件
                    </div>
                  </div>
                </div>


                <div id="uploadProgress" style="display:none" class="toy-upload-progress progress">
                  <div class="toy-upload-progress-bar progress-bar progress-bar-success" role="progressbar"
                       aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%">
                    <span class="sr-only">0% Complete (success)</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" id="saveButton" class="pop-padding frame-Button-b">保存</button>
              <button type="button" id="cancelButton" class="pop-padding frame-Button" data-dismiss="modal">关闭</button>
            </div>
          </div><!-- /.modal-content -->
        </div><!-- /.modal-dialog -->
      </div>
    </div>
  </div>
  <style>
    .normalRepoCheck.active {
      /*background: url(/static/images/ico_unchecked.jpg) no-repeat 0 0;
      background-size: 100%;*/
    }

    .tab-toggle .tab-unit:first-child {
      /*margin-left: 10px;*/
    }

    .tab-toggle .tab-unit {
      width: 100px;
      height: 31px;
      border-top: 1px solid rgb(204, 204, 204);
      border-right: 1px solid rgb(204, 204, 204);
      border-left: 1px solid rgb(204, 204, 204);
      border-image: initial;
      text-align: center;
      border-bottom: none;
      line-height: 31px;
      margin-right: 2px;
      color: rgb(115, 115, 115);
      cursor: pointer;
      margin-bottom: -1px;
      background: rgba(0,0,0,0);
    }

    .tab-toggle .tab-unit.active {
      color: #3DBEED;
      background: #FFF;
    }
    .tab-toggle {
      border-bottom: 1px solid #cccccc
    }
    .tab-container {
      padding-top: 10px;
      max-height: 500px;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-bottom: 1px solid #ccc;
    }
  </style>
  <script>
    $(function () {
      var defaultCheckedRepos = [];
      <#list defaultCheckedRepos as repo>
      defaultCheckedRepos.push(${repo});
      </#list>

      console.log(defaultCheckedRepos);
      wantong.partnerDetailPanel.init({
        defaultCheckedRepos: defaultCheckedRepos,
      });
    });
  </script>
</div>


