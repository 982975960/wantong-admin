package com.wantong.admin.tts;


import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONException;
import com.alibaba.fastjson.JSONObject;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.wantong.admin.config.MultiRolesConfig;
import com.wantong.admin.config.TuringConfig;
import com.wantong.common.exception.ServiceException;
import com.wantong.common.response.ServiceError;
import com.wantong.common.storage.StorageConfig;
import com.wantong.common.utils.AudioTools;
import com.wantong.common.utils.encrypt.AESUtils;
import com.wantong.common.utils.file.FileTypeUtils;
import com.wantong.common.utils.json.JsonUtil;
import com.wantong.content.domain.turingos.Content;
import com.wantong.content.domain.turingos.Data;
import com.wantong.content.domain.turingos.JsonRootBean;
import com.wantong.content.domain.turingos.UserInfo;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.lame.ConvertUtil;
import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.NameValuePair;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ws.schild.jave.EncoderException;

/**
 * TTSServiceImpl tts合成
 *
 * @author : Stan
 * @version : 1.0
 * @date :  2018-11-08 18:04
 **/
@Slf4j
@Service("test")
public class TTSServiceImpl {

    private static Logger logger = LoggerFactory.getLogger(TTSServiceImpl.class);

    private static String token = "";

    private static final String API_KEY = "43bd1bf5e5bd4256a1a54f44439c3e6f";

    @Autowired
    private TuringConfig turingConfig;

    @Autowired
    private StorageConfig storageConfig;

    @Autowired
    private TuringHttpClientHolder turingHttpClientHolder;

    @Autowired
    private MultiRolesConfig multiRolesConfig;

    public String ttsConvert(String text, int tone, boolean useIntelligenceTTS)
            throws ServiceException {
        String ttsPath = getEndpoint(useIntelligenceTTS);

        CloseableHttpClient httpClient = null;
        CloseableHttpResponse httpResponse = null;
        try {
            httpClient = turingHttpClientHolder.getCloseableHttpClient();
            RequestConfig requestConfig = RequestConfig.DEFAULT;
            HttpPost httpPost = new HttpPost(ttsPath);
            httpPost.setHeader("Content-Type", "application/json");
            httpPost.setConfig(requestConfig);

            String data = getRequestParameterJson(useIntelligenceTTS, text, tone);
            StringEntity entity = new StringEntity(data, "UTF-8");
            entity.setContentType("application/json");

            httpPost.setEntity(entity);
            httpResponse = httpClient.execute(httpPost);
            HttpEntity responseEntity = httpResponse.getEntity();
            if (responseEntity != null) {
                String url = parseResponse(useIntelligenceTTS, responseEntity);
                if (url != null) {
                    String tempFileName = useIntelligenceTTS ? downloadPcmToMp3(url) : downloadMp3(url);
                    if (tempFileName == null) {
//                        throw new ServiceException(ErrorCode.ERROR_20054);
                        throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
                    }

                    //压缩音频文件
                    tempFileName = compressedIntelligentAudio(tempFileName);

                    return tempFileName;
                } else {
                    logger.error("get tts download data error");
//                    throw new ServiceException(ErrorCode.ERROR_20054);
                    throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
                }
            }
        } catch (Exception ex) {
            log.error("Call turning API to do TTS convert meet error: ", ex);
//            throw new ServiceException(ErrorCode.ERROR_20054);
            throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
        } finally {
            try {
                if (httpResponse != null) {
                    httpResponse.close();
                }
            } catch (Exception ex) {

            }
        }

//        throw new ServiceException(ErrorCode.ERROR_20054);
        throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
    }


    public String ttsDataBaker(String text, int tone) throws ServiceException {

        String ttsPath = getDBTtsPath();
        CloseableHttpClient httpClient = HttpClients.createDefault();
        CloseableHttpResponse httpResponse = null;
        String tempFileName = null;
        try {
            HttpPost httpPost = new HttpPost(ttsPath);
            List<NameValuePair> navList = getList(text);
            httpPost.setEntity(new UrlEncodedFormEntity(navList, "utf-8"));
            httpResponse = httpClient.execute(httpPost);
            log.info("audioURL:{}，参数：{}",httpPost.getURI(),navList.toString());
            int code = httpResponse.getStatusLine().getStatusCode();
            if (code == HttpStatus.SC_OK) {
                String contentType = httpResponse.getEntity().getContentType().getValue();
                if ("application/json".equals(contentType)) {
                    throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
                } else {
                    tempFileName = SaveDBTTS(httpResponse.getEntity().getContent());
                }

            }
            if (tempFileName == null) {
                throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
            }

        } catch (Exception e) {
            throw new ServiceException(ServiceError.creatFail("TTS convert failed."));
        } finally {
            try {
                if (httpResponse != null) {
                    httpResponse.close();
                }
            } catch (Exception ex) {

            }
        }

        //压缩音频文件
        tempFileName = compressedIntelligentAudio(tempFileName);

        return tempFileName;
    }

