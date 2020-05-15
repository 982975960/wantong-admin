package com.wantong.admin.domain.vo;

import com.wantong.config.domain.po.app.ByMachineAppPO;
import lombok.Data;

/**
 * AppFilterVO
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2020-01-03 12:13
 **/
@Data
public class AppFilterVO extends ByMachineAppPO {
    private int state;
}
