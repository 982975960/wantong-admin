<div class="popups-con" style="background:#FFF;">
  <div style="float:left;width: 100%">
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td width="40%">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td height="36" colspan="2" valign="top" style="font-size:14px; color:#343434;">配置视频</td>
            </tr>
            <tr>
              <td height="59" width="98" align="left" valign="top"><span   class="popups-name">上传视频：</span></td>
              <td id="video_item">
                  <span style=" border:1px solid #cccccc; width:70%;height: 235px; float:left; border-radius:5px; text-align:center;" id="video_btn">
                     <label style="width: 100%;height: 100%;position: relative">
                       <img id="video_image" src="/static/images/write.png" style="width:100%;height: 100%">
                       <img id="video_shade_image" src="/static/images/smallBg.png" style="width: 100%;height: 100%;position: absolute;top: 0%;left: 0%;opacity: 0.8;display: none">
                       <img id="video_button" src="/static/images/pic5.png" width="78" height="89" style="position: absolute;z-index: 1;cursor: pointer;top: 50%;left: 50%;margin-left: -50px;margin-top: -50px;"/>
                       <span id="video_upload_percent" style="position: absolute;top: 53%;left: 40%;color: #555;"></span>
                     </label>
                  </span>
                  <div id="delete_video_content" style="display: none;position: relative;height: 20px;">
                              <span id="delete_video_btn" class="delete-btn" aria-hidden="true" style="float: left;margin-left: -22px;margin-top: 5px">
                                <img src="/static/images/deleteBtn.png">
                              </span>
                  </div>
              </td>
            </tr>

            <tr>
              <td height="26">&nbsp;</td>
              <td>视频大小不超过100M, 建议长宽比 16:9（横屏）9:16（竖屏）</td>
            </tr>
            <tr>
              <td height="60"><span class="popups-name">视频URL：</span></td>
              <td><span><input name="text" type="text" id="video_url" value="" placeholder="视频保存后自动填入" class="popups-line" readonly="readonly" style=" width:70%;" /></span></td>
            </tr>
          </table>
        </td>
        <td width="40%">
          <table width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-left:20px;">
            <tr>
              <td height="36" colspan="2" valign="top" style="font-size:14px; color:#343434;">配置图片</td>
            </tr>
            <tr>
              <td height="59" width="98" align="left" valign="top"><span  class="popups-name">上传图片：</span></td>
              <td id="image_item">
                  <span style=" border:1px solid #cccccc; width:70%;height: 235px; float:left; border-radius:5px; text-align:center;" id="image_btn">
                      <label style="width: 100%;height: 100%;position: relative;">
                        <img id ="upload_image" src="/static/images/write.png" style="width: 100%;height: 100%;">
                        <img id="image_shade_image" src="/static/images/smallBg.png" style="width: 100%;height: 100%;position: absolute;top: 0%;left: 0%;opacity: 0.8;display: none">
                        <img id = "image_button" src="/static/images/pic5.png"  style="position: absolute;top: 50%;left: 50%;margin-left: -50px;margin-top: -50px;z-index: 1;cursor: pointer"/>
                        <span id="image_upload_percent" style="position: absolute;top: 53%;left: 40%;color: #555;""></span>
                    </label>
                  </span>

                <div id="delete_image_content" style="display: none;position: relative;height: 20px;">
                              <span id="delete_image_btn" class="delete-btn" aria-hidden="true" style="float: left;margin-left: -22px;margin-top: 5px">
                                <img src="/static/images/deleteBtn.png">
                              </span>
                </div>
              </td>
            </tr>

            <tr>
              <td height="26">&nbsp;</td>
              <td>图片大小不超过10M </td>
            </tr>
            <tr>
              <td height="60"><span class="popups-name">图片URL：</span></td>
              <td>
                <span><input name="text" type="text" id="image_url" value="" placeholder="图片保存后自动填入" class="popups-line" readonly="readonly" style=" width:70%" /></span>
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
                <span class="popups-name" style="width:155px; float:left; margin:0; padding:0;float: left;">自定义参数(字数限制250)：</span>
                <span><textarea name="" id="custom_text" cols="" rows=""  class="popups-line" maxlength="250"  style="width:760px; margin:0; padding:0; height:100px; float:left;"></textarea></span>
              </td>
            </tr>
            <tr>
              <td>
                <span class="text-b" style="padding-left:86px;float: left;margin-top: 20px;">相关文档请详见：<a href="https://developers.weixin.qq.com/doc/oplatform/Mobile_App/Launching_a_Mini_Program/Launching_a_Mini_Program.html" target="_blank" style="border-bottom: 1px solid;" >移动应用拉起小程序</a>&nbsp;&nbsp;&nbsp;&nbsp;<a href="https://developers.weixin.qq.com/miniprogram/introduction/qrcode.html#%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D" target="_blank" style="border-bottom: 1px solid;">扫普通链接二维码打开小程序</a></span>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    </table>
    <div class="popups-bot">
        <span>
          <input name="提交" type="submit" id="save_app_config" class="pop-padding frame-Button-b Button-left" value="保存" />
        </span>
    </div>
  </div>
</div>