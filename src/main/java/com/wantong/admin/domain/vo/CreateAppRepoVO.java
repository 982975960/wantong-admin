package com.wantong.admin.domain.vo;

import lombok.Data;
import lombok.experimental.Accessors;

import javax.validation.constraints.NotNull;
import java.io.Serializable;

/**
 * app与资源库的关联关系
 *
 * @author cgl
 * @date 2019/7/12 10:16
 */
@Data
@Accessors(chain = true)
public class CreateAppRepoVO implements Serializable {

    private Integer id;

    @NotNull(message = "资源库id不允许为空")
    private Integer repoId;

    @NotNull(message = "优先级不允许为空")
    private Integer priority;

    @NotNull(message = "授权方式不允许为空")
    private Integer authType;
}
