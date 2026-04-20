package com.sky.service.impl;

import com.alibaba.fastjson.JSONObject;
import com.sky.constant.MessageConstant;
import com.sky.dto.UserLoginDTO;
import com.sky.entity.User;
import com.sky.exception.LoginFailedException;
import com.sky.mapper.UserMapper;
import com.sky.properties.WeChatProperties;
import com.sky.properties.JwtProperties;
import com.sky.utils.HttpClientUtil;
import com.sky.utils.JwtUtil;
import com.sky.vo.UserLoginVO;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.impl.client.HttpClients;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户端 - 微信登录Service实现
 */
@Service
@Slf4j
public class UserServiceImpl implements com.sky.service.UserService {

    // 微信接口地址
    private static final String WX_LOGIN_URL = "https://api.weixin.qq.com/sns/jscode2session";

    @Autowired
    private WeChatProperties weChatProperties;

    @Autowired
    private JwtProperties jwtProperties;

    @Autowired
    private UserMapper userMapper;

    /**
     * 微信登录
     * 流程：code → 微信接口换 openid → 查库/注册 → 返回 JWT
     */
//    public User wxLogin(String code) {
//        log.info("微信登录 code: {}", code);
//
//        // ① 调用微信接口，用 code 换 openid
//        Map<String, String> paramMap = new HashMap<>();
//        paramMap.put("appid", weChatProperties.getAppid());
//        paramMap.put("secret", weChatProperties.getSecret());
//        paramMap.put("js_code", code);
//        paramMap.put("grant_type", "authorization_code");
//
//        String result = HttpClientUtil.doGet(WX_LOGIN_URL, paramMap);
//        log.info("微信接口返回: {}", result);
//
//        JSONObject jsonObject = JSONObject.parseObject(result);
//        // 微信接口失败时会返回 errcode
//        if (jsonObject == null || jsonObject.getInteger("errcode") != null) {
//            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
//        }
//
//        String openid = jsonObject.getString("openid");
//        String sessionKey = jsonObject.getString("session_key");
//        log.info("openid = {}, session_key = {}", openid, sessionKey);
//
//        // ② 根据 openid 查库，判断是否已注册
//        User user = userMapper.getByOpenid(openid);
//
//        if (user == null) {
//            // ③ 首次登录 → 自动注册（插入 openid）
//            log.info("新用户 openid={}，自动注册", openid);
//            user = User.builder()
//                    .openid(openid)
//                    .createTime(LocalDateTime.now())
//                    .build();
//            userMapper.insert(user);
//        } else {
//            log.info("老用户 id={} 登录", user.getId());
//        }
//
//        // ④ 返回用户（controller 负责生成 JWT）
//        return user;
//    }

    /**
     * 微信登陆
     * @param userLoginDTO  wx.login() 得到的 code
     * @return
     */
    @Override
    public User wxLogin(UserLoginDTO userLoginDTO) {

        String openid = getOpenid(userLoginDTO.getCode());


        //判断openid是否为空，如果为空表示登陆失败，抛出业务异常
        if (openid==null){
            throw new LoginFailedException(MessageConstant.LOGIN_FAILED);
        }
        //判断当前用户是否为新用户
        User user = userMapper.getByOpenid(openid);
        if(user==null){
            user = User.builder()
                    .openid(openid)
                    .createTime(LocalDateTime.now())
                    .build();
        }
        userMapper.insert(user);
        //如果是新用户自动完成注册

        //返回用户对象


        return user;
    }

    /**
     * 调用微信接口服务，获取微信用户的openid
     * @param code
     * @return
     */
    private String getOpenid(String code){
        //调用微信接口服务，获得挡墙用户的openid
        Map<String, String> map=new HashMap<>();
        map.put("appid",weChatProperties.getAppid());
        map.put("secret",weChatProperties.getSecret());
        map.put("js_code",code);
        map.put("grant_type","authorization_code");
        String json = HttpClientUtil.doGet(WX_LOGIN_URL, map);

        JSONObject jsonObject = JSONObject.parseObject(json);
        String openid = jsonObject.getString("openid");
        return openid;
    }

}
