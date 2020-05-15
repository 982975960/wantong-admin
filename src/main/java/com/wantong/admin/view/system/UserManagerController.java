package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.config.domain.dto.system.ChangeUserStatusDTO;
import com.wantong.config.domain.dto.system.UserManagerDTO;
import com.wantong.config.domain.vo.BaseQuery;
import com.wantong.config.service.system.IUserRelatedService;
import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping("/system")
public class UserManagerController extends BaseController {

    @Reference
    private IUserRelatedService userRelatedService;


    @RequestMapping("toUserManager.do")
    public ModelAndView getUserManagerView(HttpServletRequest request,
            @RequestParam(defaultValue = "1") Integer currentPage,
            @RequestParam(value = "searchText", required = false, defaultValue = "") String searchText) {
        AdminSession adminSession = getAdminSession();
        BaseQuery query = new BaseQuery();
        query.setCurrentPage(currentPage);

        UserManagerDTO result = userRelatedService.userList(adminSession.getPartnerId(), query, searchText);

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/system/userManager");
        mv.addObject("page", result.getPage());
        mv.addObject("emailList", result.getUserEmailList());
        mv.addObject("searchText", searchText);
        return mv;
    }

    @RequestMapping("changeUserStatus.do")
    @ResponseBody
    public ApiResponse changeUserStatus(@RequestParam("id") long id, @RequestParam("status") int status) {
        ChangeUserStatusDTO result = userRelatedService.changeUserStatus(id, status);
        if (result.getCode() == 1) {
            return ApiResponse.creatSuccess(result);
        } else {
            return ApiResponse.creatFail(Base.ERROR, result);
        }
    }
}