    private String parseResponse(boolean useIntelligenceTTS, HttpEntity responseEntity)
            throws Exception {
        String url = null;
        String contentType = responseEntity.getContentType().getValue();
        if (contentType.indexOf("application") >= 0) {
            String response = EntityUtils.toString(responseEntity);
            JSONObject json = JSONObject.parseObject(response);
//
            if (useIntelligenceTTS) {
                int resultCode = json.getJSONObject("intent").getIntValue("code");
                if (resultCode != 50101) {
                    return null;
                }
                url = json.getJSONArray("results").getJSONObject(0)
                        .getJSONObject("values").getJSONArray("ttsUrl").toString();
            } else {
                int resultCode = json.getIntValue("code");
                if (resultCode != 200) {
                    String tokenTemp = json.getString("token");
                    if (tokenTemp != null) {
                        token = tokenTemp;
                    }
                    return null;
                }
                String tokenTemp = json.getString("token");
                if (tokenTemp != null) {
                    token = tokenTemp;
                }
                JSONArray urls = json.getJSONArray("url");
                url = urls.get(0).toString();
            }
        }
        return url;
    }

    private String getDBTtsPath() {
        StringBuilder url = new StringBuilder();
        url.append(multiRolesConfig.getServer()).append("tts1.0");

        return url.toString();
    }

    private String getEndpoint(boolean useIntelligenceTTS) {
        String url;
        if (useIntelligenceTTS) {
            String endpoint = turingConfig.getIntelligence();
            url = endpoint;
        } else {
            String endpoint = turingConfig.getEndpoint();
            if (endpoint.charAt(endpoint.length() - 1) == '/') {
                endpoint = endpoint.substring(0, endpoint.length() - 1);
            }
            url = endpoint + "/speech/v2/tts";
        }
        return url;
    }

