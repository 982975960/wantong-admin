package com.wantong.admin.freemarker;

import freemarker.core.Environment;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateModel;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;

@FreemarkerPlugin("link")
public class Link implements TemplateDirectiveModel {

    private static final String DEFAULT_REL = "stylesheet";
    private static final String DEFAULT_TYPE = "text/css";

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws IOException {
        String rel = DEFAULT_REL;
        if (params.containsKey("rel")) {
            rel = params.get("rel").toString();
        }

        String type = DEFAULT_TYPE;
        if (params.containsKey("type")) {
            type = params.get("type").toString();
        }

        String media = null;
        if (params.containsKey("media")) {
            media = params.get("media").toString();
        }

        String href = params.get("href").toString();

        Writer out = env.getOut();
        renderForProductionMode(out, rel, type, href, media);
    }

    private void renderForProductionMode(Writer out, String rel, String type, String href,
            String media) throws IOException {
        String buildNumber = CustomEnvironment.getBuildNumber();
        StringBuffer outString = new StringBuffer();
        outString.append("<link ");
        outString.append(" rel=\"" + rel + "\" ");
        outString.append(" type=\"" + type + "\" ");
        outString.append(" href=\"" + CustomEnvironment.getStaticPath() + href + "?v="
                + buildNumber + "\" ");
        if (media != null) {
            outString.append(" media=\"" + media + "\" ");
        }
        outString.append("/>");
        out.write(outString.toString());
    }
}
