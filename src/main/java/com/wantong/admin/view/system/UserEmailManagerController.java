package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ServiceError;
import com.wantong.config.domain.dto.system.EmailReceiptAllDTO;
import com.wantong.config.domain.dto.system.EmailReceiptDTO;
import com.wantong.config.domain.vo.system.UserSetEmailVO;
import com.wantong.config.service.system.IEmailReceiptService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import java.util.List;

/**
 * UserEmailManagerController 用户邮件管理 控制层
 *
 * @author : LY
 * @version : 1.0
 * @date :  2020-2-17 10:13
 **/
@Controller
@RequestMapping("/system")
public class UserEmailManagerController extends BaseController {

    @Reference
    private IEmailReceiptService emailReceiptService;

    @RequestMapping("/userSetEmailList.do")
    @ResponseBody
    public ApiResponse getUserEmailList(@RequestParam(value = "currentPage",defaultValue = "1") int currentPage) throws ServiceException {
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(10);
        //获取合作商的Id
        long partnerId = adminSession.getPartnerId();
        EmailReceiptAllDTO emailReceiptAllDTO = emailReceiptService.userEmailReceiptList(partnerId,pagination);

        return ApiResponse.creatSuccess(emailReceiptAllDTO);
    }

    /**
     * 获取合作商的用户相关信息
     * @return
     * @throws ServiceException
     */
    @RequestMapping("/partnerUserEmail.do")
    @ResponseBody
    public ApiResponse getPartnerUserEmailInfo() throws ServiceException{
        AdminSession adminSession = getAdminSession();
        if(adminSession == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        EmailReceiptAllDTO emailReceiptAllDTO = emailReceiptService.partnerUserEmailReceiptList(adminSession.getPartnerId());

        return ApiResponse.creatSuccess(emailReceiptAllDTO);
    }

    @RequestMapping("/userEmail.do")
    @ResponseBody
    public ModelAndView userEmailFrame(){
        ModelAndView model = new ModelAndView();
        model.setViewName("/system/userEmailManager");

        return model;
    }

    @RequestMapping("/saveUserSetData.do")
    @ResponseBody
    public ApiResponse saveUserData(@RequestBody List<UserSetEmailVO> list) throws ServiceException{
        AdminSession session = getAdminSession();
        if(session == null){
            throw new ServiceException(ServiceError.creatFail("请先登录后台"));
        }
        emailReceiptService.saveUserSetEmail(list,session.getPartnerId());

        return ApiResponse.creatSuccess();
    }
}
