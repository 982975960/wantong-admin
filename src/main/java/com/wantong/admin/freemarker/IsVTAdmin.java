package com.wantong.admin.freemarker;

import com.wantong.admin.session.AdminSession;
import com.wantong.admin.view.BaseController;
import freemarker.core.Environment;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateException;
import freemarker.template.TemplateModel;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

@FreemarkerPlugin("isVTAdmin")
public class IsVTAdmin extends BaseController implements TemplateDirectiveModel {

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws TemplateException, IOException {

        AdminSession adminSession = getAdminSession();
        boolean isVTAdmin = adminSession.getPartnerId() == 1;

        if (true) {
            body.render(env.getOut());
        } else {
            Writer out = env.getOut();
            out.write("");
        }

    }

}
