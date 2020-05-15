package com.wantong.admin.view.common;

import com.alibaba.fastjson.JSONArray;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.AudioTools;
import com.wantong.common.utils.file.FileHeadUtils;
import com.wantong.common.utils.file.FileUtil;
import com.wantong.content.domain.vo.PageInfoVO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.imageio.ImageIO;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STVerticalAlignRun.Factory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Controller
@Slf4j
public class UploadController {

    @Autowired
    private StorageConfig storageConfig;

    @RequestMapping("/upload.do")
    @ResponseBody
    public ApiResponse upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "check", required = false, defaultValue = "false") boolean check,
            @RequestParam(value = "checkScale", required = false, defaultValue = "false") boolean checkScale,
            @RequestParam(value = "isMp3", required = false, defaultValue = "false") boolean isMp3,
            @RequestParam(value = "isVoice", required = false, defaultValue = "false") boolean isVoice,
            HttpServletResponse response) {
        if (file.isEmpty()) {
            return ApiResponse.creatFail(Base.ERROR, "请求文件不存在", "");
        }
        if (check) {
            String imageType = "jpg".toLowerCase();
            String type = "";
            try {
                type = FileHeadUtils.getFileType(file).toLowerCase();
            } catch (Exception e) {
                return ApiResponse.creatFail(Base.ERROR, "请上传jpeg格式的文件，如img.jpg或img.jpeg等", "");
            }
            if ("".equals(type)) {
                return ApiResponse.creatFail(Base.ERROR, "请上传jpeg格式的文件，如img.jpg或img.jpeg等", "");
            }
            if (!type.contains(imageType)) {
                return ApiResponse.creatFail(Base.ERROR, "请上传jpeg格式的文件，如img.jpg或img.jpeg等", "");
            }
        }
        if (checkScale) {
            try {
                if (!judgeImgPixel(file)) {
                    return ApiResponse.creatFail(Base.ERROR, "图片比例不符合要求(16:9 或者 4:3)", "");
                }
            } catch (Exception e) {
                return ApiResponse.creatFail(Base.ERROR, "图片比例不符合要求(16:9)", "");
            }
        }
  
        if (isMp3) {
            try {
                file = audioCompression(file,isVoice);
            }catch (Exception e){
               log.error("异常",e);
               return ApiResponse.creatFail(Base.ERROR,"上传文件非Mp3","");
            }
        }
        String tempFolder = null;
        tempFolder = storageConfig.getUploadTemp();
        FileUtil.createFolderIfNotExist(tempFolder);
        String uuid = UUID.randomUUID().toString();
        String name = file.getOriginalFilename();
        int position = name.lastIndexOf('.');
        String fileExtension = name.substring(position + 1).replace("blod","jpg");
        String tempFileName = uuid + "." + fileExtension;
        String tempFilePath = tempFolder + File.separator + tempFileName;
        try {
            FileUtils.copyInputStreamToFile(file.getInputStream(), new File(tempFilePath));
        } catch (IOException ex) {
            return ApiResponse.creatFail(Base.ERROR, "上传文件失败", "");
        }

        Map<String, String> data = new HashMap<String, String>();
        data.put("fileName", tempFileName);
        data.put("clientFileName", name);
        return ApiResponse.creatSuccess(data);
    }

    @RequestMapping("/uploadFolder.do")
    @ResponseBody
    public  ApiResponse uploadFolder(@RequestParam("file") MultipartFile file,@RequestParam("pagesJson")String pagesJson){

        if (file.isEmpty()) {
            return ApiResponse.creatFail(Base.ERROR, "请求文件不存在", "");
        }
        if(pagesJson.isEmpty()){
            return  ApiResponse.creatFail(Base.ERROR,"书本没有书页,请添加书本书页");
        }

        JSONArray array = JSONArray.parseArray(pagesJson);
        List<PageInfoVO> pages = array.toJavaList(PageInfoVO.class);

        Map<Long,String> pageMessage = new HashMap<>();

        pageMessage = pages.stream().collect(Collectors.toMap(PageInfoVO::getId,pageInfoVO->pageInfoVO.getPhysicalIndex()+"-"+pageInfoVO.getPhysicalState()));

        for (Long key : pageMessage.keySet()){
             System.out.println("key="+key+"and value = "+pageMessage.get(key));
        }

        //零时文件目录
       String tempFolder = storageConfig.getUploadTemp();

       String tempFilePath = tempFolder + File.separator + file.getOriginalFilename();
       try {
           FileUtils.copyInputStreamToFile(file.getInputStream(), new File(tempFilePath));
       } catch (IOException ex) {
           return ApiResponse.creatFail(Base.ERROR, "上传文件失败", "");
       }

       return null;
    }

    private boolean judgeImgPixel(MultipartFile file) throws Exception {
        BufferedImage bi = null;
        try {
            bi = ImageIO.read(file.getInputStream());
        } catch (Exception e) {

        }
        int width = bi.getWidth();
        double fWidth = (double) width;
        int height = bi.getHeight();
        double fHeight = (double) height;
        double scale = fWidth / fHeight;
        double scale2 = 16.0 / 9.0;
        double scale3 = 4.0 / 3.0;

        if (scale != scale2 && scale!=scale3) {
            return false;
        }
        return true;
    }


    /**
     * audioCompression mp3音频压缩
     *
     * @param file  MultipartFile
     * @param isVoice boolean 是否是配音
     */
    private MultipartFile  audioCompression(MultipartFile file ,boolean isVoice) throws Exception,IOException{

        MultipartFile compressionFile = null;

        String compressSourceFileName = UUID.randomUUID().toString()+".mp3";
        String compressSourceFilePath = storageConfig.getUploadTemp() + File.separator + compressSourceFileName;
        File path = new File(compressSourceFilePath);
        try {
            FileUtils.copyInputStreamToFile(file.getInputStream(),path);
        }catch (IOException e){
            log.error("UploadController(audioCompression)：音频文件的MultipartFile写入"+path+"失败",e);
        }
        // 把目标文件 file.getOriginalFilename() 修改成UUID 避免产生相同名文件
        File targetFile =new File(storageConfig.getUploadTemp() + File.separator + UUID.randomUUID().toString());

        File result = null;
        try {
            result = AudioTools.compressMp3(path,targetFile,isVoice);
        }catch (Exception e){

             log.error("UploadController(audioCompression):使用AudioTools音频工具来压缩MP3异常",e);
             throw new Exception("文件格式非Mp3");
        }
        FileInputStream fileInputStream = new FileInputStream(result);
        try {

            System.out.println(result.getName());
            compressionFile =new MockMultipartFile(result.getName(),file.getOriginalFilename(),(String)null,fileInputStream);


        }catch (FileNotFoundException e){

            log.error("UploadController(audioCompression):压缩过的文件异常FileNotFoundException:",e);
        }catch (IOException e){
            log.error("UploadController(audioCompression):压缩过的文件异常IOException:",e);
        }finally {
            fileInputStream.close();

            //删传零时创建的文件
            if(targetFile.exists()) {
                FileUtils.forceDelete(targetFile);
            }
            if(path.exists()) {
                FileUtils.forceDelete(path);
            }
        }


        return  compressionFile;
    }

}
