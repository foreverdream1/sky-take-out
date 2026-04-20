package com.sky.service;

import com.sky.dto.UserLoginDTO;
import com.sky.entity.User;

/**
 * 用户端 - 微信登录Service
 */
public interface UserService {

    /**
     * 微信用户登录
     * @param userLoginDTO  wx.login() 得到的 code
     * @return 已注册用户或新用户信息
     */
    User wxLogin(UserLoginDTO userLoginDTO);
}
