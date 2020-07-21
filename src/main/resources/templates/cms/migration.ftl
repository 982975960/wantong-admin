<!--图书管理-->
<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>
<@link href="/css/cms/migration.css"/>
<@script src="/js/common/pagination.js"/>
<@script src="/js/cms/migration.js"/>
<@link href="/css/demo.css" rel="stylesheet"/>
<@link href="/css/3rd-party/zui/component-chosen.css" rel="stylesheet"/>
<script src="/static/js/3rd-party/chosen.jquery.js"></script>
<div id="migration_module" class="main-w">
    <div id="migration_left" class="content-nav">
<#--        <div class="con-nav-top">-->
<#--            <select v-model="self" @change="switchSourcePartner" class="con-r-top-l-frame frame-line" style="width: 180px; color: rgb(115, 115, 115); line-height: 20px; border: 0; height: 22px; font-size: 14px; padding: 0; padding-right: 23px;">-->
<#--                <option v-for="one in total" :value="one">{{one.partnerVO.partnerName}}</option>-->
<#--            </select>-->
<#--        </div>-->
        <div style="width:96%; border-bottom:1px solid #eceff8; float:left; padding:6%;">
            <select id="migration_partner_selector" style="display: none">
                <option v-for="one in total" :value="one.partnerVO.partnerId">{{one.partnerVO.partnerName}}</option>
            </select>
        </div>
        <div  class="con-nav-cen">
            <ul>
                <li @click="tag = 'submit', switchTag(), switchSourcePartner()"><a :class="{'nav-active': tag == 'submit'}" :style="tag == 'submit'?'color: #3dbceb;background-color: #f6f7fb;':''" href="#">资源迁移</a></li>
                <li @click="tag = 'schedule', switchTag()"><a :class="{'nav-active': tag == 'schedule'}" :style="tag == 'schedule'||tag == 'detail' ?'color: #3dbceb;background-color: #f6f7fb;':''" href="#">任务列表</a></li>
            </ul>
        </div>
    </div>
    <div id="migration_submit" class="content-right">
        <div class="content-wrap-w">
            <div class="content-r-path">图书管理 / 资源迁移 / 资源迁移</div>


            <!--新增代码---选择资源库-->


            <div  style="width:100%; background:#FFF; float:left; border-bottom:1px solid #eceff8; padding:5px 0 10px 0;">
                <div style="margin-left:1%;"><h2 style="line-height: 35px">选择资源库：</h2>
