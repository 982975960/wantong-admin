package com.wantong.admin.view.cms;

import static com.wantong.content.domain.vo.TaskStatusVO.*;

import cn.visiontalk.interservice.plainobjects.kpi.BatchFingerResourceProductionJob;
import cn.visiontalk.interservice.plainobjects.kpi.BatchReadingResourceProductionJob;
import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.admin.domain.vo.AudioFilesData;
import com.wantong.admin.domain.vo.PagesAudiosData;
import com.wantong.admin.domain.vo.PagesFingerAudiosData;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.model.JsonWrapper;
import com.wantong.common.redis.RedisDao;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.content.domain.DbTtsRole;
import com.wantong.content.domain.po.BookInfoPO;
import com.wantong.content.domain.po.FingerDataPO;
import com.wantong.content.domain.po.PageInfoPO;
import com.wantong.content.domain.vo.*;
import com.wantong.content.service.*;

import java.io.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Map.Entry;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutionException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.annotations.Param;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * PageController 书页管理
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-01-08 11:09
 **/
@Controller
@RequestMapping("/cms")
@Slf4j
public class PageController extends BaseController {

    private static final String REG = "\\d{1,3}\\-\\d{1,3}\\-\\d{1,3}\\-";

    private final static String TEMP_COVER_IMAGE = "temp.jpg";

    @Autowired
    private StorageConfig storageConfig;

    @Reference(timeout = 15 * 1000)
    private IPageInfoService pageInfoService;

    @Reference
    private ITTSService ittsService;

    @Reference
    private IPictureBookPageAudioService pictureBookPageAudioService;

    @Reference
    private IBookInfoService bookInfoService;

    @Autowired
    private RedisDao redisDao;

    @Value("${mq-topic.kpi-event}")
    private String kpiTopic;

    @Autowired
    private RocketMQTemplate template;


    @RequestMapping("loadPageInfo.do")
    @ResponseBody
    public ApiResponse showAddPage(Integer pageId, Integer repoId) {
        PageInfoPO pageInfoPO = pageInfoService.getById(pageId);
        BookInfoPO bookInfoPO = bookInfoService.getById(pageInfoPO.getBookId());
        AdminSession adminSession = getAdminSession();
        if (!bookInfoPO.getRepoId().equals(repoId) && adminSession.getPartnerId() != 1) {
            return ApiResponse.creatFail(Base.ERROR, "没有权限", "");
        }

        PageInfoVO pageInfoVO = pageInfoService.loadPage(pageId);

        return ApiResponse.creatSuccess(pageInfoVO);
    }

    @RequestMapping("loadPageFingerInfo.do")
    @ResponseBody
    public ApiResponse loadPageFingerData(Integer pageId) {
        PageInfoVO pageInfoVO = pageInfoService.loadPageFinger(pageId);
        return ApiResponse.creatSuccess(pageInfoVO);
    }

    @RequestMapping("showAddPage.do")
    public String showAddPage(long bookId, long baseBookId, Model model,
            @RequestParam(value = "examine", defaultValue = "", required = false) String examine,
            @RequestParam(value = "bookExamine", defaultValue = "", required = false) String bookExamine,
            @RequestParam(value = "moduleValue", defaultValue = "", required = false) int moduleValue,
            @RequestParam(value = "bookState", defaultValue = "", required = false) int bookState,
            @RequestParam(value = "repoId") Long repoId)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();

