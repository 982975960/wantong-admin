package com.wantong.admin.view.workOrder;

import cn.visiontalk.interservice.plainobjects.kpi.WorkOrderCreationJob;
import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.JsonWrapper;
import com.wantong.common.model.Pagination;
import com.wantong.common.order.OrderConfig;
import com.wantong.common.response.ApiResponse;
import com.wantong.config.domain.po.supplier.PartnerPO;
import com.wantong.config.domain.po.system.AdminPO;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.system.IUserRelatedService;
import com.wantong.content.domain.WorkOrderBookState;
import com.wantong.content.domain.dto.*;
import com.wantong.content.domain.po.*;
import com.wantong.content.domain.vo.*;
import com.wantong.content.service.*;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * BookController 书本图书管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 11:03
 **/
@Controller
@RequestMapping("/work")
@Slf4j
public class WorkOrderController extends BaseController {

    @Reference
    private IModelService modelService;

    @Reference
    private IWorkOrderService workOrderService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference(timeout = 10 * 1000)
    private IWorkOrderBookInfoService workOrderBookInfoService;

    @Reference
    private IBookBaseInfoService bookBaseInfoService;

    @Reference
    private IBookInfoService bookInfoService;

    @Reference
    private IBookIsbnInfoService bookIsbnInfoService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;


    @Autowired
    private OrderConfig orderConfig;

    @RequestMapping("workOrderManager.do")
    public String workOrderManager(Model model) {
        AdminSession adminSession = getAdminSession();
        Set<String> urls = adminSession.getAuthorizedUrls();
        //tab标记工单任务是否展示全部，1展示全部，0展示部分,-1不展示
        int tab = 0;
        boolean bAll = urls.contains("/virtual/work/lookAllBookProgress.do");
        boolean bPart = urls.contains("/work/lookBookProgress.do");

        if (!bAll && !bPart){
            tab = -1;
        }

        List<ModelPO> dto = modelService.listLibraries();
        model.addAttribute("models", dto);
        model.addAttribute("partnerId", adminSession.getPartnerId());
        model.addAttribute("tab", tab);

        return "workOrder/workOrderManager";
    }

    @RequestMapping("openCreateWorkOrder.do")
    public ModelAndView openCreateWorkOrder(String name,Integer id,Long partnerId,Integer modelId) {
        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();

        ModelAndView mv = new ModelAndView();
        mv.addObject("partners", partnerVOS);
        mv.addObject("name", name == null ? "" : name);
        mv.addObject("id", id == null ? 0 : id);
        mv.addObject("modelId", modelId);
        mv.addObject("partnerId", partnerId == null ? 0 : partnerId);

        mv.setViewName("workOrder/createWorkOrder");
        return mv;
    }

    @RequestMapping("loadWorkOrders.do")
    public String loadWorkOrders(@RequestParam("modelId") Integer modelId,@RequestParam("partnerId") Long partnerId, Model model)
            throws ServiceException {

        AdminSession adminSession = getAdminSession();
        WorkOrderVO workOrderVO = new WorkOrderVO();
        workOrderVO.setPartnerId(adminSession.getPartnerId());
        workOrderVO.setModelId(modelId);
        workOrderVO.setPartnerIdFilter(partnerId);

        //获得在当前modelId下的所有名字用于查询使用
        List<String> names = workOrderService.getAllWorkOrderName(workOrderVO);

        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();

        model.addAttribute("allWorkOrderNames", names);
        model.addAttribute("partners", partnerVOS);
        model.addAttribute("partnerId",adminSession.getPartnerId());
        model.addAttribute("partnerName",adminSession.getPartnerName());

        return "workOrder/workOrder";
    }


    @RequestMapping("loadWorkOrderList.do")
    public String loadWorkOrderList(@RequestParam("modelId") Integer modelId, @RequestParam(value = "partnerId", required = false) Long partnerId,
            @RequestParam(value = "name", required = false, defaultValue = "") String name, int currentPage,
            @RequestParam(value = "pageSize", required = false, defaultValue = "12") int pageSize, Model model)
            throws ServiceException {

        AdminSession adminSession = getAdminSession();
        WorkOrderVO workOrderVO = new WorkOrderVO();
        workOrderVO.setPartnerId(adminSession.getPartnerId());
        workOrderVO.setModelId(modelId);
        workOrderVO.setName(name);
        workOrderVO.setPartnerIdFilter(partnerId);

        Pagination pagination = new Pagination();
        if (currentPage == 0) {
            currentPage = 1;
        }
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);

