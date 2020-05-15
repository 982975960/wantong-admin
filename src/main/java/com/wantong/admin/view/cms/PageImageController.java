package com.wantong.admin.view.cms;

import static com.wantong.content.domain.vo.TaskStatusVO.ASYNC_BATCH_UPLOAD_PICTURE_DATA_KEY;

import cn.visiontalk.interservice.plainobjects.kpi.BatchPictureProductionJob;
import cn.visiontalk.interservice.plainobjects.kpi.PictureExaminationJob;
import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.ImageValidationConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.JsonWrapper;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.content.domain.po.BookBaseInfoPO;
import com.wantong.content.domain.po.PageImageInfoPO;
import com.wantong.content.domain.vo.BatchPageImageVO;
import com.wantong.content.domain.vo.PageImageInfoVO;
import com.wantong.content.domain.vo.TaskStatusVO;
import com.wantong.content.domain.vo.UpdatePageResponseVO;
import com.wantong.content.service.IBookBaseInfoService;
import com.wantong.content.service.IPageImageInfoService;
import com.wantong.content.service.ITTSService;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * PageController 书页管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 11:09
 **/
@Controller
@RequestMapping("/base")
@Slf4j
@RequiredArgsConstructor
public class PageImageController extends BaseController {

    private final static String TEMP_COVER_IMAGE = "temp.jpg";

    @Reference
    private IPageImageInfoService pageImageInfoService;

    @Reference
    private IBookBaseInfoService bookBaseInfoService;

    @Reference
    private ITTSService ittsService;

    @Value("${mq-topic.kpi-event}")
    private String kpiTopic;

    private final RocketMQTemplate template;
    private final RedisDao redisDao;
    private final ImageValidationConfig imageValidationConfig;

    /**
     * 删除书本中的一页
     */
    @RequestMapping("deletePage.do")
    @ResponseBody
    public ApiResponse deletePage(@RequestParam("pageId") long pageId,
            @RequestParam(value = "deleteIndexOnly", defaultValue = "false", required = false) boolean deleteIndexOnly)
            throws Exception {
        AdminSession adminSession = getAdminSession();
        List<PageImageInfoVO> pageInfoVOList = pageImageInfoService.loadPage(pageId, true);
        pageImageInfoService.deletePage(pageId, deleteIndexOnly, adminSession.getId());
        if (pageInfoVOList != null && pageInfoVOList.size() != 0) {
            pageInfoVOList.stream().forEach(p -> {
                if (p.getId() != pageId) {
                    try {
                        pageImageInfoService.deletePage(p.getId(), deleteIndexOnly, adminSession.getId());
                    } catch (Exception e) {

                    }

                }
            });
        }

        return ApiResponse.creatSuccess();
    }

    @RequestMapping("loadPageInfo.do")
    @ResponseBody
    public ApiResponse loadPageInfo(long pageId) {
        List<PageImageInfoVO> pageInfoVOList = pageImageInfoService.loadPage(pageId, true);

        return ApiResponse.creatSuccess(pageInfoVOList);
    }

    private static Integer MODEL_ID_27 = 27;
    private static Integer MODEL_ID_28 = 28;
    private static Integer MODEL_ID_29 = 29;

    @RequestMapping("showAddPage.do")
    public String showAddPage(long bookId, Model model,
            @RequestParam(value = "examine", defaultValue = "", required = false) String examine,
            @RequestParam(value = "bookExamine", defaultValue = "", required = false) String bookExamine,
            @RequestParam(value = "moduleValue", defaultValue = "", required = false) int moduleValue,
            @RequestParam(value = "bookState", defaultValue = "", required = false) int bookState,
            @RequestParam(value = "bookInfoState", defaultValue = "0", required = false) Integer bookInfoState,
            Integer modelId)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        BookBaseInfoPO bookBaseInfoPO = bookBaseInfoService.loadBookBaseInfo((int) bookId);

        String imageLimitation = "1280*720";
        if (MODEL_ID_27.equals(modelId)){
            imageLimitation = imageValidationConfig.getSize27batch();
        }else if (MODEL_ID_28.equals(modelId)) {
            imageLimitation = imageValidationConfig.getSize28batch();
        }else if (MODEL_ID_29.equals(modelId)) {
            imageLimitation = imageValidationConfig.getSize29batch();
        }

