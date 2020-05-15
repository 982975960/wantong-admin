package com.wantong.admin.interceptor.system;


import com.wantong.admin.exception.LoginInterceptionException;
import com.wantong.admin.session.AdminSession;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ServiceError;
import com.wantong.common.session.SessionUserManager;
import com.wantong.config.domain.vo.system.AuthorityVO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

@Component
public class LoginInterceptor extends HandlerInterceptorAdapter {

    private Logger logger = LoggerFactory.getLogger(LoginInterceptor.class);
    @Autowired
    protected SessionUserManager sessionUserManager;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        //logger.info("url:{}", request.getRequestURI());
        String uri = request.getRequestURI();

        long reqPartnerId = 0;

        String _partner = request.getParameter("partnerId");
        if (_partner != null) {
            reqPartnerId = Long.parseLong(_partner);
        }

        String[] passUrls = LoginPassUrl.getPassThroughUrls();
        for (String passUrl : passUrls) {
            if (uri.contains(passUrl)) {
                return true;
            }
        }
        AdminSession admin = sessionUserManager.getSessionUser(request.getSession(), AdminSession.class);
        if (admin == null) {
            //logger.info("admin is null ");
            throw new LoginInterceptionException();
        }

        passUrls = LoginPassUrl.getLoginUserPassThroughUrls();
        for (String passUrl : passUrls) {
            if (uri.contains(passUrl)) {
                return true;
            }
        }

        authResolver(request, admin);

        long adminPartnerId = admin.getPartnerId();
        if (reqPartnerId != 0) {
            if (adminPartnerId != 1) {
                //throw new NoPowerInterceptionException();
            }
        }
        //logger.info("adminId:{} url:{}",admin.getId(), request.getRequestURI());
        return super.preHandle(request, response, handler);
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex)
            throws Exception {
        super.afterCompletion(request, response, handler, ex);
    }

    @SuppressWarnings("unchecked")
    @Override
    public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
            ModelAndView modelAndView) throws Exception {

        if (modelAndView != null) {
            Object object = request.getAttribute("currentMenu");
            if (object != null) {
                modelAndView.addObject("currentMenu", (List<AuthorityVO>) object);
            } else {
                modelAndView.addObject("currentMenu", new ArrayList<AuthorityVO>());
            }
        }

        super.postHandle(request, response, handler, modelAndView);
    }

    @Override
    public void afterConcurrentHandlingStarted(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {
        super.afterConcurrentHandlingStarted(request, response, handler);
    }

    /**
     * 判断admin是否有当前请求url的权限
     *
     * @param request
     * @param admin
     */
    public void authResolver(HttpServletRequest request, AdminSession admin) throws ServiceException {
        String uri = request.getRequestURI();
        String contextPath = request.getContextPath();
        int startIndex = uri.indexOf(contextPath);
        String moduleURL = uri.substring(startIndex + contextPath.length());
        startIndex = moduleURL.indexOf("?");
        if (startIndex >= 0) {
            moduleURL = moduleURL.substring(0, startIndex);
        }

        if (!admin.canAccessUrl(moduleURL)) {
            logger.info("没有权限。 adminId:{}  url:{}",admin.getId(),uri);
            throw new ServiceException(ServiceError.creatFail("没有此权限。"));
            //throw new LoginInterceptionException();
        }
    }

}
