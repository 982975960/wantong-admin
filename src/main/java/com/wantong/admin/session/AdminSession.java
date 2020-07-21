package com.wantong.admin.session;

import com.wantong.common.model.sesssion.SessionUser;
import java.util.List;
import java.util.Set;
import lombok.Data;

/**
 * 后台管理 ADMIN_SESSION
 *
 * @author : hsc
 * @version : 1.0
 * @date :  2018-12-17 15:31
 **/
@Data
public class AdminSession extends SessionUser {
    private static final long serialVersionUID = -3930442955042946621L;
    private long id;
    private long partnerId;
    private String partnerName;
    private Set<String> authorizedUrls;
    private String email;
    private String nbeToken;
    private List<Integer> modelIds;

    public boolean canAccessUrl(String url) {
        return this.authorizedUrls.contains(url);
    }

}
