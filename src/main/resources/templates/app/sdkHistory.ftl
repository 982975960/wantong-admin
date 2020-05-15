<@script src="/js/app/sdkHistory.js"></@script>
<div id="sdkHistory" class="content-pro">
  <div>
    <span id="historyPlatform"></span>
    <span style="margin-left: 20px" id="historyType"></span>
  </div>
  <div id="sdkHistoryTable">

  </div>
</div>

<script>
  $(function () {
    wantong.app.sdkHistory.init({
      typeId: "${typeId}",
      platform:"${platform}",
    });
  });
</script>