<#--                    <select id="sourceRepoName" @change="sourceRepoChanged" v-model="searchParam.repoId"-->
<#--                            class="con-r-top-l-frame frame-line"-->
<#--                            style=" width:200px; margin-right:10px; color:#737373;margin-top: 3px">-->
<#--                        <option v-for="one in self.repositoryVOList" :value="one.repositoryId">{{one.repositoryName}}</option>-->
<#--                    </select>-->
                    <div style=" width:250px; margin-right:20px; color:#737373;margin-top: 5px;float: left">
                        <select id="sourceRepoName">
                            <option v-for="one in self.repositoryVOList" :value="one.repositoryId">{{one.repositoryName}}</option>
                        </select>
                    </div>
                    <div style="width: 644px;background: rgb(246, 247, 251);float: left;font-size: 14px;height: 32px;margin-top: 3px;line-height: 32px;">
                            <span class="Button-left"><input @click="searchAllChanged" v-model="searchParam.whole" type="checkbox" style="width: 15px;height: 15px;margin-right: 10px;margin-left: 20px;"/>全选</span>
                        <span class="Button-left"> <span style="color: #cccccc;"> | </span> <input @change="searchStateChange" v-model="searchParam.editing" type="checkbox" style="width: 15px;height: 15px;margin-right: 10px;margin-left: 20px;"/>资源待编辑</span>
                        <span class="Button-left"><input @change="searchStateChange" v-model="searchParam.examining" type="checkbox" style="width: 15px;height: 15px;margin-right: 10px;margin-left: 20px;"/>待审核</span>
                        <span class="Button-left"><input @change="searchStateChange" v-model="searchParam.examined" type="checkbox" style="width: 15px;height: 15px;margin-right: 10px;margin-left: 20px;"/>已审核</span>
                        <span class="Button-left"> <span style="color: #cccccc;"> | </span> <input :disabled="!searchParam.examining && !searchParam.examined && !searchParam.editing" v-model="searchParam.forbidden" type="checkbox" style="width: 15px;height: 15px;margin-right: 10px;margin-left: 20px;"/>禁用中</span>
                    </div>
                </div>
            </div>
            <div class="content-box">
                <div class="con-r-top">
                    <div class="con-search">
                        <ul>
                            <Li><span class="search-name">书名：</span><span class="search-span"><input
                                            v-model="searchParam.bookName" type="text" placeholder="请输入书名"
                                            class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">ISBN：</span><span class="search-span"><input
                                            v-model="searchParam.isbn" type="text" placeholder="请输入完整ISBN号"
                                            maxlength="13" class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">出版社：</span><span class="search-span"><input
                                            v-model="searchParam.press" type="text" placeholder="请输入出版社"
                                            class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">系列名：</span><span class="search-span"><input
                                            v-model="searchParam.series" type="text" placeholder="请输入系列名"
                                            class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">版次：</span><span class="search-span"><input
                                            v-model="searchParam.edition" type="text" placeholder="请输入完整版次"
                                            class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">书本编号：</span><span class="search-span"><input
                                            v-model="searchParam.bookNumber" type="text" maxlength="12"
                                            placeholder="请输入完整编号" class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">BookID：</span><span class="search-span"><input
                                            v-model="searchParam.bookId" type="text" placeholder="请输入完整ID"
                                            class="search-box search-width"/></span></Li>
                            <Li><span class="search-name">标签名：</span><span class="search-span"><input
                                            v-model="searchParam.labelName" type="text" maxlength="15"
                                            placeholder="请输入完整标签名" class="search-box search-width"/></span></Li>
                        </ul>
                        <div class="con-search-input" style="width: 100% !important;">
                            <input v-on:click="searchParam.currentPage = 1, search()" type="submit" value="搜索" class="frame-Button-b search-Button" style="width:15%; margin-right:3%"/>
                            <input v-on:click="clearSearchInput" type="button" value="清空" class="search-Button02"/>
                        </div>


                        <!--搜索完结，以下复制到内容和领书页面一致。-->


                    </div>
                    <div class="ref-head">
                        <div class="ref-book-btn" style="float: left;margin-left: 0;margin-right: 10px;">
                            <@checkPrivilege url="/api/cms/migration/cut" >
                            <button @click="changeMode(true) ;migrationDialog()" type="button" class="btn btn-setup"
                                    style="background-color: rgb(61, 190, 237); border-radius: 0px; padding: 4px 12px; border: none; margin-top: 2px; width: 70px; color: white;">
                                移动到
                            </button>
                            </@checkPrivilege>
                            <button @click="changeMode(false) ;migrationDialog()" type="button" class="btn btn-setup"
                                    style="background-color: rgb(61, 190, 237); border-radius: 0px; padding: 4px 12px; border: none; margin-top: 2px; width: 70px; color: white;">
                                复制到
                            </button>
                        </div>
                        <div class="checkbox" style="float: left;margin-bottom: 0">
                            <label>
                                <input @click="selectAllChanged" v-model="selectAll" type="checkbox"
                                       style="width: 20px;height: 20px;margin-top: -4px;">
                                <label style="padding-left: 5px">
                                    全选
                                </label>
                            </label>
                        </div>

                    </div>
                    <div class="content-pro">
                        <div class="content-pro-pic" id="bookSearchShow">

                            <div v-if="searchNone"  class="alert alert-info" style="margin-top: 20px;" role="alert">
                                未搜索到相关资源库书本</div>

                            <dl class="dlClass picture-hover" v-for="one in books">
                                <dt
                                    class="thumbnailContainer text-center center-block picture-book-thumbnail-container"
                                    style="position: relative">
                                    <div id="thumbnail" class="picture-book-thumbnail">
                                        <img :src="one.picture"
                                             alt="封面图" width="109" height="109">
                                    </div>
                                    <div v-if="one.picChanged" class="ref-label" style="position: absolute;left: 1px;top: 4px; margin-left: 20px;">
                                        <span class="label label-default">图片维护中</span>
                                    </div>
                                    <div class="picture-book-status-container">
                                        <span class="picture-book-status">{{one.state==3? '已审核' :one.state==0?'资源待编辑':one.state==7?'待审核':'未知'}}{{one.forbidden?' 禁用中':''}}</span>
                                    </div>
                                    <div v-if="!one.onCopy" class="checkbox"
                                         style="position: absolute;left: 0;top: 0; margin: 0;">
                                        <label>
                                            <input type="checkbox" @change="bookOneSelectChanged(one.isSelected)" v-model="one.isSelected" style="height: 20px;width: 20px">
                                        </label>
                                    </div>
                                </dt>
                                <dd>
                                    <h3>{{one.name}}</h3>
                                    <span style="width: 150px">ISBN:{{one.isbn}}</span>
                                    <span style="width: 150px">作者:{{one.author}}</span>
                                    <span style="width: 150px;padding-right: 10px">出版社:{{one.publisher}}</span>
                                    <span style="width: 230px;padding-right: 10px">
                                    <span style="width: 140px;padding-right: 10px;">所属系列:{{one.series}}</span>
                                    <span v-if="one.onCopy" style="width: 70px;padding-right: 10px;color: red">资源迁移中</span>
                                </span>

                                    <div class="pro-release">
                                    </div>
                                </dd>
                                <div style="display:none;" class="row picture-book-title-container">
                                    <div class="picture-book-examine text-center">
                                    </div>
                                </div>
                            </dl>
                        </div>

                    </div>
                    <!--翻页-->
                    <div id="pagination_parent_migration_submit">
                    </div>
                </div>
            </div>
        </div>


        <#--    三个弹窗div-->
        <div>
            <#--    对话框start  -->
            <div id="migration_dialog" style="display: none">
                <div class="input-group row short-input-group" style="display: table;width: 100%;margin-top: 15px;">
                    <span class="input-group-addon" style="width: 154px;background-color: #ffffff;border: none;">合作商：</span>
