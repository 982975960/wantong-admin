# wantong-admin

├─java  
│  └─com  
│      └─wantong  
│          └─admin  
│              │  AdminApplication.java 启动入口  
│              │  
│              ├─config 配置bean  
│              │      HttpStatusCodeConfig.java  
│              │      JedisConfig.java  
│              │      ServerConfig.java  
│              │      
│              ├─constant 常量、枚举  
│              ├─exception 自定义异常  
│              │  └─resolver 异常处理  
│              │         
│              ├─interceptor 拦截器  
│              │      WebConfig.java  
│              │      
│              ├─model  
│              │      APIResponse.java  
│              │      ErrorCode.java  
│              │        
│              ├─session  
│              │      AdminSession.java  
│              │      AppIdToken.java  
│              │        
│              ├─util  
│              │            
│              └─view 视图控制器  
└─resources  
    │  bootstarp.yml 本地配置文件  
    │  bootstrap.properties spring-config配置  
    │  logback-spring.xml  
    │    
    ├─static  
    │  │  404.html  
    │  │  500.html  
    │  └─index.html  
    │                
    └─templates FTL模板   

