package com.wantong.admin.view.cms;

import static com.wantong.content.domain.vo.TaskStatusVO.*;
import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.alibaba.dubbo.common.utils.ConcurrentHashSet;
import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wantong.admin.config.EncryptConfig;
import com.wantong.admin.config.PublishConfig;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.domain.vo.AudioFilesData;
import com.wantong.admin.domain.vo.BookInfoModelVO;
import com.wantong.admin.domain.vo.K12ResDataVO;
import com.wantong.admin.domain.vo.PagesAudiosData;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.view.common.UploadController;
import com.wantong.common.cms.CmsConfig;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.Pagination;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.file.FileHeadUtils;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.config.domain.po.supplier.PartnerPO;
import com.wantong.config.domain.po.system.AdminPO;
import com.wantong.config.service.supplier.ISupplierRelatedService;
import com.wantong.config.service.system.IAdminService;
import com.wantong.config.service.system.IApiAuthService;
import com.wantong.content.domain.dto.*;
import com.wantong.content.domain.po.*;
import com.wantong.content.domain.vo.BookBooksVO;
import com.wantong.content.domain.vo.BookChangeStateVO;
import com.wantong.content.domain.vo.BookInfoVO;
import com.wantong.content.domain.vo.TaskStatusVO;
import com.wantong.content.service.*;
import com.wantong.elasticsearch.domain.BookQuery;
import com.wantong.elasticsearch.domain.RangeQuery;
import com.wantong.elasticsearch.domain.dto.BookListDTO;
import com.wantong.elasticsearch.service.IBookSearchService;
import com.wantong.elasticsearch.service.ISyncFullBookService;
import com.wantong.nativeservice.service.IImgProcessService;
import com.wantong.publish.domain.po.BookPublishPO;
import com.wantong.publish.service.IBookPublishService;
import com.wantong.record.domain.vo.ChangeBookRecordVO;
import com.wantong.record.service.IRecordRelatedService;
import it.sauronsoftware.jave.Encoder;
import it.sauronsoftware.jave.EncoderException;
import it.sauronsoftware.jave.MultimediaInfo;
import java.io.*;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

/**
 * BookController 书本图书管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 11:03
 **/
@Controller
@RequestMapping("/cms")
@Slf4j
public class BookEditorController extends BaseController {

    /**
     * 资源库书本信息索引名
     */
    public static final String ES_FULL_BOOK_INDEX = "brs_book_full_info_index";

    /**
     * 基础库书本信息索引名
     */
    public static final String ES_BASE_BOOK_INDEX = "brs_book_base_info_index";

    public static final String JPG_SUFFIX = ".jpg";

    public static final String PERSPECTIVE_SUFIX = "_perspective_v2";

    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @Autowired
    private EncryptConfig encryptConfig;

    @Autowired
    private RedisDao redisDao;

    @Reference
    private IAudioTtsRolesService audioTtsRolesService;

    @Reference
    private IBookIsbnInfoService isbnInfoService;


    @Reference
    private ImageDataService imageDataService;

    @Reference
    private IImgProcessService imgProceService;

    @Reference
    private IRecordRelatedService recordRelatedService;

    @Autowired
    private StorageConfig storageConfig;


    @Reference
    private IPageInfoService pageInfoService;

    @Reference
    private IPageFingerInfoService fingerInfoService;

    @Reference
    private IRepoService repoService;

    @Reference
    private IBookInfoService bookInfoService;

    @Reference
    private IBookSearchService bookSearchService;

    @Reference
    private ISyncFullBookService syncFullBookService;

    @Reference
    private IBookLabelService bookLabelService;

    @Autowired
    private CmsConfig cmsConfig;


    @Autowired
    private Executor executor;

    @Reference
    IMigratingService migratingService;

    @Reference
    private IBookBaseInfoService bookBaseInfoService;

    @Autowired
    private PageController pageController;

    @Autowired
    private UploadController uploadController;

    @Reference
    private IApiAuthService apiAuthService;
    @Reference
    private IAppRepoService appRepoService;

    @Reference
    private BookChangeStateService bookChangeStateService;
    @Reference
    private BookBaseChangeRecordService bookBaseChangeRecordService;

    @Reference
    private IAdminService adminService;

    @Reference
    private IModelService modelService;

    @Reference
    private IBookPublishService bookPublishService;

    @Reference
    private ISupplierRelatedService supplierRelatedService;

    @Autowired
    private PublishConfig publishConfig;

    private static final Logger logger = LoggerFactory.getLogger(BookEditorController.class);


    /**
     * 资源制作书库的接口
     *
     * @param model
     */
    @RequestMapping("resourceBookListFrame.do")
    public String resourceBookListFrame(Model model, @RequestParam(name = "index", defaultValue = "100") int index) {
        AdminSession session = getAdminSession();
        long partnerId = session.getPartnerId();
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(1);
        pagination.setPageSize(1000);

        int bookIdAuth = 0;
        Set<String> authorizedUrls = session.getAuthorizedUrls();
        if (authorizedUrls.contains("/cms/searchByBookId.do")) {
            bookIdAuth = 1;
        }

        RepoLibraryDTO dto = repoService.listLibraries(partnerId, pagination);
        AdminPO adminPO = adminService.getAdminPO(session.getId());
        String[] forRepo = adminPO.getForbiddenRepo().split(";");
        List<String> forbiddenRepoList = Arrays.asList(forRepo);
        List<RepoPO> repoPOList = new ArrayList<>();
        if (forbiddenRepoList != null && forbiddenRepoList.size() != 0) {
            for (RepoPO p : dto.getPools()) {
                if (!forbiddenRepoList.contains(p.getId().toString())) {
                    repoPOList.add(p);
                }
            }
        } else {
            for (RepoPO p : dto.getPools()) {
                repoPOList.add(p);
            }
        }

        model.addAttribute("models", repoPOList);
        model.addAttribute("module", 1);
        model.addAttribute("index", index);
        model.addAttribute("partnerId", partnerId);
        model.addAttribute("bookIdAuth", bookIdAuth);

        return "cms/listBook";
    }

