package com.wantong.admin.domain.vo;

import com.wantong.config.domain.vo.LicenseUsedDataVO;
import lombok.Data;

/**
 * ConsumeDataVO 消费数据
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-10-22 20:24
 **/
@Data
public class ConsumeDataVO extends LicenseUsedDataVO {
    private long paidUser;
    private long unpaidUser;
    private long increase;
}
