<div align="center">

# 🍱 苍穹外卖 · Sky Take-Out

**一个现代化的餐饮点餐全栈系统**

[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MyBatis](https://img.shields.io/badge/MyBatis-3.x-DC382D?style=flat-square)](https://mybatis.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 📖 项目简介

**苍穹外卖**是一套面向餐饮行业的在线点餐系统，涵盖 **商家管理后台** 与 **用户移动端** 两大端口，支持菜品管理、套餐配置、在线下单、实时推送、数据报表等完整业务闭环。

> 项目采用 Maven 多模块架构，前后端分离设计，可作为 Spring Boot 全栈学习的标准参考工程。

---

## 🏗️ 系统架构

```
sky-take-out/
├── sky-common/          # 公共模块：工具类、常量、异常、AOP 切面
├── sky-pojo/            # 实体模块：Entity / VO / DTO 数据对象
└── sky-server/          # 核心服务：Controller / Service / Mapper
    ├── controller/
    │   ├── admin/       # 管理端 API（9 个控制器）
    │   └── user/        # 用户端 API（7 个控制器）
    ├── service/         # 业务逻辑层
    ├── mapper/          # 数据访问层（MyBatis）
    ├── aspect/          # AOP 自动填充切面
    ├── task/            # 定时任务（订单状态自动处理）
    └── websocket/       # WebSocket 实时消息推送
```

---

## ✨ 核心功能

### 🏪 管理端（商家后台）

| 模块 | 功能描述 |
|------|---------|
| **员工管理** | 账号 CRUD、启用/禁用、JWT 鉴权登录 |
| **分类管理** | 菜品分类 / 套餐分类的增删改查与排序 |
| **菜品管理** | 菜品上架/下架、口味配置、图片上传（阿里云 OSS） |
| **套餐管理** | 套餐与菜品绑定、启售前校验菜品状态 |
| **订单管理** | 订单状态流转（待接单→制作中→派送中→完成） |
| **数据报表** | 营业额统计、用户增长、订单分析、TOP10 销量图表 |
| **工作台** | 实时统计今日订单、营业额、新增用户数等看板 |
| **文件上传** | 图片上传至阿里云 OSS，返回可访问 URL |

### 📱 用户端（移动端）

| 模块 | 功能描述 |
|------|---------|
| **微信登录** | 微信小程序 OAuth 静默授权，自动注册用户 |
| **菜品浏览** | 分类筛选、菜品详情、口味选择 |
| **购物车** | 增/减/清空，支持批量插入（再来一单） |
| **地址簿** | 多收货地址管理，支持默认地址 |
| **在线下单** | 微信支付、余额估价、订单备注 |
| **订单中心** | 历史订单查询、订单详情、取消订单、**再来一单** |
| **实时催单** | WebSocket 推送催单通知至商家后台 |

---

## 🛠️ 技术栈

| 分层 | 技术选型 |
|------|---------|
| **Web 框架** | Spring Boot 3 + Spring MVC |
| **持久层** | MyBatis + PageHelper 分页 |
| **数据库** | MySQL 8.0（Druid 连接池） |
| **缓存** | Redis（店铺状态缓存、菜品缓存） |
| **认证** | JWT（管理端 / 用户端双 Token） |
| **文件存储** | 阿里云 OSS |
| **支付** | 微信支付 V3 API |
| **实时通信** | WebSocket（催单 / 来单提醒） |
| **定时任务** | Spring Task（超时订单自动取消） |
| **AOP** | 公共字段自动填充（create/update time & user） |
| **API 文档** | Knife4j（Swagger 增强） |

---

## 🚀 快速开始

### 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+
- Redis 7.x

### 1. 克隆项目

```bash
git clone https://github.com/foreverdream1/sky-take-out.git
cd sky-take-out
```

### 2. 初始化数据库

```bash
mysql -u root -p < sky.sql
```

### 3. 配置环境变量

复制 `sky-server/src/main/resources/application-dev.yml`，填写以下配置：

```yaml
sky:
  datasource:
    host: localhost
    port: 3306
    database: sky_take_out
    username: root
    password: your_password
  redis:
    host: localhost
    port: 6379
  alioss:
    endpoint: oss-cn-xxx.aliyuncs.com
    access-key-id: your_key_id
    access-key-secret: your_key_secret
    bucket-name: your_bucket
  wechat:
    appid: your_appid
    secret: your_secret
```

### 4. 启动服务

```bash
mvn clean install -DskipTests
mvn spring-boot:run -pl sky-server
```

服务启动后访问：
- **API 文档**：`http://localhost:8080/doc.html`
- **管理端接口**：`http://localhost:8080/admin/...`
- **用户端接口**：`http://localhost:8080/user/...`

---

## 🔑 设计亮点

### ① AOP 自动填充
通过 `@AutoFill` 注解 + `AutoFillAspect` 切面，统一处理 `createTime`、`updateTime`、`createUser`、`updateUser` 字段，业务代码零感知。

### ② 联动停售逻辑
菜品下架时，自动检测并同步停售所有包含该菜品的套餐，保障数据一致性。

### ③ 定时任务兜底
Spring Task 定期扫描超时未支付订单（>15 分钟）和超时派送订单（>1 小时），自动流转状态，防止订单卡死。

### ④ WebSocket 实时推送
用户下单成功 / 催单时，服务端通过 WebSocket 向商家后台推送通知，实现秒级提醒。

---

## 🤖 Agent 化拓展方向

> 本项目作为标准 RESTful 后端，具备良好的接口语义，天然适合接入 AI Agent 进行自动化与智能化升级。

### 💬 1. 自然语言点餐 Agent
接入 LLM（如 GPT / 通义千问），用户通过自然语言描述需求（"来份辣的套餐，预算 50 以内"），Agent 自动解析意图 → 查询菜品 API → 生成购物车 → 完成下单，彻底替代手动点餐流程。

### 📊 2. 智能运营分析 Agent
定期调用报表接口，LLM 自动分析营业趋势、菜品销量分布，生成自然语言运营日报/周报，并主动提出补货建议或促销方案。

### 🚦 3. 订单调度 Agent
结合骑手位置与订单量，Agent 自动规划派送优先级、预测送达时间，并在异常时（骑手延误、爆单）主动通知商家和用户，替代人工客服介入。

### 🔔 4. 多渠道通知 Agent
WebSocket 催单信号触发后，Agent 判断商家响应时间，超时则自动通过微信模板消息 / 短信 / 邮件等多渠道升级提醒，实现无感知的 SLA 保障。

### 🧠 5. 菜品知识库 Agent（RAG）
将菜品描述、口味标签、用户评价构建向量知识库，用户咨询"今天吃什么"时，Agent 结合用户历史偏好进行个性化推荐，并可自动应答常见 FAQ。

---

## 📁 项目结构（详细）

<details>
<summary>点击展开完整目录</summary>

```
sky-server/src/main/java/com/sky/
├── annotation/         @AutoFill 自定义注解
├── aspect/             AutoFillAspect 自动填充切面
├── config/             Bean 配置（OSS / Redis / WebSocket / Knife4j）
├── controller/
│   ├── admin/          CategoryController  DishController  EmployeeController
│   │                   OrderController     ReportController SetmealController
│   │                   ShopController      WorkSpaceController CommonController
│   └── user/           AddressBookController  CategoryController  DishController
│                       OrderController        SetmealController   ShopController
│                       ShoppingCartController UserController
├── handler/            全局异常处理
├── interceptor/        JWT 拦截器（admin / user 双链路）
├── mapper/             11 个 Mapper 接口
├── service/            业务接口 + impl 实现
├── task/               OrderTask 定时清理任务
└── websocket/          WebSocketServer 来单 / 催单推送
```

</details>

---

## 🤝 贡献

欢迎 Issue 和 PR！如有问题请在 [Issues](https://github.com/foreverdream1/sky-take-out/issues) 区留言。

---

<div align="center">

Made with ☕ and Spring Boot &nbsp;|&nbsp; © 2024 foreverdream1

</div>