    @RequestMapping("listBooks.do")
    public String listBook(Integer modelId, Long module, int currentPage, boolean isRef, String status, String content,
            int forbidden, Model model,
            String beginTime, String endTime,
            @RequestParam(value = "pageSize", required = false, defaultValue = "16") int pageSize)
            throws ServiceException {

        Integer forb = null;
        int modu = module.intValue();

        if (modu != 5) {
            forb = forbidden;
        }

        if (modelId == null) {
            throw new ServiceException(ServiceError.creatFail("请创建/选择资源库"));
        }

        Pagination pagination = new Pagination();
        if (currentPage == 0) {
            currentPage = 1;
        }
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);

        AdminSession session = getAdminSession();
        long partnerId = session.getPartnerId();
        RepoPO repoPO = repoService.getRepoById(modelId);
        if (repoPO.getPartnerId() != partnerId && partnerId != 1) {
            throw new ServiceException(ServiceError.creatFail("没有权限"));
        }

        String[] statusArray = status.split(",");
        Integer[] statusIntArray = new Integer[statusArray.length];
        if (!status.isEmpty()) {
            for (int i = 0; i < statusArray.length; i++) {
                statusIntArray[i] = Integer.parseInt(statusArray[i]);
            }
        } else {
            statusIntArray = null;
        }
        JSONObject json = JSONObject.parseObject(content);
        BookQuery searchContent = JSONObject.toJavaObject(json, BookQuery.class);
        RangeQuery<Date> timeFilter = RangeQuery.<Date>builder().build();
        SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA);
        TimeZone gmtTime = TimeZone.getTimeZone("GMT");
        ft.setTimeZone(gmtTime);
        try {
            if ("".equals(beginTime)) {
                if (!"".equals(endTime)) {
                    timeFilter.setTo(ft.parse(endTime));
                }
            } else {
                timeFilter.setFrom(ft.parse(beginTime));
                if (!"".equals(endTime)) {
                    timeFilter.setTo(ft.parse(endTime));
                } else {
                    timeFilter.setTo(new Date());
                }
            }
        } catch (ParseException e) {
            log.error("格式化时间发生错误 time:{}", e);
        }
        if (searchContent.getLabelIds() != null) {
            searchContent.setLabelName("");
        }
//        格式搜索内容
        searchContent.getBookId().trim();
        searchContent.getBookName().trim();
        searchContent.getBookNumber().trim();
        searchContent.getDubble().trim();
        searchContent.getEdition().trim();
        searchContent.getIsbn().trim();
        searchContent.getLabelName().trim();
        searchContent.getPress().trim();
        searchContent.setTimeRange(timeFilter);
        BookListDTO dto = bookSearchService.listBook(modelId, statusIntArray, pagination, isRef, searchContent, forb);
        pagination = dto.getPagination();

        //状态 迁移中 start
        Set<Long> bookIdToQuery = new ConcurrentHashSet<>(dto.getListBook().size());
        dto.getListBook().parallelStream().forEach(data -> {
            Map<String, Object> source = (Map<String, Object>) data.getOrDefault("source", new HashMap<>());
            long id = 0;
            if (isRef) {
                Map<String, Object> bookInfo = (Map<String, Object>) source.getOrDefault("bookInfo", new HashMap<>());
                bookInfo = bookInfo == null ? new HashMap<>() : bookInfo;
                id = (int) bookInfo.getOrDefault("id", 0);
            } else {
                id = (int) source.getOrDefault("id", 0);
            }

            if (id > 0) {
                bookIdToQuery.add(id);
            }
        });

        List<Long> bookOnCopy = migratingService.isBookOnMigrating(bookIdToQuery);
        //获得书本是否未处理的记录
        Map<Long, Boolean> bookRecordMap = bookChangeStateService.getBookRecordState(bookIdToQuery);
        dto.getListBook().parallelStream().forEach(data -> {
            Map<String, Object> source = (Map<String, Object>) data.getOrDefault("source", new HashMap<>());
            long id = 0;
            if (isRef) {
                Map<String, Object> bookInfo = (Map<String, Object>) source.getOrDefault("bookInfo", new HashMap<>());
                bookInfo = bookInfo == null ? new HashMap<>() : bookInfo;
                id = (int) bookInfo.getOrDefault("id", 0);
            } else {
                id = (int) source.getOrDefault("id", 0);
            }
            source.put("on_copy", bookOnCopy.contains(id));
            source.put("recordState", bookRecordMap.get(id));
        });
        List<RepoPO> listRepo = repoService.listReposByPartnerId(cmsConfig.getPartnerId());
        //cms 资源库Id
        List<Integer> repoIds = listRepo.stream().map(RepoPO::getId).collect(Collectors.toList());
        //状态 迁移中 end

        PartnerPO partnerPO = supplierRelatedService.findPartnerById(partnerId);
        boolean isPublish = partnerPO.getPartnerType().equals(1);
        model.addAttribute("status", status);
        model.addAttribute("pagination", pagination);
        model.addAttribute("currentPage", pagination.getCurrentPage());
        model.addAttribute("pages", pagination.getPages());
        model.addAttribute("pageSize", pagination.getPageSize());
        model.addAttribute("searchText", searchContent);
        System.out.println(JSONObject.toJSONString(dto.getListBook()));
        model.addAttribute("books", dto.getListBook());
        model.addAttribute("currentTabBookCount", dto.getCurrentTabCount());
        model.addAttribute("modelBookCount", dto.getRepoBookCount());
        //是否是领书模块
        model.addAttribute("ref", isRef);
        model.addAttribute("modu", modu);
        model.addAttribute("cmsRepoId", repoIds);
        model.addAttribute("isPublish", isPublish);
        return "cms/listResourceBook_list";
    }

    @RequestMapping("booksExport.do")
    @ResponseBody
    public ApiResponse export(Integer modelId, String status, String content, Integer forbidden, String beginTime,
            String endTime, String labelNames) throws ServiceException {
        if (modelId == null) {
            throw new ServiceException(ServiceError.creatFail("请创建/选择资源库"));
        }
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(1);
        pagination.setPageSize(999999);
        AdminSession session = getAdminSession();
        long partnerId = session.getPartnerId();
        RepoPO repoPO = repoService.getRepoById(modelId);
        if (repoPO.getPartnerId() != partnerId && partnerId != 1) {
            throw new ServiceException(ServiceError.creatFail("没有权限"));
        }
        String[] statusArray = status.split(",");
        Integer[] statusIntArray = new Integer[statusArray.length];
        if (!"".equals(status)) {
            for (int i = 0; i < statusArray.length; i++) {
                statusIntArray[i] = Integer.parseInt(statusArray[i]);
            }
        } else {
            statusIntArray = null;
        }
        //选择所有状态
        forbidden = null;
        JSONObject json = JSONObject.parseObject(content);
        BookQuery searchContent = JSONObject.toJavaObject(json, BookQuery.class);
        RangeQuery<Date> timeFilter = RangeQuery.<Date>builder().build();
        SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.CHINA);
        TimeZone gmtTime = TimeZone.getTimeZone("GMT");
        ft.setTimeZone(gmtTime);
        try {
            if ("".equals(beginTime)) {
                if (!"".equals(endTime)) {
                    timeFilter.setTo(ft.parse(endTime));
                }
            } else {
                timeFilter.setFrom(ft.parse(beginTime));
                if (!"".equals(endTime)) {
                    timeFilter.setTo(ft.parse(endTime));
                } else {
                    timeFilter.setTo(new Date());
                }
            }
        } catch (ParseException e) {
            log.error("格式化时间发生错误 time:{}", e);
        }
        searchContent.getBookId().trim();
        searchContent.getBookName().trim();
        searchContent.getBookNumber().trim();
        searchContent.getDubble().trim();
        searchContent.getEdition().trim();
        searchContent.getIsbn().trim();
        searchContent.getLabelName().trim();
        searchContent.getPress().trim();
        searchContent.setTimeRange(timeFilter);
