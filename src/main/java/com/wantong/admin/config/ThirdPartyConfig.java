package com.wantong.admin.config;

import com.wantong.admin.domain.FileEndpoint;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * ThirdPartyConfig 第三方接口地址配置
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-11-02 17:47
 **/
@Component
@ConfigurationProperties(prefix = "thirdparty")
public class ThirdPartyConfig {

    private String fileEndpoint;
    private List<FileEndpoint> fileEndpoints;
    private String thisEndpoint;
    private String downloadEndpoint;
    private String isbnEndpoint;
    private String wechatAppidSecret;
    private String wechatQrcode;

    public String getWechatAppidSecret() {
        return wechatAppidSecret;
    }

    public void setWechatAppidSecret(String wechatAppidSecret) {
        this.wechatAppidSecret = wechatAppidSecret;
    }

    public String getWechatQrcode() {
        return wechatQrcode;
    }

    public void setWechatQrcode(String wechatQrcode) {
        this.wechatQrcode = wechatQrcode;
    }

    public String getFileEndpoint() {
        return fileEndpoint;
    }

    public void setFileEndpoint(String fileEndpoint) {
        this.fileEndpoint = fileEndpoint;
    }

    public String getThisEndpoint() {
        return thisEndpoint;
    }

    public void setThisEndpoint(String thisEndpoint) {
        this.thisEndpoint = thisEndpoint;
    }

    public String getDownloadEndpoint() {
        return downloadEndpoint;
    }

    public void setDownloadEndpoint(String downloadEndpoint) {
        this.downloadEndpoint = downloadEndpoint;
    }

    public String getIsbnEndpoint() { return isbnEndpoint; }

    public void setIsbnEndpoint(String isbnEndpoint) { this.isbnEndpoint = isbnEndpoint; }

    public List<FileEndpoint> getFileEndpoints() {
        return fileEndpoints;
    }

    public void setFileEndpoints(List<FileEndpoint> fileEndpoints) {
        this.fileEndpoints = fileEndpoints;
    }
}
