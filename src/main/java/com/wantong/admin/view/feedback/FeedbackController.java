package com.wantong.admin.view.feedback;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.order.OrderConfig;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.session.SessionUserManager;
import com.wantong.config.domain.po.app.AppPO;
import com.wantong.config.domain.po.feedback.FeedBackPO;
import com.wantong.config.domain.vo.FeedBackManagerQuery;
import com.wantong.config.domain.vo.PageHelperUtil;
import com.wantong.config.domain.vo.app.PartnerVO;
import com.wantong.config.service.app.IAppService;
import com.wantong.config.service.app.IOpenIdentityService;
import com.wantong.config.service.app.IPartnerRelatedService;
import com.wantong.config.service.feedback.IFeedBackRelatedSevice;
import com.wantong.config.service.system.IMenuRelatedService;
import com.wantong.content.domain.WorkOrderBookState;
import com.wantong.content.domain.dto.CreateOrderDTO;
import com.wantong.content.domain.vo.OrderTaskVO;
import com.wantong.content.service.IWorkOrderBookInfoService;
import com.wantong.record.domain.dto.NetBookDTO;
import com.wantong.record.domain.po.NetBookPO;
import com.wantong.record.domain.vo.BookFeedbackVO;
import com.wantong.record.domain.vo.NetBookVO;
import com.wantong.record.service.INetBookService;
import com.wantong.record.service.IUserFeedbackService;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

/**
 * UserFeedBack Class
 *
 * @author win7
 * @date 2018-11-12 用户数据
 */
@Controller
@Slf4j
public class FeedbackController extends BaseController {

    private static long MODULE_ID = 386;

    @Reference
    private IMenuRelatedService menuRelatedService;

    @Reference
    private IUserFeedbackService userFeedbackService;

    @Reference
    private IPartnerRelatedService partnerRelatedService;
    @Reference
    private IOpenIdentityService openIdentityService;

    @Reference
    private IAppService appService;
    @Reference
    private INetBookService netBookService;

    @Autowired
    private SessionUserManager sessionUserManager;

    @Autowired
    private OrderConfig orderConfig;

    @Autowired
    private RedisDao redisDao;

    @Reference(timeout = 10 * 1000)
    private IWorkOrderBookInfoService workOrderBookInfoService;

    @RequestMapping("/feedback/userfeedback.do")
    public String getFeedbackView(Model model) {
        model.addAttribute("menu", menuRelatedService.getMenu(MODULE_ID));

        return "feedback/index";
    }


    @Reference
    private IFeedBackRelatedSevice feedBackRelatedSevice;

    @RequestMapping("/feedback/listfeedback.do")
    public ModelAndView listFeedback(HttpServletRequest request,
            @RequestParam(defaultValue = "1") int currentPage, @RequestParam(defaultValue = "0") int state,
            @RequestParam(defaultValue = "") String deviceType) {
        FeedBackPO feedBackPO = new FeedBackPO();

        FeedBackManagerQuery query = new FeedBackManagerQuery();
        query.setState(state);
        query.setFeedBackPO(feedBackPO);
        query.setCurrentPage(currentPage);
        query.setSize(12);

        deviceType = deviceType.replace(" ", "");

        PageHelperUtil<FeedBackPO> page = feedBackRelatedSevice.listUserFeedBack(query, deviceType);
        ModelAndView mv = new ModelAndView("/feedback/userFeedBack");
        mv.addObject("page", page);
        mv.addObject("searchText", deviceType);
        mv.addObject("state", state);
        mv.addObject("len", page.getTotalCount());
        return mv;
    }

