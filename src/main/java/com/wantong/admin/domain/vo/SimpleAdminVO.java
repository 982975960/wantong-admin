package com.wantong.admin.domain.vo;

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
@AllArgsConstructor
@NoArgsConstructor
public class SimpleAdminVO {
    private Long id;
    private String email;
}
