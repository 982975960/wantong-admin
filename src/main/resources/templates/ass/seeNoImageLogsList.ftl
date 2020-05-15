<div class="text-block-con row-t" id="seeNoImageLogs">
    <div class="container-fluid" style="margin: 10px;padding: 0px;margin-top: -20px;">
        <div class="row" style="margin-bottom: 10px">
            <div id="callbackLogs"
                 style="display: inline-block;cursor: pointer; background: url(&quot;static/images/back_01.png&quot;) 2px center no-repeat; padding-left: 20px; height: 27px; border-radius: 5px; line-height: 27px; padding-right: 5px; font-size: 14px;">
                <span>返回</span></div>
        </div>
        <div class="row" style="margin-bottom: 10px">
            <div class="con-r-top-l">
                <button class="frame-Button Button-left" id="seeYesImage"> 已识别图片</button>
                <button class="frame-Button-b Button-left" id="#">全部图片</button>
            </div>
            <div class="con-r-top-r">
<#--                <button class="frame-Button-b Button-left" id="nextPage">下一页</button>-->
<#--                <button class="frame-Button-b Button-left" id="downAll">全部下载</button>-->
                <button class="frame-Button-b Button-left down-logs" id="logsImgaeDown">下载</button>
            </div>
        </div>
            <div id="logsImageShow" class="scroll-container layui-row layui-col-space1">
                <div class="layui-col-md2" id="thumbnail" style="display: none">
                    <dt style="position: relative;">
                        <div style="height: 300px">
                            <img id="thumbnailImage" src="" traceId = "" height="90%" defaultsrc="/images/temp.jpg" >
                            <p style="text-align: center;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;width: 100%"></p>
                        </div> <!---->
                        <div class="checkbox" style="position: absolute; left: 0px; top: 0px; margin: 0px;">
                            <label><input id="checkBoxId" name="imageIds" type="checkbox" value="1" style="height: 20px; width: 20px;"></label>
                        </div>
                    </dt>
                </div>
            </div>
    </div>
</div>
<style>
    #logsImageShow {
        max-height: 64vh;overflow-y: auto;
        float: left;
        margin-top: 2px;
        min-width: 80%;
    }
    #logsImageShow img {
        width: 99%;
    }
</style>
