package com.wantong.admin.domain;

import java.io.Serializable;
import java.util.List;
import lombok.Data;

/**
 * PartnerModelInfo 合作商图片库限制
 *
 * @author : jsj
 * @version : 1.0
 * @date :  2020-06-24 12:16
 **/
@Data
public class PartnerModelInfo implements Serializable {

    private Integer partnerId;
    private List<Integer> modelId;
}
