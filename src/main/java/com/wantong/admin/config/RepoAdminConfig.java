package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 设置资源制作可操作用户权限
 *
 * @author : jsj
 * @version : 1.0
 * @date : 2020年3月3日 11:29:06
 */
@Component
@ConfigurationProperties(prefix = "repoadmin")
@Data
public class RepoAdminConfig {

    private Long authId;

}
