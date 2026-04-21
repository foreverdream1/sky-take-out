package com.sky.controller.user;

import com.sky.constant.StatusConstant;
import com.sky.entity.Dish;
import com.sky.result.Result;
import com.sky.service.DishService;
import com.sky.vo.DishVO;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.concurrent.TimeUnit;

@RestController("userDishController")
@RequestMapping("/user/dish")
@Slf4j
@Api(tags = "用户端菜品浏览接口")
public class DishController {

    @Autowired
    private DishService dishService;


    @Autowired
    private RedisTemplate redisTemplate;


    @GetMapping("/list")
    @ApiOperation("根据分类id查询菜品")
    public Result<List<DishVO>> list(Long categoryId) {
        //构造redis的key
        log.info("redis:...");
        String key = "dish" + categoryId;
        //查询redis中是否存在菜品数据
        List<DishVO> dishList = (List<DishVO>) redisTemplate.opsForValue().get(key);
        if (dishList != null && dishList.size() > 0) {
            return Result.success(dishList);
        }
        //如果存在，直接返回，无需查询数据库


        //如果不存在，查询数据库并将查询到的数据库放入redis

        Dish dish = new Dish();
        dish.setCategoryId(categoryId);
        dish.setStatus(StatusConstant.ENABLE);

        dishList = dishService.listWithFlavor(dish);
        redisTemplate.opsForValue().set(key, dishList,20, TimeUnit.MINUTES);
        return Result.success(dishList);
    }

}
