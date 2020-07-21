package com.wantong.admin.view.cms;

import static org.apache.commons.io.IOUtils.toByteArray;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wantong.admin.business.BaseBookImportBiz;
import com.wantong.admin.config.PartnerModelConfig;
import com.wantong.admin.constants.Constants;
import com.wantong.admin.domain.vo.BookInfoModelVO;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.cms.CmsConfig;
import com.wantong.common.cms.CmsConfig.Origin;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.PageResult;
import com.wantong.common.model.Pagination;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ResponseCode.Parameter;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.file.FileHeadUtils;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.config.service.app.IDeviceRelatedService;
import com.wantong.config.service.system.IUserRelatedService;
import com.wantong.content.domain.BookState;
import com.wantong.content.domain.dto.BookBaseInfoDTO;
import com.wantong.content.domain.dto.BookInfoImportRecordDTO;
import com.wantong.content.domain.dto.BookLableNameDTO;
import com.wantong.content.domain.dto.RepoMakedDTO;
import com.wantong.content.domain.po.*;
import com.wantong.content.domain.vo.BookSimilarSetVO;
import com.wantong.content.domain.vo.BookSimilarVO;
import com.wantong.content.domain.vo.ImageDataVO;
import com.wantong.content.domain.vo.IsbnVO;
import com.wantong.content.service.*;
import com.wantong.elasticsearch.domain.BookQuery;
import com.wantong.elasticsearch.domain.RangeQuery;
import com.wantong.elasticsearch.domain.dto.BookListDTO;
import com.wantong.elasticsearch.service.IBookSearchService;
import com.wantong.elasticsearch.service.ISyncBaseBookService;
import com.wantong.nativeservice.service.IImgProcessService;
import com.wantong.recognition.service.IReCompareToolService;
import com.wantong.record.domain.vo.ChangeBookRecordVO;
import com.wantong.record.service.IRecordRelatedService;
import java.io.*;
import java.net.URLEncoder;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.Executor;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;

/**
 * BookController 书本图书管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 11:03
 **/
@Slf4j
@Controller
@RequestMapping("/base")
public class BookBaseInfoController extends BaseController {

    private static final Integer JD_PLATFORM = 0;

    @Reference(timeout = 6000)
    private IBookBaseInfoService bookBaseInfoService;

    @Reference
    private IUserRelatedService userRelatedService;

    @Reference
    private IModelService modelService;

    @Reference
    private IBookLabelService bookLabelService;

    @Reference
    private ImageDataService imageDataService;

    @Reference
    private IImgProcessService imgProceService;

    @Reference
    private IRecordRelatedService recordRelatedService;

    @Autowired
    private StorageConfig storageConfig;

    @Reference
    private IPageImageInfoService pageInfoService;


    @Reference
    private ISyncBaseBookService syncBaseBookService;

    @Reference
    private IBookSearchService searchService;

    @Reference
    private IBookSimilarService similarService;

    @Autowired
    private Executor executor;
    @Reference
    private IDeviceRelatedService deviceRelatedService;

    @Reference
    private IPageImageInfoService pageImageInfoService;

    @Reference
    private IBookIsbnInfoService isbnInfoService;

    @Reference
    private IBookInfoService bookInfoService;

    @Reference(timeout = 20000)
    private IReCompareToolService reCompareToolService;

    @Reference
    private IBookPlatformInfoService bookPlatformInfoService;

    @Autowired
    private PartnerModelConfig partnerModelConfig;

    @Autowired
    private CmsConfig cmsConfig;

    private static final Logger logger = LoggerFactory.getLogger(BookBaseInfoController.class);

    @RequestMapping("bookListFrame.do")
    public String bookListFrame(Model model) {

        AdminSession session = getAdminSession();
        Long partnerId = session.getPartnerId();
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(1);
        pagination.setPageSize(1000);
        List<ModelPO> dto = modelService.listLibraries();
        List<ModelPO> result = new ArrayList<>();
        //过滤此合作商允许使用的图像库id
        if (session.getModelIds() != null && session.getModelIds().size() != 0) {
            result = dto.stream().filter(p -> session.getModelIds().contains(p.getId()))
                    .collect(Collectors.toList());
        } else {
            result = dto;
        }

        //添加来源选项
        List<Origin> origins = new ArrayList<>();
        Map<Integer, Origin> commonOrigin = cmsConfig.getOrigin().getCommonOrigin();
        Map<Integer, Origin> custom = cmsConfig.getOrigin().getCustom();
        boolean isShowOrigin = false;
        if (partnerId.equals(1L)) {
            Origin origin = new Origin();
            origin.setOrigin(-1);
            origin.setName("全部书本图片");
            origins.add(origin);
            origins.addAll(commonOrigin.values());
            origins.addAll(custom.values());
            isShowOrigin = true;
        } else {
            Origin o = custom.get(partnerId.intValue());
            if (o == null) {
                origins.addAll(commonOrigin.values());
            } else {
                origins.add(o);
            }
        }

        model.addAttribute("origin", origins);
        model.addAttribute("isShowOrigin", isShowOrigin);
        model.addAttribute("models", result);
        model.addAttribute("adminemail", session.getEmail());
        return "base/listBook";
    }

