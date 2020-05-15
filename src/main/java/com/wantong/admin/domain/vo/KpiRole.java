package com.wantong.admin.domain.vo;

import cn.visiontalk.interservice.plainobjects.kpi.JobKind;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * for api json
 * @see com.wantong.admin.view.kpi.KpiApiController#setup(Long) (Long)
 * @author : 刘建宇
 * @version : 1.0
 * @since : 2019/10/18
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class KpiRole {
    /**
     * @see JobKind#getInt()
     */
    private Integer jobKind;
    /**
     * @see JobKind#getRoleName()
     */
    private String name;
}
