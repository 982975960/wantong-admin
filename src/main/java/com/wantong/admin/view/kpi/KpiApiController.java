package com.wantong.admin.view.kpi;

import cn.visiontalk.interservice.interfaces.config.PartnerInfoService;
import cn.visiontalk.interservice.interfaces.record.KpiResultService;
import cn.visiontalk.interservice.plainobjects.PageResult;
import cn.visiontalk.interservice.plainobjects.Pagination;
import cn.visiontalk.interservice.plainobjects.dto.KpiResultDTO;
import cn.visiontalk.interservice.plainobjects.dto.SimplePartnerDTO;
import cn.visiontalk.interservice.plainobjects.kpi.JobKind;
import com.alibaba.dubbo.config.annotation.Reference;
import com.google.common.collect.ImmutableMap;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.domain.vo.KpiRole;
import com.wantong.admin.domain.vo.KpiVO;
import com.wantong.admin.domain.vo.SimpleAdminVO;
import com.wantong.admin.view.StaticPageController;
import com.wantong.common.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * @see StaticPageController#kpi()
 *
 * @author : 刘建宇
 * @version : 1.0
 * @since : 2019/10/18
 */
@Slf4j
@RestController
@RequestMapping("api/kpi")
public class KpiApiController extends BaseController {

    @Reference
    private PartnerInfoService partnerInfoService;

    @Reference(timeout = 5 * 1000)
    private KpiResultService kpiResultService;

    private final Long VT_PARTNER_ID = 1L;

    /**
     * 初始化选项信息
     * 返回admin信息 {@link SimpleAdminVO}, 以及角色选项
     */
    @GetMapping("setup")
    public ApiResponse setup(){
        Long partnerId = getAdminSession().getPartnerId();
        partnerId =  VT_PARTNER_ID.equals(partnerId) ? null : partnerId;
        List<SimpleAdminVO> adminOption =  partnerInfoService.listSimpleAdminByPartnerId(partnerId)
                .stream()
                .map(e -> new SimpleAdminVO(e.getAdminId(), e.getEmail()))
                .collect(Collectors.toList());
        List<KpiRole> roleOption =  Stream.of(JobKind.values())
                .filter(e-> !e.equals(JobKind.PictureProduction))
                .map(e-> new KpiRole(e.getInt(), e.getRoleName()))
                .collect(Collectors.toList());
        Long sessionPartnerId = getAdminSession().getPartnerId();
        String sessionPartnerName = getAdminSession().getPartnerName();
        List<SimplePartnerDTO> partnerOption = VT_PARTNER_ID.equals(sessionPartnerId) ?
                partnerInfoService.listAllSimplePartner()
                : Collections.singletonList(new SimplePartnerDTO(sessionPartnerId, sessionPartnerName));
        Map<String, Object> map = ImmutableMap.of(
                "adminOption",adminOption,
                "roleOption",roleOption,
                "partnerOption",partnerOption,
                "sessionPartnerId", sessionPartnerId
        );
        return ApiResponse.creatSuccess(map);
    }

    /**
     * 查询kpi数据的接口
     * null表示不过滤此字段, month = -1时 同上
     */
    @GetMapping("query")
    public ApiResponse query(@Nullable Long admin,
                             @Nullable Integer role,
                             @Nullable Long partner,
                             @RequestParam int year,
                             @RequestParam int month,
                             @RequestParam int currentPage,
                             @RequestParam int pageSize){
        PageResult<KpiResultDTO> result = kpiResultService.listKpiResult(
                admin,
                role == null ? null :JobKind.fromInt(role),
                month == -1 ? null: year * 100 + month,
                partner,
                new Pagination(currentPage, pageSize,-1)
        );
        Map<Long, String> partnerName = partnerInfoService.listAllSimplePartner()
                .stream()
                .collect(Collectors.toMap(SimplePartnerDTO::getId, SimplePartnerDTO::getName));
        List<KpiVO> voList = result.getResult()
                .stream()
                .map(e->new KpiVO(partnerName.get(e.getSimpleAdminDTO().getPartnerId()), e.getSimpleAdminDTO().getEmail(),
                        e.getJobKind().getRoleName()
                        , e.getMonth().getYear() +"-"+e.getMonth().getMonthValue()
                        , e.getCount() + (JobKind.WorkOrderCreation.equals(e.getJobKind()) ? " 条" : " 页")))
                .collect(Collectors.toList());
        Map<String, Object> map = ImmutableMap.of("data", voList, "pagination", result.getPagination());
        return ApiResponse.creatSuccess(map);
    }
}
