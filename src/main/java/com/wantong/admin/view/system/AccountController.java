package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.EmailConfig;
import com.wantong.admin.config.InterfacePathConfig;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.freemarker.CustomEnvironment;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.email.MailBody;
import com.wantong.common.email.MailSendUtil;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.utils.encrypt.Base64Util;
import com.wantong.common.utils.encrypt.MD5Util;
import com.wantong.config.domain.dto.system.CreateUserDTO;
import com.wantong.config.domain.vo.system.UserVO;
import com.wantong.config.service.system.IEmailRelatedService;
import com.wantong.config.service.system.IPasswordRelatedService;
import com.wantong.config.service.system.IUserRelatedService;

import java.util.Random;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * AccountController
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 16:51
 **/
@Controller
@RequestMapping("/system")
public class AccountController extends BaseController {
    @Reference
    private IPasswordRelatedService passwordRelatedService;

    @Reference
    IUserRelatedService userRelatedService;

    @Autowired
    private MailBody mailBody;

    @Autowired
    private MailSendUtil mailSendUtil;

    @Autowired
    ThirdPartyConfig thirdPartyConfig;

    @Autowired
    InterfacePathConfig interfacePathConfig;

    @Autowired
    EmailConfig emailConfig;


    @RequestMapping("toSetPassword/{email}/{identityCode}")
    @ResponseBody
    public ModelAndView activate(@PathVariable("email") String email,
                                 @PathVariable("identityCode") String identityCode) {

        email = Base64Util.decodeBase64(email);
        Long identityId = passwordRelatedService.toSetPassword(email, identityCode);

        ModelAndView mv = new ModelAndView();
        if (identityId == null) {
            mv.setViewName("system/error");
            mv.addObject("msg", "设置密码链接已过期！");
        } else {
            mv.setViewName("system/setPassword");
            mv.addObject("identityId", identityId);
            mv.addObject("email", email);
            mv.addObject("identityCode", identityCode);
        }

        return mv;
    }


    @RequestMapping("createUser.do")
    @ResponseBody
    public ApiResponse createUser(HttpServletRequest request, @RequestParam("email") String email)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        ApiResponse apiResponse = new ApiResponse();
        CreateUserDTO result = userRelatedService.createUser(email, adminSession.getPartnerId(), adminSession.getId());
        if (result != null) {
            boolean res = sendActiveEmail(email, result.getIdentityCode());
            if (res) {
                apiResponse = ApiResponse.creatSuccess();
            } else {
                result.setAdminId(0);
                apiResponse = ApiResponse.creatFail(Base.ERROR, "验证邮件发送失败");
            }
        } else {
            apiResponse = ApiResponse.creatFail(Base.ERROR, "创建用户失败");
        }
        result.setIdentityCode(null);
        apiResponse.setData(result);
        return apiResponse;
    }

    public boolean sendActiveEmail(String email, String identityCode) {
        String thisEndpoint = thirdPartyConfig.getThisEndpoint();
        if (thisEndpoint.charAt(thisEndpoint.length() - 1) == '/') {
            thisEndpoint = thisEndpoint.substring(0, thisEndpoint.length() - 1);
        }
        String contextPath = CustomEnvironment.getContextPath();
        if (contextPath != "" && contextPath.charAt(0) == '/') {
            contextPath = contextPath.substring(1);
        }

        StringBuffer sb = new StringBuffer();
        sb.append(emailConfig.getEmailContentStart());
        sb.append(emailConfig.getActiveContentStart());
        sb.append(thisEndpoint);
        if (contextPath != "") {
            sb.append("/" + contextPath);
        }

        sb.append(interfacePathConfig.getSetPasswordPath());
        sb.append("/");
        sb.append(Base64Util.encodeBase64(email));
        //去掉/ 因为某些网页自动将/转义
        sb.append("/");
        sb.append(identityCode);
        sb.append(emailConfig.getActiveContentEnd());
        sb.append(emailConfig.getEmailContentEnd());
        mailBody.setSubject(emailConfig.getActiveSubject());
        mailBody.setContent(sb.toString());
        mailBody.setToAddress(email);
        mailBody.setValidate(true);

        return mailSendUtil.sendEmail(mailBody);
    }


    @RequestMapping("forgetpasword.do")
    @ResponseBody
    public ApiResponse forgetPassword(HttpServletRequest request, @RequestParam("email") String email)
            throws ServiceException {

        String identityCode = getIdentityCode();
        passwordRelatedService.forgetPassword(email, identityCode);

        if (sendPasswordEmail(email, identityCode)) {
            return ApiResponse.creatSuccess("重置密码链接已发送至您的邮箱！");
        } else {
            return ApiResponse.creatFail(Base.ERROR, "错误");
        }
       /* apiResponse.setCode(1);
        apiResponse.setMsg("重置密码链接已发送至您的邮箱！");*/

        //由于之前code返回为1表示成功，故此暂时设置为返回error，但是实际表示成功
    }

    private String getIdentityCode() {
        Random r = new Random();
        int code = r.nextInt(9000) + 1000;
        String identityCode = MD5Util.MD5(code + "");
        return identityCode;
    }

    private boolean sendPasswordEmail(String email, String identityCode) {
        String thisEndpoint = thirdPartyConfig.getThisEndpoint();
        if (thisEndpoint.charAt(thisEndpoint.length() - 1) == '/') {
            thisEndpoint = thisEndpoint.substring(0, thisEndpoint.length() - 1);
        }
        String contextPath = CustomEnvironment.getContextPath();
        if (contextPath != "" && contextPath.charAt(0) == '/') {
            contextPath = contextPath.substring(1);
        }

        StringBuffer sb = new StringBuffer();
        sb.append(emailConfig.getEmailContentStart());
        sb.append(emailConfig.getForgetPasswordContentStart());
        sb.append(thisEndpoint);
        if (contextPath != "") {
            sb.append("/" + contextPath);
        }

        sb.append(interfacePathConfig.getSetPasswordPath());
        sb.append("/");
        sb.append(Base64Util.encodeBase64(email));
        //去掉/ 因为某些网页自动将/转义
        sb.append("/");
        sb.append(identityCode);
        sb.append(emailConfig.getForgetPasswordContentEnd());
        sb.append(emailConfig.getEmailContentEnd());
        mailBody.setSubject(emailConfig.getForgetPasswordSubject());
        mailBody.setContent(sb.toString());
        mailBody.setToAddress(email);
        mailBody.setValidate(true);

        return mailSendUtil.sendEmail(mailBody);
    }

    @RequestMapping(value = "setpassword.do")
    @ResponseBody
    public ApiResponse setPassword(UserVO userVO) throws ServiceException {
        passwordRelatedService.setPassword(userVO);

        return ApiResponse.creatSuccess();
    }

    @Reference
    private IEmailRelatedService emailRelatedService;

    @RequestMapping("validateEmail.do")
    @ResponseBody
    public ApiResponse validateEmail(@RequestParam("email") String email, @RequestParam("partnerId") String partnerId) {
        try {
            emailRelatedService.ValidateEmail(email, partnerId);
            return ApiResponse.creatSuccess();
        } catch (ServiceException se) {
            return ApiResponse.creatFail(Base.ERROR, se);
        }
    }
}
