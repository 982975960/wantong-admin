<#--<@script src="/js/base/repoMaked.js"></@script>-->

<#assign repoCount = repos?size>
<style>
  .table-main{
    border: 1px solid #bbb;
    margin: 0 10px;
    height: 440px;
  }
  .table-title {
    border: 1px solid #bbb;
    border-bottom: 0px;
    display: inline-block;
    padding: 7px 10px;
    margin: 20px 10px 0px 10px;
    font-size: 16px;
  }
</style>
<div class="relation-repo">
  <div class="table-title" id="productName"></div>
  <div class="table-main" style="">
    <div style="margin: 20px 0 0 20px;font-size: 16px;">
      <div style="display: inline-block;">技能</div>
      <div style="display: inline-block">
        <input id="rSkillInput" style="min-width: 230px;" disabled="disabled"/>
        <span id="calcWidth" hidden></span>
      </div>
    </div>
    <div class="repo-table">
      <div style="margin: 40px 0 0 20px"><h2>关联资源库</h2></div>
      <div class="work-tab" style="max-height: 310px;" id="repoMakedDiv">
        <ul class="work-block-head">
          <li style=" width:10%; text-align:center;">优先级</li>
          <li style=" width:25%; text-align:center;">资源库ID</li>
          <li style=" width:30%; text-align:center;">资源库名称</li>
          <li style=" width:15%; text-align:center;">语言</li>
          <li style=" width:20%; text-align:center;">声线</li>
        </ul>
        <div class="work-list" style="border:1px solid #eceff8; border-top:none; width:99.8%">
          <ul class="work-list-top" style="max-height: 280px;overflow-y: auto;">
              <#if (repoCount>0)>
                  <#list repos as item>
                    <li>
                      <span style=" width:10%; text-align:center;">${item_index+1}</span>
                      <span style=" width:25%; text-align:center;" title="${item.id}">${item.id}</span>
                      <span style=" width:30%; text-align:center;" title="${item.name}"> ${item.name}</span>
                      <span style=" width:15%; text-align:center;" title="${item.languageName}"> ${item.languageName}</span>
                      <span style=" width:20%; text-align:center;" title="${item.soundRayName}"> ${item.soundRayName}</span>
                    </li>
                  </#list>
              </#if>
          </ul>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-footer" style="border-top: 1px solid #eceff8;">
    <button type="button" id="closeButton" class="pop-padding frame-Button">关闭</button>
  </div>
</div>
<script>
  $(function () {
    var skills = ${skills};
    var type = '${productType}';
    console.log('productType', type);

    if (type == 10) {
      $('#productName').text('K12英语');
    }

    if (type == 11) {
      $('.repo-table').attr('hidden', 'hidden');
      $('#productName').text('查词');
    }

    if (type == 12) {
      $('#productName').text('卡片');
    }

    if (type == 0) {
      $('#productName').text('绘本');
    }

    var skillText = '';
    skills.forEach(e => {
      var t = '未知技能';
      if (e == 0) {
        //卡片中显示为识别
        t = type == 12 ? '识别' : '领读';
      } else if (e == 1) {
        t = type == 0 ? '点读' : '常规点读';
      } else if (e == 2) {
        t = '配音';
      } else if (e == 3) {
        t = '拍照';
      } else if (e == 4) {
        t = '评测';
      } else if (e == 5) {
        t = '手指查词';
      } else if (e == 6) {
        t = '高精点读';
      }
      skillText += t + '、';
    });
    $('#rSkillInput').val(skillText.slice(0, skillText.length - 1));
    resizeInput($('#rSkillInput'));
    var _index = wantong.partnerDetailPanel.getRelationIndex();
    console.log('close index', _index)
    $(".relation-repo #closeButton").click(function () {
      layer.closeAll();
    });
  });

  function resizeInput(obj) {
    $('#calcWidth').html(obj.val());
    $('#calcWidth').css('fontSize', obj.css('fontSize'));
    obj.css('width', (parseInt($('#calcWidth').css('width').split('px')[0]) + 15) + 'px');
  }
</script>




