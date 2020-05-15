package com.wantong.admin.interceptor;

import com.wantong.admin.interceptor.system.LoginInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * WebConfig
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-10-12 15:09
 **/
@Configuration
@EnableWebMvc
@Component
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    LoginInterceptor loginInterceptor;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**", "/static/**","/webjars/**")
                .addResourceLocations("/public", "classpath:/static/images/", "classpath:/static/","/webjars/")
                .setCachePeriod(31556926);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {

        //添加拦截器
        //registry.addInterceptor(requestInterceptor).addPathPatterns("/**").excludePathPatterns("/error/**");
        registry.addInterceptor(loginInterceptor).addPathPatterns("/**")
                .excludePathPatterns("/images/**", "/error/**", "/static/**","/webjars/**");

    }


}
