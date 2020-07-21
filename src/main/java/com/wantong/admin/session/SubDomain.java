package com.wantong.admin.session;

import java.io.Serializable;
import lombok.Data;
import lombok.ToString;

/**
 * SubDomain 多域名
 *
 * @author : hsc
 * @version : 1.0
 * @date :  2020-05-14 18:37
 **/
@Data
@ToString
public class SubDomain implements Serializable {

    private static final long serialVersionUID = 1L;
    /**
     * 当前的域名前缀 例如: admin
     */
    private String subDomain;
    /**
     * 根据当前登录域名得到的模板 例如：xuexi
     */
    private String style;
    /**
     * 当前的域名 例如：https://admin.51wanxue.com
     */
    private String currentServerName;

}
