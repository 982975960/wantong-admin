package com.wantong.admin.config;

import com.wantong.admin.domain.PartnerModelInfo;
import java.util.List;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * PartnerModelConfig 合作商图片库限制关系
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-06-24 12:24
 **/
@Component
@ConfigurationProperties(prefix = "partnermodel")
@Data
public class PartnerModelConfig {

    private List<PartnerModelInfo> infoList;
}
