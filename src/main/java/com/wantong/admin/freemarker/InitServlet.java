package com.wantong.admin.freemarker;

import com.wantong.admin.config.ServerConfig;
import freemarker.template.Configuration;
import freemarker.template.TemplateModel;
import java.util.Map;
import java.util.Map.Entry;
import javax.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.servlet.view.freemarker.FreeMarkerConfigurer;

@Component
public class InitServlet {

    @Autowired
    private WebApplicationContext webApplicationConnect;

    @Autowired
    private FreeMarkerConfigurer freeMarkerConfigurer;

    @Autowired
    private ApplicationContext context;

    @Autowired
    private ServerConfig serverConfig;
    @PostConstruct
    public void init() {
        String contextPath = webApplicationConnect.getServletContext().getContextPath();
        CustomEnvironment.init(contextPath,serverConfig.getBuildNumber());
        //init freemarker
        Configuration freemarkerConfiguration = freeMarkerConfigurer.getConfiguration();
        Map<String, Object> pluginMaps = context.getBeansWithAnnotation(FreemarkerPlugin.class);
        for (Entry<String, Object> pluginEntry : pluginMaps.entrySet()) {
            String name = pluginEntry.getKey();
            TemplateModel plugin = (TemplateModel) pluginEntry.getValue();
            freemarkerConfiguration.setSharedVariable(name, plugin);
        }
    }

}
