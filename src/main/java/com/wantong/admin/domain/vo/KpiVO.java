package com.wantong.admin.domain.vo;

import com.wantong.common.model.Pagination;
import com.wantong.admin.view.kpi.KpiApiController;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * KPI DATA for JSON
 *
 * @see KpiApiController#query(Long, Integer, LocalDate, Pagination)
 *
 * @author : 刘建宇
 * @version : 1.0
 * @since : 2019/10/22
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class KpiVO {
    private String partner;
    private String email;
    private String role;
    private String month;
    private String count;
}
