package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.content.domain.dto.NoResourceStatisticsDTO;
import com.wantong.content.domain.vo.NoResourceStatisticsInnerVO;
import com.wantong.content.domain.vo.NoResourceStatisticsVO;
import com.wantong.content.service.INoResourceStatisticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * 无资源书本统计
 *
 * @author ly
 * @version 1.0
 * @date 2020-03-05
 */
@RestController
@Slf4j
public class NoResourceBookStatisticsController {

    @Reference
    private INoResourceStatisticsService noResourceStatisticsService;

    /**
     * 返回界面的权
     *
     * @return
     */
    @RequestMapping("/noResourceBookStatistics/frame.do")
    @ResponseBody
    public ModelAndView frame() {
        ModelAndView model = new ModelAndView();
        model.setViewName("/noResourceBook/noResourceBookStatistics");

        return model;
    }

    @RequestMapping("/noResourceBookStatistics/listNoResourceBook.do")
    @ResponseBody
    public ApiResponse listNoResourceBook(@RequestBody NoResourceStatisticsDTO dto) {
        Pagination pagination = new Pagination();
        pagination.setPageSize(10);
        pagination.setCurrentPage(dto.getCurrentPage());
        dto.setPagination(pagination);
        NoResourceStatisticsVO vo =noResourceStatisticsService.searchByCondition(dto);

        return ApiResponse.creatSuccess(vo);
    }

    /**
     * 删除数据
     *
     * @param deleteBaseBookIds
     * @return
     * @throws ServiceException
     */
    @RequestMapping("/noResourceBookStatistics/deleteRecord.do")
    @ResponseBody
    public ApiResponse deleteRecord(@RequestBody List<Long> deleteBaseBookIds) throws ServiceException {
        NoResourceStatisticsDTO dto = new NoResourceStatisticsDTO();
        dto.setBaseBookIds(deleteBaseBookIds);
        noResourceStatisticsService.deleteStatistics(dto);
        return ApiResponse.creatSuccess();
    }

    /**
     * 导出数据
     *
     * @param exportBaseBookIds
     * @return
     * @throws ServiceException
     */
    @RequestMapping("/noResourceBookStatistics/exportRecordNoDel.do")
    @ResponseBody
    public ApiResponse exportRecord(@RequestBody List<Long> exportBaseBookIds) throws ServiceException {
        NoResourceStatisticsDTO dto = new NoResourceStatisticsDTO();
        dto.setBaseBookIds(exportBaseBookIds);
        log.info("开始导出无资源书本数据:[{}]", dto);
        List<NoResourceStatisticsInnerVO> list = noResourceStatisticsService.searchByBaseBookIds(dto);
        return ApiResponse.creatSuccess(list);
    }

    @RequestMapping("/noResourceBookStatistics/exportRecordOrDel.do")
    @ResponseBody
    public ApiResponse exportRecordOrDel(@RequestBody List<Long> exportBaseBookIds) throws ServiceException {
        NoResourceStatisticsDTO dto = new NoResourceStatisticsDTO();
        dto.setBaseBookIds(exportBaseBookIds);
        log.info("开始导出无资源书本数据:[{}]", dto);
        List<NoResourceStatisticsInnerVO> list = noResourceStatisticsService.searchByBaseBookIds(dto);
        NoResourceStatisticsDTO noResourceStatisticsDTO = new NoResourceStatisticsDTO();
        noResourceStatisticsDTO.setBaseBookIds(exportBaseBookIds);
        noResourceStatisticsService.deleteStatistics(noResourceStatisticsDTO);

        return ApiResponse.creatSuccess(list);
    }


}
