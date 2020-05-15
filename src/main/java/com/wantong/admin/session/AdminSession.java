package com.wantong.admin.session;

import com.wantong.common.model.sesssion.SessionUser;
import java.util.Set;

/**
 * 后台管理 ADMIN_SESSION
 *
 * @author : hsc
 * @version : 1.0
 * @date :  2018-12-17 15:31
 **/
public class AdminSession extends SessionUser {

    private long id;
    private long partnerId;
    private String partnerName;
    private Set<String> authorizedUrls;
    private String email;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getPartnerId() {
        return partnerId;
    }


    public String getPartnerName() {
        return partnerName;
    }

    public void setPartnerName(String partnerName) {
        this.partnerName = partnerName;
    }

    public void setPartnerId(long partnerId) {
        this.partnerId = partnerId;
    }

    public Set<String> getAuthorizedUrls() {
        return authorizedUrls;
    }

    public void setAuthorizedUrls(Set<String> authorizedUrls) {
        this.authorizedUrls = authorizedUrls;
    }

    public boolean canAccessUrl(String url) {
        return this.authorizedUrls.contains(url);
    }

}
