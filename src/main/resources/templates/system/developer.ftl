<@script src="/js/system/developer.js"></@script>
<div class="main-w" xmlns="http://www.w3.org/1999/html">
  <div class="content-wrap-w">
    <div class="content-r-path">系统管理 / 成为开发者</div>
    <div class="content-box partner-detail-panel" id="developerManager">
      <div class="content-pro">
        <div class="text-block-con">
          <div style="font-size: 14px;color: #343434;">合作商ID：${partnerId}</div>
          <div style="font-size: 16px;color: #343434;margin: 10px 0;">为什么要成为开发者？</div>
          <div style="line-height: 29px">
            <span>成为开发者后，可获得AppKey和AppSecret。</span><br>
            <span>用AppKey及AppSecret完成登录授权后，可进行深度的对接开发。</span>
          </div>
          <div style="margin: 10px 0 20px 0;">
            <button type="button" class="frame-Button-b" id="toBeBtn" <#if (appkey!="")>disabled="disabled"
                    style="background-color: #CCCCCC;" </#if>>
              成为开发者
            </button>
          </div>
          <div id="resetDiv" style="display: <#if (appkey!="")>inline <#else > none </#if>;">
            <div class="form-group">
              <label for="edition" style="float: left;line-height: 33px;width: 80px;">AppKey：</label>
              <input type="text" id="appkey" class="form-control" disabled="disabled" value="${appkey}"
                     style="width: 500px;border-radius: 0px;cursor: pointer;">
              <span style="line-height: 33px;">AppKey是开发识别码，配合AppSecret可调用接口。</span>
            </div>
            <div class="form-group">
              <label for="edition" style="float: left;line-height: 33px;width: 80px;">AppSecret：</label>
              <input type="text" id="appsecret" class="form-control" disabled="disabled" value="${appsecret}"
                     style="width: 500px;float: left;border-radius: 0px;cursor: pointer;">
              <button type="button" class="frame-Button-b" id="resetBtn"
                      style="margin-left: 10px;width: 60px;height: 34px">重置
              </button>
              <div>
                <span style="width: 70%;line-height: 33px;">AppSecret是校验开发者身份的密码，具有极高的安全性，切记勿把AppSecret直接交给第三方开发者或直接存储在代码中。</span>
              </div>
              <div>
                <span style="line-height: 35px;font-size: 18px;margin-left: 80px;color: red;">注：使用AppKey及AppSecret进行深度开发是用来从玩瞳服务器与客户服务器做数据对接的，注意不要直接在端上获取玩瞳数据。</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="tipDiv" style="display: none">
        <div>
          <div style="width: 90%;margin: 5%;float: left;">
            <div>
              <img src="/static/images/warning.png" style="width: 10%;height: 10%;float: left;">
            </div>
            <div style="margin-left: 10px;float: left;width: 80%;line-height: 33px;font-size: 16px;color: #343434">
              您确定要重置AppSecret吗？
            </div>
            <div style="margin-left: 10px;float: left;width: 80%;line-height: 22px;">
              请注意：重置AppSecret后会立即生效，所有使用旧AppSecret的接口将立即生效。为确保服务的正常使用，请尽快更新AppSecret信息。
            </div>
          </div>
          <div class="modal-footer" style="width: 100%;float: left;">
            <button type="button" id="saveBtn" class="pop-padding frame-Button-b" style="margin-right: 10px;">确定重置
            </button>
            <button type="button" id="closeBtn" class="pop-padding frame-Button">取消</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>
<script>
  $(function () {
    wantong.developer.init();
  });
</script>