package com.wantong.admin.freemarker;

public class CustomEnvironment {

    private static String contextPath;
    //构建前端css,js的版本号
    private static String buildNumber;

    public static void init(String contextPathParam, String build) {
        contextPath = contextPathParam;
        buildNumber = build;
    }

    public static String getContextPath() {
        return contextPath;
    }

    public static String getBuildNumber() {
        return buildNumber;
    }

    public static String getStaticPath() {
        return contextPath + "/static";
    }
}
