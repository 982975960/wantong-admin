package com.wantong.admin.domain.vo;

import lombok.Data;
import lombok.ToString;

import java.util.List;

/**
 * 刘建宇 2019/6/20 13:59
 */
@ToString @Data
@Deprecated
public class AppRequestData {
    long appId;
    String name;
    int amount;
    int billingModel;
    long partnerId;
    int appTypeId;
    int authorityType;
    int verifyType;
    int platform;
    int pointingRead;
    int shareType;

    List<RepoPriorityMap> repoPri;

    @ToString @Data
    public static class RepoPriorityMap {
        int repoId;
        int priority;

    }
}
