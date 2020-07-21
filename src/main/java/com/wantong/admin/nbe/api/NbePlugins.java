package com.wantong.admin.nbe.api;

import com.wantong.admin.domain.vo.NbeLoginRequest;
import com.wantong.common.response.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * NbePlugins nbe工具
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-05-25 15:19
 **/
@FeignClient(name = "nbe-plugins", url = "http://nbe.51wanxue.com")
public interface NbePlugins {

    /**
     * 登录
     *
     * @param request
     */
    @RequestMapping(value = "/login", method = RequestMethod.POST, consumes = MediaType.APPLICATION_JSON_VALUE)
    ApiResponse login(@RequestBody NbeLoginRequest request);
}
