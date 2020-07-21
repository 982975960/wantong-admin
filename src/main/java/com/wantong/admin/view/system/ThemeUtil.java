package com.wantong.admin.view.system;

import com.wantong.admin.config.BrandingConfig;
import com.wantong.admin.session.SubDomain;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * ThemeUtil 主题session管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2020-05-15 17:42
 **/
@Component
@Slf4j
public class ThemeUtil {
    @Autowired
    private BrandingConfig brandingConfig;

    public void setThemeIfAbsent(HttpServletRequest request){
        if (request.getSession().getAttribute(BrandingConfig.BRANDING_SUBDOMAINSTYLE) == null) {
            setTheme(request);
        }
    }

    public void setTheme(HttpServletRequest request){
        String serverName = request.getServerName();
        SubDomain subDomainStyle = brandingConfig.getSubDomainStyle(serverName);
        subDomainStyle.setCurrentServerName(request.getScheme()+"://" +serverName);
        request.getSession().setAttribute(BrandingConfig.BRANDING_SUBDOMAINSTYLE, subDomainStyle);
        log.info("serverName:{},subDomainStyle:{}", serverName, subDomainStyle);
    }
}
