package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 备货app配置
 *
 * @author : jsj
 * @version : 1.0
 * @date : 2018-11-13 16:12
 */
@Component
@ConfigurationProperties(prefix = "publish")
@Data
public class PublishConfig {

    private String url;

}
