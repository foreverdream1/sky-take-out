package com.sky.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 管理端员工微信登录
 */
@Data
@ApiModel(description = "员工微信登录传递的数据模型")
public class EmployeeWxLoginDTO implements Serializable {

    @ApiModelProperty("wx.login() 得到的 code")
    private String code;

}
