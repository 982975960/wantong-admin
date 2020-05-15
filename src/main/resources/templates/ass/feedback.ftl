<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@script src = "/js/ass/feedback.js"></@script>
<@script src="/js/common/pagination.js"></@script>

<div class="main-w">
    <div class="content-wrap-w">
        <div class="content-r-path">
            售后服务/用户反馈
        </div>
        <div class="content-box" id="feedbackBody">
            <#--搜索框组-->
            <div class="con-r-top">
                <el-input type="text" placeholder="输入openId" v-model.trim ="resultSearch.openId" maxlength="32" style="width: 20%;" show-word-limit></el-input>
                <el-input type="text" placeholder="输入ISBN" v-model.trim ="resultSearch.isbn" maxlength="13" style="width: 20%;margin-left: 20px" show-word-limit></el-input>
            <#-- 问题反馈类型选择-->
                <template >
                    <el-select v-model="resultSearch.questionType" multiple placeholder="选择问题类别" style="margin-left: 20px;width: 30%;">
                        <el-option v-for="item in search.questionTypes" :key="item.type" :label="item.name" :value="item.type">
                        </el-option>
                    </el-select>
                </template>
<#--                搜索按钮-->
                <input name="" type="button" value="搜索" class="frame-Button-b search-Button" @click = "searchFeedback">
<#--               清空按钮-->
                <input name=""  type="button" value="清空" class="search-Button02"  style="margin-left: 8px"  @click = "clearSearchData">
            </div>
            <div class="content-pro">
                <#--列表-->
                <div class="text-block-con row-t">
                    <ul>
                        <li>
                            <table width="100%">
                                <thead>
                                <tr class="text-block-head">
                                    <td v-for="a in head" :width="a.width + '%'" :align="a.align"
                                        :valign="a.valign" :nowrap="a.nowrap" :bgcolor="a.bgcolor" :style="a.style">
                                        {{a.name}}
                                    </td>
                                </thead>
                                <tbody>
                                    <tr v-for="(tt,index) in body" class="anno-item" :keyId="tt.id">

                                    <td :align="align">{{tt.number}}</td>
                                    <td :align="align" style="max-width: 180px;overflow: hidden;white-space: nowrap;text-overflow: ellipsis" :title="tt.openId">{{tt.openId}}</td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.isbn"><div v-if='tt.isbn != ""' @click="showBookMessage(tt.isbn)" style="cursor:pointer ">{{tt.isbn}}</div><div v-else>/</div></td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.questionName"><div v-if='tt.questionName != ""'>{{tt.questionName}}</div><div v-else>/</div></td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.content"><div v-if='tt.content != ""'>{{tt.content}}</div><div v-else>/</div></td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.fileURL"><div v-if='tt.fileURL != "" '><div class="demo-image__preview">
                                                    <el-image :src="tt.src"
                                                              :on-close="closeViewer"
                                                            :preview-src-list="tt.srcList">
                                                    </el-image>
                                                </div>
                                            </div>
                                            <div v-else>/</div></td>
                                        <td :align="align" style="max-width: 180px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;" :title="tt.createTime"><div v-if="tt.createTime != ''">{{tt.createTime}}</div></td>
                                    </tr>
                                </tbody>
                            </table>
                        </li>
                    </ul>
                    <div v-if="body.length <= 0">
                        <div class="text-block-con row-t">
                        <div class="alert alert-info" style="margin-top: 20px;" role="alert">没有搜索到相关记录</div>
                    </div>
                    </div>
                </div>

                <el-dialog :title="title" width="800px" top="160px" :close-on-press-escape="false"  :close-on-click-modal="false" append-to-body="true" :before-close="handleClose" :visible="dialogFormVisible">
                    <div class="content-pro-pic-dig" style="height: 450px">
                    <el-tabs v-model="digUserData.activeName" type="border-card"   @tab-click="tabClick">
                        <el-tab-pane name="1" label="来自绘本图像库">
                            <div style="height: 350px">
                            <#-- 使用v-for 创建书本-->
                                <dl class="dlClass picture-hover" v-for="item in digUserData.pictureBookData">
                                    <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container">
                                        <div id="thumbnail" class="picture-book-thumbnail">
                                            <img :src ="item.cover_image" alt="封面图" width="109" height="109">
                                        </div>
                                    </dt>
                                    <dd>
                                        <h3 :title="item.name">{{item.name}}</h3>
                                        <span style="width: 150px" title="item.isbn">ISBN:{{item.isbn}}</span>
                                        <span style="width: 150px">作者:{{item.author}}</span>
                                        <span style="width: 150px;padding-right: 10px">出版社:{{item.publisher}}</span>
                                        <span style="width: 150px;padding-right: 10px">所属系列:{{item.series_title}}</span>
                                    </dd>
                                </dl>
                                <div v-if="digUserData.pictureBookData.length <= 0">
                                    <div class="text-block-con row-t">
                                        <div class="alert alert-info" style="margin-top: 20px;" role="alert">无匹配书本</div>
                                    </div>
                                </div>
                                <div v-show="isShowMessage" id="pictureBookPagination" style="border: 0"></div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="2" label="来自K12图像库">
                            <div style="height: 350px">
                                <dl class="dlClass picture-hover" v-for="item in digUserData.K12BookData" >
                                    <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container">
                                        <div id="thumbnail" class="picture-book-thumbnail">
                                            <img :src="item.cover_image"  style="" alt="封面图" width="109" height="109">
                                        </div>
                                    </dt>
                                    <dd>
                                        <h3 :title="item.name">{{item.name}}</h3>
                                        <span style="width: 150px" :title="item.isbn">ISBN:{{item.isbn}}</span>
                                        <span style="width: 150px">作者:{{item.author}}</span>
                                        <span style="width: 150px;padding-right: 10px">出版社:{{item.publisher}}</span>
                                        <span style="width: 150px;padding-right: 10px">所属系列:{{item.series_title}}</span>
                                    </dd>
                                </dl>
                                <div v-if="digUserData.K12BookData.length <= 0">
                                    <div class="text-block-con row-t">
                                        <div class="alert alert-info" style="margin-top: 20px;" role="alert">无匹配书本</div>
                                    </div>
                                </div>
                                <div v-show="isShowMessage" id="K12BookPagination" style="border: 0"></div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane name="3" label="来自豆瓣">
                            <div style="height: 350px">
                                <dl class="dlClass picture-hover" v-for="item in digUserData.doubanBookData">
                                    <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container">
                                        <div id="thumbnail" class="picture-book-thumbnail">
                                            <div v-if="item.imageURL == null">
                                                <img src="/static/images/noCoverImage.jpg"alt="封面图" width="109" height="109">
                                            </div>
                                            <div v-else>
                                            <img :src="item.imageURL"  style="" alt="封面图" width="109" height="109">
                                            </div>
                                        </div>
                                    </dt>
                                    <dd>
                                        <h3 :title="item.title">{{item.title}}</h3>
                                        <span style="width: 150px" :title="item.isbn">ISBN:{{item.isbn}}</span>
                                        <span style="width: 150px">作者:{{item.author}}</span>
                                        <span style="width: 150px;padding-right: 10px">出版社:{{item.publisher}}</span>
                                        <span style="width: 150px;padding-right: 10px">所属系列:{{item.seriesTitle}}</span>
                                    </dd>
                                </dl>
                                <div v-if="digUserData.doubanBookData.length <= 0">
                                    <div class="text-block-con row-t">
                                        <div class="alert alert-info" style="margin-top: 20px;" role="alert">无匹配书本</div>
                                    </div>
                                </div>
                                <div v-show="isShowMessage" id="DouBanBookPagination" style="border: 0"></div>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                    </div>
                </el-dialog>
                <#--分页-->
                <div v-show="isShowMessage" id="messageCenter_pagination" style="border: 0">
                    <div style="float: left"><span id="totalCount" style="background: #dadada; font-size: 14px;">共{{count}}条反馈</span></div>
                </div>


            </div>
        </div>
    </div>
