package com.wantong.admin.config;

import com.wantong.admin.session.SubDomain;
import java.io.Serializable;
import java.util.List;
import java.util.Map;
import lombok.Data;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * BrandingConfig 样式模板配置
 *
 * @author : hsc
 * @version : 1.0
 * @date :  2020-05-14 17:09
 **/
@Component
@ConfigurationProperties(prefix = "branding")
@Data
@Slf4j
public class BrandingConfig {

    private BrandingInfo original;
    private BrandingInfo xuexi;
    private BrandingInfo lib;

    /**
     * 默认的样式
     */
    public final String BRANDING_ORIGINAL = "original";
    /**
     * 红色中国 党建样式
     */
    public static final String BRANDING_XUEXI = "xuexi";
    /**
     * 书香学苑样式
     */
    private final String BRANDING_LIB = "lib";

    /**
     * 默认域名
     */
    private final String BRANDING_CONSOLE = "console";

    /**
     * 放置在session里的域名与样式模板信息
     * ftl取值：${Session.subDomainStyle.style!'original'}
     * java代码取值:SubDomain subDomainStyle =(SubDomain) request.getSession().getAttribute(BrandingConfig.BRANDING_SUBDOMAINSTYLE);
     */
    public static final String BRANDING_SUBDOMAINSTYLE = "subDomainStyle";


    public SubDomain getSubDomainStyle(String serverName) {
        SubDomain subDomainStyle = new SubDomain();

        findSubDomain(serverName, BRANDING_ORIGINAL, original.getSubdomains(), subDomainStyle);
        if (subDomainStyle.getStyle() == null) {
            findSubDomain(serverName, BRANDING_XUEXI, xuexi.getSubdomains(), subDomainStyle);
            if (subDomainStyle.getStyle() == null) {
                findSubDomain(serverName, BRANDING_LIB, lib.getSubdomains(), subDomainStyle);
                if (subDomainStyle.getStyle() == null) {
                    //默认的
                    subDomainStyle.setStyle(BRANDING_ORIGINAL);
                    subDomainStyle.setSubDomain(BRANDING_CONSOLE);
                }
            }
        }
        return subDomainStyle;
    }

    private void findSubDomain(String serverName, String sytle, List<String> styleSubDomains,
            SubDomain subDomainStyle) {
        for (String subDomain : styleSubDomains) {
            if (serverName.startsWith(subDomain)) {
                subDomainStyle.setSubDomain(subDomain);
                subDomainStyle.setStyle(sytle);
                break;
            }
        }
    }

    /**
     * 获取模板自定义的菜单名称
     * @param sytle
     * @param menuId
     * @return
     */
    public String getCustomizeMenu(String sytle,long menuId){
        switch(sytle){
            case BRANDING_ORIGINAL :
                Map<Long,String> customizeMenu = original.getCustomizeMenu();
                if(customizeMenu != null){
                    return customizeMenu.get(menuId);
                }
                break;
            case BRANDING_XUEXI :
                Map<Long,String> xuexiCustomizeMenu = xuexi.getCustomizeMenu();
                if(xuexiCustomizeMenu != null){
                    return xuexiCustomizeMenu.get(menuId);
                }
                break;
            case BRANDING_LIB :
                Map<Long,String> libCustomizeMenu = lib.getCustomizeMenu();
                if(libCustomizeMenu != null){
                    return libCustomizeMenu.get(menuId);
                }
                break;
        }
        return null;
    }
    @Data
    @ToString
    public static final class BrandingInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 模板映射的域名信息
         */
        private List<String> subdomains;
        /**
         * 自定义菜单信息
         *  菜单id:菜单名称
         */
        private Map<Long,String> customizeMenu;

    }
}
