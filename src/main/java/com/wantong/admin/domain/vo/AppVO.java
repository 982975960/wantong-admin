package com.wantong.admin.domain.vo;

import javax.validation.constraints.NotEmpty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.util.List;

/**
 * 创建app的vo
 *
 * @author cgl
 * @date 2019/7/12 9:58
 */
@Data
public class AppVO implements Serializable {

    @NotNull(message = "更新的appId不允许为空", groups = UpdateGroup.class)
    private Integer appId;

    @NotBlank(message = "应用名称不允许为空", groups = BaseGroup.class)
    private String name;

    @NotNull(message = "app类型不允许为空", groups = BaseGroup.class)
    private Integer appTypeId;

    private Integer platform;

    private Integer authorityType;

    private Integer verifyType;

    private Integer shareType;

    private Integer billingModel;

    private Integer qrCodeAmount;

    private Integer partnerId;

    private List<Integer> skills;

    private List<Integer> platforms;

    private List<Integer> functions;

    private List<CreateAppRepoVO> data;

    public interface BaseGroup {

    }

    public interface UpdateGroup extends BaseGroup {

    }


}
