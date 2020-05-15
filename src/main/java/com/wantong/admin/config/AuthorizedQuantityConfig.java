package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author cgl
 * @date 2020/3/3
 */
@Component
@ConfigurationProperties(prefix = "authorized")
@Data
public class AuthorizedQuantityConfig {

    private List<String> quantityWarning;
}
