package com.sky.controller.user;

import com.sky.constant.JwtClaimsConstant;
import com.sky.dto.UserLoginDTO;
import com.sky.entity.User;
import com.sky.properties.JwtProperties;
import com.sky.result.Result;
import com.sky.service.UserService;
import com.sky.utils.JwtUtil;
import com.sky.vo.UserLoginVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 用户端 - 微信小程序登录
 */
@RestController
@RequestMapping("/user/user")
@Api(tags = "用户端相关接口")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtProperties jwtProperties;

    /**
     * 微信小程序登录
     * 小程序前端：wx.login() → code → 传这里 → 返回 token
     */
    @PostMapping("/wxLogin")
    @ApiOperation("微信登录")
    public Result<UserLoginVO> wxLogin(@RequestBody UserLoginDTO userLoginDTO) {
        log.info("微信登录请求: code={}", userLoginDTO.getCode());//微信授权码

        // Service 处理：微信换openid + 查库/注册
        User user = userService.wxLogin(userLoginDTO);

        // 生成用户端 JWT
        Map<String, Object> claims = new HashMap<>();
        claims.put(JwtClaimsConstant.USER_ID, user.getId());
        String token = JwtUtil.createJWT(
                jwtProperties.getUserSecretKey(),
                jwtProperties.getUserTtl(),
                claims);

        UserLoginVO vo = UserLoginVO.builder()
                .id(user.getId())
                .openid(user.getOpenid())
                .token(token)
                .build();

        log.info("登录成功，返回 token，用户 id={}", user.getId());
        return Result.success(vo);
    }
}
