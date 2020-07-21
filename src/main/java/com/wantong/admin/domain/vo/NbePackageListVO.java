package com.wantong.admin.domain.vo;

import javax.validation.constraints.NotBlank;
import lombok.Data;

/**
 * NbePackageListVO nbe 轻课包listVO
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-05-25 14:55
 **/
@Data
public class NbePackageListVO {
    @NotBlank(message = "entityId不能空")
    private String entityId;
}
