package com.wantong.admin.domain.vo;

import com.wantong.config.domain.vo.system.AuthorityVO;
import java.util.List;

/**
 * Menu
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2019-05-14 18:04
 **/
public class Menu {
    private AuthorityVO topMenu;
//    private List<AuthorityVO> sceondsMenu;
    private List<AuthorityVO> sceondsMenu;
    private String img;

    public String getImg() {
        return img;
    }

    public void setImg(String img) {
        this.img = img;
    }

    public AuthorityVO getTopMenu() {
        return topMenu;
    }

    public void setTopMenu(AuthorityVO topMenu) {
        this.topMenu = topMenu;
    }

    public List<AuthorityVO> getSceondsMenu() {
        return sceondsMenu;
    }

    public void setSceondsMenu(List<AuthorityVO> sceondsMenu) {
        this.sceondsMenu = sceondsMenu;
    }
}
