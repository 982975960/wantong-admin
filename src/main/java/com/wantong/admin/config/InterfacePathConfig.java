package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * InterfacePathConfig
 *
 * @author : longtao
 * @version : 1.0
 * @date : 2018-11-13 17:05
 */
@Component
@ConfigurationProperties(prefix = "interfacepath")
@Data
public class InterfacePathConfig {

    private String setPasswordPath;

}
