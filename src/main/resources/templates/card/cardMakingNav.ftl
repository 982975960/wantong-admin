<#--卡片制作导航栏-->
<@script src="/js/3rd-party/vue/2.6.10/dist/vue.min.js" />
<@link rel="stylesheet" href="/js/3rd-party/element-ui/2.12.0/lib/theme-chalk/index.css" />
<@script src="/js/3rd-party/element-ui/2.12.0/lib/index.js" />
<@link href="/css/cms/picturebook.css" rel="stylesheet"/>
<@link href = "/css/card/cardInfo.css" rel="stylesheet"/>
<@script src="/js/card/cardMakingNav.js"/>
<@script src="/js/common/pagination.js"></@script>
<div id="cardList">
    <div class="main-w">
        <div id="cardNavi" class="content-nav">
            <div class="con-nav-top">
                <form>
                 <label for="appId"><h2>选择套装</h2></label>
                 <template>
                       <el-select v-model="currentCardGroupId" @change="cardGroupChange">
                           <el-option v-for="item in cardGroup" :key="item.id" :label="item.name" :value="item.id">
                          </el-option>
                       </el-select>
                 </template>
                </form>
            </div>
            <div class="con-nav-cen">
                <ul id="listTab">
                 <li index = "100" :id="navItem.tab" v-for="navItem in navList" role="presentation" :class="navItem.class" @click="changeTab($event,navItem)"><a href="#">{{navItem.name}}</a></li>
                </ul>
            </div>
        </div>
        <div class="content-right">
            <div class="content-wrap-w">
                <div class="content-r-path">卡片管理 / 卡片制作 / <span id="curContentTab">{{currentTabName}}</span></div>
                <div class="content-box">
                    <#--头部模块 -->
                    <div class="con-r-top">
                        <div class="con-search-input" >
                            <div v-if="currentTab == 0">
                                <@checkPrivilege url = "/card/moveCardIntoResourceEditState.do">
                                    <div v-if="body.length <= 0" style="display: inline-block">
                                <input name="" type="button" value="全部移至资源待编辑"  disabled="disabled"  class="frame-Button-i search-Button " />
                                </div>
                                     <div v-else style="display: inline-block">
                                <input name="" type="button" value="全部移至资源待编辑"   class="frame-Button-b search-Button" @click="moveCardToEditResEvent" />
                            </div>
                                </@checkPrivilege>
                                <@checkPrivilege url = "/card/showCardPageFrame.do">
                                <div v-if="canAddCard" style="display: inline-block;margin-left: 10px;">
                                     <input name="" type="button" value="添加卡片"  class="frame-Button-b search-Button" style="width: 90px;" @click="addCardEvent" />
                                </div>
                                <div v-else style="display: inline-block;margin-left: 10px">
                                    <input name="" type="button" value="添加卡片"  disabled="disabled" style="width: 90px;" class="frame-Button-i search-Button"/>
                                </div>
                                </@checkPrivilege>
                            </div>
                            <div v-else-if="currentTab == 1">
                                <@checkPrivilege url="/card/intoTrain.do">
                                    <div v-if="body.length <= 0" style="display: inline-block">
                                        <input name="" type="button" value="全部移至待训练"  disabled="disabled"  class="frame-Button-i search-Button " />
                                    </div>
                                    <div v-else style="display: inline-block">
                                        <input name="" type="button" value="全部移至待训练"   class="frame-Button-b search-Button" @click="moveCardToWaitTrainEvent" />
                                    </div>
                                </@checkPrivilege>
                            </div>
                            <div v-else-if="currentTab == 2">
                                <div v-if="body.length <= 0" style="display: inline-block">
                                    <input name="" type="button" value="训练卡片"  disabled="disabled"  class="frame-Button-i search-Button " />
                                </div>
                                <div v-else style="display: inline-block">
                                    <input name="" type="button" value="训练卡片"   class="frame-Button-b search-Button" @click="moveCardToTrainEvent" />
                                </div>
                            </div>


                        </div>
                    </div>

                    <#--不同模块 -->
                    <div v-for="navItem in navList">
                        <div :id="navItem.id"  :class="navItem.class" :style="navItem.tabStyle" style="width: 100%; overflow: hidden;float: left;">
                            <div class="content" style="margin-top: 0;width: 105%;float: left;">
                                <div v-if="body.length > 0">
                                        <dl class="dlClass picture-hover" @mouseover="dlClassMouseOver(item)" @mouseout="dlClassMouseOut(item)"  v-for="item in body" @click.stop="clickPicture(item)">
                                            <dt id="thumbnailContainer" class="thumbnailContainer text-center center-block picture-book-thumbnail-container" @mouseover = "thumbnailContainerMouseOver(item)" @mouseout="thumbnailContainerMouseOut(item)" style="height: auto">
                                                <div id="thumbnail" class="picture-book-thumbnail" >
                                                    <img :src="item.imageUrl" alt="封面图" width="129" height="129">
                                                </div>
                                                <div class="picture-card-status-container">
                                                    <span v-if="item.state == 3" class="picture-card-status-failure">训练失败</span>
                                                </div>
                                                <span style="display:block;margin-left:20%;width: 100px;line-height: 30px;text-overflow:ellipsis;white-space:nowrap;overflow: hidden" :title="item.name">卡片名称: &nbsp;&nbsp;{{item.name}}</span>
                                                <div v-if="currentTab != 3" class="editBtn-container" :style="item.buttonContainerStyle" style="background-color: unset">
                                                    <span id="editBtn"  class="glyphicon" aria-hidden="true" @click="editCardClick(item)"></span>
                                                </div>
                                            </dt>
                                            <dd>
                                                <div class="pro-window" @mouseleave="proWindowLeave(item)">
                                                <div v-if="currentTab != 3 && currentTab != 2">
                                                    <div class="pro-window-ico" :style="item.proWindowIcoStyle" @click.stop="proWindowIcoClick(item)"><img src="static/images/ico-p.png" width="15" height="3" @click=""></div>
                                                    <div class="pro-window-box" :style="item.proWindowBoxStyle" >
                                                        <ul>
                                                            <@checkPrivilege url = "/card/deleteCardInfo.do">
                                                            <LI id="deleteLi" @click.stop="deleteCard(item)"><a href="#" id="deleteBtn">删除</a></LI>
                                                            </@checkPrivilege>
                                                        </ul>
                                                    </div>
                                                </div>
                                                </div>
                                            </dd>
                                        </dl>
                                        <div class="row" style="height: 70px"></div>
                                    </div>
                                <div v-else>
                                        <div v-if="currentTab == 0">
                                            <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">当前模块没有卡片数据，如果需要，请创建</div>
                                        </div>
                                        <div v-else-if="currentTab == 3">
                                            <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">当前没有正在训练的卡片</div>
                                        </div>
                                        <div v-else>
                                            <div id="noBooks" class="alert alert-info" style="margin-top: 20px;" role="alert">当前模块没有卡片数据</div>
                                        </div>
                                    </div>
                            </div>

                            <div class="con-page">
                                <div class="books-count"  style="float: left;">
                                    <label style="font-size: 12px;font-weight: normal">当前模块共{{navItem.cardCount}}张卡片</label>
                                </div>
                                <div v-show="navItem.isShowPagination" :id="navItem.paginationId" style="border: 0"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script>
    wantong.cardMakingNav.init({

    });
</script>

<style>
    .con-nav-top span{
        width: 30%;
        float: none;
        overflow: hidden;
        margin-top: 0px;
        background: none;
        text-align: center;
        padding-right: 0;
        font-size: 0px;
    }
    .el-select{
        width: 60%;
    }
    .con-search-input{
        float: right;
        text-align: right;
    }

    .frame-Button-i{
        background:#979da7;
        border:none;
        color:#ffffff;
        cursor:pointer;
        padding: 9px 15px;
        font-size: 14px;
    }
    .picture-card-status-container{
        margin-top: -145px;
        width: 100%;
        z-index: 5;
        display: inline-block;
    }
    .picture-card-status-failure{
        line-height: 30px;
        width: 100%;
        z-index: 10;
        display: inline-block;
        color: red;
        background-color: rgba(0, 0, 0, 0.55);
    }
</style>
