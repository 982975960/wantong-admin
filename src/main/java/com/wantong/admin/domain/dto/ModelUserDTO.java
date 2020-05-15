package com.wantong.admin.domain.dto;

import lombok.Data;

import java.io.Serializable;
import java.sql.Date;


@Data
public class ModelUserDTO implements Serializable {
    private Long id;
    private String name;
    private Integer state;
    private Long partnerId;
    private Long createAdminId;
    private Date createTime;

    private String partnerName;
    private String email;
}
