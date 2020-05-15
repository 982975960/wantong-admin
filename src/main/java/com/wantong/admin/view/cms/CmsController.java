package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.config.service.system.IMenuRelatedService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller
public class CmsController {

    private static long MODULE_ID = 361;

    @Reference
    private IMenuRelatedService menuRelatedService;

    @RequestMapping("/cms/frame.do")
    public String frame(Model model) {
        model.addAttribute("menu", menuRelatedService.getMenu(MODULE_ID));

        return "cms/index";
    }
}
