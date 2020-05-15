package com.wantong.admin.view.common;

import com.wantong.common.storage.StorageConfig;
import java.io.File;
import java.io.IOException;
import javax.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@Slf4j
public class DownloadFileController {

    @Autowired
    private StorageConfig storageConfig;

    @RequestMapping("/downloadTempFile.do")
    @ResponseBody
    public void view(@RequestParam("fileName") String fileName,
            @RequestParam(value = "type", defaultValue = "0") int type, HttpServletResponse response)
            throws IOException {
        if (fileName.isEmpty()) {
            response.sendError(500);
        }

        String tempFolder = null;
        if (type == 0) {
            tempFolder = storageConfig.getUploadTemp();
        } else {
            tempFolder = storageConfig.getPcmPath();
        }
        File folderFile = new File(tempFolder);
        if (!folderFile.exists()) {
            response.sendError(500);
        }

        String tempFilePath = tempFolder + File.separator + fileName;
        File tempFile = new File(tempFilePath);
        int length = (int) tempFile.length();
        byte[] imageData = null;
        try {
            imageData = FileUtils.readFileToByteArray(tempFile);
        } catch (IOException ex) {

        }
        if (fileName.endsWith(".mp3")) {
            response.setContentType("audio/mpeg");
            response.setHeader("Accept-Ranges", "bytes");
        }

        response.setContentLength(length);
        response.getOutputStream().write(imageData);
        response.getOutputStream().flush();
    }


}
