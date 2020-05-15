package com.wantong.admin.domain.vo;

import java.io.Serializable;
import java.util.Date;
import lombok.Data;

/**
 * ActiveMachineVO 激活设备信息
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-11-12 10:46
 **/
@Data
public class ActiveMachineVO implements Serializable {
    private long id;
    private String machineId;
    private String machineType;
    private String qrCodeId;
    private Date createTime;
    private int status;
    private long appId;
    private String openId;
}