    @RequestMapping("listBooks.do")
    public String listBook(int modelId, String status,
            @RequestParam(value = "examine", defaultValue = "") String examine, int currentPage, Model model,
            @RequestParam(value = "pageSize", required = false, defaultValue = "16") int pageSize,
            @RequestParam(value = "origin", required = false, defaultValue = "-1") Integer origin)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Long partnerId = adminSession.getPartnerId();
        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);

        String[] statusArray = status.split(",");
        int[] statusIntArray = new int[statusArray.length];
        if (status != null) {
            for (int i = 0; i < statusArray.length; i++) {
                statusIntArray[i] = Integer.parseInt(statusArray[i]);
            }
        }

        Integer[] originValue = null;
        Origin o = cmsConfig.getOrigin().getCustom().get(partnerId.intValue());
        if (origin == 0) {
            if (partnerId.equals(1L)) {
                originValue = new Integer[]{0};
            } else {
                if (o != null) {
                    originValue = new Integer[]{o.getOrigin()};
                } else {
                    originValue = new Integer[]{0};
                }
            }
        } else if (origin == 2) {
            originValue = new Integer[]{1, 2};
        } else if (origin == -1) {
            if (o != null) {
                originValue = new Integer[]{o.getOrigin()};
            }
        }

        log.info("listBaseBook.modelId:{},statusIntArray:{},pagination:{},originValue:{}", modelId, statusIntArray,
                pagination, originValue);
        BookListDTO dto = searchService.listBaseBook(modelId, statusIntArray, pagination,
                BookQuery.builder().bookId("").bookNumber("")
                        .bookName("").dubble("")
                        .edition("").press("").isbn("").labelName("").origin(originValue).build());

        pagination = dto.getPagination();

        model.addAttribute("status", status);
        model.addAttribute("pagination", pagination);
        model.addAttribute("currentPage", pagination.getCurrentPage());
        model.addAttribute("pages", pagination.getPages());
        model.addAttribute("pageSize", pagination.getPageSize());
        model.addAttribute("books", dto.getListBook());
        model.addAttribute("currentTabBookCount", dto.getCurrentTabCount());
        model.addAttribute("modelBookCount", dto.getRepoBookCount());
        model.addAttribute("partnerId", partnerId);
        return "base/listBook_list";
    }

    public static boolean isNumeric(String str) {
        return str.matches("[0-9]+");
    }

    public boolean isISBN(String isbn) {
        if (isbn == null || isbn.length() < 10) {
            return false;
        }

        String frontStr = isbn.substring(0, isbn.length() - 1);
        String backStr = isbn.substring(isbn.length() - 1);
        boolean isNum = frontStr.matches("[0-9]+");
        if (!isNum || !(frontStr.length() == 9 || frontStr.length() == 12)) {
            return false;
        }
        char[] tmp = frontStr.toCharArray();
        int sum = 0;
        int count = 10;
        if (frontStr.length() == 9) {//验证10位的ISBN
            for (int i = 0; i < 9; i++) {
                int dd = Integer.parseInt(tmp[i] + "");
                sum = sum + count * dd;
                count--;
            }

            int n = 11 - sum % 11;
            String s = "";
            if (n == 11) {
                s = "0";
            } else if (n == 10) {
                s = "x";
            } else {
                s = "" + n;
            }

            return backStr.toLowerCase().equals(s);
        } else if (frontStr.length() == 12) {//验证13位的ISBN
            String str = isbn.substring(0, 3);
            if (!(str.equals("979") || str.equals("978"))) {
                return false;
            }
            for (int i = 0; i < 12; i++) {
                int dd = Integer.parseInt(tmp[i] + "");
                if (i % 2 == 0) {
                    sum = sum + 1 * dd;
                } else {
                    sum = sum + 3 * dd;
                }
            }
            String s = "" + (10 - sum % 10);
            return backStr.equals(s);
        } else {
            return false;
        }
    }


    @RequestMapping("showAddBookPage.do")
    public String showAddBookPage(long modelId, long bookId, Model model, boolean examine, int moduleValue,
            int bookState, int bookInfoState) throws ServiceException {
        if (bookId > -1) {
            BookBaseInfoPO book = bookBaseInfoService.loadBookBaseInfo((int) bookId);
            model.addAttribute("bookName", book.getName());
        } else {
            model.addAttribute("bookName", "");
        }

        model.addAttribute("modelId", modelId).addAttribute("bookId", bookId)
                .addAttribute("examine", examine).addAttribute("moduleValue", moduleValue)
                .addAttribute("bookState", bookState).addAttribute("bookInfoState", bookInfoState);
        return "base/addBook";
    }

    @RequestMapping("saveBookInfo.do")
    @ResponseBody
    public ApiResponse createBook(long bookId, Integer modelId,
            @RequestParam(value = "name", required = false, defaultValue = "") String name,
            @RequestParam(value = "coverImage", required = false, defaultValue = "") String coverImage,
            String author,
            String description,
            @RequestParam(value = "isbn", required = false, defaultValue = "") String isbn, String publish,
            String seriesTitle,
            @RequestParam(value = "innerId", required = false) String innerId,
            @RequestParam(defaultValue = "", required = false) String edition,
            @RequestParam(defaultValue = "", value = "extraData", required = false) String extraData,
            @RequestParam(value = "isbns", required = false) String isbnsStr,
            @RequestParam(defaultValue = "", value = "sku", required = false) String sku) throws Exception {

        AdminSession adminSession = getAdminSession();

        if (modelId == 0) {
            return ApiResponse.creatFail(Base.ERROR, "model ID is missing.");
        }

        Map<String, String> data = new HashMap<>();

        boolean isAdd = false;
        long finalBookId = bookId;
        BookBaseInfoPO bookBaseInfoPO = new BookBaseInfoPO();
        bookBaseInfoPO.setModelId(modelId);
        bookBaseInfoPO.setAuthor(author);
        bookBaseInfoPO.setCoverImage(coverImage);
        bookBaseInfoPO.setDescription(description);
        bookBaseInfoPO.setName(name);
        bookBaseInfoPO.setIsbn(isbn);
        bookBaseInfoPO.setPublisher(publish);
        bookBaseInfoPO.setSeriesTitle(seriesTitle);
        bookBaseInfoPO.setInnerId(innerId);
        bookBaseInfoPO.setEdition(edition);

        List<IsbnVO> isbns = JSONObject.parseObject(isbnsStr, new TypeReference<List<IsbnVO>>() {
        });

        BookBaseInfoDTO bookBaseInfoDTO = new BookBaseInfoDTO();
        bookBaseInfoDTO.setIsbns(isbns);
        bookBaseInfoDTO.setBookBaseInfo(bookBaseInfoPO);

        if (bookId > 0) {
            bookBaseInfoPO.setId(bookId);
            isbnInfoService.updateBaseBook(bookBaseInfoDTO);
            data.put("bookId", String.valueOf(bookId));
        } else {
            //根据创建合作商获取书本来源
            Integer origin = 0;
            Long partnerId = adminSession.getPartnerId();
            Origin o = cmsConfig.getOrigin().getCustom().get(partnerId.intValue());
            if (o != null) {
                origin = o.getOrigin();
            }

            bookBaseInfoPO.setOrigin(origin);
            bookBaseInfoPO.setState(BookState.MAKING.state());
            long id = isbnInfoService.createBaseBook(bookBaseInfoDTO);
            data.put("bookId", String.valueOf(id));
            finalBookId = id;
            isAdd = true;
        }

        //更新sku
        bookPlatformInfoService.setSameSku(finalBookId, sku, JD_PLATFORM);

        /*if (labels != null) {
            int id = Integer.parseInt(data.getOrDefault("bookId", "0"));
            bookLabelService.setBookLabels(id, labels);
        }*/
        ChangeBookRecordVO changeBookRecordVO = new ChangeBookRecordVO();
        changeBookRecordVO.setAdminId(adminSession.getId());
        changeBookRecordVO.setBookId(finalBookId);
        changeBookRecordVO.setBookName(name);
        changeBookRecordVO.setIsbn(isbn);
        changeBookRecordVO.setPageId(-1);
        changeBookRecordVO.setStatus(isAdd ? 3 : 7);
        String message = "";
        if (isAdd) {
            message = "创建新绘本：bookId:" + finalBookId + ",名称:" + name + ",isbn:" + isbn + ",封面图:" + coverImage
                    + ",作者:" + author + ",出版社:" + publish + ",所属系列:" + seriesTitle + ",书本编号:" + innerId;
        } else {
            message = "更新绘本：bookId:" + finalBookId + ",名称:" + name + ",isbn:" + isbn + ",封面图:" + coverImage
                    + ",作者:" + author + ",出版社:" + publish + ",所属系列:" + seriesTitle + ",书本编号:" + innerId;
        }
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
    public ApiResponse loadBook(int bookId) throws Exception {
        AdminSession adminSession = getAdminSession();
        if (adminSession == null) {
            return ApiResponse.creatSuccess("无权限访问此接口");
        }
        BookBaseInfoPO bookBaseInfoPO = bookBaseInfoService.loadBookBaseInfo(bookId);
        List<BookIsbnInfoPO> isbns = isbnInfoService.getIsbnsByBookId(Long.valueOf(bookId));
        List<BookLableNameDTO> labels = bookLabelService.getBookLabelNames(bookId, true);
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

        JsonNode node = JsonUtil.toJson(bookBaseInfoPO);
        ObjectNode objectNode = (ObjectNode) node;
        objectNode.put("labels", JsonUtil.toJson(map));
        objectNode.put("isbns", JsonUtil.toJson(isbns));

        String sku = bookPlatformInfoService.getSkuByBookId(Long.valueOf(bookId), JD_PLATFORM);
        objectNode.put("sku", sku);

        return ApiResponse.creatSuccess(objectNode);
    }

    /**
     * 删除书本
     *
     * @param bookId
     * @param deleteType 0 默认为整本删除 1 为删除未发布页
     */
    @RequestMapping(value = "deleteBook.do", produces = {APPLICATION_JSON_VALUE})
    @ResponseBody
    public ApiResponse deletePictureBook(@RequestParam(value = "bookId") int bookId,
            @RequestParam(value = "deleteType", required = false, defaultValue = "0") String deleteType)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();

        if (deleteType == null || "".equals(deleteType)) {
            deleteType = "0";
        }

        bookBaseInfoService.deletePictureBook(bookId, adminSession.getId());

        syncBaseBookService.syncDeleteBaseBookInfoIndexById(bookId);

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

        boolean b = bookBaseInfoService.forbiddenBook(bookId, forbidden);
        if (b) {
            syncBaseBookService.syncBrsBaseBookInfoIndexById(bookId);
            return ApiResponse.creatSuccess();
        } else {
            return ApiResponse.creatFail(Base.ERROR);
        }
    }


    /**
     * @param （传入bookid)
     * @return(返回处理后的图片base64）
     */
    @RequestMapping("getProcessImg.do")
    @ResponseBody
    public ModelAndView getInitImage(ImageDataVO vo) throws Exception {
        //通过bookid获取图片imageId
        logger.debug(vo.toString());
        String imageId = pageImageInfoService.getImageIdByBookId(vo.getBookId());
        if (imageId == null) {
            throw new ServiceException(ServiceError.creatFail(Base.API_DISABLE, "封面图片不存在，请添加封面后再试"));
        }

        ModelPO modelPO = modelService.getModelPOById((long) vo.getModelId());
        //服务器图片
        String path =
                storageConfig.getBaseBookRoot() + File.separator + vo.getModelId() + File.separator + vo.getBookId()
                        + File.separator + imageId + ".jpg";
        logger.debug("*************************path:" + path);
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
            btImg2 = imgProceService.nImgPreviewProc(data, modelPO.getModelType());
        }

        String tempFolder = storageConfig.getUploadTemp();
        FileUtil.createFolderIfNotExist(tempFolder);
        String uuid = UUID.randomUUID().toString();
        String tempFileName = tempFolder + File.separator + uuid + ".jpg";

        try (OutputStream out = new FileOutputStream(tempFileName)) {
            out.write(btImg2);
            out.flush();
        } catch (IOException e) {
            logger.debug("***********IOException**********");
        }

        ModelAndView modle = new ModelAndView();
        modle.setViewName("base/editImage");
        modle.addObject("fileName", uuid + ".jpg");
        modle.addObject("bookId", vo.getBookId());
        return modle;
    }

    /**
     * @param （传入图像数据及描点坐标)
     * @return(返回处理后的图片base64）
     */
    @RequestMapping("getPreviewImg.do")
    public String getPreviewImg(Model model, ImageDataVO vo) throws Exception {
        //把图片从临时文件读取出来
        logger.debug(vo.toString());
        String tempFilePath = storageConfig.getUploadTemp() + File.separator + vo.getCoverImage();
        logger.debug("*************************tempFilePath2:" + tempFilePath);
        byte[] btImg = null;
        try (InputStream in = new FileInputStream(tempFilePath)) {
            byte[] data = toByteArray(in);//原图片二进制数据
            btImg = imgProceService.nImgCutProc(data, vo.getX1(), vo.getY1(), vo.getX2(), vo.getY2());//算法处理后的二进制数据
        }

        String tempFolder = storageConfig.getUploadTemp();
        FileUtil.createFolderIfNotExist(tempFolder);
        String uuid = UUID.randomUUID().toString();
        //最后图形的临时文件
        String tempFileName = tempFolder + File.separator + uuid + ".jpg";
        vo.setTempFilePath(tempFileName);
        try (OutputStream out = new FileOutputStream(tempFileName)) {
            out.write(btImg);
            out.flush();
        } catch (IOException e) {
            logger.debug("***********IOException**********");
        }

        model.addAttribute("x1", vo.getX1());
        model.addAttribute("y1", vo.getY1());
        model.addAttribute("x2", vo.getX2());
        model.addAttribute("y2", vo.getY2());
        model.addAttribute("tempFileName", tempFileName);
        model.addAttribute("coverImage", uuid + ".jpg");
        model.addAttribute("bookId", vo.getBookId());
        return "base/editImageManager";
    }

    /**
     * @param （传入图像数据及描点坐标)
     * @return(返回处理后的图片base64）
     */
    @RequestMapping("saveImage.do")
    @ResponseBody
    public Map<String, String> saveImage(ImageDataVO vo) throws Exception {
        String imageId = pageImageInfoService.getImageIdByBookId(vo.getBookId());
        vo.setImageId(imageId);
        //坐标点存入数据库
        imageDataService.saveImageData(vo);
        String coverImage = vo.getCoverImage();
        Map map = new HashMap();
        map.put("coverImage", coverImage);

        return map;
    }

    @RequestMapping("searchAllBooks.do")
    @ResponseBody
    public ModelAndView searchAllBooks(int modelId, @RequestParam(defaultValue = "", required = false) String bookName,
            @RequestParam(defaultValue = "", required = false) String isbn,
            @RequestParam(defaultValue = "", required = false) String press,
            @RequestParam(defaultValue = "", required = false) String dubble,
            @RequestParam(defaultValue = "", required = false) String edition,
            @RequestParam(value = "bookNumber", required = false) String bookNumberString,
            @RequestParam(value = "bookId", required = false) String bookIdString, int currentPage,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "label", required = false) String label,
            @RequestParam(value = "pageSize", required = false, defaultValue = "16") int pageSize,
            @RequestParam(value = "isSearchAll", required = false, defaultValue = "false") boolean isSearchAll,
            @RequestParam(value = "beginTime", required = false, defaultValue = "") String beginTime,
            @RequestParam(value = "endTime", required = false, defaultValue = "") String endTime,
            @RequestParam(value = "labelIds", required = false) String labelIds,
            @RequestParam(value = "origin", required = false, defaultValue = "-1") Integer origin)
            throws ServiceException {

        Map<String, Object> data = new HashMap<>();
        AdminSession session = getAdminSession();
        Long partnerId = session.getPartnerId();

        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(pageSize);
        BookListDTO dto = getDTO(modelId, bookName, isbn, press, dubble, edition, bookNumberString, bookIdString,
                status, label, isSearchAll, beginTime, endTime, labelIds, origin, pagination);
        ModelAndView modelAndView = new ModelAndView("/base/listBook_list");
        pagination = dto.getPagination();
        modelAndView.addObject("pagination", pagination);
        modelAndView.addObject("books", dto.getListBook());
        modelAndView.addObject("currentPage", pagination.getCurrentPage());
        modelAndView.addObject("pages", pagination.getPages());
        modelAndView.addObject("pageSize", pagination.getPageSize());
        modelAndView.addObject("currentTabBookCount", dto.getCurrentTabCount());
        modelAndView.addObject("modelBookCount", dto.getRepoBookCount());
        modelAndView.addObject("partnerId", partnerId);

        if (isSearchAll) {
            modelAndView.addObject("isSearchAll", "1");
        }
        return modelAndView;
    }

    @RequestMapping("baseBookExport.do")
    @ResponseBody
    public ApiResponse getSearchDataToVO(int modelId,
            @RequestParam(defaultValue = "", required = false) String bookName,
            @RequestParam(defaultValue = "", required = false) String isbn,
            @RequestParam(defaultValue = "", required = false) String press,
            @RequestParam(defaultValue = "", required = false) String dubble,
            @RequestParam(defaultValue = "", required = false) String edition,
            @RequestParam(value = "bookNumber", required = false) String bookNumberString,
            @RequestParam(value = "bookId", required = false) String bookIdString, int currentPage,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "label", required = false) String label,
            @RequestParam(value = "labelNames", required = false) String labelNames,
            @RequestParam(value = "pageSize", required = false, defaultValue = "1000000") int pageSize,
            @RequestParam(value = "isSearchAll", required = false, defaultValue = "false") boolean isSearchAll,
            @RequestParam(value = "beginTime", required = false, defaultValue = "") String beginTime,
            @RequestParam(value = "endTime", required = false, defaultValue = "") String endTime,
            @RequestParam(value = "labelIds", required = false) String labelIds,
            @RequestParam(value = "origin", required = false, defaultValue = "-1") Integer origin)
            throws ServiceException {

        Pagination pagination = new Pagination();
        pagination.setCurrentPage(currentPage);
        pagination.setPageSize(999999);
        BookListDTO dto = getDTO(modelId, bookName, isbn, press, dubble, edition, bookNumberString, bookIdString,
                status, label, isSearchAll, beginTime, endTime, labelIds, origin, pagination);
        //完整数据结构
        List<BookInfoModelVO> data = new ArrayList<>();
        dto.getListBook().forEach(p -> {
            Map<String, Object> source = (Map<String, Object>) p.getOrDefault("source", new HashMap<>());
            BookInfoModelVO vo = new BookInfoModelVO();
            vo.setNumber((String) source.getOrDefault("inner_id", "空"));
            vo.setBookId(Long.valueOf(source.getOrDefault("id", 0).toString()));
            vo.setBookName((String) source.getOrDefault("name", ""));
            String state = "";
            switch ((int) source.getOrDefault("state", 0)) {
                case 0:
                    state = "书本信息待创建";
                    break;
                case 1:
                    state = "待采样";
                    break;
                case 7:
                    state = "待审核";
                    break;
                case 3:
                    state = "已发布";
                    break;
                case 4:
                    state = "待训练";
                    break;
                case 6:
                    state = "待训练";
                    break;
                case 5:
                    state = "训练中";
                    break;
                default:
                    state = "其他状态";
                    break;
            }
            vo.setState(state);
            vo.setAuthor((String) source.getOrDefault("author", ""));
            vo.setIsbn((String) source.getOrDefault("isbn", ""));
            if (!"".equals(labelIds)) {
                String[] ids = labelIds.split(",");
                String temp = "";
                List<Map<String, Object>> labels = (List<Map<String, Object>>) source
                        .getOrDefault("labels", new ArrayList<>());
                for (int i = 0; i < labels.size(); i++) {
                    for (int j = 0; j < ids.length; j++) {
                        if (((Integer) labels.get(i).get("id")).equals(Integer.valueOf(ids[j]))) {
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
                vo.setLabel(label);
            }
            vo.setSeries_title((String) source.getOrDefault("series_title", ""));
            vo.setTime(BookEditorController.dealDateFormat((String) source.getOrDefault("update_time", "")));
            data.add(vo);
        });

        return ApiResponse.creatSuccess(data);
    }


    private BookListDTO getDTO(int modelId, String bookName, String isbn, String press, String dubble, String edition,
            String bookNumberString, String bookIdString, String status, String label, boolean isSearchAll,
            String beginTime, String endTime, String labelIds, Integer origin, Pagination pagination)
            throws ServiceException {
        if (modelId == 0) {
            throw new ServiceException(ServiceError.creatFail("modelId Not Null"));
        }

        AdminSession session = getAdminSession();
        Long partnerId = session.getPartnerId();
        bookName = bookName.trim();
        isbn = isbn.trim();
        press = press.trim();
        dubble = dubble.trim();
        edition = edition.trim();

        String[] statusArray = status.split(",");
        int[] statusIntArray = new int[statusArray.length];
        if (!"".equals(status)) {
            for (int i = 0; i < statusArray.length; i++) {
                statusIntArray[i] = Integer.parseInt(statusArray[i]);
            }
        }
        String[] labelIdsArray = labelIds.split(",");
        Integer[] labelIdArray = new Integer[labelIdsArray.length];
        if (!"".equals(labelIds)) {
            for (int i = 0; i < labelIdsArray.length; i++) {
                labelIdArray[i] = Integer.parseInt(labelIdsArray[i]);
            }
        } else {
            labelIdArray = null;
        }
        RangeQuery<Date> timeFilter = RangeQuery.<Date>builder().build();
        SimpleDateFormat ft = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
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

        Integer[] originValue = null;
        if (partnerId.equals(1L)) {
            originValue = origin == -1 ? null : new Integer[]{origin};
        } else {
            Origin o = cmsConfig.getOrigin().getCustom().get(partnerId.intValue());
            originValue = o == null ? null : new Integer[]{o.getOrigin()};
        }

        if (labelIdArray != null) {
            label = "";
        }

        log.info("listBaseBook.modelId:{},statusIntArray:{},pagination:{},originValue:{}", modelId, statusIntArray,
                pagination, originValue);
        BookListDTO dto = searchService.listBaseBook(modelId, statusIntArray, pagination,
                BookQuery.builder().bookId(bookIdString).bookNumber(bookNumberString)
                        .bookName(bookName).dubble(dubble)
                        .edition(edition).press(press).isbn(isbn).labelName(label).origin(originValue)
                        .labelIds(labelIdArray).timeRange(timeFilter).build());

        return dto;
    }

    @RequestMapping("changeBookState.do")
    @ResponseBody
    public ApiResponse changBookState(long bookId, int state) throws ServiceException {
        if (bookId <= 0) {

            return ApiResponse.creatFail(Base.ERROR, "bookid Is Null");
        }
        if (state < 0) {

            return ApiResponse.creatFail(Base.ERROR, "state Is Less than zero");
        }

        bookBaseInfoService.manualRepairBookStatus(bookId, state);

        return ApiResponse.creatSuccess();
    }


    @Autowired
    BaseBookImportBiz baseBookImportBiz;

    @PostMapping("excelFile.do")
    @ResponseBody
    public Object importFromExcel(MultipartFile file, @RequestParam Integer modelId) throws Exception {
        int valid = baseBookImportBiz.checkHead(file);
        if (valid == 1) {
            return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, "失败，上传的文件必须为.xlsx");
        } else if (valid == 2) {
            return ApiResponse.creatFail(ResponseCode.Parameter.ILLEGAL, "excel表头与模板不一致");
        }

        logger.info("modelId: " + modelId);
        baseBookImportBiz.pushExcelImportTaskToRedis(file, getAdminSession(), modelId);
        return ApiResponse.creatSuccess();
    }

    @GetMapping("excelFile.do")
    public ResponseEntity<byte[]> getImportReport(@RequestParam Long recordId) throws Exception {

        byte[] bytes = baseBookImportBiz.reportImportResult(recordId);

        String fileName = null;
        if (recordId == -1) {
            fileName = "书本信息待创建清单模板" + Constants.DOT_XLSX;
        } else {
            fileName = Constants.REPORT_FILENAME_PREFIX + recordId + Constants.DOT_XLSX;

            List<BookInfoImportRecordDTO> data = baseBookImportBiz.listReport(getAdminSession().getId());
            for (BookInfoImportRecordDTO dto : data) {
                if (dto.getId().equals(recordId)) {
                    fileName = dto.getFilename();
                }
            }

        }
        fileName = URLEncoder.encode(fileName, "utf-8");
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(bytes.length);

        return new ResponseEntity(bytes, headers, HttpStatus.OK);
    }

    @GetMapping("importHistory")
    @ResponseBody
    public ApiResponse listReport() {
        List<BookInfoImportRecordDTO> data = baseBookImportBiz.listReport(getAdminSession().getId());
        return ApiResponse.creatSuccess(data);
    }

    @PostMapping("autoSetCoverImage")
    @ResponseBody
    public ApiResponse autoSetCoverImage(@RequestParam Long bookId) {
        logger.info("autoSetCoverImage bookId : " + bookId);
        bookBaseInfoService.autoSetCoverImage(bookId);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("lookRepoMaked.do")
    public ModelAndView lookRepoMaked(@RequestParam("bookId") Long bookId,
            @RequestParam("currentPage") Integer currentPage) throws ServiceException {

        RepoMakedDTO repoMakedDTO = bookBaseInfoService.getRepoMakedInfo(bookId, currentPage);
        Pagination pagination = repoMakedDTO.getPagination();

        ModelAndView mv = new ModelAndView();
        mv.setViewName("base/repoMakedList");
        mv.addObject("repoMakedInfo", repoMakedDTO.getList());
        mv.addObject("currentPage", pagination.getCurrentPage());
        mv.addObject("pages", pagination.getPages());
        mv.addObject("pageSize", pagination.getPageSize());
        mv.addObject("bookId", bookId);
        mv.addObject("isDisplay", 1);
        return mv;
    }

    @RequestMapping("similarBookByCover.do")
    @ResponseBody
    public ModelAndView similarBookByCover(@RequestParam("fileName") String fileName,
            @RequestParam("bookId") Long bookId, @RequestParam("modelId") Integer modelId,
            @RequestParam("type") Integer type) throws ServiceException {
        List<String> imageIdArr = new ArrayList<>();
        byte[] imageData = null;
        if (type == 0) {
            String uploadTemp = storageConfig.getUploadTemp();
            String tempFilePath = uploadTemp + File.separator + fileName;
            File tempFile = new File(tempFilePath);
            if (!tempFile.exists()) {
                log.info("临时图片不存在");
                throw new ServiceException(ServiceError.creatFail("临时图片不存在"));
            }
            try {
                imageData = FileUtils.readFileToByteArray(tempFile);
            } catch (IOException e) {
                log.info("图片转字节数组失败", e);
            }
        } else if (type == 1) {
            String path = bookBaseInfoService.getCoverImagePath(bookId);
            try {
                InputStream in = new FileInputStream(path);
                imageData = toByteArray(in);
            } catch (IOException e) {
                log.info("算法根据封面获取相似书本失败", e);
            }
        } else {
            throw new ServiceException(ServiceError.creatFail("不支持的操作类型"));
        }
        imageIdArr = reCompareToolService.getSimilarImageId(imageData, 0, modelId);

        if (imageIdArr == null || imageIdArr.isEmpty()) {
            log.info("算法找不到相似书本,bookId={}", bookId);
            throw new ServiceException(ServiceError.creatFail("算法找不到相似书本"));
        }
        List<BookBaseInfoDTO> bookBaseInfoDTOS = pageImageInfoService.getBookByImageIds(imageIdArr, modelId);
        if (bookBaseInfoDTOS.isEmpty()) {
            log.info("算法找不到相似书本");
            throw new ServiceException(ServiceError.creatFail("算法找不到相似书本"));
        }
        ModelAndView mv = new ModelAndView();
        mv.setViewName("base/similarBook");
        mv.addObject("books", bookBaseInfoDTOS);
        return mv;
    }


    @RequestMapping("replaceBaseBook.do")
    @ResponseBody
    public ApiResponse replaceBaseBook(@RequestParam("baseBookId") Long baseBookId,
            @RequestParam("replaceBookId") Long replaceBookId) throws ServiceException {
        AdminSession adminSession = getAdminSession();

        //判断replaceBookId是否在图像库的已发布中存在
        bookBaseInfoService.checkReplaceBookId(baseBookId, replaceBookId);

        bookBaseInfoService.replaceBook(baseBookId, replaceBookId, adminSession.getId());

        syncBaseBookService.syncDeleteBaseBookInfoIndexById(baseBookId);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("bothBaseBookInOneRepo.do")
    @ResponseBody
    public ModelAndView bothBaseBookInOneRepo(@RequestParam("baseBookId") Long baseBookId,
            @RequestParam("replaceBookId") Long replaceBookId) throws ServiceException {
        //判断要替换的bookId和被替换的bookId是否被同一个资源库领取
        RepoMakedDTO repoMakedDTO = bookInfoService.checkBookIdBothInRepo(baseBookId, replaceBookId);

        ModelAndView mv = new ModelAndView();
        mv.setViewName("base/repoMakedList");
        mv.addObject("repoMakedInfo", repoMakedDTO.getList());
        mv.addObject("isDisplay", 0);

        return mv;
    }

    /**
     * 相似书set首页
     */
    @RequestMapping("similarSet.do")
    public ModelAndView similarSetPage(@RequestParam(name = "modelId", defaultValue = "27") int modelId,
            @RequestParam(name = "name", required = false) String name,
            @RequestParam(name = "page", defaultValue = "1") int page) throws ServiceException {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("base/similarBookSet");
        PageResult<BookSimilarSetVO> similarSet = similarService.querySimilarBookSetByPage(modelId, name, page);
        List<String> names = similarService.queryAllSetName(modelId);
        mv.addObject("pagination", similarSet.getPagination());
        mv.addObject("data", similarSet.getResult());
        mv.addObject("name", name);
        mv.addObject("names", names);

        return mv;
    }

    @RequestMapping("addSimilarSet.do")
    @ResponseBody
    public Object addSimilarSet(@RequestParam(name = "modelId") int modelId,
            @RequestParam(name = "name") String name) throws ServiceException {
        BookSimilarSetPO bookSimilarSetPO = new BookSimilarSetPO();
        bookSimilarSetPO.setCreateAdmin((int) getAdminSession().getId());
        bookSimilarSetPO.setModelId(modelId);
        bookSimilarSetPO.setName(name);
        similarService.createSimilarBookSet(bookSimilarSetPO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("getSimilarSet.do")
    @ResponseBody
    public Object getSimilarSet(@RequestParam(name = "sid") Long sid) throws ServiceException {
        if (sid == null) {
            throw new ServiceException(ServiceError.creatFail(Parameter.LACK));
        }

        return ApiResponse.creatSuccess(similarService.queryById(sid));
    }

    @RequestMapping("updateSimilarSet.do")
    @ResponseBody
    public Object updateSimilarSet(@RequestParam(name = "id") int id,
            @RequestParam(name = "name") String name) throws ServiceException {
        BookSimilarSetPO similarSetPO = similarService.queryById(id);
        if (similarSetPO == null) {
            throw new ServiceException(ServiceError.creatFail(Parameter.OTHERS));
        }

        similarSetPO.setName(name);
        similarService.updateSimilarBookSet(similarSetPO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("deleteSimilarSet.do")
    @ResponseBody
    public Object deleteSimilarSet(@RequestParam(name = "id") int id) throws ServiceException {
        similarService.deleteSimilarBookSet(id);

        return ApiResponse.creatSuccess();
    }

    /**
     * 相似书首页
     */
    @RequestMapping("openSimilarSet.do")
    public ModelAndView similarBookPage(@RequestParam(name = "sid") int sid,
            @RequestParam(name = "page", defaultValue = "1") int page
    ) throws ServiceException {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("base/similarBookEditor");
        PageResult<BookSimilarVO> similarBooks = similarService.querySimilarBookSetByPage(sid, page);
        mv.addObject("pagination", similarBooks.getPagination());
        mv.addObject("data", similarBooks.getResult());
        mv.addObject("sid", sid);

        return mv;
    }

    @RequestMapping("addSimilarBook.do")
    @ResponseBody
    public Object addSimilarBook(@RequestParam(name = "sid") long sid,
            @RequestParam(name = "bookId") long bookId) throws ServiceException {
        BookSimilarPO bookSimilarPO = new BookSimilarPO();
        bookSimilarPO.setSetId(sid);
        bookSimilarPO.setBookId(bookId);
        similarService.createSimilarBook(bookSimilarPO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("getSimilarBook.do")
    @ResponseBody
    public Object getSimilarBook(@RequestParam(name = "bid") Long bid) throws ServiceException {
        if (bid == null) {
            throw new ServiceException(ServiceError.creatFail(Parameter.LACK));
        }

        return ApiResponse.creatSuccess(similarService.querySimilarBookById(bid));
    }

    @RequestMapping("updateSimilarBook.do")
    @ResponseBody
    public Object updateSimilarSet(@RequestParam(name = "id") long id,
            @RequestParam(name = "bookId") long bookId) throws ServiceException {
        BookSimilarPO similarPO = similarService.querySimilarBookById(id);
        if (similarPO == null) {
            throw new ServiceException(ServiceError.creatFail(Parameter.OTHERS));
        }

        similarPO.setBookId(bookId);
        similarService.updateSimilarBook(similarPO);

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("deleteSimilarBook.do")
    @ResponseBody
    public Object deleteSimilarBook(@RequestParam(name = "id") int id) throws ServiceException {
        similarService.deleteSimilarBook(id);

        return ApiResponse.creatSuccess();
    }
}
