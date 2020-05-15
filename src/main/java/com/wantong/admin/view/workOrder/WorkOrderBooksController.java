package com.wantong.admin.view.workOrder;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.constants.CheckResult;
import com.wantong.admin.business.WorkOrderImportBiz;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.order.OrderConfig;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.common.storage.StorageConfig;
import com.wantong.content.domain.dto.WorkOrderBookInfoDTO;
import com.wantong.content.domain.dto.WorkOrderBookListDTO;
import com.wantong.content.domain.dto.WorkOrderBookStateDTO;
import com.wantong.content.domain.vo.OrderTaskVO;
import com.wantong.content.domain.vo.WorkOrderBookInfoVO;
import com.wantong.content.domain.vo.WorkOrderBookSearchVO;
import com.wantong.content.service.IWorkOrderBookInfoService;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

/**
 * WorkOrderBooksController
 *
 * @author : win7
 * @version : 1.0
 * @date :  2019-08-02 14:27
 **/
@Controller
@RequestMapping("/work")
@Slf4j
@RequiredArgsConstructor
public class WorkOrderBooksController extends BaseController {

    @Reference(timeout = 10000)
    private IWorkOrderBookInfoService workOrderBookInfoService;

    private final WorkOrderImportBiz workOrderImportBiz;

    private static final Integer NO_HAVE_STATE = 100;


    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @Autowired
    private StorageConfig storageConfig;

    @Autowired
    private OrderConfig orderConfig;

    /**
     * loadWorkOrderBooks 通过工单Id 获得工单下的所有书本、
     * @return 返回ftl文件所在路径
     */
    @RequestMapping("loadWorkOrderBooks.do")
    public ModelAndView loadWorkOrderBooks(@RequestBody WorkOrderBookSearchVO vo)
            throws ServiceException {

        if (vo.getCurrentPage() == 0) {
            vo.setCurrentPage(1);
        }
        if (NO_HAVE_STATE.equals(vo.getState())) {
            vo.setState(null);
        }


        Pagination pagination = new Pagination();
        pagination.setCurrentPage(vo.getCurrentPage());
        pagination.setPageSize(12);
        vo.setPagination(pagination);

        WorkOrderBookListDTO books = workOrderBookInfoService.loadWorkOrderBookMessage(vo);
        List<WorkOrderBookStateDTO> states = workOrderBookInfoService.loadWorkOrderState(vo.getWorkOrderId());

        ModelAndView mv = new ModelAndView("/workOrder/workOrderBookList");

        mv.addObject("workOrderBookList", books.getBooks());
        mv.addObject("states", states);
        mv.addObject("currentPage", books.getPagination().getCurrentPage());
        mv.addObject("pages", books.getPagination().getPages());
        mv.addObject("pageSize", books.getPagination().getPageSize());
        mv.addObject("workOrderId", vo.getWorkOrderId());
        mv.addObject("workOrderName", vo.getWorkOrderName());
        mv.addObject("state", vo.getState());
        mv.addObject("huibenOrderId", orderConfig.getHuibenOrderId());
        mv.addObject("testOrderId", orderConfig.getTestOrderId());
        mv.addObject("partnerId", getAdminSession().getPartnerId());

        if (vo.getInnerId() != null && vo.getInnerId() == 0){
            vo.setInnerId(null);
        }
        mv.addObject("searchVO", vo);

        return mv;
    }

    /**
     * deleteWorkOrderBook 删除工单下一本书的信息
     *
     * @param id 书本信息的ID
     * @return ApiResponse
     */
    @RequestMapping("deleteWorkOrderBook.do")
    @ResponseBody
    public ApiResponse deleteWorkOrderBook(long id) throws ServiceException {

        workOrderBookInfoService.deleteWorkOrderBook(id);

        return ApiResponse.creatSuccess();
    }

    /**
     * createWorkOrderBook 书单下创建一本书
     */
    @PostMapping("createWorkOrderBook.do")
    @ResponseBody
    public ApiResponse createWorkOrderBook(
            @Validated(value = OrderTaskVO.OrderTaskBaseGroup.class) @RequestBody OrderTaskVO vo)
            throws ServiceException {
        Integer repoId =
                vo.getModelId() == 27 ? orderConfig.getHuibenRepoId() : orderConfig.getTestRepoId();
        vo.setRepoId(repoId);
        log.info("开始创建工单任务:[{}]", vo);
        long start = System.currentTimeMillis();
        workOrderBookInfoService.createOrderTask(vo);
        log.info("创建工单任务结束:[{}],耗时:[{}]ms", vo, System.currentTimeMillis() - start);
        return ApiResponse.creatSuccess();
    }