</div>
<script>
    wantong.ass.feedback.init({

    });
</script>
<style>
    @media screen and (max-width: 1920px) {
        .search-Button{
            margin-left: 13%;
        }
    }
    @media screen and (max-width: 1600px) {
        .search-Button{
            margin-left: 13%;
        }
    }

    @media screen and (max-width: 1440px) {
        .search-Button{
            margin-left: 11%;
        }
    }

    @media screen and (max-width: 1366px) {
        .search-Button{
            margin-left: 11%;
        }
    }
    .el-dialog__header{
        border-bottom: 1px solid #eee;
        background-color: #f6f7fb;
    }
    <#--dialog 的脚部样式-->
    .el-dialog__footer{
        border-top: 1px solid #eceff8;
    }
    .el-select__tags {
        white-space: nowrap;
        overflow: hidden;
        flex-wrap: nowrap!important;
    }

    .content-pro-pic-dig dl{float:left; width:303px; margin-right:1%; margin-top:1.3%; box-sizing: border-box;height:97px; }
    .content-pro-pic-dig dl dt{ float:left; height:95px; width:95px; overflow:hidden;}
    .content-pro-pic-dig dl dt img{ width:100%;}
    .content-pro-pic-dig dl dd{float: left;width:200px;background: #f6f7fb;height:95px;padding-left:10px; line-height: 21px; position:relative;}
    .content-pro-pic-dig dl dd h3{ width:100%; margin-top:2.5%; float:left; overflow:hidden;white-space:nowrap;text-overflow:ellipsis;}
    .content-pro-pic-dig dl dd span{ width:100%; color:#b1b2b4; float:left;white-space:nowrap;text-overflow:ellipsis; height: 18px; overflow:hidden;}

</style>