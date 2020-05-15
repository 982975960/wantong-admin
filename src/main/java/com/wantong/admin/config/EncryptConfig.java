package com.wantong.admin.config;


import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * K12加密配置
 */
@Component
@ConfigurationProperties(prefix = "encrypt")
@Data
public class EncryptConfig {
    //解密文件路径
    private String filePath;
    private String decryptKey;
}