    /**
     * updateWorkOrderBook 跟新书本
     *
     * @param workOrderBookInfoVO 书本信息
     */
    @RequestMapping("updateWorkOrderBook.do")
    @ResponseBody
    public ApiResponse updateWorkOrderBook(@RequestBody WorkOrderBookInfoVO workOrderBookInfoVO)
            throws ServiceException {

        workOrderBookInfoService.updateWorkOrderBook(workOrderBookInfoVO);

        return ApiResponse.creatSuccess();
    }


    /***/
    @RequestMapping("loadOneWorkOrderBook.do")
    @ResponseBody
    public ModelAndView loadOneWorkOrderBook(@RequestParam(value = "id", required = false, defaultValue = "0") Long id,
            boolean isCreate) throws ServiceException {

        ModelAndView mv = new ModelAndView("workOrder/addAndEditorWorkOrderBook");
        if (isCreate) {
            return mv;
        } else {
            WorkOrderBookInfoDTO workOrderBookInfoDTO = workOrderBookInfoService.loadWorkOrderBookInfo(id);
            mv.addObject("workOrderBook", workOrderBookInfoDTO);
        }
        return mv;
    }

    @RequestMapping("baseBookInfos.do")
    @ResponseBody
    public ApiResponse baseBookInfos(MultipartFile file,
            @RequestParam(value = "state", required = false, defaultValue = "0") Integer state, Integer modelId,
            Long workOrderId) throws Exception {
        Integer repoId = modelId == 27 ? orderConfig.getHuibenRepoId() : orderConfig.getTestRepoId();
        Set<CheckResult> results = workOrderImportBiz
                .importBookOrder(file.getBytes(), state, modelId, workOrderId, repoId);

        if (results.size() == 0) {
            return ApiResponse.creatSuccess();
        } else {
            if (results.contains(CheckResult.EXCEL_HEAD_MISSING)) {
                return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, "表中缺少列，无法导入");
            } else if (results.contains(CheckResult.EXCEL_HEAD_WRONG_ORDER)) {
                return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, "列顺序错误，无法导入");
            } else if (results.contains(CheckResult.EXCEL_HEAD_INVALIDATE)) {
                return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, "未知错误");
            } else {
                StringBuilder s = new StringBuilder();
                if (results.contains(CheckResult.ISBN_NOT_NUMBER)) {
                    s.append("部分书本信息ISBN不合法，无法导入<br>");
                }
                if (results.contains(CheckResult.MISSING_REQUIRED_FILED)) {
                    s.append("部分书本信息必填项缺失，无法导入");
                }
                return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, s.toString());
            }

        }

    }

    /**
     * openBatchPanel 批量上传的界面
     */
    @RequestMapping("batchPanel.do")
    @ResponseBody
    public ModelAndView openBatchPanel() {
        ModelAndView mv = new ModelAndView("workOrder/batchIndex");
        mv.addObject("downloadPath", thirdPartyConfig.getFileEndpoint() + storageConfig.getWorkOrderExcelTemplate());

        return mv;
    }


    private void setWorkOrderBookInfoVO(WorkOrderBookInfoVO workOrderBookInfoVO) {
        if (workOrderBookInfoVO.getInnerId() != null && workOrderBookInfoVO.getId() == 0) {
            workOrderBookInfoVO.setId(null);
        }
        if (workOrderBookInfoVO.getInnerId() != null && workOrderBookInfoVO.getInnerId() == 0) {
            workOrderBookInfoVO.setInnerId(null);
        }
        if (workOrderBookInfoVO.getModelId() == 0) {
            workOrderBookInfoVO.setModelId(null);
        }
    }

    @RequestMapping("batchCreateBook.do")
    @ResponseBody
    public ApiResponse batchCreateBook(@RequestParam("workOrderId") Long workOrderId) throws ServiceException {
        workOrderBookInfoService.batchCreateBook(workOrderId);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("batchUpdateState.do")
    @ResponseBody
    public ApiResponse batchUpdateState(@RequestParam("workOrderId") Long workOrderId,
                                        @RequestParam("oldState") Integer oldState,
                                        @RequestParam("newState") Integer newState) throws ServiceException {
        workOrderBookInfoService.batchUpdateState(workOrderId, oldState, newState);
        return ApiResponse.creatSuccess();
    }
    @RequestMapping("checkBatchTask.do")
    @ResponseBody
    public ApiResponse checkBatchTask(@RequestParam("workOrderId") Long workOrderId,
                                        @RequestParam("state") Integer state) throws ServiceException {
        //1 批量任务未完成， 0已经完成
        Integer i =workOrderBookInfoService.checkBatchTask(workOrderId, state);
        return ApiResponse.creatSuccess(i);
    }
}
