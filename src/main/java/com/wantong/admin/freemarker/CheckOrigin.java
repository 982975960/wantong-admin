package com.wantong.admin.freemarker;

import com.wantong.admin.view.BaseController;
import freemarker.core.Environment;
import freemarker.template.*;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * 检测域名所属来源
 */
@FreemarkerPlugin("checkOrigin")
public class CheckOrigin extends BaseController implements TemplateDirectiveModel {

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws TemplateException, IOException {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs.getRequest();
        String domain = request.getServerName();
        SimpleScalar urlSS = (SimpleScalar) params.get("env");
        String prefixDomains = urlSS.toString();
        String[] subDomains =  prefixDomains.split(",");
//        String url = urlSS.toString();
//        int position = url.indexOf(".");
//        if (position > 0) {
//            url = url.substring(0, position);
//        }
        SimpleScalar defSS = (SimpleScalar) params.get("def");
        String desStr = defSS == null ? "" : defSS.toString();

        boolean isValid = false;
        //只要满足一个则验证成功
        for (String subDomain : subDomains){
            if(domain.startsWith(subDomain)){
                isValid = true;
                break;
            }
        }
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
