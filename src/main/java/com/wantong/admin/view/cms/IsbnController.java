package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.alibaba.fastjson.JSONObject;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.common.storage.StorageConfig;
import com.wantong.content.domain.vo.BookFromNetPO;
import com.wantong.content.service.IBrsSearchBookService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.List;

/**
 * @author free
 */
@RestController
public class IsbnController {

    private Logger logger = LoggerFactory.getLogger(IsbnController.class);
    @Autowired
    private StorageConfig storageConfig;
    @Autowired
    private RestTemplate restTemplate;
    @Reference
    private IBrsSearchBookService searchBookService;

    @RequestMapping("/cms/netBookInfo.do")
    public ApiResponse getNetBookInfo(@RequestParam("isbn") String isbn) {
        List<BookFromNetPO> bookFromNetPOS = searchBookService.searchBookFromNet(isbn);
        if (bookFromNetPOS == null || bookFromNetPOS.size() == 0){
            return ApiResponse.creatFail(Base.ERROR, isbn);
        }
        BookFromNetPO bookFromNetPO = bookFromNetPOS.get(0);
        JSONObject result = new JSONObject();
        result.put("title", bookFromNetPO.getTitle());
        result.put("author", bookFromNetPO.getAuthor());
        result.put("isbn", isbn);
        result.put("publisher", bookFromNetPO.getPublisher());
        result.put("seriesTitle", bookFromNetPO.getSeriesTitle());
        result.put("summary", bookFromNetPO.getSummary());
        result.put("image", bookFromNetPO.getImage());
        return ApiResponse.creatSuccess(result);
    }
}