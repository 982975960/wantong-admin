package com.wantong.admin.config;

import com.wantong.content.domain.DbTtsRole;
import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * MultiRolesConfig 多角色配置
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-04-11 17:52
 **/
@Component
@Data
@ConfigurationProperties(prefix = "multi")
public class MultiRolesConfig {

    private String server;
    private String serverHigh;
    private List<DbTtsRole> roles;
}
