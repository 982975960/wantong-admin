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
 * 检测是否默认主题
 */
@FreemarkerPlugin("checkDefaultTheme")
public class CheckDefaultTheme extends BaseController implements TemplateDirectiveModel {

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws TemplateException, IOException {
        SimpleScalar urlSS = (SimpleScalar) params.get("env");
        String prefixDomains = urlSS.toString();

        //是否需要匹配 默认false就是返回默认
        SimpleScalar match = (SimpleScalar) params.get("match");
        boolean matchBool = match != null && Boolean.parseBoolean(match.toString());

        SimpleScalar defSS = (SimpleScalar) params.get("def");
        String desStr = defSS == null ? "" : defSS.toString();
        boolean isValid = "original".equals(prefixDomains);
        //反转状态
        isValid = matchBool != isValid;
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
