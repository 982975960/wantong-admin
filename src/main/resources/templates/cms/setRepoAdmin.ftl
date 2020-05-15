<@script src="/js/cms/repoAdmin.js"/>
<div id="setRepoAdminDiv" repoId="${repoId}">
  <div class="work-tab">
    <ul class="work-block-head">
      <li style=" width:20%; text-align:center;">序号</li>
      <li style=" width:20%; text-align:center;">账户</li>
      <li style=" width:20%; text-align:center;">角色</li>
      <li style=" width:20%; text-align:center;">账户状态</li>
      <li style=" width:20%; text-align:center;">是否可操作资源库</li>
    </ul>
    <div class="work-list">
      <ul class="work-list-top">
          <#if (adminList?size gt 0)>
              <#list adminList as l>
                <li>
                  <span style="width:20%; text-align:center;border-top: 1px solid #eceff8;">${l_index+1}</span>
                  <span style="width:20%; text-align:center;border-top: 1px solid #eceff8;">${l.email}</span>
                  <span title="${l.roleName}" style="width:20%; text-align:center;border-top: 1px solid #eceff8;white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">${l.roleName}</span>
                  <span style="width:20%; text-align:center;border-top: 1px solid #eceff8;">
                    <#if (l.status==0)>
                      无效
                    <#elseif (l.status==1) >
                      正常
                    <#else >
                      待激活
                    </#if>
                  </span>
                  <span style="width:20%; text-align:center;border-top: 1px solid #eceff8;padding-left: 70px;">
                    <#if (l.canHandle)>
                      <button class="btn-info Button-line handle-btn" adminId="${l.adminId}" repoId="${repoId}" style="line-height: 22px;margin-top: 12px;">
                        可操作
                      </button>
                    <#else >
                      <button class="btn-info Button-line no-handle-btn" adminId="${l.adminId}" repoId="${repoId}" style="line-height: 22px;margin-top: 12px;">
                        不可操作
                      </button>
                    </#if>
                    </span>
                </li>
              </#list>
          </#if>
      </ul>
    </div>
  </div>

  <div class="con-page" style="border-top: none;width: 99%;">
      <#if (pages > 1)>
        <div id="paginationContainer">
          <div>
            <nav aria-label="Page navigation">
              <ul id="pagination" class="" currentPage="${currentPage}" pages="${pages}"
                  pageSize="${pageSize}" style="margin-top: 0px;">
              </ul>
            </nav>
          </div>
        </div>
      </#if>
  </div>

</div>


<script>
  $(function () {
    wantong.repoAdmin.init();
  });
</script>