//        final String recordLabelName = searchContent.getLabelName();
        String[] recordList = searchContent.getLabelName().split(",");
        if (searchContent.getLabelIds() != null) {
            searchContent.setLabelName("");
        }
        BookListDTO dto = bookSearchService
                .listBook(modelId, statusIntArray, pagination, false, searchContent, forbidden);
        List<BookInfoModelVO> data = new ArrayList<>();
        dto.getListBook().forEach(p -> {
            Map<String, Object> source = (Map<String, Object>) p.getOrDefault("source", new HashMap<>());
            BookInfoModelVO vo = new BookInfoModelVO();
            vo.setNumber((String) source.getOrDefault("inner_id", "空"));
            vo.setBookId(Long.valueOf(source.getOrDefault("id", 0).toString()));
            vo.setBookName((String) source.getOrDefault("name", ""));
            String state = "";
            int bookForbidden = (int) source.getOrDefault("forbidden", 0);
            if (bookForbidden == 1) {
                state = "(禁用中)";
            }
            switch ((int) source.getOrDefault("state", 0)) {
                case 0:
                    state = state + "资源待编辑";
                    break;
                case 7:
                    state = state + "待审核";
                    break;
                case 3:
                    state = state + "已审核";
                    break;
                case 11:
                    state = state + "已审核";
                    break;
                default:
                    state = state + "其他状态";
                    break;
            }
            vo.setState(state);
            vo.setAuthor((String) source.getOrDefault("author", ""));
            vo.setIsbn((String) source.getOrDefault("isbn", ""));
            if (searchContent.getLabelIds() != null) {
                String temp = "";
                List<Map<String, Object>> labels = (List<Map<String, Object>>) source
                        .getOrDefault("labels", new ArrayList<>());
                for (int i = 0; i < labels.size(); i++) {
                    for (int j = 0; j < searchContent.getLabelIds().length; j++) {
                        if (((Integer) labels.get(i).get("id")).equals(searchContent.getLabelIds()[j])) {
                            if (temp.equals("")) {
                                temp = (String) labels.get(i).get("label_name");
                            } else {
                                temp = temp + "," + (String) labels.get(i).get("label_name");
                            }
                        }
                    }
                }
                vo.setLabel(temp);
            } else {
                vo.setLabel(labelNames);
            }
            vo.setSeries_title((String) source.getOrDefault("series_title", ""));
            vo.setTime(dealDateFormat((String) source.getOrDefault("update_time", "")));
            data.add(vo);
        });

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("listRecordBooks.do")
    public String listBooksRecord(Integer modelId, int currentPage,
            @RequestParam(value = "pageSize", required = false, defaultValue = "16") int pageSize, Model model)
            throws ServiceException {

        Pagination pagination = new Pagination();
        if (currentPage == 0) {
            currentPage = 1;
        }
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        com.wantong.content.domain.dto.BookListDTO dto = bookInfoService
                .getBookPictureUpdateRecord(modelId, pagination);
        List<BookDTO> books = new ArrayList<>();
        if (dto.getListBook() != null) {
            List<Long> ids = dto.getListBook().stream().map(BookDTO::getBookInfo).collect(Collectors.toList()).stream()
                    .map(BookInfoPO::getId).collect(
                            Collectors.toList());
            log.info("--------------------------->> ids:{}", ids.toString());
            List<Long> bookOnCopy = migratingService.isBookOnMigrating(ids);
            dto.getListBook().parallelStream().forEach(p -> {
                long id = p.getBookInfo().getId();
                p.setOnCopy(bookOnCopy.contains(id));
            });
            books = dto.getListBook();
        }
        log.info(books.stream().map(BookDTO::getBookInfo).collect(Collectors.toList()).toString());
        model.addAttribute("pagination", dto.getPagination());
        model.addAttribute("currentPage", dto.getPagination().getCurrentPage());
        model.addAttribute("pages", dto.getPagination().getPages());
        model.addAttribute("pageSize", dto.getPagination().getPageSize());
        model.addAttribute("books", books);
        model.addAttribute("modu", -1);
        model.addAttribute("ref", false);
        return "cms/listResourceBook_list";
    }

    @RequestMapping("getBookChangeRecord.do")
    @ResponseBody
    public ApiResponse getBookChangeRecord(long bookId) {
        List<BookChangeRecordDTO> list = bookBaseChangeRecordService.getChangeNotFinishRecordDTO(bookId);

        return ApiResponse.creatSuccess(list);
    }

    /**
     * 修改书本记录状态
     *
     * @param bookId
     * @param state
     */
    @RequestMapping("changeRecordBookState.do")
    @ResponseBody
    public ApiResponse changeRecordBookState(long bookId, int state) throws ServiceException {
        BookChangeStateVO vo = new BookChangeStateVO();
        vo.setBookId(bookId);
        vo.setState(state);
        bookChangeStateService.bookRecordStateChange(vo);

        return ApiResponse.creatSuccess();
    }

    /**
     * pickUpBooks 领取书本
     *
     * @param books 领取书本的参数VO
     */
    @RequestMapping("pickUpBooks.do")
    @ResponseBody
    public ApiResponse pickUpBooks(@RequestBody BookBooksVO books) throws ServiceException {

        AdminSession adminSession = getAdminSession();
        Integer repoId = books.getRepoId();

        long dbPartnertId = repoService.getPartnerIdByRepoID(repoId);
        if (dbPartnertId != cmsConfig.getPartnerId() && adminSession.getPartnerId() != repoService
                .getPartnerIdByRepoID(repoId)) {

            throw new ServiceException(ServiceError.creatFail("非法资源库ID"));
        }
        ApiResponse apiResponse = null;
        apiResponse = bookInfoService.book(books, repoId);

        BookBooksDTO data = (BookBooksDTO) apiResponse.getData();
        long[] bookIds = data.getRefBookIds().stream().mapToLong(Long::longValue).toArray();
        syncFullBookService.syncBrsBookInfosIndexByIds(bookIds);

        return apiResponse;

    }

    @RequestMapping("showAddBookPage.do")
    public String showAddBookPage(long modelId, long baseModelId, long bookId, long baseBookId, Model model,
            boolean examine,
            int moduleValue, int bookState, long bookInfoState) throws ServiceException {
        BookBaseInfoPO bookBaseInfoPO = bookBaseInfoService.loadBookBaseInfo((int) baseBookId);
        model.addAttribute("modelId", modelId).addAttribute("bookId", bookId)
                .addAttribute("examine", examine).addAttribute("moduleValue", moduleValue)
                .addAttribute("bookState", bookState).addAttribute("baseBookId", baseBookId)
                .addAttribute("baseModelId", baseModelId).addAttribute("bookInfoState", bookInfoState)
                .addAttribute("bookName", bookBaseInfoPO.getName()).addAttribute("origin", bookBaseInfoPO.getOrigin());
        return "cms/addBook";
    }


    @RequestMapping("saveBookInfo.do")
    @ResponseBody
    public ApiResponse updateRepoBook(Long bookId, long modelId,
            @RequestParam(defaultValue = "", value = "extraData", required = false) String extraData) throws Exception {

        AdminSession adminSession = getAdminSession();

        if (modelId == 0) {
            return ApiResponse.creatFail(Base.ERROR, "资源库ID为空");
        }
        Map<String, String> data = new HashMap<>();

        boolean isAdd = false;
        long finalBookId = bookId;

        BookInfoVO bookInfoVO = new BookInfoVO();
        bookInfoVO.setBookId(bookId);
        bookInfoVO.setExtraDate(extraData);
        bookInfoService.updateBookExtraData(bookInfoVO);
        data.put("bookId", String.valueOf(bookId));
        ChangeBookRecordVO changeBookRecordVO = new ChangeBookRecordVO();
        changeBookRecordVO.setAdminId(adminSession.getId());
        changeBookRecordVO.setBookId(finalBookId);
        changeBookRecordVO.setPageId(-1);
        changeBookRecordVO.setStatus(7);

        String message = "创建新绘本：bookId:" + finalBookId;
        changeBookRecordVO.setText(message);
        executor.execute(() -> {
            try {
                recordRelatedService.changeBookRecord(changeBookRecordVO);
            } catch (Exception e) {
                logger.info(e.getMessage());
            }
        });

        return ApiResponse.creatSuccess(data);
    }


    /**
     * 读取书本信息
     *
     * @param bookId
     */
    @RequestMapping("loadBookInfo.do")
    @ResponseBody
    public ApiResponse loadBook(Long bookId, Long repoId) throws Exception {
        AdminSession adminSession = getAdminSession();
        if (adminSession == null) {
            return ApiResponse.creatSuccess("无权限访问此接口");
        }

        PictureBookInfoDTO pictureBookInfoDTO = bookInfoService.loadBook(bookId.intValue());
        if (pictureBookInfoDTO.getRepoId() != repoId && (adminSession.getPartnerId() != 1
                || adminSession.getPartnerId() != cmsConfig.getPartnerId())) {
            //非玩瞳账户不可通过接口直接请求非本资源库书本
            return ApiResponse.creatSuccess("没有权限");
        }

        List<BookIsbnInfoPO> isbns = new ArrayList<>();
        if (pictureBookInfoDTO != null) {
            isbns = isbnInfoService.getIsbnsByBookId(pictureBookInfoDTO.getBookId());
        }

        List<BookLableNameDTO> labels = bookLabelService.getBookLabelNames(bookId.intValue(), false);
        List<BookLableNameDTO> wtLabels = new ArrayList<>();
        List<BookLableNameDTO> partnerLabels = new ArrayList<>();
        for (BookLableNameDTO label : labels) {
            if (label.getPartnerId() == 1) {
                wtLabels.add(label);
            } else {
                partnerLabels.add(label);
            }
        }
        Map<String, List<BookLableNameDTO>> map = new HashMap<>();
        map.put("wtLabels", wtLabels);
        map.put("partnerLabels", partnerLabels);

        JsonNode node = JsonUtil.toJson(pictureBookInfoDTO);
        ObjectNode objectNode = (ObjectNode) node;
        objectNode.put("labels", JsonUtil.toJson(map));
        objectNode.put("isbns", JsonUtil.toJson(isbns));

        return ApiResponse.creatSuccess(objectNode);
    }


    @RequestMapping("getBookAudioTtsRoles.do")
    @ResponseBody
    public ApiResponse getBookAudioTtsRoels(int bookId) throws ServiceException {

        List<AudioTtsRolesPO> list = audioTtsRolesService.getBookAudioRolesByBookId(bookId);

        return ApiResponse.creatSuccess(list);
    }


    @RequestMapping(value = "deleteBookRepo.do", produces = {APPLICATION_JSON_VALUE})
    @ResponseBody
    public ApiResponse deletePictureBookRepo(@RequestParam(value = "bookId") int bookId) throws ServiceException {

        AdminSession adminSession = getAdminSession();

        bookInfoService.deletePictureBook(bookId, adminSession.getId());
        syncFullBookService.syncDeleteBookInfoIndexById(bookId);
        return ApiResponse.creatSuccess();
    }

    /**
     * 禁用和解禁book
     *
     * @param bookId
     */
    @RequestMapping("forbiddenBook.do")
    @ResponseBody
    public ApiResponse forbiddenBook(@RequestParam("bookId") long bookId, @RequestParam("forbidden") int forbidden) {

        boolean b = bookInfoService.forbiddenBook(bookId, forbidden);
        if (b) {
            syncFullBookService.syncBrsBookInfoIndexById(bookId);
            return ApiResponse.creatSuccess();
        } else {
            return ApiResponse.creatFail(Base.ERROR);
        }
    }

    @RequestMapping("changeBookStatus.do")
    @ResponseBody
    public ApiResponse changeBookStatus(@RequestParam("bookId") long bookId, @RequestParam("status") boolean status) {

        bookInfoService.changeExamineBookStatus(bookId, status);

        syncFullBookService.syncBrsBookInfoIndexById(bookId);

        return ApiResponse.creatSuccess();
    }

    private byte[] processPerspective(String path, int imgType) throws ServiceException, IOException {
        byte[] btImg2 = null;
        try (InputStream in = new FileInputStream(path)) {
            byte[] data = toByteArray(in);
            //判断是否为jpg,不是则提示错误
            byte[] b = new byte[4];
            System.arraycopy(data, 0, b, 0, 4);
            String hexType = FileHeadUtils.bytesToHexString(b).toUpperCase();
            if (!hexType.contains("FFD8FF")) {
                logger.info("source img path:{},type:{}", path, hexType);
                throw new ServiceException(ServiceError.creatFail(Base.API_DISABLE, "封面图片格式不对,请记录该书本数据."));
            }
            //算法处理后的二进制数据
            btImg2 = imgProceService.nImgPreviewProc(data, imgType);
        }

        return btImg2;
    }

    /**
     * 生成手指点读透视图
     *
     * @param response
     * @param baseBookId
     * @param imageId
     */
    @RequestMapping("perspectiveImg.do")
    public String perspectiveImg(HttpServletResponse response, @RequestParam("bookId") long baseBookId,
            @RequestParam("imageId") String imageId, @RequestParam("modelId") String modelId) throws Exception {
        String folderPath = storageConfig.getBaseBookRoot() + File.separator + modelId + File.separator + baseBookId
                + File.separator;
        //服务器图片
        String path = folderPath + imageId + JPG_SUFFIX;
        String targetPath = folderPath + imageId + PERSPECTIVE_SUFIX + JPG_SUFFIX;
        ModelPO modelPO = modelService.getModelPOById(Long.valueOf(modelId));
        File targetFile = new File(targetPath);
        if (!targetFile.exists()) {
            String os = System.getProperty("os.name");
            if (os.toLowerCase().startsWith("win")) {
                //WIN系统不做处理
            } else {
                //不存在透视图则转换生成
                byte[] btImg2 = processPerspective(path, modelPO.getModelType());
                if (!targetFile.getParentFile().exists()) {
                    targetFile.getParentFile().mkdirs();
                }

                try (OutputStream out = new FileOutputStream(targetPath)) {
                    out.write(btImg2);
                    out.flush();
                }
            }
        }

        return "redirect:" + thirdPartyConfig.getFileEndpoint() + storageConfig.getBookImagePath()
                + File.separator + modelId + File.separator + baseBookId + File.separator + imageId + PERSPECTIVE_SUFIX
                + JPG_SUFFIX + "?t=" + System.currentTimeMillis();
    }


    @RequestMapping("getBookState.do")
    @ResponseBody
    public ApiResponse getBookState(@RequestParam("bookId") long bookId) throws ServiceException {

        return ApiResponse.creatSuccess(bookInfoService.getBookState(bookId));
    }


    @RequestMapping("changeBookState.do")
    @ResponseBody
    public ApiResponse changBookState(long bookId, int state, boolean isAuth) throws ServiceException {

        AdminSession adminSession = getAdminSession();
        if (bookId <= 0) {

            return ApiResponse.creatFail(Base.ERROR, "bookid Is Null");
        }
        if (state < 0) {

            return ApiResponse.creatFail(Base.ERROR, "state Is Less than zero");
        }

        bookInfoService.manualRepairBookStatus(bookId, state, adminSession.getPartnerId(), isAuth);

        return ApiResponse.creatSuccess();
    }

    /**
     * 异步下载语音资源
     *
     * @param bookId
     */
    @RequestMapping("packUpResource.do")
    @ResponseBody
    public ApiResponse asyncPackUpResource(long bookId) throws ServiceException {
        String taskId = bookInfoService.asyncPackUpAudioResource(bookId);
        Map<String, String> data = new HashMap<>(1);
        data.put("taskId", taskId);

        return ApiResponse.creatSuccess(data);
    }


    @RequestMapping("checkPackUpResource.do")
    @ResponseBody
    public ApiResponse checkPackUpResource(String taskId) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_PACK_UP_RESOURCE_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }

        return ApiResponse.creatSuccess(task);
    }

    /**
     * 异步转换点读音频
     *
     * @param bookId
     */
    @RequestMapping("convertFingerAudio.do")
    @ResponseBody
    public ApiResponse convertFingerAudio(long bookId) throws ServiceException {
        String taskId = fingerInfoService.asyncConvertFingerVoice(bookId);
        Map<String, String> data = new HashMap<>(1);
        data.put("taskId", taskId);

        return ApiResponse.creatSuccess(data);
    }


    /**
     * 查询书本是否存在点读语音
     *
     * @param bookId
     */
    @RequestMapping("existFingerAudio.do")
    @ResponseBody
    public ApiResponse existFingerAudio(long bookId) throws ServiceException {
        return ApiResponse.creatSuccess(fingerInfoService.existFingerAudio(bookId));
    }

    /**
     * 查询转换任务状态
     *
     * @param taskId
     */
    @RequestMapping("queryConvertFingerAudioTask.do")
    @ResponseBody
    public ApiResponse queryConvertFingerAudioTask(String taskId) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_CONVERT_FINGER_VOICE_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }

        return ApiResponse.creatSuccess(task);
    }

    @RequestMapping("uploadBigfile.do")
    @ResponseBody
    public ApiResponse uploadBigfile(MultipartFile file, String chunk, String guid) throws IOException {
        String filename = file.getOriginalFilename();
        log.info("uploadBigfile，guid={},chunk={},fileName={}", guid, chunk, filename);

        String tempFolder = storageConfig.getUploadTemp();
        //将分片文件存于临时目录guid的文件夹下
        String dir = tempFolder + File.separator + guid;
        FileUtil.createFolderIfNotExist(dir);
        if (chunk == null) {
            deleteFile(new File(dir));
            FileUtil.createFolderIfNotExist(dir);
            String dirFile = dir + "/" + guid + "_0";
            FileUtils.copyInputStreamToFile(file.getInputStream(), new File(dirFile));
        } else {
            String dirFile = dir + "/" + guid + "_" + chunk;
            FileUtils.copyInputStreamToFile(file.getInputStream(), new File(dirFile));
        }

        Map<String, String> map = new HashMap<>();
        map.put("filename", filename);
        map.put("guid", guid);

        return ApiResponse.creatSuccess(map);
    }

    @RequestMapping("zipUpload.do")
    @ResponseBody
    public ApiResponse importRepo(String filename, String guid,
            Integer repoId, Integer bookState) throws Exception {

        log.info("importRepo,fileName={},repoId={}", filename, repoId);
        long baseBookId = Long.parseLong(filename.substring(0, filename.length() - 4));
        log.info("importRepo，baseBookId={}", baseBookId);
        //上传文件
       /* String tempFolder = storageConfig.getUploadTemp();
        FileUtil.createFolderIfNotExist(tempFolder);
        String tempFilePath = tempFolder + File.separator + filename;
        //如果文件存在，删掉
        deleteFile(new File(tempFilePath));
        try {
            FileUtils.copyInputStreamToFile(file.getInputStream(), new File(tempFilePath));
        } catch (IOException ex) {
            throw new ServiceException(ServiceError.creatFail("上传文件失败"));
        }*/
        //合并文件
        String tempFolder = storageConfig.getUploadTemp();
        String dir = tempFolder + File.separator + guid;
        File fileDir = new File(dir);
        File[] fileLists = fileDir.listFiles();
        String[] fpaths = new String[fileLists.length];
        for (int i = 0; i < fileLists.length; i++) {
            File file = fileLists[i];
            String name = file.getName();
            String[] s = name.split("_");
            String str = s[s.length - 1];
            if (str.equals("null") || StringUtils.isEmpty(str)) {
                continue;
            }
            int i1 = Integer.parseInt(str);
            fpaths[i1] = dir + "/" + name;
        }

        String tempFilePath = tempFolder + File.separator + filename;
        //合并到tempFilePath，然后解压至decryptPath文件夹
        mergeFiles(fpaths, tempFilePath);
        deleteFile(fileDir);
        //解密目录
        String decryptPath = tempFolder + File.separator + baseBookId;

        //先判断在该资源库是否存在
        BookInfoPO testBook = bookInfoService.getOneByRefBookIdAndRepoId(baseBookId, repoId);
        if (testBook != null) {
            K12ResDataVO vo = K12ResDataVO.builder().tempFilePath(tempFilePath).decryptPath(decryptPath)
                    .tempFolder(tempFolder).bookId(baseBookId).repoId(repoId).flag(1).build();
            return ApiResponse.creatSuccess(vo);
        }

        Integer isSuccess = createK12Book(tempFilePath, decryptPath, tempFolder, baseBookId, repoId, 0, bookState);
        if (isSuccess == 0) {
            K12ResDataVO vo = K12ResDataVO.builder().flag(0).build();
            return ApiResponse.creatSuccess(vo);
        } else {
            return ApiResponse.creatFail(Base.ERROR, "资源上传失败");
        }
    }

    @RequestMapping("uploadConfirm.do")
    @ResponseBody
    public ApiResponse uploadK12Confirm(String tempFilePath, String decryptPath, String tempFolder,
            Long bookId, Integer repoId, Integer bookState)
            throws InterruptedException, ExecutionException, ServiceException, EncoderException {
        //flag为1表示book已经存在，这是覆盖的
        //0成功，1失败
        Integer isSuccess = createK12Book(tempFilePath, decryptPath, tempFolder, bookId, repoId, 1, bookState);
        if (isSuccess == 0) {
            return ApiResponse.creatSuccess();
        } else {
            return ApiResponse.creatFail(Base.ERROR, "资源上传失败");
        }

    }


    private Integer createK12Book(String tempFilePath, String decryptPath, String tempFolder,
            Long baseBookId, Integer repoId, Integer flag, Integer bookState)
            throws InterruptedException, ExecutionException, ServiceException, EncoderException {
        //如果文件存在，删掉
        deleteFile(new File(decryptPath));
        FileUtil.createFolderIfNotExist(decryptPath);

        //解密
        //解密程序在服务器上路径
        String encryptFilePath = encryptConfig.getFilePath();
        //获取appKey,作为解密key
        String decryptKey = encryptConfig.getDecryptKey();

        String decryptPathFile = decryptPath + File.separator + baseBookId + ".zip";
        String cmd = encryptFilePath + " decrypt " + decryptKey + " " + tempFilePath + " " + decryptPathFile;
        Runtime rt1 = Runtime.getRuntime();
        Process p1 = null;
        runLinuxCommand(rt1, p1, cmd, "");

        //获取解压后的文件列表
        unZip(new File(decryptPathFile), decryptPath);
        File[] listFiles = null;
        File decryptPathToFile = new File(decryptPath);
        File[] decryptPathFileList = decryptPathToFile.listFiles();
        if (decryptPathFileList == null || decryptPathFileList.length == 0) {
            log.info("上传资源解压没有文件");
            throw new ServiceException(ServiceError.creatFail("上传资源有问题"));
        }

        for (File decryptFile : decryptPathFileList) {
            if (decryptFile.isDirectory()) {
                listFiles = decryptFile.listFiles();
            }
        }

        Long newBookId = null;
        if (flag == 0) {
            //领书
            List<Long> list = new ArrayList<>();
            list.add(baseBookId);
            ApiResponse response = bookInfoService
                    .book(BookBooksVO.builder().baseBookIds(list).repoId(repoId).build(), repoId);
            if (response.getCode() == 0) {
                BookBooksDTO data = (BookBooksDTO) response.getData();
                List<Long> bookIds = data.getRefBookIds();
                newBookId = bookIds.get(0);
                log.info("领书完成，newbookId={}", newBookId);
            } else {
                log.info("该资源库无法领取改书，bookId={},repoId={},msg={}", baseBookId, repoId, response.getMsg());
                throw new ServiceException(ServiceError.creatFail("该资源库无法领取改书"));
            }

        } else {
            BookInfoPO testBook = bookInfoService.getOneByRefBookIdAndRepoId(baseBookId, repoId);
            newBookId = testBook.getId();
            log.info("当前资源库已存在相同书本，newbookId=bookId,bookId={}", newBookId);
        }

        List<PagesAudiosData> pageFilesArray = new ArrayList<>();

        List<PageIdAndPrefixDTO> pageIdAndPrefix = pageInfoService.getPageIdAndPrefix(baseBookId, newBookId);
        for (PageIdAndPrefixDTO idAndPrefix : pageIdAndPrefix) {
            PagesAudiosData pagesAudiosData = new PagesAudiosData();
            BeanUtils.copyProperties(idAndPrefix, pagesAudiosData);
            pageFilesArray.add(pagesAudiosData);
        }

        Map<String, List<AudioFilesData>> map = new HashMap<>();

        //将音频文件上传至临时目录，并整合成map
        for (File listFile : listFiles) {
            AudioFilesData audioFiles = new AudioFilesData();
            String fileName = listFile.getName();
            audioFiles.setClientFileName(fileName);
            audioFiles.setMatchText(fileName.substring(0, fileName.length() - 4));

            String tempName = UUID.randomUUID().toString() + ".mp3";
            String tempPath = tempFolder + File.separator + tempName;

            try {

                FileUtils.copyFile(listFile, new File(tempPath));
            } catch (IOException e) {
                log.info("将解压后的文件移至临时目录失败,listFileName={}", fileName, e);
            }
            audioFiles.setTempFileName(tempName);

            Encoder encoder = new Encoder();
            MultimediaInfo m = encoder.getInfo(listFile);
            long ls = m.getDuration();
            float duration = ls / 1000f;
            audioFiles.setDuration(duration);

            String[] splits = fileName.split("-");
            String keyPrefix = splits[0] + "-" + splits[1];
            if (map.containsKey(keyPrefix)) {
                List<AudioFilesData> dataList = map.get(keyPrefix);
                int i = Integer.parseInt(splits[2].substring(0, splits[2].length() - 4));
                dataList.add(i - 1, audioFiles);
                map.put(keyPrefix, dataList);

            } else {
                List<AudioFilesData> dataList = new ArrayList<>();
                dataList.add(audioFiles);
                map.put(keyPrefix, dataList);
            }
        }
        //没有音频的list,需要删除
        List<PagesAudiosData> removeData = new ArrayList<>();
        for (PagesAudiosData audiosData : pageFilesArray) {
            List<AudioFilesData> dataList = map.get(audiosData.getPrefix());
            if (dataList != null && !dataList.isEmpty()) {
                audiosData.setAudioFilesNameAndMatchText(dataList);
            } else {
                removeData.add(audiosData);
            }
        }
        pageFilesArray.removeAll(removeData);
        //调用批量上传真人录音接口
        ApiResponse apiResponse = pageController.savePagesAudios(pageFilesArray, newBookId.intValue());
        log.info("批量上传真人录音，newbookId={}", newBookId);
        //批量上传音频是异步,轮询访问是否执行完
        if (apiResponse.getCode() == 0) {
            Thread.sleep(2000);
            //轮询1000次不成功，返回失败
            int count = 1000;
            String taskId = (String) apiResponse.getData();
            for (int i = 0; i < count; i++) {
                TaskStatusVO task = redisDao.get(ASYNC_BATCH_UPLOAD_AUDIO_DATA_KEY + ":" + taskId, TaskStatusVO.class);
                log.info("k12音频批量上传,taskId={},i={}", taskId, i);
                if (task.isFinish() && task.getError() == null) {
                    log.info("k12音频批量成功,i={}", i);
                    //成功
                    break;
                }
                if (task.isFinish() && task.getError() != null) {
                    log.info("k12音频批量失败,i={}", i);
                    //失败
                    return 1;
                }
                Thread.sleep(1000);
                if (i == 999) {
                    return 1;
                }
            }
        }

        //同步玩瞳K12资源库的标签,书的状态,书页审核状态
        bookInfoService.setBookAndPageToExam(newBookId, bookState);
        if (flag == 0) {
            BookInfoPO testBook = bookInfoService.getOneByRefBookIdAndRepoId(baseBookId, 27);
            if (testBook != null) {
                bookLabelService.keepLabelSame(testBook.getId(), newBookId);
            }
        }

        //打包book资源
        bookInfoService.packageK12Book(newBookId);

        //删除上传zip
        deleteFile(new File(tempFilePath));
        //删除解压zip和解压文件
        deleteFile(new File(decryptPath));

        return 0;
    }

    private void runLinuxCommand(Runtime rt, Process p, String cmd, String decryptPath) {
        try {
            if ("".equals(decryptPath)) {
                p = rt.exec(cmd);
            } else {
                p = rt.exec(cmd, null, new File(decryptPath));
            }

            //获取进程的标准输入流
            final InputStream is1 = p.getInputStream();
            //获取进城的错误流
            final InputStream is2 = p.getErrorStream();
            //启动两个线程，一个线程负责读标准输出流，另一个负责读标准错误流
            new Thread() {
                @Override
                public void run() {
                    BufferedReader br1 = new BufferedReader(new InputStreamReader(is1));
                    try {
                        String line1 = null;
                        while ((line1 = br1.readLine()) != null) {
                            if (line1 != null) {
                            }
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        try {
                            is1.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }.start();

            new Thread() {
                @Override
                public void run() {
                    BufferedReader br2 = new BufferedReader(new InputStreamReader(is2));
                    try {
                        String line2 = null;
                        while ((line2 = br2.readLine()) != null) {
                            if (line2 != null) {
                            }
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    } finally {
                        try {
                            is2.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                }
            }.start();

            p.waitFor();
            p.destroy();
            log.info("cmd 执行结束");
        } catch (Exception e) {
            try {
                p.getErrorStream().close();
                p.getInputStream().close();
                p.getOutputStream().close();
            } catch (Exception ee) {
            }
        }
    }

    private void mergeFiles(String[] fpaths, String resultPath) throws ServiceException {
        File[] files = new File[fpaths.length];
        for (int i = 0; i < fpaths.length; i++) {
            files[i] = new File(fpaths[i]);
            if (StringUtils.isEmpty(fpaths[i]) || !files[i].exists() || !files[i].isFile()) {
                throw new ServiceException(ServiceError.creatFail("文件已存在"));
            }
        }

        File resultFile = new File(resultPath);

        try {
            int bufSize = 1024;
            BufferedOutputStream outputStream = new BufferedOutputStream(new FileOutputStream(resultFile));
            byte[] buffer = new byte[bufSize];

            for (int i = 0; i < fpaths.length; i++) {
                BufferedInputStream inputStream = new BufferedInputStream(new FileInputStream(files[i]));
                int readcount;
                while ((readcount = inputStream.read(buffer)) > 0) {
                    outputStream.write(buffer, 0, readcount);
                }
                inputStream.close();
            }
            outputStream.close();
        } catch (FileNotFoundException e) {
            e.printStackTrace();
            throw new ServiceException(ServiceError.creatFail("合并文件出错"));
        } catch (IOException e) {
            e.printStackTrace();
            throw new ServiceException(ServiceError.creatFail("合并文件出错"));
        }

    }

    private void deleteFile(File file) {
        if (file.exists()) {
            try {
                FileUtils.forceDelete(file);
            } catch (IOException ex) {
                log.info("deleteFile删除文件失败，fileName={}", file.getName(), ex);
            }

        }
    }

    public static void unZip(File srcFile, String destDirPath) throws RuntimeException {
        log.info("start unZip srcFile:{} ,destDirPath:{}", srcFile, destDirPath);
        long start = System.currentTimeMillis();
        // 判断源文件是否存在

        if (!srcFile.exists()) {

            throw new RuntimeException(srcFile.getPath() + "所指文件不存在");

        }

        // 开始解压

        ZipFile zipFile = null;

        try {

            zipFile = new ZipFile(srcFile);

            Enumeration<?> entries = zipFile.entries();

            while (entries.hasMoreElements()) {

                ZipEntry entry = (ZipEntry) entries.nextElement();

                System.out.println("解压" + entry.getName());

                // 如果是文件夹，就创建个文件夹

                if (entry.isDirectory()) {

                    String dirPath = destDirPath + "/" + entry.getName();

                    File dir = new File(dirPath);

                    dir.mkdirs();

                } else {

                    // 如果是文件，就先创建一个文件，然后用io流把内容copy过去

                    File targetFile = new File(destDirPath + "/" + entry.getName());

                    // 保证这个文件的父文件夹必须要存在

                    if (!targetFile.getParentFile().exists()) {

                        targetFile.getParentFile().mkdirs();

                    }

                    targetFile.createNewFile();

                    // 将压缩文件内容写入到这个文件中

                    InputStream is = zipFile.getInputStream(entry);

                    FileOutputStream fos = new FileOutputStream(targetFile);

                    int len;

                    byte[] buf = new byte[10 * 1024];

                    while ((len = is.read(buf)) != -1) {

                        fos.write(buf, 0, len);

                    }

                    // 关流顺序，先打开的后关闭

                    fos.close();

                    is.close();

                }

            }

            long end = System.currentTimeMillis();

            System.out.println("解压完成，耗时：" + (end - start) + " ms");

        } catch (Exception e) {

            throw new RuntimeException("unzip error from ZipUtils", e);

        } finally {

            if (zipFile != null) {

                try {

                    zipFile.close();

                } catch (IOException e) {

                    e.printStackTrace();

                }

            }

        }

        log.info("end unZip srcFile:{} ,destDirPath:{}", srcFile, destDirPath);
    }

    @ResponseBody
    @RequestMapping("/getBookSize.do")
    public ApiResponse getBookSize(@RequestParam("bookId") Long bookId) {
        Integer bookSize = bookInfoService.getBookSize(bookId);

        return ApiResponse.creatSuccess(bookSize);
    }

    public static String dealDateFormat(String oldDate) {
        Date date1 = null;
        DateFormat df2 = null;
        try {
            DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");
            Date date = df.parse(oldDate);
            SimpleDateFormat df1 = new SimpleDateFormat("EEE MMM dd HH:mm:ss Z yyyy", Locale.UK);
            date1 = df1.parse(date.toString());
            df2 = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        } catch (ParseException e) {

            e.printStackTrace();
        }
        return df2.format(date1);
    }

    @ResponseBody
    @RequestMapping("/showQrcode.do")
    public ApiResponse showQrcode(@RequestParam("bookId") String bookId) throws ServiceException {
        BookPublishPO po = bookPublishService.getOneByBookSecurityId(bookId);
        String url = publishConfig.getUrl() + po.getSecurityId();

        return ApiResponse.creatSuccess(url);
    }
}
