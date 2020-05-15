package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.freemarker.CustomEnvironment;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.config.domain.dto.system.LoginDTO;
import com.wantong.config.domain.po.app.AdminProtocolDTO;
import com.wantong.config.domain.vo.system.LoginVo;
import com.wantong.config.service.system.ILoginService;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class LoginController extends BaseController {

    @Reference
    private ILoginService loginService;

    @RequestMapping("/showLogin.do")
    public ModelAndView showLogin() throws Exception {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("system/login");
        return mv;
    }

    @RequestMapping("/login.do")
    @ResponseBody
    public ApiResponse login(@RequestParam("email") String email, @RequestParam("password") String password,
            HttpSession session) throws ServiceException {

        LoginVo loginVo = new LoginVo();
        loginVo.setEmail(email);
        loginVo.setPassword(password);
        LoginDTO loginDTO = loginService.login(loginVo);

        AdminSession adminSession = new AdminSession();
        adminSession.setId(loginDTO.getId());
        adminSession.setPartnerId(loginDTO.getPartnerId());
        adminSession.setPartnerName(loginDTO.getPartnerName());
        adminSession.setAuthorizedUrls(loginDTO.getAuthorizedUrls());
        adminSession.setEmail(email);
        sessionUserManager.setSessionUser(session, adminSession);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/checkProtocolState.do")
    @ResponseBody
    public ApiResponse checkProtocolState(@RequestParam("email") String email, @RequestParam("password") String password,
            HttpSession session) throws ServiceException{
        LoginVo loginVo = new LoginVo();
        loginVo.setEmail(email);
        loginVo.setPassword(password);

        AdminProtocolDTO dto = loginService.checkProtocolState(loginVo);

        return ApiResponse.creatSuccess(dto);
    }

    @RequestMapping("/changeProtocolState.do")
    @ResponseBody
    public ApiResponse changeProtocolState(@RequestParam("id") Long id) throws ServiceException{

        loginService.changeProtocolState(id);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("*")
    public ModelAndView notFount() {
        ModelAndView mv = new ModelAndView();
        //redirectHttp10Compatible:解决https环境下使用redirect重定向地址变为http的协议，无法访问服务的问题，设置为false,即关闭了对http1.0协议的兼容支持
        mv.setView(new RedirectView(CustomEnvironment.getContextPath() + "/main.do",false,false));
        return mv;
    }

    @RequestMapping(value = "/system/loginOut.do", method = RequestMethod.GET)
    public ModelAndView handleRequest(HttpServletRequest request, HttpServletResponse response) {
        sessionUserManager.removeSessionUser(request.getSession(), AdminSession.class);
        ModelAndView view = new ModelAndView();
        //redirectHttp10Compatible:解决https环境下使用redirect重定向地址变为http的协议，无法访问服务的问题，设置为false,即关闭了对http1.0协议的兼容支持
        view.setView(new RedirectView(CustomEnvironment.getContextPath() + "/showLogin.do",false,false));
        return view;
    }
}