<#--                    <select id="targetPartnerName" @change="targetPartnerIdChanged" v-model="targetPartnerId" class="con-r-top-l-frame frame-line" style="width: 280px;border-radius: 0;margin-left: 10px;padding-right: 25px">-->
<#--                        <option v-for="one in total" :value="one.partnerVO.partnerId">{{one.partnerVO.partnerName}}-->
<#--                        </option>-->
<#--                    </select>-->
                    <div style="width: 260px;">
                        <select id="targetPartnerName" >
                            <option v-for="one in total" :value="one.partnerVO.partnerId">{{one.partnerVO.partnerName}}
                            </option>
                        </select>
                    </div>

                </div>
                <div class="input-group row short-input-group" style="display: table;width: 100%;margin-top: 15px;">
                    <span class="input-group-addon" style="width: 154px;background-color: #ffffff;border: none;">资源库：</span>
<#--                    <select id="targetRepoName" v-model="migrationRequest.targetRepoId" class="con-r-top-l-frame frame-line" style="width: 280px;border-radius: 0;margin-left: 10px;padding-right: 25px">-->
<#--                        <option v-for="one in targetRepoList" :value="one.repositoryId">{{one.repositoryName}}</option>-->
<#--                    </select>-->
                    <div style="width: 260px;">
                        <select id="targetRepoName">
                            <option v-for="one in targetRepoList" :value="one.repositoryId">{{one.repositoryName}}</option>
                        </select>
                    </div>
                </div>
                <div class="input-group row short-input-group" style="display: table;width: 100%;margin-top: 10px">
                    <label style="width: 164px;float: left;background-color: #ffffff;border: none;margin-top: 4px"
                           class="input-group-addon">资源类型：</label>
                    <div style="width: 60%;float: left;margin-top: 5px;margin-left: 10px">
                        <div style="width: 30%;float: left;">
                            <input :disabled="targetPartnerId==1 || migrationRequest.isCutMode" type="checkbox" v-model="migrationRequest.normal">
                            <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-top: 5px;">领读</label>
                        </div>
                        <div style="width: 30%;float: left;">
                            <input :disabled="migrationRequest.isCutMode" type="checkbox" v-model="migrationRequest.pointing">
                            <label style="font-size: 14px;font-weight: normal;color: #555;margin-bottom: 0;margin-top: 5px;">点读</label>
                        </div>
                    </div>
                </div>
                <br><br><br><br><br>
                <div class="modal-footer" style="border-top: 1px solid #eceff8;margin-top: 20px">
                    <br>
                    <button type="button" @click="nextStep" class="pop-padding frame-Button-b">下一步</button>
                    <button type="button" @click="closeDialog" class="pop-padding frame-Button">关闭</button>
                </div>

            </div>
            <#--    对话框end  -->


            <div id="migration_ready_dialog" style="display: none">
                <img src="/static/images/ico_pic_right.jpg" width="65" height="64"
                     style="margin-left: 200px;margin-top: 40px;float: left"/>
                <span style="float: left;width:100%;font-size:20px;text-align: center;margin-top: 20px;">全部资源自检成功</span>
                <button type="button" @click="goCopy" class="pop-padding frame-Button-b"
                        style="float: left;width: 200px;height: 50px;font-size: 20px;margin-left: 135px;margin-top: 50px">开始{{modeName}}
                </button>
            </div>

            <!--弹窗-->
            <div id="migration_confirm_dialog" style="display: none">
                <div class=""
                     style="width: 680px;position: relative;height: 650px;padding: 0;margin-left: 20px;margin-right: 0;">
                    <div style="width: 103%;float: left;height: 595px;overflow-y: scroll;">
                        <div style="width: 100%;float: left;line-height: 40px;margin-top: 20px;"><img
                                    src="/static/images/ico_pic_waring.jpg"
                                    style="float: left; margin-right: 10px; width: 35px; height: 35px;"><span
                                    style="font-size: 16px; color: rgb(220, 170, 0);">自检完毕，输出位置存在相同内容书本资源，请检查！</span>
                            <span style=" font-size: 14px; margin-left: 80px;">
                                资源类型：
                                <span v-if="migrationRequest.normal">领读</span>
                                <span v-if="migrationRequest.pointing"> 点读</span>
                            </span>
                <div style="width: 100%; float: left; ">
                    <div class="work-box-bot" style="width: 313px; float: left;"><h3
                                style="background: rgb(218, 225, 244); line-height: 30px; color: rgb(52, 52, 52);"><span
                                    style="margin-left: 10px;">来源位置：{{sourcePartnerName}}\{{sourceRepoName}}</span></h3>
                        <div class="content-pro">
                            <div class="content-pro-pic">
                                <dl class="dlClass picture-hover" v-for="one in duplicatedBooks">
                                    <dt id="thumbnailContainer"
                                        class="thumbnailContainer text-center center-block picture-book-thumbnail-container"
                                        style="position: relative">
                                        <div id="thumbnail" class="picture-book-thumbnail">
                                            <img :src="one.picture"
                                                 alt="封面图" width="109" height="109">
                                        </div>
                                        <div v-if="one.picChanged" class="ref-label" style="position: absolute;left: 1px;top: 4px; margin-left: 20px;">
                                            <span class="label label-default">图片维护中</span>
                                        </div>
