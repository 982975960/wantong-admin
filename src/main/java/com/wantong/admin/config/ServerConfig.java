package com.wantong.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * ToolsConfig
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-10-12 15:21
 **/
@Component
@ConfigurationProperties(prefix = "server")
public class ServerConfig {

    private String index;
    private int sessionExpired;
    private String buildNumber;

    public int getSessionExpired() {
        return sessionExpired;
    }

    public void setSessionExpired(int sessionExpired) {
        this.sessionExpired = sessionExpired;
    }

    public String getBuildNumber() {
        return buildNumber;
    }

    public void setBuildNumber(String buildNumber) {
        this.buildNumber = buildNumber;
    }

    public String getIndex() {
        return index;
    }

    public void setIndex(String index) {
        this.index = index;
    }
}