        //获得当前modelId下的所有元素
        WorkOrderDTO dto = workOrderService.getWorkOrder(workOrderVO, pagination);

        if (!dto.getWorkOrders().isEmpty()){
            Set<Long> adminId = new HashSet<Long>();

            List<Long> partnerIds = dto.getWorkOrders().stream().map(WorkOrderPO::getPartnerId).collect(Collectors.toList());

            List<PartnerPO> partnerPOS = partnerRelatedService.getPartnersByIds(partnerIds);

            Map<Long, String> map = partnerPOS.stream().collect(Collectors.toMap(PartnerPO::getId, PartnerPO::getName));

            for (WorkOrderInfoDTO workOrderInfoDTO : dto.getWorkOrders()) {
                adminId.add(workOrderInfoDTO.getAdminId());
                workOrderInfoDTO.setPartnerName(map.getOrDefault(workOrderInfoDTO.getPartnerId(), ""));
            }
            //找到所有ID的对象
            List<AdminPO> admins = userRelatedService.getUserList(new ArrayList<>(adminId));

            admins.stream().forEach(p -> {
                dto.getWorkOrders().stream().filter(p1 -> p.getId() == p1.getAdminId()).forEach(p2 -> {
                    p2.setEmail(p.getEmail());
                });
            });
        }

        model.addAttribute("workOrderList", dto.getWorkOrders());
        model.addAttribute("currentPage", dto.getPagination().getCurrentPage());
        model.addAttribute("pages", dto.getPagination().getPages());
        model.addAttribute("pageSize", dto.getPagination().getPageSize());
        model.addAttribute("huibenOrderId", orderConfig.getHuibenOrderId());
        model.addAttribute("testOrderId", orderConfig.getTestOrderId());
        model.addAttribute("partnerId", adminSession.getPartnerId());