<#--                                        <div class="picture-book-status-container">-->
<#--                                            <span class="picture-book-status">{{one.state==3? '已审核' :one.state==0?'资源待编辑':one.state==7?'待审核':'未知'}}{{one.forbidden?' 禁用中':''}}</span>-->
<#--                                        </div>-->
                                    </dt>
                                    <dd>
                                        <h3>{{one.name}}</h3>
                                        <span style="width: 150px">ISBN:{{one.isbn}}</span>
                                        <span style="width: 150px">作者:{{one.author}}</span>
                                        <span style="width: 150px;padding-right: 10px">出版社:{{one.publisher}}</span>
                                        <span style="width: 230px;padding-right: 10px">
                                        <span style="width: 140px;padding-right: 10px;">所属系列:{{one.series}}</span>
                                    </span>

                                        <div class="pro-release">
                                        </div>
                                    </dd>
                                    <div style="display:none;" class="row picture-book-title-container">
                                        <div class="picture-book-examine text-center">
                                        </div>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                    <div class="work-box-bot" style="width: 313px; float: left; margin-left: 20px;"><h3 style="background: rgb(218, 225, 244); line-height: 30px; color: rgb(52, 52, 52);"><span style="margin-left: 10px;">输出位置：{{targetPartnerName}}\{{targetRepoName}}</span></h3>
                        <div class="content-pro">
                            <div class="content-pro-pic">
                                <dl class="dlClass picture-hover" v-for="one in duplicatedBooks">
                                    <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container" style="position: relative">
                                        <div id="thumbnail" class="picture-book-thumbnail">
                                            <img :src="one.picture" alt="封面图" width="109" height="109">
                                        </div>
                                        <div v-if="one.picChanged" class="ref-label" style="position: absolute;left: 1px;top: 4px; margin-left: 20px;">
                                            <span class="label label-default">图片维护中</span>
                                        </div>
