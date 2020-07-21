package com.wantong.admin.domain.vo;

import javax.validation.constraints.NotNull;
import lombok.Data;

/**
 * NbeLoginRequest nbe登录请求
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-05-25 15:28
 **/
@Data
public class NbeLoginRequest {

    /**
     * 登录账号
     */
    @NotNull(message = "登录邮箱不能为空")
    private String email;
    /**
     * 登录密码
     */
    @NotNull(message = "登录密码不能为空")
    private String password;
}
