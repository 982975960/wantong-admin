package com.wantong.admin.view.ass;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.config.service.system.IMenuRelatedService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * 售后服务管理
 *
 * @author ruanjiewei
 * @version 1.0
 * @date 2019.08.24
 */
@Controller
@Slf4j
@RequiredArgsConstructor
public class AfterServiceController {

    private static long MODULE_ID = 575;

    @Reference
    private IMenuRelatedService menuRelatedService;

    @RequestMapping("/ass/assframe.do")
    public String appFrame(Model model) {

        model.addAttribute("menu", menuRelatedService.getMenu(MODULE_ID));

        return "ass/index";
    }
}