<#--                                        <div class="picture-book-status-container">-->
<#--                                            <span class="picture-book-status">{{one.state==3? '已审核' :one.state==0?'资源待编辑':one.state==7?'待审核':'未知'}}{{one.forbidden?' 禁用中':''}}</span>-->
<#--                                        </div>-->
                                    </dt>
                                    <dd>
                                        <h3>{{one.name}}</h3>
                                        <span style="width: 150px">ISBN:{{one.isbn}}</span>
                                        <span style="width: 150px">作者:{{one.author}}</span>
                                        <span style="width: 150px;padding-right: 10px">出版社:{{one.publisher}}</span>
                                        <span style="width: 230px;padding-right: 10px">
                                        <span style="width: 140px;padding-right: 10px;">所属系列:{{one.series}}</span>
                                    </span>

                                        <div class="pro-release">
                                        </div>
                                    </dd>
                                    <div style="display:none;" class="row picture-book-title-container">
                                        <div class="picture-book-examine text-center">
                                        </div>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
                        </div>
                    </div>
                    <div style="background: rgb(255, 255, 255);width: 700px;height: 55px;position: absolute;bottom: 0px;line-height: 55px;padding-left: 10px;border-top: 1px solid rgb(236, 239, 248);">
                        <span>对全部相同内容书本资源使用相同操作</span> <span class="Button-left">
                    <input @click="overrideStateChanged" v-model="false == migrationRequest.override" type="checkbox" style="margin-right: 10px; margin-bottom: 2px;">
                全部忽略
            </span> <span class="Button-left">
                    <input @click="overrideStateChanged" v-model="true == migrationRequest.override" type="checkbox" style="margin-right: 10px; margin-bottom: 2px;">
                全部替换
            </span> <span style="float: right; margin: 10px 15px 0px 0px;"><button @click="goCopy"
                                                                                   class="pop-padding frame-Button-b Button-left"
                                                                                   style="height: 35px; line-height: 0px;">开始{{modeName}}</button></span>
                    </div>
                </div>
            </div>
            <!--弹窗结束-->
        </div>
    </div>
    <!--图书管理结束-->

    <div hidden id="migration_schedule">
        <div id="migration_orders" class="content-right">
            <div class="content-wrap-w">
            <div class="content-r-path">图书管理 / 资源迁移 / 任务列表</div>


            <div class="content-box partner-detail-panel" id="mobileParmManager">
                <div class="con-r-top">

                    <div class="con-r-top-l">
                        <h3 class="con-list-title">迁移状态</h3>
                        <select @change="refresh" v-model="state" class="con-r-top-l-frame frame-line" style="width: 80px;margin-right:10px;">
                            <option value="15">全部</option>
                            <option value="1">复制中</option>
                            <option value="6">复制完成</option>
                            <option value="8">移动完成</option>
                        </select>
                    </div>

                    <div class="con-r-top-r">
                        <button @click="refresh" class="frame-Button-b Button-left"><i class="layui-icon">&#xe669;</i> 刷新</button>
                    </div>
                </div>


                <div class="content-pro">
                    <div class="text-block-con row-t">
                        <ul>
                            <li>
                                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                    <thead>
                                    <tr class="text-block-head">
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">来源</td>
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">输出</td>
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">创建时间</td>
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">资源类型</td>
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">迁移状态</td>
                                        <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">操作</td>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr v-for="one in orders">
                                        <td align="left">
                                            {{one.whereFrom}}
                                        </td>
                                        <td align="left">
                                            {{one.whereTo}}
                                        </td>
                                        <td align="left">
                                            {{one.submitTime}}
                                        </td>
                                        <td align="left">
                                            {{one.resourceType}}
                                        </td>
                                        <td align="left" style="color: red">
                                            {{one.state}}
                                        </td>
                                        <td align="left">
                                            <button class="Button-line btn-look" @click="gotoItems( one )" style="">
                                                查看详情
                                            </button>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>

                            </li>
                        </ul>
                    </div>
                </div>

                <!--分页-->
                <div id="pagination_parent_migration_schedule" style="border: 0">
                </div>
                <!--分页-->
            </div>


        </div>
        </div>

        <div hidden id="migration_items" class="content-right">
            <div class="content-wrap-w">
                <div class="content-r-path">图书管理 / 资源迁移 / 任务列表</div>


                <div class="content-box partner-detail-panel" id="mobileParmManager">
                    <div class="con-r-top">

                        <div class="con-r-top-l" style="width: 100px">
                            <button @click="backToOrders" class="frame-Button-b"><i class="layui-icon">&#xe603;</i> 返回</button>
                        </div>
                        <div class="con-r-top-l" style="margin-left: 50px;width: 300px;height: 40px">
                            <span class="order_info_span" :title="openedOrder.whereFrom">
                                来源：{{openedOrder.whereFrom === undefined ? '' : openedOrder.whereFrom.length > 17 ? openedOrder.whereFrom.substr(0,17).concat("...") : openedOrder.whereFrom}}</span>
                            <span class="order_info_span" :title="openedOrder.whereTo">
                                输出：{{openedOrder.whereTo === undefined ? '' : openedOrder.whereTo.length > 17 ? openedOrder.whereTo.substr(0,17).concat("...") : openedOrder.whereTo}}</span>
                        </div>
                        <div class="con-r-top-l" style="margin-left: 50px;width: 250px;height: 40px">
                            <span class="order_info_span">资源状态：<span style="color: red">{{openedOrder.state}}</span></span>
                            <span class="order_info_span">资源类型：{{openedOrder.resourceType}}</span>
                        </div>
                        <div class="con-r-top-l" style="margin-left: 50px;width: 300px;height: 40px">
                            <span class="order_info_span">创建时间：{{openedOrder.submitTime}}</span>
                        </div>
                    </div>


                    <div class="content-pro">
                        <div class="text-block-con row-t">
                            <ul>
                                <li>
                                    <table width="100%" border="0" cellpadding="0" cellspacing="0">
                                        <thead>
                                        <tr class="text-block-head">
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">书名</td>
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">ISBN</td>
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">作者</td>
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">出版社</td>
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">所属系列</td>
                                            <td width="16%" align="left" valign="middle" nowrap="nowrap" bgcolor="#f6f7fb" style="border-bottom:none;">封面图片</td>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        <tr v-for="one in items">
                                            <td align="left" :title='one.name'>
                                                {{one.name.length>15?one.name.substr(0,15).concat("..."):one.name}}
                                            </td>
                                            <td align="left" :title='one.isbn'>
                                                {{one.isbn}}
                                            </td>
                                            <td align="left" :title='one.author'>
                                                {{one.author.length>15?one.author.substr(0,15).concat("..."):one.author}}
                                            </td>
                                            <td align="left" :title='one.publisher'>
                                                {{one.publisher.length>15?one.publisher.substr(0,15).concat("..."):one.publisher}}
                                            </td>
                                            <td align="left" :title='one.seriesTitle'>
                                                {{one.seriesTitle.length>15?one.seriesTitle.substr(0,15).concat("..."):one.seriesTitle}}
                                            </td>
                                            <td align="left" @click="showImage(one.coverImage)">
                                                <button  class="Button-line btn-look">封面图片</button>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>

                                </li>
                            </ul>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    </div>

    <script defer>
        wantong.cms.migration.initer.init();
    </script>
