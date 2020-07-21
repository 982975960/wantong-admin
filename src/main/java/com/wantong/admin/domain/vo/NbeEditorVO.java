package com.wantong.admin.domain.vo;

import javax.validation.constraints.NotBlank;
import lombok.Data;

/**
 * NbeEditorVO NbeEditorVO 进入nbe编辑器vo
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-05-25 14:54
 **/
@Data
public class NbeEditorVO {
    @NotBlank(message = "packageId不能空")
    private String packageId;

    /**
     * 书本ID
     */

    private String bookId="";

    /**
     * 卡片id
     */
    private String cardId="";
}
