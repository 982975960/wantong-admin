package com.wantong.admin.tts;

import java.io.IOException;
import java.net.URI;
import org.apache.http.*;
import org.apache.http.client.CookieStore;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpRequestWrapper;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.config.Registry;
import org.apache.http.config.RegistryBuilder;
import org.apache.http.config.SocketConfig;
import org.apache.http.conn.socket.ConnectionSocketFactory;
import org.apache.http.conn.socket.PlainConnectionSocketFactory;
import org.apache.http.impl.client.*;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.protocol.HttpContext;
import org.springframework.stereotype.Service;


@Service("turingHttpClientHolder")
public class TuringHttpClientHolder {

    private HttpClientBuilder httpClientBuilder = null;
    private CloseableHttpClient httpClient = null;

    public TuringHttpClientHolder() {
        initHttpClient(50);
    }

    public void initHttpClient(int connections) {
        httpClientBuilder = HttpClients.custom();
        //设置httpclient的链接池管理类
        Registry<ConnectionSocketFactory> reg = RegistryBuilder.<ConnectionSocketFactory>create().
                register("http", PlainConnectionSocketFactory.INSTANCE).build();

        PoolingHttpClientConnectionManager manager = new PoolingHttpClientConnectionManager(reg);
        //连接池的相关配置
        SocketConfig config = SocketConfig.custom().setSoTimeout(60000).
                setSoKeepAlive(true).setTcpNoDelay(true).build();
        manager.setDefaultSocketConfig(config);
        //控制最大连接数
        manager.setDefaultMaxPerRoute(connections);
        //为连接池配置管链接理器
        httpClientBuilder.setConnectionManager(manager);
        //配置user-agent欺骗服务器
        httpClientBuilder.setUserAgent("VT-Cloud");
        //为请求添加压缩属性
        httpClientBuilder.addInterceptorFirst(new HttpRequestInterceptor() {

            @Override
            public void process(HttpRequest httpRequest, HttpContext arg1)
                    throws HttpException, IOException {
                if (!httpRequest.containsHeader("Accept-Encoding")) {
                    httpRequest.addHeader("Accept-Encoding", "gzip");
                }
            }

        });
        //httpclientbuilder配置链接设置
        httpClientBuilder.setDefaultSocketConfig(config);

        //设置重新请求使用的类
        httpClientBuilder.setRetryHandler(new DefaultHttpRequestRetryHandler(
                3, true
        ));
        //配置cookie位生成的http请求都添加这个cookie，也是为了欺骗服务器
        CookieStore cookieStore = new BasicCookieStore();
        //位即将生成的httpclient配置cookie
        httpClientBuilder.setDefaultCookieStore(cookieStore);
        //为httpclient设置重定向时的处理方法
        httpClientBuilder.setRedirectStrategy(new LaxRedirectStrategy() {
            @Override
            public HttpUriRequest getRedirect(HttpRequest request, HttpResponse response,
                    HttpContext context) throws ProtocolException {
                URI uri = getLocationURI(request, response, context);
                String method = request.getRequestLine().getMethod();
                if ("post".equalsIgnoreCase(method)) {
                    try {
                        HttpRequestWrapper httpRequestWrapper = (HttpRequestWrapper) request;
                        httpRequestWrapper.setURI(uri);
                        httpRequestWrapper.removeHeaders("Content-Length");
                        return httpRequestWrapper;
                    } catch (Exception e) {
                    }
                    return new HttpPost(uri);
                } else {
                    return new HttpGet(uri);
                }
            }
        });

        //生成我们配置好的httpclient类
        httpClient = httpClientBuilder.build();

    }

    public CloseableHttpClient getCloseableHttpClient() {
        return this.httpClient;
    }

    public void closeAll() throws IOException {
        this.httpClient.close();
    }
}
