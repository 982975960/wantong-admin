package com.wantong.admin.view.system;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.wantong.admin.config.BrandingConfig;
import com.wantong.admin.config.ImageValidationConfig;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.domain.FileEndpoint;
import com.wantong.admin.domain.vo.Menu;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.session.SubDomain;
import com.wantong.admin.view.BaseController;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.config.domain.vo.system.AuthorityVO;
import com.wantong.config.service.system.IMenuRelatedService;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class FrameController extends BaseController {

    /**
     * top menu's father id is always 0
     */
    private static final long fatherId = 0;

    @Reference
    private IMenuRelatedService menuRelatedService;


    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @Autowired
    private StorageConfig storageConfig;

    @Autowired
    private ImageValidationConfig imageValidationConfig;
    @Autowired
    private BrandingConfig brandingConfig;
    @Autowired
    private ThemeUtil themeUtil;

    @RequestMapping("/main.do")
    public String handleIndexRequest(Model model) {
        themeUtil.setThemeIfAbsent(request);
        List<AuthorityVO> authorities = menuRelatedService.getMenu(fatherId);
        if (authorities == null) {
            return "system/login";
            //throw new LoginInterceptionException();
        }
        AdminSession adminSession = getAdminSession();
        if (adminSession == null) {
            return "system/login";
            //throw new LoginInterceptionException();
        }

        //组装菜单
        List<Menu> menus = new ArrayList<>();
        for (AuthorityVO authorityVO : authorities) {
            if (adminSession.canAccessUrl(refineURL(authorityVO.getUrl()))) {
                Menu menu = new Menu();
                menu.setTopMenu(authorityVO);
                menu.setSceondsMenu(menuRelatedService.getMenu(authorityVO.getId()));
                menu.setImg(getMenuImg(authorityVO.getName()));
                menus.add(menu);
            }
        }
        handleCustomizeMenu(menus);
        String fdsEndpoint = thirdPartyConfig.getFileEndpoint();
        List<FileEndpoint> fdsEndpoints = thirdPartyConfig.getFileEndpoints();
        String downloadEndpoint = thirdPartyConfig.getDownloadEndpoint();
        String isbnEndpoint = thirdPartyConfig.getIsbnEndpoint();
        String bookImagePath = storageConfig.getBookImagePath();
        String thumbnailPath = storageConfig.getThumbnailImagePath();
        String appOperatingConfig = storageConfig.getAppOperatingConfigPath();
        String cardImagePath = storageConfig.getCardImagePath();
        model.addAttribute("imageValidationConfig", JSON.toJSONString(imageValidationConfig));
        model.addAttribute("FDSEndpoint", fdsEndpoint);
        model.addAttribute("FDSEndpoints", JsonUtil.toJSONString(fdsEndpoints.stream()
                .collect(Collectors.toMap(FileEndpoint::getDateCenter, FileEndpoint::getEndpoint))));
        model.addAttribute("DOWNLOADEndpoint", downloadEndpoint);
        model.addAttribute("ISBNEndpoint", isbnEndpoint);
        model.addAttribute("BookImagePath", bookImagePath);
        model.addAttribute("ThumbnailPath", thumbnailPath);
        model.addAttribute("menus", menus);
        model.addAttribute("AppOperatingConfigPath", appOperatingConfig);
        model.addAttribute("partnerId", adminSession.getPartnerId());
        model.addAttribute("cardImagePath", cardImagePath);
        return "frame/frame";
    }

    //先写死对应几个一级菜单的图片路径
    public String getMenuImg(String menuName) {
        if ("应用管理".equals(menuName)) {
            return "static/images/icoimg2.png";
        } else if ("运营管理".equals(menuName)) {
            return "static/images/icoimg3.png";
        } else if ("内容管理".equals(menuName)) {
            return "static/images/icoimg4.png";
        } else if ("图书管理".equals(menuName)) {
            return "static/images/icoimg4.png";
        } else if ("系统管理".equals(menuName)) {
            return "static/images/icoimg5.png";
        } else if ("卡片管理".equals(menuName)) {
            return "static/images/icoimg6.png";
        } else if ("售后服务".equals(menuName)) {
            return "static/images/icoimg7.png";
        } else if ("KPI".equals(menuName)) {
            return "static/images/icoimg8.png";
        } else if ("AI课程制作".equals(menuName)) {
            return "static/images/icoimg9.png";
        }

        return "static/images/icoimg1.png";
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

    private void handleCustomizeMenu(List<Menu> menus){
        if(menus != null){
            //获取当前的样式模板
            SubDomain subDomainStyle =(SubDomain) request.getSession().getAttribute(BrandingConfig.BRANDING_SUBDOMAINSTYLE);
            for(Menu menu : menus){
                AuthorityVO topMenu =  menu.getTopMenu();
                List<AuthorityVO>  authoritys =  menu.getSceondsMenu();
                authoritys.add(topMenu);
                for (AuthorityVO authorityVO : authoritys){
                    if (authorityVO != null) {
                        String customizeMenu =  brandingConfig.getCustomizeMenu(subDomainStyle.getStyle(),authorityVO.getId());
                        if (customizeMenu != null) {
                            authorityVO.setName(customizeMenu);
                        }
                    }
                }
                authoritys.remove(topMenu);
            }
        }

    }

}
