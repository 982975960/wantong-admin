package com.wantong.admin.freemarker;


import freemarker.core.Environment;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateModel;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

@FreemarkerPlugin("script")
public class Script implements TemplateDirectiveModel {


    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws IOException {
        String sourceSrc = params.get("src").toString();
        Writer out = env.getOut();
        renderForDebugMode(out, sourceSrc);
    }

    private void renderForDebugMode(Writer out, String src) throws IOException {
        out.write("<script type=\"text/javascript\" src=\"" + CustomEnvironment
                .getStaticPath() + src + "?v=" + CustomEnvironment.getBuildNumber()
                + "\"></script>");
    }
}