    private String downloadPcmToMp3(String strURL) {
        JSONArray urls = null;
        try {
            urls = JSONArray.parseArray(strURL);
            if (urls.size() <= 0) {
                return null;
            }
        } catch (JSONException e) {
            e.printStackTrace();
            return null;
        }
        String tempFolder = storageConfig.getUploadTemp();
        List<String> files = new ArrayList<>(urls.size());
        for (int i = 0; i < urls.size(); i++) {
            URL url = null;
            HttpURLConnection conn = null;
            InputStream is = null;
            InputStream bis = null;
            FileOutputStream fos = null;
            try {
                url = new URL(urls.getString(i));
                conn = (HttpURLConnection) url.openConnection();
                conn.setConnectTimeout(3 * 1000);
                is = conn.getInputStream();
                bis = new BufferedInputStream(is);
                bis.mark(bis.available());
                boolean isMp3 = FileTypeUtils.fileIsMp3(bis);
                bis.reset();
                //先生成w文件
                //先生成w文件
                String fileNameMp3 = UUID.randomUUID().toString() + ".pcm";

                String tempFolderMp3 = tempFolder + "/" + fileNameMp3;
                File file = new File(tempFolderMp3);
                file.createNewFile();
                fos = new FileOutputStream(file);
                byte[] buffer = new byte[5 * 1024];
                int readLength = 0;
                while ((readLength = bis.read(buffer, 0, buffer.length)) != -1) {
                    fos.write(buffer, 0, readLength);
                }
                files.add(tempFolderMp3);
            } catch (IOException ex) {
                ex.printStackTrace();
                return null;
            } catch (JSONException ex) {
                ex.printStackTrace();
                return null;
            } finally {
                try {
                    if (bis != null) {
                        bis.close();
                    }
                    if (fos != null) {
                        fos.close();
                    }
                    if (is != null) {
                        is.close();
                    }
                    if (conn != null) {
                        conn.disconnect();
                    }
                } catch (IOException ex) {

                }
            }
        }
        //如果不是MP3则从新写入，并删除旧文件
        String fileNameRealMp3 = UUID.randomUUID().toString() + ".mp3";
        String tempFolderRealMp3 = tempFolder + "/" + fileNameRealMp3;
        String tempFolderRealWav = tempFolder + "/" + UUID.randomUUID().toString() + ".wav";
        try {
            logger.debug(String.format("合成wav: %s  wav: %s", files.toString(), tempFolderRealWav));
            if (files.size() != 1) {
                ConvertUtil.mergePCMFilesToWAVFile(files, tempFolderRealWav);
            } else {
                FileTypeUtils.pcmToWav(new File(files.get(0)), tempFolderRealWav);
            }
            logger.debug(String.format("转换mp3: %s  mp3: %s", tempFolderRealWav, tempFolderRealMp3));
            FileTypeUtils.wavToMp3(new File(tempFolderRealWav), tempFolderRealMp3);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        files.stream().forEach(f -> FileTypeUtils.deleteFile(f));
        FileTypeUtils.deleteFile(tempFolderRealWav);

        return fileNameRealMp3;
    }

    private String downloadMp3(String strURL) {
        URL url = null;
        HttpURLConnection conn = null;
        InputStream is = null;
        InputStream bis = null;
        FileOutputStream fos = null;
        try {
            url = new URL(strURL);
            conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(3 * 1000);
            is = conn.getInputStream();
            bis = new BufferedInputStream(is);
            //在调用mark的地方做上标记,参数readlimit说明在读取readlimit个字符后书签做废,使用reset后回到标记的位置.
            bis.mark(bis.available());
            boolean isMp3 = FileTypeUtils.fileIsMp3(bis);
            bis.reset();
            //先生成w文件
            String fileNameMp3 = UUID.randomUUID().toString() + ".mp3";
            String tempFolder = null;
            tempFolder = storageConfig.getUploadTemp();
            String tempFolderMp3 = tempFolder + "/" + fileNameMp3;
            File file = new File(tempFolderMp3);
            file.createNewFile();
            fos = new FileOutputStream(file);
            byte[] buffer = new byte[5 * 1024];
            int readLength = 0;
            while ((readLength = bis.read(buffer, 0, buffer.length)) != -1) {
                fos.write(buffer, 0, readLength);
            }
            if (!isMp3) {
                //如果不是MP3则从新写入，并删除旧文件
                String fileNameRealMp3 = UUID.randomUUID().toString() + ".mp3";
                String tempFolderRealMp3 = tempFolder + "/" + fileNameRealMp3;
                FileTypeUtils.wavToMp3(file, tempFolderRealMp3);
                if (fos != null) {
                    fos.close();
                }
                FileTypeUtils.deleteFile(tempFolderMp3);
                fileNameMp3 = fileNameRealMp3;
            }
            return fileNameMp3;
        } catch (IOException ex) {
            return null;
        } catch (EncoderException ex) {
            log.error("转换MP3异常", ex);
            return null;
        } finally {
            try {
                if (bis != null) {
                    bis.close();
                }
                if (fos != null) {
                    fos.close();
                }
                if (is != null) {
                    is.close();
                }
                if (conn != null) {
                    conn.disconnect();
                }
            } catch (IOException ex) {

            }
        }
    }

    private String SaveDBTTS(InputStream stream) {
        InputStream is = null;
        InputStream bis = null;
        FileOutputStream fos = null;
        try {
            is = stream;
            bis = new BufferedInputStream(is);
            bis.mark(bis.available());
            boolean isMp3 = FileTypeUtils.fileIsMp3(bis);
            bis.reset();
            //先生成w文件
            String fileNameMp3 = UUID.randomUUID().toString() + ".mp3";
            String tempFolder = null;
            tempFolder = storageConfig.getUploadTemp();
            String tempFolderMp3 = tempFolder + "/" + fileNameMp3;
            File file = new File(tempFolderMp3);
            file.createNewFile();
            fos = new FileOutputStream(file);
            byte[] buffer = new byte[5 * 1024];
            int readLength = 0;
            while ((readLength = bis.read(buffer, 0, buffer.length)) != -1) {
                fos.write(buffer, 0, readLength);
            }

            return fileNameMp3;
        } catch (IOException ex) {
            return null;
        } finally {
            try {
                if (bis != null) {
                    bis.close();
                }
                if (fos != null) {
                    fos.close();
                }
                if (is != null) {
                    is.close();
                }
            } catch (IOException ex) {

            }
        }

    }

    private String getRequestParameterJson(boolean useIntelligenceTTS, String text, int tone) {
        String value = null;
        String timestamp = String.valueOf(System.currentTimeMillis());

        if (useIntelligenceTTS) {
            JsonRootBean jsonRootBean = new JsonRootBean();
            Data data = new Data();
            Content content = new Content();
            UserInfo userInfo = new UserInfo();
            userInfo.setUniqueId(turingConfig.getApikeyanduniqueId());
            List<Integer> list = new LinkedList<>();
            list.add(turingConfig.getUsecode());
            userInfo.setUseCodes(list);
            //去掉换行符
            String str = text.replace("\r|\n", "");
            content.setData(str);
            List<Content> contents = new LinkedList<>();
            contents.add(content);
            data.setContent(contents);
            data.setUserInfo(userInfo);
            jsonRootBean.setData(data);
            jsonRootBean.setTimestamp(timestamp);
            jsonRootBean.setKey(turingConfig.getApikeyanduniqueId());
            String jsonUtil = JsonUtil.toJSONString(jsonRootBean);
            value = jsonUtil;
            System.out.println(jsonUtil);

        } else {
            ObjectNode rootNode = new ObjectNode(JsonNodeFactory.instance);
            String apiKey = "fa696d6e4a054fbd94b0479a3f560ed2";
            String uid = getUID(apiKey);
            ObjectNode parameterNode = rootNode.putObject("parameters");
            switch (tone) {
                case 2:
                    parameterNode.put("volume", 9);
                    break;
                case 10:
                    parameterNode.put("volume", 6);
                    break;
                case 11:
                    parameterNode.put("volume", 9);
                    break;
                case 5:
                    parameterNode.put("volume", 6);
                    break;
                default:
                    break;
            }
            parameterNode.put("ak", apiKey);
            parameterNode.put("text", text);
            parameterNode.put("asr", 0);
            parameterNode.put("tts", 2);
            parameterNode.put("tts_lan", 0);
            parameterNode.put("tone", tone);
            parameterNode.put("speed", 3);
            parameterNode.put("flag", 3);
            parameterNode.put("uid", uid);
            parameterNode.put("token", token);
            ObjectMapper mapper = new ObjectMapper();
            try {
                value = mapper.writeValueAsString(rootNode);
            } catch (Exception ex) {

            }
        }

        return value;
    }

    private String getUID(String apiKey) {
        String uid = "ai10000000000001";
        String iv = apiKey.substring(0, 16);
        return AESUtils.encrypt(uid, "Y970Vb28g4n07719", iv, AESUtils.AES_MODEL_AES_CBC_NOPADDING);
    }

    private List<NameValuePair> getList(String text) {
        int speed = 3;
        int volume = 5;
        int pitch = 5;
        List<NameValuePair> list = new ArrayList<>();
        //用户id
        list.add(new BasicNameValuePair("user_id", "speech"));
        list.add(new BasicNameValuePair("access_token", "speech"));
        //合成内容
        list.add(new BasicNameValuePair("text", text));
        //文本语言
        list.add(new BasicNameValuePair("language", "zh"));
        //领域 如导航 客服 目前固定值1
        list.add(new BasicNameValuePair("domain", "1"));
        ///语速 0-9 默认是5
        list.add(new BasicNameValuePair("speed", "" + speed));
        //音量 0-9  默认是5
        list.add(new BasicNameValuePair("volume", "" + volume));
        //音调 0-9 默认是5
        list.add(new BasicNameValuePair("pitch", "" + pitch));
        list.add(new BasicNameValuePair("audiotype", "3"));
        list.add(new BasicNameValuePair("voice_name","甜美女声"));

        return list;
    }

    private String compressedIntelligentAudio(String fileName) {

        String resultFileName = "";

        String targetFileName = UUID.randomUUID().toString() + ".mp3";

        log.info("compressedIntelligentAudio 的souceFileName:{}", fileName);
        log.info("compressedIntelligentAudio 的targetFileName:{}", targetFileName);

        String souceFilePath = storageConfig.getUploadTemp() + File.separator + fileName;
        String targetFilePath = storageConfig.getUploadTemp() + File.separator + targetFileName;
        try {
            resultFileName = AudioTools.compressMp3(souceFilePath, targetFilePath, true);
        } catch (Exception e) {

            log.error("使用 AudioTools的工具来进行压缩时，异常", e);
        }

        return resultFileName;
    }
}
