package com.wantong.admin.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author free
 */
@Component
@ConfigurationProperties(prefix = "isbn")
@Data
public class IsbnConfig {
    private String url;
    private String titleNode;
    private String authorNode;
    private String publisherNode;
    private String seriesTitleNode;
    private String summaryNode;
    private String imageNode;
    private String successNode;
}
