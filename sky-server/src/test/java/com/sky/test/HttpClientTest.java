package com.sky.test;

import com.alibaba.fastjson.JSONObject;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;

@SpringBootTest
public class HttpClientTest {
    @Test
    /**
     * 测试通过httpclient发送get请求
     */
    public void testGet() throws IOException {
        //创建httpclient对象
        CloseableHttpClient HttpDefault = HttpClients.createDefault();
        //创建请求对象

        HttpGet httpGet = new HttpGet("http://localhost:8080/user/shop/status");

        //发送请求
        CloseableHttpResponse execute = HttpDefault.execute(httpGet);
        int statusCode = execute.getStatusLine().getStatusCode();
        System.out.println(statusCode);
        HttpEntity entity = execute.getEntity();
        String string = EntityUtils.toString(entity);
        System.out.println(string);
    }



    /**
     * 测试通过httpclient发送get请求
     */
    @Test
    public void testPost() throws IOException {
        //创建httpclient对象
        CloseableHttpClient HttpDefault = HttpClients.createDefault();
        //创建请求对象

        JSONObject jsonObject = new JSONObject();
        jsonObject.put("username","admin");
        jsonObject.put("password","123456");
        StringEntity stringEntity = new StringEntity(jsonObject.toString());
        HttpPost httpPost = new HttpPost("http://localhost:8080/admin/employee/login");

        //发送请求
        //指定请求编码方式
        stringEntity.setContentEncoding("utf-8");
        //数据格式
        stringEntity.setContentType("application/json");
        httpPost.setEntity(stringEntity);

        CloseableHttpResponse response = HttpDefault.execute(httpPost);
        int statusCode = response.getStatusLine().getStatusCode();
        String string = EntityUtils.toString(stringEntity);
        System.out.println(statusCode);
        System.out.println(string);
    }


}
