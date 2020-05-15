package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.stereotype.Component;

/**
 * @author 刘建宇
 * @since 2019/12/30 Sprint
 */
@ConfigurationProperties(prefix = "image-validation")
@RefreshScope
@Component
@Data
public class ImageValidationConfig {

    /**
     * 批量传图
     *
     * size27a = "1280x720";
     * ratio27a = "16:9 4:3";
     */
    String size27batch;
    String ratio27batch;
    String size28batch;
    String ratio28batch;
    String size29batch;
    String ratio29batch;
    /**
     * a
     */
    String size27a;
    String ratio27a;
    String size28a;
    String ratio28a;
    String size29a;
    String ratio29a;
    /**
     * e
     */
    String size27e;
    String ratio27e;
    String size28e;
    String ratio28e;
    String size29e;
    String ratio29e;
    /**
     * f
     */
    String size27f;
    String ratio27f;
    String size28f;
    String ratio28f;
    String size29f;
    String ratio29f;
    /**
     * b
     */
    String size27b;
    String ratio27b;
    String size28b;
    String ratio28b;
    String size29b;
    String ratio29b;
    /**
     * c
     */
    String size27c;
    String ratio27c;
    String size28c;
    String ratio28c;
    String size29c;
    String ratio29c;
    /**
     * d
     */
    String size27d;
    String ratio27d;
    String size28d;
    String ratio28d;
    String size29d;
    String ratio29d;
    /**
     * d
     */
    String size27g;
    String ratio27g;
    String size28g;
    String ratio28g;
    String size29g;
    String ratio29g;
}