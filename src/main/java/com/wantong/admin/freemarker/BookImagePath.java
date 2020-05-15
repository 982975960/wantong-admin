package com.wantong.admin.freemarker;

import com.wantong.common.storage.StorageConfig;
import freemarker.core.Environment;
import freemarker.template.SimpleScalar;
import freemarker.template.TemplateDirectiveBody;
import freemarker.template.TemplateDirectiveModel;
import freemarker.template.TemplateModel;
import java.io.File;
import java.io.IOException;
import java.io.Writer;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * BookImagePath 默认书本图片路径
 *
 * @author : Forever
 * @version : 1.0
 * @date :  2019-06-20 14:51
 **/
@FreemarkerPlugin("bookImagePath")
public class BookImagePath implements TemplateDirectiveModel {

    @Autowired
    private StorageConfig storageConfig;

    @Override
    public void execute(Environment env, Map params, TemplateModel[] loopVars,
            TemplateDirectiveBody body) throws IOException {
        SimpleScalar modelId = (SimpleScalar) params.get("modelId");
        SimpleScalar bookId = (SimpleScalar) params.get("bookId");
        SimpleScalar imageId = (SimpleScalar) params.get("imageId");
        StringBuffer stringBuffer = new StringBuffer();
        stringBuffer.append(storageConfig.getUploadBook() + File.separator);
        stringBuffer.append(modelId == null ? ""
                : modelId.toString() + File.separator + bookId.toString() + File.separator + imageId);
        Writer out = env.getOut();
        out.write(stringBuffer.toString());
    }
}
