<style type="text/css">
  .text-b a{color:#3dbeed; line-height:33px;}
  .text-b a:hover{color:#0aa0d6;}
</style>
  <div class="popups-con" style="background:#FFF;">
    <div style="float:left">
      <table width="100%" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td width="50%">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td height="36" colspan="2" valign="top" style="font-size:14px; color:#343434;">配置APP闪屏视频</td>
              </tr>
              <tr>
                <td height="59"><span class="popups-name">上传视频：</span></td>
                <td>
                  <span style=" border:1px solid #cccccc; width:285px; float:left; border-radius:5px; text-align:center;" id="video_btn">
                     <label style="background: none;width: 283px;height: 131px">
                       <img id="video_button" src="/static/images/pic5.png" width="78" height="89" style="position: absolute;z-index: 1;margin-left: -33px;margin-top: 28px;cursor: pointer"/>
                     </label>
                  </span>
                </td>
              </tr>

              <tr>
                <td height="26">&nbsp;</td>
                <td>视频大小不超过50M, 建议长宽比 16:9（横屏）9:16（竖屏）</td>
              </tr>
              <tr>
                <td height="60"><span class="popups-name">视频URL：</span></td>
                <td><span><input name="text" type="text" id="video_url" value="" placeholder="视频上传后自动填入" class="popups-line" readonly="readonly" style=" width:285px" /></span></td>
              </tr>
            </table>
          </td>

          <td width="50%">
            <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-left:20px;">
              <tr>
                <td height="36" colspan="2" valign="top" style="font-size:14px; color:#343434;">配置App弹窗广告图片</td>
              </tr>
              <tr>
                <td height="59"><span class="popups-name">上传视频：</span></td>
                <td>
                  <span style=" border:1px solid #cccccc; width:285px; float:left; border-radius:5px; text-align:center;" id="image_btn">
                      <label style="background: none;width: 283px;height: 131px">
                      <img id = "image_button" src="/static/images/pic5.png" width="78" height="89" style="position: absolute;z-index: 1;margin-left: -33px;margin-top: 28px;cursor: pointer"/>
                    </label>
                  </span>
                </td>
              </tr>

              <tr>
                <td height="26">&nbsp;</td>
                <td>图片大小不超过10M </td>
              </tr>
              <tr>
                <td height="60"><span class="popups-name">图片URL：</span></td>
                <td>
                  <span><input name="text" type="text" id="image_url" value="" placeholder="图片上传后自动填入" class="popups-line" readonly="readonly" style=" width:285px" /></span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td height="158" colspan="2" align="left">
            <table width="100%" border="0" cellpadding="0">
              <tr>
                <td height="45" style="font-size:14px; color:#343434;">自定义参数</td>
              </tr>
              <tr>
                <td>
                  <span class="popups-name" style="width:87px; float:left; margin:0; padding:0;">自定义参数：</span>
                  <span><textarea name="" id="custom_text" cols="" rows="" class="popups-line"  style="width:760px; margin:0; padding:0; height:100px; float:left;"></textarea></span>
                </td>
              </tr>
              <tr>
                <td>
                  <span class="text-b" style="padding-left:86px;">相关文档请详见：<a href="https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Launching_a_Mini_Program/Launching_a_Mini_Program.html" target="_blank" style="border-bottom: 1px solid;" >移动应用拉起小程序</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://developers.weixin.qq.com/miniprogram/introduction/qrcode.html#%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D" target="_blank" style="border-bottom: 1px solid;">扫普通链接二维码打开小程序</a></span>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
      <div class="popups-bot">
        <span>
          <input name="提交" type="submit" id="save_app_config" class="pop-padding frame-Button-b Button-left" value="保存" />
          <input name="提交" type="submit" id="cancel" class="pop-padding frame-Button Button-left" value="取消" />
        </span>
      </div>
    </div>
  </div>
