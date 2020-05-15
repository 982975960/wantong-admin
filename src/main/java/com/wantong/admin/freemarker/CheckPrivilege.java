package com.wantong.admin.freemarker;

import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import freemarker.core.Environment;
import freemarker.template.*;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

@FreemarkerPlugin("checkPrivilege")
public class CheckPrivilege extends BaseController implements TemplateDirectiveModel {


    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws TemplateException, IOException {
        SimpleScalar urlSS = (SimpleScalar) params.get("url");
        String url = urlSS.toString();
        int position = url.indexOf("?");
        if (position > 0) {
            url = url.substring(0, position);
        }

        SimpleScalar defSS = (SimpleScalar) params.get("def");
        String desStr = defSS == null ? "" : defSS.toString();

        AdminSession adminSession = getAdminSession();
        if (adminSession.getPartnerId() != 1) {
            if (url.equals("/app/createnew.do") || url.equals("/app/updatelicenseamount.do") || url.equals("/app/toUpdateResourcePage.do")) {
                Writer out = env.getOut();
                out.write("");
                return;
            }
        }

        boolean isValid = adminSession.canAccessUrl(url);
        if (isValid) {
            if(body != null) {
                body.render(env.getOut());
            }
        } else {
            Writer out = env.getOut();
            out.write(desStr);
        }


    }

}
