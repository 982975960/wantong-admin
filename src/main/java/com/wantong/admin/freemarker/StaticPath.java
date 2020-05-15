package com.wantong.admin.freemarker;

import freemarker.core.Environment;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateModel;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

@FreemarkerPlugin("staticPath")
public class StaticPath implements TemplateDirectiveModel {

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws IOException {
        Writer out = env.getOut();
        out.write(CustomEnvironment.getStaticPath());
    }
}
