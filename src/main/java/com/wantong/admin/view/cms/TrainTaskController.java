package com.wantong.admin.view.cms;

import com.alibaba.dubbo.config.annotation.Reference;
import com.wantong.common.response.ApiResponse;
import com.wantong.common.response.ResponseCode.Base;
import com.wantong.content.service.ITrainTaskService;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;


@Controller
@RequestMapping("/cms")
public class TrainTaskController {

    @Reference
    private ITrainTaskService brsTrainTaskInfoService;


    @RequestMapping("createTask.do")
    @ResponseBody
    public ApiResponse createTask(long modelId, long bookId, int[] trainTypeList) throws Exception {
        if (modelId == 0) {
            return ApiResponse.creatFail(Base.ERROR, "App ID is missing.");
        }
        List<Integer> trainType = new ArrayList<>();
        for (int i = 0; i < trainTypeList.length; i++) {
            trainType.add(trainTypeList[i]);
        }
        List<String> trainTaskIdList = brsTrainTaskInfoService.createTrainTask(modelId, bookId, false, trainType);
        Map<String, List<String>> data = new HashMap<String, List<String>>();
        if (trainTaskIdList == null || trainTaskIdList.size() == 0) {
            return ApiResponse.creatFail(Base.ERROR, "创建训练id失败", "");
        }
        data.put("trainTaskId", trainTaskIdList);
        return ApiResponse.creatSuccess(data);
    }


    @RequestMapping("publishAll.do")
    @ResponseBody
    public ApiResponse startTrainTask(long modelId) throws Exception {
        if (modelId == 0) {
            return ApiResponse.creatFail(Base.ERROR, "model ID is missing.");
        }
        brsTrainTaskInfoService.startTrainTask(modelId);

        return ApiResponse.creatSuccess();
    }
}
