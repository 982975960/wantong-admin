package com.wantong.admin.domain.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * QrCodeRecordVO 操作记录VO
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-11-13 11:12
 **/
@Data
public class QrCodeOpRecordVO implements Serializable {
    private long id;
    private long partnerId;
    private String partner;
    private long appId;
    private String qrCode;
    private Date createdTime;
    private long opId;
}
