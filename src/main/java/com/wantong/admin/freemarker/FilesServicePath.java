package com.wantong.admin.freemarker;

import com.wantong.admin.config.ThirdPartyConfig;
import com.wantong.common.storage.StorageConfig;
import freemarker.core.Environment;
import freemarker.template.*;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

@FreemarkerPlugin("filesServicePath")
public class FilesServicePath implements TemplateDirectiveModel {

    @Autowired
    private ThirdPartyConfig thirdPartyConfig;

    @Autowired
    private StorageConfig storageConfig;

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws TemplateException, IOException {
        SimpleScalar relativePathSS = (SimpleScalar) params.get("src");
        SimpleScalar cardImage = (SimpleScalar) params.get("cardImage");
        SimpleScalar bookImage = (SimpleScalar) params.get("bookImage");
        boolean isCardImage = cardImage == null ? false : true;
        boolean isBookImage = bookImage == null ? false : true;
        String relativePath = "";

        if (isCardImage) {
            relativePath =  storageConfig.getCardImagePath() + "/" + relativePathSS.getAsString();

        } else {
            relativePath = isBookImage ? storageConfig.getBookImagePath() + "/" + relativePathSS.getAsString()
                    : relativePathSS.getAsString();
        }
        if (relativePath.charAt(0) == '/') {
            relativePath = relativePath.substring(1);
        }
        String filesServiceEndPoint = thirdPartyConfig.getFileEndpoint();
        if (filesServiceEndPoint.charAt(filesServiceEndPoint.length() - 1) == '/') {
            filesServiceEndPoint = filesServiceEndPoint.substring(0, filesServiceEndPoint.length() - 1);
        }
        String absolutePath = filesServiceEndPoint + '/' + relativePath;
        Writer out = env.getOut();
        out.write(absolutePath);
    }

}
