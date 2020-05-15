package com.wantong.admin.exception;

public class LoginInterceptionException extends RuntimeException {

    private static final String message = "没有登录";

    public LoginInterceptionException() {
        super(message);
    }
}
