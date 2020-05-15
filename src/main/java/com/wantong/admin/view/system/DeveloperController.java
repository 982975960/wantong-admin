package com.wantong.admin.view.System;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.config.domain.po.system.ApiAuthPO;
import com.wantong.config.service.system.IApiAuthService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * DeveloperController 开发者controller
 *
 * @author : Forever
 * @version : 1.0
 * @date :  2019-07-04 15:59
 **/
@Controller
@RequestMapping("/system")
public class DeveloperController extends BaseController {

    @Reference
    private IApiAuthService apiAuthService;

    /**
     * 获取合作商列表
     *
     * @param request
     */
    @RequestMapping("toBeDeveloper.do")
    @ResponseBody
    public ModelAndView getDeveloperList(HttpServletRequest request)
            throws ServiceException {

        AdminSession admin = getAdminSession();
        ApiAuthPO apiAuthPO = apiAuthService.getApiAuth((int) admin.getPartnerId());
        ModelAndView mv = new ModelAndView("/system/developer");
        mv.addObject("appkey", apiAuthPO == null ? "" : apiAuthPO.getAppkey());
        mv.addObject("appsecret", apiAuthPO == null ? "" : apiAuthPO.getAppsecret());
        mv.addObject("partnerId", admin.getPartnerId());
        return mv;
    }

    @RequestMapping("/createDeveloper.do")
    @ResponseBody
    public ApiResponse createDeveloper() throws ServiceException {

        AdminSession admin = getAdminSession();
        ApiAuthPO apiAuthPO = apiAuthService.createApiAuth((int) admin.getPartnerId());
        return ApiResponse.creatSuccess(apiAuthPO);
    }
}
