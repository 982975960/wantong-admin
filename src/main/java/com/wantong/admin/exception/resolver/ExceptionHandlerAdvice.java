package com.wantong.admin.exception.resolver;

import com.wantong.admin.exception.LoginInterceptionException;
import com.wantong.admin.freemarker.CustomEnvironment;
import com.wantong.common.webcommon.GlobalExceptionHandler;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

/**
 * GloableExceptionHandlerAdvice 全局异常处理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-11-01 17:43
 **/
@ControllerAdvice
public class ExceptionHandlerAdvice extends GlobalExceptionHandler {

    @ExceptionHandler(value = LoginInterceptionException.class)
    public Object loginErrorHandler(LoginInterceptionException ex) {
        ModelAndView view = new ModelAndView();
        //view.setView(new RedirectView(CustomEnvironment.getContextPath() + "/showLogin.do"));
        view.setViewName("outTime");
        return view;
    }
}