        model.addAttribute("imageLimitation", imageLimitation);
        model.addAttribute("bookId", bookId);
        model.addAttribute("examine", examine);
        model.addAttribute("bookExamine", bookExamine);
        model.addAttribute("partnerId", adminSession.getPartnerId());
        model.addAttribute("moduleValue", moduleValue);
        model.addAttribute("bookState", bookState);
        model.addAttribute("bookInfoState", bookInfoState);
        model.addAttribute("modelId", modelId);
        model.addAttribute("origin", bookBaseInfoPO.getOrigin());
        return "base/addPage";
    }

    @RequestMapping("savePageInfo.do")
    @ResponseBody
    public ApiResponse savePageInfo(@RequestBody List<PageImageInfoVO> pageInfoVOList, Model model)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Map<String, Object> data = new HashMap<String, Object>();
        PageImageInfoVO pageInfoVO = pageInfoVOList.get(0);

        //相同书页类型(type)不能页码(pagination)相同
        List<PageImageInfoPO> pageImageInfoPOList;
        pageImageInfoPOList = pageImageInfoService
                .countPageByBookIdTypePagination(pageInfoVO.getBaseBookId(), pageInfoVO.getPageType(),
                        pageInfoVO.getPagination());
        if (pageImageInfoPOList.size() > 0) {
            if (pageInfoVO.getId() > 0) {
                if (!pageInfoVO.getId().equals(pageImageInfoPOList.get(0).getId())) {
                    //修改 :  id相同才能修改
                    return ApiResponse.creatFail(Base.ERROR, "此书页类型页码已存在", null);
                }
            } else {
                // 新增
                return ApiResponse.creatFail(Base.ERROR, "此书页类型页码已存在", null);
            }
        }

        //设置图片
        setTempImage(pageInfoVO);
        //图片数据一致性检查
        boolean checkFlag = false;
        boolean saveFlag = false;
        long pageId;
        pageInfoVO.setParentPageId(0L);
        if (pageInfoVO.getId() > 0) {
            UpdatePageResponseVO responseVO = null;
            try {
                responseVO = pageImageInfoService.updatePage(pageInfoVO, adminSession.getId());
                saveFlag = true;
            } catch (ServiceException e) {
                if (e.getErrorCode() != null) {
                    responseVO = (UpdatePageResponseVO) e.getErrorCode().getData();
                }

                if (responseVO == null) {
                    throw new ServiceException(e.getErrorCode());
                }
            }

            checkFlag = pageImageInfoService
                    .checkPageCoincident(responseVO.getPageId(), responseVO.getImageId(), responseVO.getTaskId());
            pageId = responseVO.getPageId();
            data.put("pageId", pageId);
            if (!saveFlag) {
                return ApiResponse.creatFail(Base.ERROR, "Update page's info meet error.");
            }

        } else {
            PageImageInfoPO responseVO = null;
            try {
                responseVO = pageImageInfoService.createPage(pageInfoVO, adminSession.getId());
                saveFlag = true;
            } catch (ServiceException e) {
                if (e.getErrorCode() != null) {
                    responseVO = (PageImageInfoPO) e.getErrorCode().getData();
                }

                if (responseVO == null) {
                    throw new ServiceException(e.getErrorCode());
                }
            }
           /* if (responseVO == null) {
                throw new ServiceException(ServiceError.creatFail(TASK_IN_PROGRESS));
            }*/
            checkFlag = pageImageInfoService
                    .checkPageCoincident(responseVO.getId(), responseVO.getImageId(), responseVO.getTrainTaskId());
            pageId = responseVO.getId();
            data.put("pageId", pageId);
            if (!saveFlag) {
                return ApiResponse.creatFail(Base.ERROR, "Update page's info meet error.");
            }
        }
        List<PageImageInfoVO> list = pageImageInfoService.loadPage(pageId, true);

        if (pageInfoVOList.size() > 1) {
            for (int i = 0; i < pageInfoVOList.size(); i++) {
                if (pageInfoVOList.get(i) != null && pageInfoVOList.get(i).getImageType() != 0
                        && pageInfoVOList.get(i).getCoverImage() != null
                        && !pageInfoVOList.get(i).getCoverImage().equals("")) {
                    PageImageInfoVO page = pageInfoVOList.get(i);
                    PageImageInfoVO oldPage = list.stream().filter(p -> p.getImageType().equals(page.getImageType()))
                            .findAny()
                            .orElse(null);
                    page.setParentPageId(pageId);
                    if (oldPage == null) {
                        pageImageInfoService.createPage(page, adminSession.getId());
                    } else {
                        page.setId(oldPage.getId());
                        pageImageInfoService.updatePage(page, adminSession.getId());
                    }
                }
            }
        }
        pageInfoVO.setId(pageId);
        if (!checkFlag) {
            return ApiResponse.creatFail(Base.ERROR, "Save page's cover image to storage meet error.");
        }

        //kpi统计消息 start
        try {
            PageImageInfoVO vo = pageInfoVOList.get(0);
            BatchPictureProductionJob.UniqueBasePage uniqueBasePage = new BatchPictureProductionJob.UniqueBasePage(
                    vo.getBaseBookId(), vo.getPhysicalIndex(), vo.getPhysicalState());
            List<BatchPictureProductionJob.UniqueBasePage> ubpList = Collections.singletonList(uniqueBasePage);
            BatchPictureProductionJob job = new BatchPictureProductionJob(
                    getAdminSession().getId(),
                    getAdminSession().getPartnerId(),
                    LocalDateTime.now(),
                    ubpList
            );
            JsonWrapper jsonWrapper = JsonWrapper.of(job);
            template.convertAndSend(kpiTopic, jsonWrapper);
            log.debug("kpi统计消息" + jsonWrapper);
        } catch (Throwable throwable) {
            log.error("base/savePageInfo.do?pageInfoVOList={}", pageInfoVOList);
            log.error("kpi统计消息 发送失败", throwable);
        }

        //kpi统计消息 end
        return ApiResponse.creatSuccess(data);
    }

    /**
     * 获得书本书页
     *
     * @param bookId
     */
    @RequestMapping("listPages.do")
    @ResponseBody
    public ApiResponse listPages(int bookId) throws Exception {
        List<PageImageInfoVO> pages = pageImageInfoService.listPage(bookId);
        Map<String, Object> data = new HashMap<>();
        data.put("pages", pages);

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("changePageExamine.do")
    @ResponseBody
    public ApiResponse changePageExamine(int pageId, int examine,
            @RequestParam(value = "examineReason", required = false, defaultValue = "") String examineReason)
            throws ServiceException {

        //kpi统计消息 start
        try {
            if (examine != 1) {
                //只记审核通过的
            } else {
                PictureExaminationJob job = new PictureExaminationJob(
                        getAdminSession().getId(),
                        getAdminSession().getPartnerId(),
                        LocalDateTime.now(),
                        (long) pageId
                );
                JsonWrapper jsonWrapper = JsonWrapper.of(job);
                template.convertAndSend(kpiTopic, jsonWrapper);
                log.debug("kpi统计消息" + jsonWrapper);
            }
        } catch (Throwable throwable) {
            log.error("base/changePageExamine.do?pageId={}&examine={}", pageId, examine);
            log.error("kpi统计消息 发送失败", throwable);
        }
        //kpi统计消息 end

        pageImageInfoService.changeExamine(examine, pageId, examineReason);
        return ApiResponse.creatSuccess();
    }

    @RequestMapping("fingerBook.do")
    @ResponseBody
    public ModelAndView fingerBook() throws ServiceException {
        ModelAndView mv = new ModelAndView("/base/fingerBook");

        return mv;
    }

    @RequestMapping("saveFingerPosition.do")
    @ResponseBody
    public ApiResponse saveFingerPosition(@RequestParam("pageId") long pageId,
            @RequestParam("position") String position) {

        pageImageInfoService.updateFingerPosition(pageId, position);

        return ApiResponse.creatSuccess();
    }

    /**
     * deletePageByBookId 根据基础库的书本Id删除书页
     *
     * @param bookId          书本ID
     * @param deleteIndexOnly
     */
    @RequestMapping("deletePagesAccordingToBookId.do")
    @ResponseBody
    public ApiResponse deletePageByBookId(@RequestParam("bookId") @NotNull long bookId,
            @RequestParam(value = "deleteIndexOnly", defaultValue = "false", required = false) boolean deleteIndexOnly)
            throws ServiceException {
        AdminSession session = getAdminSession();
        // 删除书本上的所有书页
        String taskId = pageImageInfoService.deletePageByBookId(bookId, deleteIndexOnly, session.getId());

        return ApiResponse.creatSuccess(taskId);
    }


    /**
     * savePagesData 批量保存书页的书本信息
     */
    @RequestMapping("savePagesData.do")
    @ResponseBody
    public ApiResponse savePagesData(@RequestBody List<BatchPageImageVO> batchPageImageVOList)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        String taskId = pageImageInfoService.savePages(batchPageImageVOList,adminSession.getId());

        return ApiResponse.creatSuccess(taskId);
    }

    /**
     * 检查批量上传图片任务状态
     * @param taskId
     * @param batchPageImageVOList
     * @return
     * @throws ServiceException
     */
    @RequestMapping("checkBatchUploadPictureTaskState.do")
    @ResponseBody
    public ApiResponse checkBatckUploadPictureTaskState(@RequestParam("taskId") String taskId,
            @RequestBody List<BatchPageImageVO> batchPageImageVOList) throws ServiceException {
        TaskStatusVO statusVO = redisDao.get(ASYNC_BATCH_UPLOAD_PICTURE_DATA_KEY + ":" + taskId, TaskStatusVO.class);
        if (statusVO.isFinish() && statusVO.getError() != null) {
            throw new ServiceException(statusVO.getError());
        }
        HashMap<String,String> error = new HashMap<>();
        if(statusVO.isFinish() && statusVO.getError() == null) {
            error = map(statusVO.getExtra());
            //        //kpi统计消息 start
            try {
                Set<String> errorFileNameSet = error.keySet();
                List<BatchPictureProductionJob.UniqueBasePage> list = batchPageImageVOList
                        .stream()
                        .filter(e -> !errorFileNameSet.contains(e.getClientFileName()))
                        .map(e -> new BatchPictureProductionJob.UniqueBasePage(
                                e.getBookId(), e.getPhysicalIndex(), e.getPhysicalState())
                        ).collect(Collectors.toList());

                BatchPictureProductionJob job = new BatchPictureProductionJob(
                        getAdminSession().getId(),
                        getAdminSession().getPartnerId(),
                        LocalDateTime.now(),
                        list
                );
                JsonWrapper jsonWrapper = JsonWrapper.of(job);
                template.convertAndSend(kpiTopic, jsonWrapper);
                log.debug("kpi统计消息" + jsonWrapper);
            } catch (Throwable throwable) {
                log.error("base/savePagesData.do?batchPageImageVOList={}", batchPageImageVOList);
                log.error("kpi统计消息 发送失败", throwable);
            }
            //kpi统计消息 end
        }
        return ApiResponse.creatSuccess(statusVO);
    }

    @RequestMapping("checkDelBookPagesTaskState.do")
    @ResponseBody
    public ApiResponse checkDelBookPagesTaskState(String taskId) {

        return ApiResponse.creatSuccess(pageImageInfoService.checkDeleteBookPagesTaskState(taskId));
    }

    /**
     * 获取书页nycontent
     *
     * @param pageId
     */
    @RequestMapping("loadPageNyContent.do")
    @ResponseBody
    public ApiResponse loadPageNyContent(Long pageId) throws Exception {
        String content = pageImageInfoService.loadNyContentByPageId(pageId);

        return ApiResponse.creatSuccess(content);
    }

    private PageImageInfoVO setTempImage(PageImageInfoVO pageInfoVO) {

        if (pageInfoVO.getCoverImage().getImageName() == null) {
            pageInfoVO.getCoverImage().setImageName(TEMP_COVER_IMAGE);
        }

        return pageInfoVO;
    }

    private HashMap<String,String> map(Serializable serializable) throws ServiceException{

        HashMap<String,String> map = new HashMap<>();
        ObjectOutputStream objectOutputStream =null;
        ByteArrayOutputStream byteArrayOutputStream = null;
        ByteArrayInputStream byteArrayInputStream = null;
        try {
            byteArrayOutputStream = new ByteArrayOutputStream();
            objectOutputStream = new ObjectOutputStream(byteArrayOutputStream);
            objectOutputStream.writeObject(serializable);
            byte[] bytes = byteArrayOutputStream.toByteArray();
            objectOutputStream.flush();
            objectOutputStream.close();
            byteArrayInputStream = new ByteArrayInputStream(bytes);
            ObjectInputStream objectInputStream = new ObjectInputStream(byteArrayInputStream);
            map =(HashMap<String,String>)objectInputStream.readObject();

        }catch (IOException ex){
            log.error("------------------------->> map方法异常IOException{}",ex);
            throw new ServiceException(ServiceError.creatFail(Base.SYSTEM_ERR));
        }catch (Exception ex){

            log.error("------------------------->> map方法异常 Exception{}",ex);
            throw new ServiceException(ServiceError.creatFail(Base.SYSTEM_ERR));
        }

        return map;
    }
}

