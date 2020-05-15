package com.wantong.admin.view.card;

import static org.apache.commons.io.IOUtils.toByteArray;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import com.wantong.card.domain.po.CardGroupInfoPO;
import com.wantong.card.domain.vo.CardImageInfoVO;
import com.wantong.card.service.IBrsCardGroupInfoService;
import com.wantong.card.service.IBrsImageInfoService;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.file.FileHeadUtils;
import com.wantong.nativeservice.service.IImgProcessService;
import java.io.*;
import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

/**
 * 卡片相关的控制层
 *
 * @author ly
 * @date 2020-03-26
 */
@Controller
@RequestMapping("/card")
@Slf4j
public class CardImageController extends BaseController {

    public static final String JPG_SUFFIX = ".jpg";

    public static final String PERSPECTIVE_SUFIX = "_perspective_v2";

    @Reference
    private IBrsImageInfoService imageInfoService;

    @Autowired
    private StorageConfig storageConfig;

    @Reference
    private IBrsCardGroupInfoService groupInfoService;

    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @Reference
    private IImgProcessService imgProceService;


    @RequestMapping("saveCardInfo.do")
    @ResponseBody
    public ApiResponse savePageInfo(@RequestBody CardImageInfoVO vo, Model model)
            throws ServiceException {
        AdminSession adminSession = getAdminSession();
        Map<String, Object> data = new HashMap<String, Object>();
        Long cardId = imageInfoService.saveCardInfo(vo);
        data.put("cardId", cardId);

        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("fingerBook.do")
    @ResponseBody
    public ModelAndView fingerBook() throws ServiceException {
        ModelAndView mv = new ModelAndView("/card/fingerBook");

        return mv;
    }

    @RequestMapping("saveFingerPosition.do")
    @ResponseBody
    public ApiResponse saveFingerPosition(@RequestParam("imageId") Long imageId,
            @RequestParam("position") String position) {

        imageInfoService.updateFingerPosition(imageId, position);

        return ApiResponse.creatSuccess();
    }

    /**
     * 生成卡片标定透视图
     *
     * @param response
     * @param groupId
     * @param imageId
     */
    @RequestMapping("perspectiveImg.do")
    public String perspectiveImg(HttpServletResponse response, @RequestParam("groupId") Long groupId,
            @RequestParam("imageId") String imageId) throws Exception {
        CardGroupInfoPO po = groupInfoService.getCardGroupInfoById(groupId);
        Long modelId = po.getModelId();

        String folderPath = storageConfig.getCardBasePath() + File.separator + modelId + File.separator + groupId
                + File.separator;
        //服务器图片
        String path = folderPath + imageId + JPG_SUFFIX;
        String targetPath = folderPath + imageId + PERSPECTIVE_SUFIX + JPG_SUFFIX;
        File targetFile = new File(targetPath);
        if (!targetFile.exists()) {
            String os = System.getProperty("os.name");
            if (os.toLowerCase().startsWith("win")) {
                //WIN系统不做处理
            } else {
                //不存在透视图则转换生成
                //卡片暂时用低清图的生成方式
                byte[] btImg2 = processPerspective(path, 0);
                if (!targetFile.getParentFile().exists()) {
                    targetFile.getParentFile().mkdirs();
                }

                try (OutputStream out = new FileOutputStream(targetPath)) {
                    out.write(btImg2);
                    out.flush();
                }
            }
        }

        return "redirect:" + thirdPartyConfig.getFileEndpoint() + storageConfig.getCardImagePath()
                + File.separator + modelId + File.separator + groupId + File.separator + imageId + PERSPECTIVE_SUFIX
                + JPG_SUFFIX + "?t=" + System.currentTimeMillis();
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
                log.info("source img path:{},type:{}", path, hexType);
                throw new ServiceException(ServiceError.creatFail(Base.API_DISABLE, "封面图片格式不对,请记录该书本数据."));
            }
            //算法处理后的二进制数据
            btImg2 = imgProceService.nImgPreviewProc(data, imgType);
        }

        return btImg2;
    }

}
