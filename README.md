# Sky Take Out 项目

这是一个基于Spring Boot的外卖订餐系统后端项目。

## 项目结构

- `sky-common`: 公共模块，包含常量、异常、工具类等
- `sky-pojo`: 实体类模块，包含数据库实体、DTO、VO等
- `sky-server`: 服务模块，包含业务逻辑、控制器、Mapper等

## 环境要求

- JDK 11+
- Maven 3.6+
- MySQL 8.0+

## 配置说明

### 1. 数据库配置

修改 `sky-server/src/main/resources/application-dev.yml` 文件中的数据库连接信息：

```yaml
sky:
  datasource:
    driver-class-name: com.mysql.cj.jdbc.Driver
    host: localhost
    port: 3306
    database: sky_take_out
    username: root
    password: YOUR_DATABASE_PASSWORD  # 替换为你的数据库密码
```

### 2. 阿里云OSS配置

项目使用了阿里云OSS进行文件存储，需要配置以下信息：

```yaml
alioss:
  endpoint: oss-cn-aliyuncs.com
  access-key-id: YOUR_ACCESS_KEY_ID  # 替换为你的AccessKey ID
  access-key-secret: YOUR_ACCESS_KEY_SECRET  # 替换为你的AccessKey Secret
  buckey-name: sky-itcast
```

### 3. JWT密钥配置

修改 `sky-server/src/main/resources/application.yml` 文件中的JWT密钥：

```yaml
sky:
  jwt:
    # 设置jwt签名加密时使用的秘钥
    admin-secret-key: YOUR_JWT_SECRET_KEY  # 替换为你的JWT密钥
    # 设置jwt过期时间
    admin-ttl: 7200000
    # 设置前端传递过来的令牌名称
    admin-token-name: token
```

## 运行项目

1. 创建数据库：`sky_take_out`
2. 导入SQL脚本（如果有）
3. 修改配置文件中的敏感信息
4. 运行以下命令：

```bash
mvn clean install
cd sky-server
mvn spring-boot:run
```

项目将在 `http://localhost:8080` 启动。

## 安全说明

- 所有敏感信息（数据库密码、阿里云AccessKey、JWT密钥等）已替换为占位符
- 请勿将包含真实敏感信息的配置文件提交到版本控制系统
- 建议使用环境变量或外部配置文件管理敏感信息

## 开发说明

- 项目已配置 `.gitignore` 文件，忽略编译文件和敏感配置文件
- 建议使用 `application-dev.local.yml` 作为本地开发配置文件（该文件已被.gitignore忽略）
- 生产环境应使用 `application-prod.yml` 配置文件

## API文档

启动项目后，访问 `http://localhost:8080/doc.html` 查看API文档（如果配置了Knife4j）。

## 许可证

MIT License