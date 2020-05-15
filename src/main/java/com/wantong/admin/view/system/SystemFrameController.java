package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.config.domain.vo.system.AuthorityVO;
import com.wantong.config.service.system.IMenuRelatedService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * SystemFrameController 系统管理响应事件
 *
 * @author : Forever
 * @version : 1.0
 * @date :  2018-11-06 10:41
 **/
@Controller
public class SystemFrameController extends BaseController {

    @Reference
    private IMenuRelatedService menuRelatedService;

    private static long MODULE_ID = 324;

    @RequestMapping("/system/userframe.do")
    public String GetSystemMenu(Model model) throws Exception {
        AdminSession adminSession = getAdminSession();
        List<AuthorityVO> authorities = menuRelatedService.getMenu(MODULE_ID);

        List<AuthorityVO> authorizedMenu = new ArrayList<AuthorityVO>();
        for (AuthorityVO authorityVO : authorities) {
            if (adminSession.canAccessUrl(refineURL(authorityVO.getUrl()))) {
                authorizedMenu.add(authorityVO);
            }
        }

        model.addAttribute("menu", authorizedMenu);
        return "system/index";
    }

    /**
     * 去除url中“?”后的请求参数
     *
     * @param url 待处理的url
     */
    private String refineURL(String url) {
        int questionPosition = url.indexOf('?');
        if (questionPosition > 0) {
            url = url.substring(0, questionPosition);
        }
        return url;
    }

    @RequestMapping("/menu/userAgreement.do")
    public String userAgreement(Model model){

        return "system/userAgreement";
    }
}
