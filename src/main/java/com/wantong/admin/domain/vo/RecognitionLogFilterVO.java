package com.wantong.admin.domain.vo;

import java.io.Serializable;
import lombok.Data;

/**
 * QrCodeRecordVO 操作记录VO
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-11-13 11:12
 **/
@Data
public class RecognitionLogFilterVO implements Serializable {
    private long id;
    private long partnerId;
    private String partner;
    private long appId;
    private String appName;
    /**
     * 开启状态
     */
    private int state;

}
