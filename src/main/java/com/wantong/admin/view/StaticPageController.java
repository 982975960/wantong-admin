package com.wantong.admin.view;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author 刘建宇
 * @since 2019/12/30 Sprint
 */
@Controller
@RequestMapping("page")
public class StaticPageController {

    @GetMapping("cms/migration/main")
    public String migration(){
        return "cms/migration";
    }

    @GetMapping("kpi/display")
    public String kpi(){
        return "kpi/kpi";
    }

    @GetMapping("feedback/dashboard/main")
    public Object dashboard(){
        return "feedback/dashboard";
    }
}