    /**
     * 修改用户反馈的状态
     *
     * @param feedBackId
     */
    @RequestMapping("/feedBack/setfeedbackstate.do")
    @ResponseBody
    public ApiResponse setFeedBackState(int feedBackId) throws ServiceException {

        feedBackRelatedSevice.setFeedBackState(feedBackId);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/feedback/getAppList.do")
    @ResponseBody
    public ApiResponse getAppList(Long partnerId) throws ServiceException {
        List<AppPO> apps = new ArrayList<>();
        if (partnerId == 0) {
            apps = appService.listAllApp();
        } else {
            apps = appService.listAppByPartnerId(partnerId);
        }
        return ApiResponse.creatSuccess(apps);
    }

    @RequestMapping("/feedback/addRemark.do")
    @ResponseBody
    public ApiResponse addRemark(Long id, String remark) throws ServiceException {
        netBookService.addRemark(id, remark);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("/feedback/addToWorkOrder.do")
    public ModelAndView addToWorkOrder(Long id) throws ServiceException {
        NetBookPO netBookPO = netBookService.getOneNetBook(id);
        ModelAndView mv = new ModelAndView();
        mv.setViewName("/feedback/addToWorkOrder");
        mv.addObject("book", netBookPO);
        return mv;
    }

    @RequestMapping("/feedback/listbookfeedback.do")
    public ModelAndView userBookFeedBackManager() {
        AdminSession adminSession = getAdminSession();
        long partnerId = adminSession.getPartnerId();
        List<AppPO> apps = new ArrayList<>();
        List<String> models = new ArrayList<>();
        if (partnerId == 1) {
            apps = appService.listAllApp();
//            models = openIdentityService.listModelByPartnerId(partnerId, true);
        } else {
            apps = appService.listAppByPartnerId(partnerId);
//            models = openIdentityService.listModelByPartnerId(partnerId, false);
        }

        List<PartnerVO> partnerVOS = partnerRelatedService.listPartner();
        ModelAndView mv = new ModelAndView();
        mv.addObject("partnerId", partnerId);
        mv.addObject("partners", partnerVOS);
        mv.addObject("apps", apps);
//        mv.addObject("models", models);
        mv.setViewName("/feedback/userBookFeedBack");
        return mv;
    }

    @RequestMapping("/feedback/getbookfeedbackList.do")
    public ModelAndView listBookFeedback(HttpServletRequest request, @RequestBody BookFeedbackVO bookFeedbackVO) {

        AdminSession sessionUser = sessionUserManager.getSessionUser(request.getSession(), AdminSession.class);
        try {
            NetBookDTO netBookDTO = userFeedbackService
                    .getFeedBackBooksCountByPartnerId(sessionUser.getPartnerId(), bookFeedbackVO);
            Pagination pagination = netBookDTO.getPagination();
            List<NetBookVO> netBookVOS = netBookDTO.getNetBookVOS();
            Map<Integer, String> map = WorkOrderBookState.mapStates();
            for (NetBookVO vo : netBookVOS) {
                vo.setStateName(map.getOrDefault(vo.getState(), "未知状态"));
                vo.setCoverImage(StringUtils.isEmpty(vo.getCoverImage()) ? "" : vo.getCoverImage());
                if (vo.getOrderId() == null){
                    vo.setOrderId(0L);
                }
            }

            ModelAndView mv = new ModelAndView("/feedback/userBookFeedBack_list");
            mv.addObject("netBooks", netBookVOS != null ? netBookVOS : Collections.emptyList());

            mv.addObject("currentPage", pagination == null ? 0 : pagination.getCurrentPage());
            mv.addObject("pages", pagination == null ? 0 : pagination.getPages());
            mv.addObject("pageSize", pagination == null ? 0 : pagination.getPageSize());

            return mv;
        } catch (ServiceException e) {
            log.error("listBookFeedback error!");
            e.printStackTrace();
        }
        log.error("listBookFeedback error!");
        return null;
    }

    @RequestMapping("/feedback/exportAllBooks")
    @ResponseBody
    public ResponseEntity<byte[]> listAllBooks(HttpServletRequest request) {
        AdminSession sessionUser = sessionUserManager.getSessionUser(request.getSession(), AdminSession.class);
        BookFeedbackVO bookFeedbackVO = new BookFeedbackVO();
        //不分页，全量查询
        bookFeedbackVO.setCurrentPage(-1);
        bookFeedbackVO.setDayNum(0);
        List<Integer> list = new ArrayList<>();
        int[] bookState = new int[]{-2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13};
        for (int i : bookState) {
            list.add(i);
        }
        bookFeedbackVO.setBookStates(list);
        try {
            NetBookDTO netBookDTO = userFeedbackService
                    .getFeedBackBooksCountByPartnerId(sessionUser.getPartnerId(), bookFeedbackVO);

            List<Map<String, Object>> listmap = new ArrayList<Map<String, Object>>();
            Map<String, Object> map = new HashMap<String, Object>();
            map.put("sheetName", "sheet1");
            listmap.add(map);
            String[] keys = {"bookName", "author", "publisher", "isbn", "publishTime", "originalName", "pageSize",
                    "price", "binding", "tags", "count"};
            String[] columnNames = {"书名", "作者", "出版社", "书号", "出版时间", "原作名", "页数", "定价", "装帧", "标签", "反馈人数"};
            for (NetBookVO netBookVO : netBookDTO.getNetBookVOS()) {
                Map<String, Object> mapValue = new HashMap<>(11);
                mapValue.put(keys[0], netBookVO.getName());
                mapValue.put(keys[1], netBookVO.getAuthor());
                mapValue.put(keys[2], netBookVO.getPublisher());
                mapValue.put(keys[3], netBookVO.getIsbn());
                mapValue.put(keys[4], netBookVO.getPublishTime());
                mapValue.put(keys[5], netBookVO.getOriginalName());
                mapValue.put(keys[6], netBookVO.getPageSize());
                mapValue.put(keys[7], netBookVO.getPrice());
                mapValue.put(keys[8], netBookVO.getBinding());
                mapValue.put(keys[9], netBookVO.getTags());
                mapValue.put(keys[10], netBookVO.getBookCount());
                listmap.add(mapValue);
            }

            ByteArrayOutputStream os = new ByteArrayOutputStream();
            try {
                createWorkBook(listmap, keys, columnNames).write(os);
            } catch (IOException e) {
                e.printStackTrace();
            }
            byte[] content = os.toByteArray();
            HttpHeaders httpHeaders = new HttpHeaders();
            httpHeaders.add("Content-Disposition", "attachment;filename=feedback.xlsx");
            return new ResponseEntity<>(content, httpHeaders, HttpStatus.OK);

        } catch (ServiceException e) {
            return null;
        }
    }


    /**
     * 创建excel文档， list 数据
     *
     * @param keys        list中map的key数组集合
     * @param columnNames excel的列名
     */
    private static Workbook createWorkBook(List<Map<String, Object>> list, String[] keys, String columnNames[]) {
        // 创建excel工作簿
        Workbook wb = new XSSFWorkbook();
        // 创建第一个sheet（页），并命名
        Sheet sheet = wb.createSheet(list.get(0).get("sheetName").toString());
        // 手动设置列宽。第一个参数表示要为第几列设；，第二个参数表示列的宽度，n为列高的像素数。
        for (int i = 0; i < keys.length; i++) {
            sheet.setColumnWidth((short) i, (short) (35.7 * 200));
        }

        // 创建第一行
        Row row = sheet.createRow((short) 0);

        // 创建两种单元格格式
        CellStyle cs = wb.createCellStyle();
        CellStyle cs2 = wb.createCellStyle();

        // 创建两种字体
        Font f = wb.createFont();
        Font f2 = wb.createFont();

        // 创建第一种字体样式（用于列名）
        f.setFontHeightInPoints((short) 10);
        f.setColor(IndexedColors.BLACK.getIndex());
        f.setBold(true);

        // 创建第二种字体样式（用于值）
        f2.setFontHeightInPoints((short) 10);
        f2.setColor(IndexedColors.BLACK.getIndex());

        // 设置第一种单元格的样式（用于列名）
        cs.setFont(f);
        cs.setBorderLeft(BorderStyle.THIN);
        cs.setBorderRight(BorderStyle.THIN);
        cs.setBorderTop(BorderStyle.THIN);
        cs.setBorderBottom(BorderStyle.THIN);
        cs.setAlignment(HorizontalAlignment.CENTER);
        // 设置第二种单元格的样式（用于值）
        cs2.setFont(f2);
        cs2.setBorderLeft(BorderStyle.THIN);
        cs2.setBorderRight(BorderStyle.THIN);
        cs2.setBorderTop(BorderStyle.THIN);
        cs2.setBorderBottom(BorderStyle.THIN);
        cs2.setAlignment(HorizontalAlignment.CENTER);
        //设置列名
        for (int i = 0; i < columnNames.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(columnNames[i]);
            cell.setCellStyle(cs);
        }
        //设置每行每列的值
        for (short i = 1; i < list.size(); i++) {
            // Row 行,Cell 方格 , Row 和 Cell 都是从0开始计数的
            // 创建一行，在页sheet上
            Row row1 = sheet.createRow((short) i);
            // 在row行上创建一个方格
            for (short j = 0; j < keys.length; j++) {
                Cell cell = row1.createCell(j);
                cell.setCellValue(list.get(i).get(keys[j]) == null ? " " : list.get(i).get(keys[j]).toString());
                cell.setCellStyle(cs2);
            }
        }
        return wb;
    }

    /**
     * createWorkOrderBook 书单下创建一本书
     */
    @PostMapping("/feedback/saveToWorkOrder.do")
    @ResponseBody
    public ApiResponse saveToWorkOrder(
            @Validated(value = OrderTaskVO.OrderTaskFeedBackGroup.class) @RequestBody OrderTaskVO vo)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        boolean isTest = adminSession.getPartnerId() == orderConfig.getTestPartnerId();
        Long orderId = isTest ? orderConfig.getTestOrderId() : orderConfig.getHuibenOrderId();
        Integer modelId = isTest ? 28 : 27;
        Integer repoId = modelId == 27 ? orderConfig.getHuibenRepoId() : orderConfig.getTestRepoId();
        vo.setModelId(modelId);
        vo.setWorkOrderId(orderId);
        vo.setRepoId(repoId);
        vo.setState(0);
        log.info("开始创建工单任务:[{}]", vo);
        long start = System.currentTimeMillis();
        CreateOrderDTO createOrderDTO = workOrderBookInfoService.createOrderTask(vo);
        log.info("创建工单任务结束:[{}],耗时:[{}]ms", vo, System.currentTimeMillis() - start);
        createOrderDTO.setId(vo.getId());
        createOrderDTO.setName(vo.getName());
        createOrderDTO.setAuthor(vo.getAuthor());
        createOrderDTO.setPublisher(vo.getPublisher());
        createOrderDTO.setSeriesTitle(vo.getSeriesTitle());
        netBookService.addOrderIdToNetBook(createOrderDTO);
        return ApiResponse.creatSuccess();
    }

}
