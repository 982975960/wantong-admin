package com.wantong.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * TuringConfig 图灵TTS
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-11-08 18:16
 **/
@Component
@ConfigurationProperties(prefix = "turing")
public class TuringConfig {
    private String endpoint;
    private String intelligence;



    private String apikeyanduniqueId;



    private int usecode;

    public String getEndpoint() {
        return endpoint;
    }

    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }

    public String getIntelligence() {
        return intelligence;
    }

    public void setIntelligence(String intelligence) {
        this.intelligence = intelligence;
    }

    public String getApikeyanduniqueId() {
        return apikeyanduniqueId;
    }

    public void setApikeyanduniqueId(String apikeyanduniqueId) {
        this.apikeyanduniqueId = apikeyanduniqueId;
    }

    public int getUsecode() {
        return usecode;
    }

    public void setUsecode(int usecode) {
        this.usecode = usecode;
    }
}
