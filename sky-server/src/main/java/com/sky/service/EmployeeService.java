package com.sky.service;

import com.github.pagehelper.Page;
import com.sky.dto.EmployeeDTO;
import com.sky.dto.EmployeeLoginDTO;
import com.sky.dto.EmployeePageQueryDTO;
import com.sky.entity.Employee;
import com.sky.result.PageResult;
import com.sky.result.Result;

public interface EmployeeService {

    /**
     * 员工登录
     * @param employeeLoginDTO
     * @return
     */
    Employee login(EmployeeLoginDTO employeeLoginDTO);

    /**
     * 员工微信登录（code换openid → 查库/自动注册）
     */
    Employee wxLogin(String code);

    /**
     * 新增员工
     * @param employeeDTO
     * @return
     */
    Result save(EmployeeDTO employeeDTO);

    /**
     * 员工分页查询
     * @param employeePageQueryDTO
     * @return
     */


    /**
     * 员工列表分页查询
     * @param employeePageQueryDTO
     * @return
     */

    PageResult pageQuery(EmployeePageQueryDTO employeePageQueryDTO);

    /**
     * 启用员工状态
     * @param status
     * @param id
     */
    void startOrStop(Integer status, Long id);

    /**
     * 通过id获取员工信息
     * @param id
     * @return
     */
    Employee getById(Long id);

    /**
     * 编辑员工信息
     * @param employeeDTO
     */
    void update(EmployeeDTO employeeDTO);
}
