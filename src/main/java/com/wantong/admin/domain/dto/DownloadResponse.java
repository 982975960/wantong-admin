package com.wantong.admin.domain.dto;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

/**
 * @author 刘建宇
 * @date 2019/9/23
 */
public class DownloadResponse {
    public static ResponseEntity of(byte[] file, String name){
        String fileName = name;
        try {
            fileName = URLEncoder.encode(name, "utf-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", fileName);
        headers.setContentLength(file.length);

        return new ResponseEntity(file, headers, HttpStatus.OK);
    }
}
