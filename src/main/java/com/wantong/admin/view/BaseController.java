package com.wantong.admin.view;

import com.wantong.admin.session.AdminSession;
import com.wantong.common.session.SessionUserManager;
import javax.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * BaseController
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-10-31 10:11
 **/
public abstract class BaseController {

    /**
     * 每一个请求都会先从RequestContextFilter中过来，执行里面的initContextHolders(request, attributes)，
     * 它会把每个请求的request和response放ThreadLocal<RequestAttributes>里，而注入的的 httpServletRequest 就是从ThreadLocal里面取，线程安全的
     */
    @Autowired
    protected HttpServletRequest request;
    @Autowired
    protected SessionUserManager sessionUserManager;

    protected AdminSession getAdminSession() {
        return sessionUserManager.getSessionUser(request.getSession(), AdminSession.class);
    }

    protected ModelAndView getRedirectView(String path) {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs.getRequest();
        String host = (request.isSecure() ? "http"
                : "https") + "://" + request.getServerName() + ":" + request.getServerPort() + "/" + path;

        ModelAndView modelAndView = new ModelAndView();
        modelAndView.setView(new RedirectView(host));

        return modelAndView;
    }
}
