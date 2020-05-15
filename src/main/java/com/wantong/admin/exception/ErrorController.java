package com.wantong.admin.exception;

import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

/**
 * ErrorController 异常页面情况处理
 *
 * @author : hsc
 * @version : 1.0
 * @date :  2018-10-02 15:16
 **/
@Controller
@RequestMapping("error")
public class ErrorController {

    private static final String BASE_DIR = "error/";

    @RequestMapping("404")
    public ModelAndView handle404(HttpServletRequest request) {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("system/back.ftl");
        mv.addObject("msg", "很抱歉，你要访问的界面不存在");
        return mv;
    }

    @RequestMapping("500")
    public ModelAndView handle500(HttpServletRequest request) {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("system/back.ftl");
        mv.addObject("msg", "很抱歉，服务异常，请火速联系管理员!");
        return mv;
    }
}