        List<DbTtsRole> dbTtsRole = ittsService.getDBTTSRole();
        model.addAttribute("bookId", bookId);
        model.addAttribute("baseBookId", baseBookId);
        model.addAttribute("examine", examine);
        model.addAttribute("bookExamine", bookExamine);
        model.addAttribute("partnerId", adminSession.getPartnerId());
        model.addAttribute("ttsRole", JsonUtil.toJSONString(dbTtsRole));
        model.addAttribute("moduleValue", moduleValue);
        model.addAttribute("bookState", bookState);
        model.addAttribute("repoId", repoId);
        return "cms/addPage";
    }

    @RequestMapping("showEditFinger.do")
    public String showEditFinger(long bookId, long baseBookId, Model model,
            @RequestParam(value = "examine", defaultValue = "", required = false) String examine,
            @RequestParam(value = "bookExamine", defaultValue = "", required = false) String bookExamine,
            @RequestParam(value = "moduleValue", defaultValue = "", required = false) int moduleValue,
            @RequestParam(value = "bookState", defaultValue = "", required = false) int bookState,
            @RequestParam(value = "repoId") Long repoId)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();

        List<DbTtsRole> dbTtsRole = ittsService.getDBTTSRole();
        model.addAttribute("bookId", bookId);
        model.addAttribute("baseBookId", baseBookId);
        model.addAttribute("examine", examine);
        model.addAttribute("bookExamine", bookExamine);
        model.addAttribute("partnerId", adminSession.getPartnerId());
        model.addAttribute("ttsRole", JsonUtil.toJSONString(dbTtsRole));
        model.addAttribute("moduleValue", moduleValue);
        model.addAttribute("bookState", bookState);
        model.addAttribute("repoId", repoId);

        return "cms/addPageFinger";
    }

    @RequestMapping("savePageInfo.do")
    @ResponseBody
    public ApiResponse savePageInfo(@RequestBody PageInfoVO pageInfoVO, Model model)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Map<String, Object> data = new HashMap<String, Object>();
        UpdatePageResponseVO updatePageResponseVO = pageInfoService.updatePage(pageInfoVO, adminSession.getId());
        data.put("pageId", updatePageResponseVO.getPageId());

        //KPI 消息 start
        try {
            //取保存成功的pageId
            Set<Long> pageIdSet = new HashSet<>();
            pageIdSet.add(pageInfoVO.getId());
            //转为POJO, 发送
            template.convertAndSend(kpiTopic, JsonWrapper.of(
                    new BatchReadingResourceProductionJob(
                            getAdminSession().getId(),
                            getAdminSession().getPartnerId(),
                            LocalDateTime.now(),
                            pageIdSet
                    )));
        }catch (Throwable throwable){
            log.error("cms/savePageInfo.do?pageInfoVO={}",pageInfoVO);
            log.error("KPI消息发送失败",throwable);
        }

        //KPI 消息 start

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("savePageFingerInfo.do")
    @ResponseBody
    public ApiResponse savePageFingerInfo(@RequestBody PageFingerInfoVO pageFingerInfoVO)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Map<String, Object> data = new HashMap<>();
        UpdatePageResponseVO updatePageResponseVO = pageInfoService
                .updatePageFinger(pageFingerInfoVO, adminSession.getId());
        data.put("pageId", updatePageResponseVO.getPageId());
        data.put("taskId", updatePageResponseVO.getTaskId());

        return ApiResponse.creatSuccess(data);
    }


    @RequestMapping("asyncSavePageFingerInfo.do")
    @ResponseBody
    public ApiResponse asyncSavePageFingerInfo(@RequestParam("taskId") String taskId) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_SAVE_FINGER_DATA_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }

        return ApiResponse.creatSuccess(task);
    }

    /**
     * 获得书本书页
     *
     * @param bookId
     */
    @RequestMapping("listPages.do")
    @ResponseBody
    public ApiResponse listPages(int bookId, Integer repoId) throws Exception {
        long start = System.currentTimeMillis();
        AdminSession adminSession = getAdminSession();
        BookInfoPO bookInfoPO = bookInfoService.getOneBookByBookId(Long.valueOf(bookId));
        if (!bookInfoPO.getRepoId().equals(repoId) && adminSession.getPartnerId() != 1) {
            //非玩瞳账户不可通过接口直接请求非本资源库书本
            return ApiResponse.creatSuccess("没有权限");
        }
        List<PageInfoVO> pages = pageInfoService.listPage(bookId);
        Map<String, Object> data = new HashMap<>();
        data.put("pages", pages);

        log.info("listPages耗时,time={}", System.currentTimeMillis() - start);
        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("loadPageAudios.do")
    @ResponseBody
    public ApiResponse loadPageAudios(Integer pageId) throws ServiceException {

        VoiceVO voiceVO = pageInfoService.loadPageAudio(pageId);
        if (voiceVO == null || voiceVO.getVoice() == null || voiceVO.getVoice().length == 0) {
            return ApiResponse.creatSuccess("null");
        }
        return ApiResponse.creatSuccess(voiceVO);
    }


    @RequestMapping("savePagesAudios.do")
    @ResponseBody
    public ApiResponse savePagesAudios(@RequestBody List<PagesAudiosData> matchingPageFilesArray,
            @Param("bookId") int bookId)
            throws ServiceException, ExecutionException, InterruptedException {

        PagesAudiosVO pagesAudiosVO = new PagesAudiosVO();

        Map<Long, VoiceVO> pagesAudios = new ConcurrentHashMap<>();

        pagesAudiosVO.setBookId(bookId);
        for (PagesAudiosData pagesAudiosData : matchingPageFilesArray) {
            //找到当当页的map
            Map<Integer, AudioFilesData> audios = pagesAudiosData.getAudioFilesNameAndMatchText().stream()
                    .collect(Collectors.toMap(audioFilesData -> Integer.valueOf(isNumericzidai(
                            audioFilesData.getMatchText().substring(audioFilesData.getMatchText().lastIndexOf("-") + 1,
                                    audioFilesData.getMatchText().length())) ? audioFilesData.getMatchText()
                            .substring(audioFilesData.getMatchText().lastIndexOf("-") + 1,
                                    audioFilesData.getMatchText().length()) : audioFilesData.getMatchText()
                            .substring(audioFilesData.getMatchText().lastIndexOf("_") + 1,
                                    audioFilesData.getMatchText().length())), audioFilesData -> audioFilesData));

            List<AudioFilesData> sortAudios = sortPageAudios(audios);

            List<AudioVO> audioVOS = new CopyOnWriteArrayList<>();

            float startTime = 0.00f;
            for (AudioFilesData audioFilesData : sortAudios) {
                AudioVO audioVO = new AudioVO();
                audioVO.setTempFileName(audioFilesData.getTempFileName());
                audioVO.setClientFileName(audioFilesData.getClientFileName());
                BigDecimal decimal = new BigDecimal(startTime);
                audioVO.setStartAt(decimal.setScale(2, 4).floatValue());
                startTime += audioFilesData.getDuration() + 0.70f;
                audioVOS.add(audioVO);
            }

            VoiceVO vo = new VoiceVO();
            vo.setVoice(audioVOS.toArray(new AudioVO[audioVOS.size()]));
            pagesAudios.put(pagesAudiosData.getPageId(), vo);

        }
        pagesAudiosVO.setPagesAudios(pagesAudios);
        String taskId = pictureBookPageAudioService.savePagesAudios(pagesAudiosVO);

        return ApiResponse.creatSuccess(taskId);
    }


    @RequestMapping("listPagesAndFingers.do")
    @ResponseBody
    public ApiResponse listPagesAndFingers(@RequestParam("bookId") long bookId) {

        List<PageInfoVO> list = pageInfoService.listPageFingerByBookId(bookId);

        return ApiResponse.creatSuccess(list);
    }
    @Reference
    IPageFingerInfoService pageFingerInfoService;

    /**
     * 批量保存书页的手指点读音频
     */
    @RequestMapping("savePagesFingersAudios.do")
    @ResponseBody
    public ApiResponse savePagesFingersAudios(@RequestParam("bookId") long bookId,
            @RequestBody List<PagesFingerAudiosData> fingerAudiosData)
            throws ServiceException, ExecutionException, InterruptedException {
//
        PageFingerInfoVO pageFingerInfoVO = new PageFingerInfoVO();
        List<FingerDataVO> listData = new ArrayList<>();
        for (PagesFingerAudiosData pageFingerAudiosData : fingerAudiosData) {
            FingerDataVO fingerDataVO = new FingerDataVO();
            fingerDataVO.setId(pageFingerAudiosData.getFingerId());

            List<AudioVO> audios = new CopyOnWriteArrayList<>();

            float startTime = 0.00f;
            for (AudioFilesData audioFilesData : pageFingerAudiosData.getAudioFilesNameAndMatchText()) {
                AudioVO audioVO = new AudioVO();
                BigDecimal decimal = new BigDecimal(startTime);
                audioVO.setStartAt(decimal.setScale(2, 4).floatValue());
                startTime += audioFilesData.getDuration() + 0.70f;
                audioVO.setTempFileName(audioFilesData.getTempFileName());
                audioVO.setClientFileName(audioFilesData.getClientFileName());
                audios.add(audioVO);
            }
            VoiceVO voiceVO = new VoiceVO();
            voiceVO.setVoice(audios.toArray(new AudioVO[audios.size()]));
            fingerDataVO.setVoice(voiceVO);

            listData.add(fingerDataVO);
        }
        pageFingerInfoVO.setUploadFingerDatas(listData);
        String taskId = pictureBookPageAudioService.savePagesFingersAudios(bookId, pageFingerInfoVO);

        return ApiResponse.creatSuccess(taskId);
    }

    @RequestMapping("checkBatchFingerAudiosState.do")
    @ResponseBody
    public ApiResponse checkBatchUploadFingerAudiosState(@RequestParam("taskId")String taskId,
            @RequestBody List<PagesFingerAudiosData> fingerAudiosData) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_SAVE_FINGER_BATCH_DATA_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            throw new ServiceException(task.getError());
        }
        HashMap<String,String> error = new HashMap<>();
        if(task.isFinish() && task.getError() == null) {
            error = map(task.getExtra());

            //KPI 消息 start
            Set<String> errorFileNameMap = error.keySet();
            Set<Long> fingerIdList = fingerAudiosData
                    .stream()
                    .filter(e ->
                            e.getAudioFilesNameAndMatchText()
                                    .stream()
                                    .noneMatch(one -> errorFileNameMap.contains(one.getClientFileName()))
                    ).map(PagesFingerAudiosData::getFingerId).collect(Collectors.toSet());
            if(!fingerIdList.isEmpty()) {
                Set<Long> pageIdList = pageFingerInfoService.listFingerDataPOById(fingerIdList)
                        .stream().map(FingerDataPO::getPageId).collect(Collectors.toSet());
                template.convertAndSend(kpiTopic, JsonWrapper.of(new BatchFingerResourceProductionJob(
                        getAdminSession().getId(),
                        getAdminSession().getPartnerId(),
                        LocalDateTime.now(),
                        pageIdList
                )));
            }
        }

        return ApiResponse.creatSuccess(task);
    }

    @RequestMapping("checkBatchAudiosState.do")
    @ResponseBody
    public ApiResponse checkBatchAudiosState(@RequestParam("taskId") String taskId,
            @RequestBody List<PagesAudiosData> matchingPageFilesArray) throws ServiceException {
        TaskStatusVO task = redisDao.get(ASYNC_BATCH_UPLOAD_AUDIO_DATA_KEY + ":" + taskId, TaskStatusVO.class);
        if (task.isFinish() && task.getError() != null) {
            log.info("------------>> 在redis拿到值为异常");
            throw new ServiceException(task.getError());
        }
        HashMap<String, String> error = new HashMap<>();
        if (task.isFinish() && task.getError() == null) {
            error = map(task.getExtra());
            //KPI 消息 start
            try {
                //取保存成功的pageId
                Set<String> errorFileNameMap = error.keySet();
                Set<Long> pageIdSet = matchingPageFilesArray
                        .stream()
                        .filter(e ->
                                e.getAudioFilesNameAndMatchText()
                                        .stream()
                                        .noneMatch(one -> errorFileNameMap.contains(one.getClientFileName()))
                        ).map(PagesAudiosData::getPageId)
                        .collect(Collectors.toSet());
                //转为POJO, 发送
                template.convertAndSend(kpiTopic, JsonWrapper.of(
                        new BatchReadingResourceProductionJob(
                                getAdminSession().getId(),
                                getAdminSession().getPartnerId(),
                                LocalDateTime.now(),
                                pageIdSet
                        )));
            } catch (Throwable throwable) {
                log.error("cms/savePagesAudios.do?matchingPageFilesArray={}", matchingPageFilesArray);
                log.error("KPI消息发送失败", throwable);
            }
        }

        return ApiResponse.creatSuccess(task);
    }
    /**
     * 音频排序
     **/
    private List<AudioFilesData> sortPageAudios(Map<Integer, AudioFilesData> audios) {

        int size = audios.size();
        List<Map.Entry<Integer, AudioFilesData>> list = new ArrayList<Entry<Integer, AudioFilesData>>(size);

        list.addAll(audios.entrySet());
        Collections.sort(list, new Comparator<Entry<Integer, AudioFilesData>>() {
            @Override
            public int compare(Entry<Integer, AudioFilesData> o1, Entry<Integer, AudioFilesData> o2) {
                return o1.getKey().compareTo(o2.getKey());
            }
        });
        List<AudioFilesData> values = new ArrayList<AudioFilesData>(size);
        for (Entry<Integer, AudioFilesData> entry : list) {

            values.add(entry.getValue());
        }
//        排序后的list
        return values;

    }


    private boolean isNumericzidai(String str) {
        Pattern pattern = Pattern.compile("-?[0-9]+\\.?[0-9]*");
        Matcher isNum = pattern.matcher(str);
        if (!isNum.matches()) {
            return false;
        }
        return true;
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
