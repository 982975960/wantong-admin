package com.wantong.admin.domain;

import java.io.Serializable;
import lombok.Data;

/**
 * FileEndpoint 文件域名节点
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-12-05 10:40
 **/
@Data
public class FileEndpoint implements Serializable {
    private Integer dateCenter;
    private String endpoint;
}