        return "workOrder/workOrderList";
    }

    @RequestMapping("createWorkOrder.do")
    @ResponseBody
    public ApiResponse createWorkOrder(String name,Long partnerId, Integer modelId) throws ServiceException {

        AdminSession adminSession = getAdminSession();
        // 获得创建者的id
        long adminId = adminSession.getId();
        WorkOrderVO workOrderVO = new WorkOrderVO();
        workOrderVO.setModelId(modelId);
        workOrderVO.setAdminId(adminId);
        workOrderVO.setName(name);
        workOrderVO.setPartnerId(partnerId);
        workOrderService.createWorkOrder(workOrderVO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("updateWorkOrder.do")
    @ResponseBody
    public ApiResponse updateWorkOrder(long id, String name,Long partnerId) throws ServiceException {

        WorkOrderVO workOrderVO = new WorkOrderVO();
        workOrderVO.setId(id);
        workOrderVO.setName(name);
        workOrderVO.setPartnerId(partnerId);
        workOrderService.updateWorkOrder(workOrderVO);

        return ApiResponse.creatSuccess();
    }

    private static final List<Integer> REPO_STATE = new ArrayList<>(Arrays.asList(9, 10, 11, 12));
    private static final List<Integer> IMAGE_STATE = new ArrayList<>(Arrays.asList(4, 5, 6, 7));
    private static final String WAIT_HANDLE = "待处理";
    private static final String IMAGE_MAKING = "图片制作中";
    private static final String IMAGE_FINISH = "图片已完成";
    @RequestMapping("bookProgressManager.do")
    public String bookProgressManager(String searchVO, int currentPage, Model model)
            throws ServiceException, IOException {
        //tab标记工单任务是否展示全部，1展示全部，0展示部分
        AdminSession adminSession = getAdminSession();
        Set<String> urls = adminSession.getAuthorizedUrls();
        int tab = 0;
        boolean bAll = urls.contains("/virtual/work/lookAllBookProgress.do");

        if (bAll){
            tab = 1;
        }

        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        pagination.setCurrentPage(currentPage);
        ObjectMapper mapper = new ObjectMapper();
        WorkOrderBookSearchVO searchContent = mapper.readValue(searchVO, WorkOrderBookSearchVO.class);

        if (tab == 0) {
            Integer[] bookState = searchContent.getBookState();
            List<Integer> stateList = Arrays.stream(searchContent.getBookState()).collect(Collectors.toList());
            for (Integer state : bookState) {
                if (state == WorkOrderBookState.IMAGE_PUBLISHED.getState()) {
                    stateList.addAll(REPO_STATE);
                }else if (state == WorkOrderBookState.NO_HANDLE.getState()){
                    stateList.add(WorkOrderBookState.WAIT_BUY.getState());
                }else if (state == WorkOrderBookState.IMAGE_MAKING.getState()){
                    stateList.addAll(IMAGE_STATE);
                }
            }
            Integer[] bookStateNew = new Integer[stateList.size()];
            stateList.toArray(bookStateNew);
            searchContent.setBookState(bookStateNew);
        }

        searchContent.setPagination(pagination);
        BookProgressDTO result = workOrderBookInfoService.searchAllBookProgress(searchContent);
        List<BookProgressInfoDTO> list = result.getList();
        // 只有“查看任务图片制作信息”权限时，将资源制作状态全部变为图片已发布
        if (!list.isEmpty() && tab == 0){
            for (BookProgressInfoDTO dto : list) {
                if (dto.getState() >= WorkOrderBookState.IMAGE_PUBLISHED.getState()){
                    dto.setStateName(IMAGE_FINISH);
                }else if (dto.getState() == WorkOrderBookState.WAIT_BUY.getState() || dto.getState() == WorkOrderBookState.NO_HANDLE.getState()){
                    dto.setStateName(WAIT_HANDLE);
                }else if (dto.getState() >= WorkOrderBookState.IMAGE_MAKING.getState() && dto.getState() <= WorkOrderBookState.IMAGE_TRAINING.getState()){
                    dto.setStateName(IMAGE_MAKING);
                }
            }
        }

        model.addAttribute("books", list);
        model.addAttribute("currentPage", currentPage);
        model.addAttribute("pages", result.getPagination().getPages());
        model.addAttribute("pageSize", result.getPagination().getPageSize());
        model.addAttribute("tab", tab);

        return "workOrder/bookProgressList";
    }

    @RequestMapping("bookCheck.do")
    public String bookCheck(@RequestParam("id") Long id, @RequestParam("isbn") String isbn,
            @RequestParam("name") String name, @RequestParam("modelId") Integer modelId,
            @RequestParam(value = "tabType", defaultValue = "1") Integer tabType,
            @RequestParam(value = "page", defaultValue = "1") Integer currentPage, @RequestParam("type") String type,
            Model model)
            throws ServiceException {
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(6);
        Integer repoId = modelId == 27 ? orderConfig.getHuibenRepoId() : orderConfig.getTestRepoId();
        BookProgressCheckDTO result = workOrderBookInfoService
                .bookProgressCheck(id, isbn, name, modelId, repoId, tabType,
                        pagination, Integer.parseInt(type));
        pagination = result.getPagination();
        model.addAttribute("currentPage", pagination.getCurrentPage());
        model.addAttribute("pages", pagination.getPages());
        model.addAttribute("pageSize", pagination.getPageSize());
        model.addAttribute("books", result.getBookList());
        model.addAttribute("bookProgressList", result.getBookProgressList());
        model.addAttribute("type", type);

        return "/workOrder/bookProgressCheck";
    }

    @RequestMapping("/updateWorkState.do")
    @ResponseBody
    public ApiResponse updateWorkState(@RequestParam("id") Long id, @RequestParam("state") Integer state,
            @RequestParam("remark") String remark) {
        ChangeBookStateVO vo = new ChangeBookStateVO();
        vo.setId(id);
        vo.setState(state);
        vo.setRemark(remark);
        log.info("更改工单书本的状态:[{}]", vo);
        return workOrderBookInfoService.changeBookState(vo);
    }

    @RequestMapping("/download.do")
    public ResponseEntity<byte[]> downloadExcel(@RequestParam("searchVO") String searchVO,
            @RequestParam("currentPage") Integer currentPage)
            throws ServiceException {
        log.info("开始导出工单书本数据:[{}], page:[{}]", searchVO, currentPage);
        Pagination pagination = new Pagination();
        pagination.setPageSize(12);
        pagination.setCurrentPage(currentPage);
        JSONObject json = JSONObject.parseObject(searchVO);
        WorkOrderBookSearchVO searchContent = JSONObject.toJavaObject(json, WorkOrderBookSearchVO.class);
        searchContent.setPagination(pagination);
        byte[] bytes = workOrderBookInfoService.exportExcel(searchContent);
        HttpHeaders headers = new HttpHeaders();
        String finalName = "bookProgress.xlsx";
        try {
            finalName = URLEncoder.encode("工单书本数据.xlsx", "UTF-8");
        } catch (Exception e) {
            log.info("encode转换appname失败", e);
        }
        headers.add("Content-Disposition", "attchement;filename=" + finalName);
        ResponseEntity<byte[]> entity = new ResponseEntity<>(bytes, headers, HttpStatus.OK);
        log.info("导出工单书本数据结束");

        return entity;
    }

    private void writeToResponse(HttpServletResponse response, ApiResponse apiResponse) {
        response.setHeader("Content-Type", "application/json");
        try (OutputStream out = response.getOutputStream()) {
            out.write(JSON.toJSONBytes(apiResponse));
            out.flush();
        } catch (IOException e) {
            log.info("错误信息写入相应失败");
        }
    }

    @RequestMapping("/bookProgressSearch.do")
    public String bookProgressSearch(Model model, @RequestParam("modelId") Integer modelId)
            throws ServiceException {

        AdminSession adminSession = getAdminSession();
        Set<String> urls = adminSession.getAuthorizedUrls();

        //tab标记工单任务是否展示全部，1展示全部，0展示部分
        int tab = 0;
        boolean bAll = urls.contains("/virtual/work/lookAllBookProgress.do");
        boolean bPart = urls.contains("/work/lookBookProgress.do");

        if (bAll){
            tab = 1;
        }

        List<WorkOrderPO> workOrderPOList = workOrderService.getAllWorkOrder(modelId);
        model.addAttribute("allWorkOrder", workOrderPOList);
        model.addAttribute("tab", tab);
        return "/workOrder/bookProgressManager";
    }

    @Value("${mq-topic.kpi-event}")
    private String kpiTopic;

    @Autowired
    private RocketMQTemplate template;

    @RequestMapping("/create.do")
    @ResponseBody
    public ApiResponse createBook(@RequestParam("id") Long id, @RequestParam("modelId") Integer modelId)
            throws ServiceException {
        workOrderBookInfoService.createBook(id);
        //kpi统计消息 start
        try {
            WorkOrderCreationJob job = new WorkOrderCreationJob(
                    getAdminSession().getId(),
                    getAdminSession().getPartnerId(),
                    LocalDateTime.now(),
                    id
            );
            JsonWrapper jsonWrapper = JsonWrapper.of(job);
            template.convertAndSend(kpiTopic, jsonWrapper);
            log.debug("kpi统计消息" + jsonWrapper);
        }catch (Throwable throwable){
            log.error("kpi统计消息 / work/create.do  / id: {}, modelId: {}",id, modelId);
            log.error("kpi统计消息 发送失败",throwable);
        }
        //kpi统计消息 end
        return ApiResponse.creatSuccess();
    }


    @RequestMapping("/setSameBook.do")
    @ResponseBody
    public ApiResponse setSameBook(@RequestParam("id") Long id, @RequestParam("bookId") Long bookId,
            @RequestParam("type") Integer type) throws ServiceException {
        WorkOrderBookInfoPO workOrderBookInfoPO = workOrderBookInfoService.getOneById(id);
        BookBaseInfoPO bookBaseInfoPO = bookBaseInfoService.loadBookBaseInfo(bookId.intValue());
        workOrderBookInfoPO.setBookType(0);
        workOrderBookInfoPO.setBookId(bookBaseInfoPO.getId());
        Long innerId = 0L;
        try {
            innerId = Long.valueOf(bookBaseInfoPO.getInnerId());
        } catch (Exception e) {
            innerId = 0L;
        }
        workOrderBookInfoPO.setInnerId(innerId);
        Integer modelId = bookBaseInfoPO.getModelId();
        Integer repoId = modelId == 27 ? orderConfig.getHuibenRepoId() : orderConfig.getTestRepoId();
        BookInfoPO bookInfoPO = bookInfoService.getOneByRefBookIdAndRepoId(bookBaseInfoPO.getId(), repoId);
        Integer state = WorkOrderBookState.parseState(true, bookBaseInfoPO.getState(), 0).getState();
        if (bookInfoPO != null) {
            state = WorkOrderBookState.parseState(false, bookInfoPO.getState(), bookInfoPO.getForbidden()).getState();
            workOrderBookInfoPO.setBookType(1);
            workOrderBookInfoPO.setBookId(bookInfoPO.getId());
        }
        workOrderBookInfoPO.setState(state);
        workOrderBookInfoService.updateAllTask(workOrderBookInfoPO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/addBookIsbn.do")
    @ResponseBody
    public ApiResponse addBookIsbn(@RequestParam("id") Long id, @RequestParam("bookId") Long bookId)
            throws ServiceException {
        WorkOrderBookInfoPO workOrderBookInfoPO = workOrderBookInfoService.getOneById(id);
        BookBaseInfoPO bookBaseInfoPO = bookBaseInfoService.loadBookBaseInfo(bookId.intValue());
        BookIsbnInfoPO bookIsbnInfoPO = BookIsbnInfoPO.builder().build();
        bookIsbnInfoPO.setBookId(bookBaseInfoPO.getId());
        bookIsbnInfoPO.setIsbn(workOrderBookInfoPO.getIsbn().toString());
        bookIsbnInfoService.createIsbn(bookIsbnInfoPO);

        return ApiResponse.creatSuccess();
    }


    @RequestMapping("/deleteWorkOrder.do")
    @ResponseBody
    public ApiResponse deleteWorkOrder(@RequestParam("id") Long id) throws ServiceException {
        log.info("开始删除工单:[{}]", id);
        workOrderService.deleteOrder(new OrderVO().setId(id));
        log.info("删除工单完成:[{}]", id);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/setSameTask.do")
    @ResponseBody
    public ApiResponse setSameTask(@RequestParam("id") Long id, @RequestParam("taskId") Long taskId)
            throws ServiceException {
        workOrderBookInfoService.updateSameTask(id, taskId);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("loadTaskCheckInfo.do")
    @ResponseBody
    public ApiResponse loadTaskCheckInfo(Long taskId) throws Exception {
        WorkOrderBookInfoPO workOrderBookInfoPO = workOrderBookInfoService.getOneById(taskId);
        Map<Integer, String> map = WorkOrderBookState.mapStates();
        BookProgressInfoDTO dto = new BookProgressInfoDTO();
        BeanUtils.copyProperties(workOrderBookInfoPO, dto);
        dto.setStateName(map.getOrDefault(dto.getState(), "未知状态"));
        dto.setInnerIdString(dto.getInnerId() == null ? "" : dto.getInnerId().toString());

        return ApiResponse.creatSuccess(dto);
    }

    @RequestMapping("openEditBookProgress.do")
    public ModelAndView openEditBookProgress(Long id){
        WorkOrderBookInfoPO workOrderBookInfoPO = workOrderBookInfoService.getOneById(id);
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/workOrder/editBookProgress");
        mv.addObject("book",workOrderBookInfoPO);

        return mv;
    }

    @RequestMapping("editBookProgress.do")
    @ResponseBody
    public ApiResponse editBookProgress(@RequestBody WorkOrderBookInfoVO vo) throws ServiceException {

        workOrderBookInfoService.editBookProgress(vo);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("showEditBaseBook.do")
    public ModelAndView showEditBaseBook(Long bookId,Integer bookType) throws ServiceException {

        if (bookType == 1){
            BookInfoPO bookInfoPO = bookInfoService.getOneBookByBookId(bookId);
            bookId = bookInfoPO.getRefBaseBookId();
        }

        ModelAndView mv = new ModelAndView();
        mv.setViewName("/base/addBook");
        mv.addObject("modelId", 27).addObject("bookId", bookId)
                .addObject("examine", false).addObject("moduleValue", 1)
                .addObject("bookState", 1).addObject("bookInfoState", 1)
                .addObject("isWorkOrder",1);

        return mv;
    }
}
