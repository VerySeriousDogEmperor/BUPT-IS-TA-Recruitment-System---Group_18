# 部署指南

## 环境要求

- JDK 17 或更高版本
- Tomcat 9 或更高版本
- 或者任何支持 Servlet 4.0 的 Web 容器

---

## 快速部署

### 方法一：使用部署脚本（推荐）

1. **运行部署脚本**
   ```bash
   deploy.bat
   ```
   
   这会自动：
   - 编译所有 Java 源代码
   - 复制编译文件到 `web/WEB-INF/classes`
   - 复制依赖库到 `web/WEB-INF/lib`

2. **部署到 Tomcat**
   - 将 `web` 目录复制到 Tomcat 的 `webapps` 目录
   - 重命名为 `ta-recruitment`
   - 启动 Tomcat

3. **访问应用**
   ```
   http://localhost:8080/ta-recruitment/
   ```

---

### 方法二：使用 IntelliJ IDEA

1. **配置 Tomcat**
   - Run → Edit Configurations
   - 添加 Tomcat Server → Local
   - 配置 Tomcat 安装路径

2. **配置 Deployment**
   - Deployment 标签
   - 添加 Artifact → Exploded
   - 设置 Application context: `/ta-recruitment`
   - 设置 Deploy at server startup

3. **运行**
   - 点击运行按钮
   - 浏览器自动打开

---

## 项目结构

```
BUPT-IS-TA-Recruitment-System/
├── src/                          # Java 源代码
│   └── com/bupt/ta/
│       ├── shared/               # 共享模块
│       │   ├── domain/           # 实体类
│       │   ├── infrastructure/   # 数据访问层
│       │   ├── interfaces/       # Servlet 接口
│       │   └── util/             # 工具类
│       └── student/              # 学生模块
│           ├── domain/
│           └── interfaces/
├── web/                          # Web 资源
│   ├── static/                   # 静态文件（CSS/JS）
│   ├── WEB-INF/
│   │   ├── web.xml              # Servlet 配置
│   │   ├── classes/             # 编译后的类文件
│   │   └── lib/                 # 依赖库
│   └── *.html                   # HTML 页面
├── resources/                    # 资源文件
│   └── data/                    # JSON 数据文件
├── lib/                         # 外部依赖
│   └── gson-2.13.2.jar
└── out/                         # 编译输出目录
```

---

## API 接口

### 认证接口
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `POST /api/auth/logout` - 登出
- `GET /api/auth/me` - 获取当前用户

### 职位接口（公开）
- `GET /api/jobs` - 浏览职位列表
- `GET /api/jobs/{id}` - 查看职位详情

### 学生端接口
- `GET /api/student/profile` - 获取个人信息
- `PUT /api/student/profile` - 更新个人信息
- `GET /api/student/applications` - 我的申请列表
- `POST /api/student/applications` - 申请职位
- `DELETE /api/student/applications/{id}` - 撤回申请
- `GET /api/student/timesheets` - 我的工时记录
- `POST /api/student/timesheets` - 提交工时

---

## 测试账号

### 学生账号
```
邮箱：zhangsan@bupt.edu.cn
密码：123456

邮箱：lisi@bupt.edu.cn
密码：123456

邮箱：wangwu@bupt.edu.cn
密码：123456
```

### MO账号
```
邮箱：mo1@bupt.edu.cn
密码：123456

邮箱：mo2@bupt.edu.cn
密码：123456
```

### Admin账号
```
邮箱：admin@bupt.edu.cn
密码：123456
```

---

## 测试数据

系统已预置测试数据：
- 3个学生账号
- 2个MO账号
- 1个Admin账号
- 5个职位（4个已发布，1个草稿）
- 5个申请记录
- 3条工时记录

数据文件位置：`resources/data/*.json`

---

## 常见问题

### 1. 编译错误：找不到 javax.servlet

**原因：** 缺少 Servlet API 依赖

**解决方案：**
- 方法一：使用 Tomcat 的 servlet-api.jar
  ```bash
  javac -cp "lib/gson-2.13.2.jar;C:/path/to/tomcat/lib/servlet-api.jar" ...
  ```
- 方法二：在 IDE 中配置 Tomcat 库

### 2. 404 错误：接口不存在

**检查：**
- Tomcat 是否正常启动
- 应用是否正确部署
- URL 路径是否正确（包含 `/ta-recruitment` 前缀）

### 3. 500 错误：服务器内部错误

**检查：**
- Tomcat 日志：`logs/catalina.out`
- 数据文件是否存在：`resources/data/*.json`
- 文件权限是否正确

### 4. CORS 跨域问题

**解决方案：**
- 已在 `web.xml` 中配置 CORS 过滤器
- 如果仍有问题，检查浏览器控制台错误信息

---

## 开发模式

### 热重载

使用 IDE 的热重载功能：
1. IntelliJ IDEA：Run → Update Application
2. 或者配置 JRebel

### 调试

1. 在 IDE 中以 Debug 模式启动 Tomcat
2. 在代码中设置断点
3. 使用浏览器或 Postman 发送请求

---

## 生产部署建议

1. **安全性**
   - 修改默认密码
   - 使用密码加密（BCrypt）
   - 启用 HTTPS
   - 配置防火墙

2. **性能优化**
   - 启用 Gzip 压缩
   - 配置静态资源缓存
   - 使用连接池

3. **监控**
   - 配置日志系统
   - 监控服务器资源
   - 设置告警

---

## 技术支持

如有问题，请检查：
1. Tomcat 日志
2. 浏览器控制台
3. 网络请求（F12 → Network）

---

**最后更新：** 2026-04-08
