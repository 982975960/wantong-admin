package com.wantong.admin.view.auth;

import com.alibaba.dubbo.config.annotation.Reference;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.config.domain.dto.auth.GrantAuthDTO;
import com.wantong.config.domain.po.auth.AuthorityPO;
import com.wantong.config.domain.vo.PageHelperUtil;
import com.wantong.config.domain.vo.auth.AuthorityManagerQuery;
import com.wantong.config.domain.vo.auth.AuthorityVO;
import com.wantong.config.domain.vo.auth.RoleAuthVO;
import com.wantong.config.service.auth.AuthorityRelatedService;
import java.util.ArrayList;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 获取权限列表模块页面
 *
 * @author
 * @date 2018-08-25
 */
@Controller
@Slf4j
public class AuthorityManagerController extends BaseController {

    @Reference
    private AuthorityRelatedService authorityRelatedService;


    @RequestMapping(value = "/auth/authmanager.do")
    @ResponseBody
    public ModelAndView getAuthManagerView(HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer currentPage) {
        AdminSession admin = getAdminSession();

        AuthorityManagerQuery query = new AuthorityManagerQuery();
        AuthorityPO authorityPO = new AuthorityPO();
        query.setAuthorityPO(authorityPO);
        query.setCurrentPage(currentPage);

        PageHelperUtil<AuthorityPO> page = authorityRelatedService.authorityManager(query);

        if (page == null) {
            return null;
        }
        ModelAndView mv = new ModelAndView("/auth/manager");
        mv.addObject("page", page);
        mv.addObject("admin", admin);

        return mv;
    }

    @RequestMapping(value = "/grantAuth/manager.do")
    public ModelAndView getManagerView(@RequestParam("id") long id) {
        AdminSession adminSession = getAdminSession();
        List<String> strs = new ArrayList<>();
        for (String str : adminSession.getAuthorizedUrls()) {
            strs.add(str);
        }
        GrantAuthDTO result = authorityRelatedService.grantAuth(id, 2, adminSession.getId(), strs);
        ModelAndView mv = new ModelAndView("/auth/grantAuthority");
        mv.addObject("topLevelAuthorities", result.getTopLevelAuthorities());
        mv.addObject("secondLevelAuthorities", result.getSecondLevelAuthorities());
        mv.addObject("thirdLevelAuthorities", result.getThirdLevelAuthorities());
        mv.addObject("role", result.getRole());

        return mv;
    }

    @RequestMapping(value = "/auth/create.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse handleRequest(HttpServletRequest request, AuthorityVO authorityVO) throws ServiceException {

        AdminSession admin = getAdminSession();
        authorityRelatedService.createAuthority(authorityVO, admin.getId());

        return ApiResponse.creatSuccess();
    }

    @RequestMapping(value = "/grantAuth/excute.do", method = RequestMethod.POST)
    @ResponseBody
    public ApiResponse executeAuth(HttpServletRequest request, @RequestParam("roleId") long roleId,
            @RequestParam("authList") String authList) {

        Gson g = new Gson();
        if (authList.equals("]")) {
            return ApiResponse.creatFail(Base.ERROR, "权限选择不能为空！", null);
        }
        List<RoleAuthVO> roleAuthVOs = g.fromJson(authList, new TypeToken<List<RoleAuthVO>>() {
        }.getType());
        AdminSession admin = getAdminSession();

        try {
            authorityRelatedService.grantAuthExcute(roleAuthVOs, admin.getId(), roleId);

            return ApiResponse.creatSuccess();
        } catch (Exception e) {
            log.error("赋予角色权限出现异常", e);

            return ApiResponse.creatFail(Base.ERROR, "分配失败", null);
        }

    }


}
