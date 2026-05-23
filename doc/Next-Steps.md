# 下一步操作指南

## 🎉 当前进度

学生端后端已完成！包括：
- ✅ 完整的数据模型和数据访问层
- ✅ 认证系统（登录/注册/登出）
- ✅ 个人信息管理
- ✅ 职位浏览
- ✅ 申请管理
- ✅ 工时管理
- ✅ 测试数据
- ✅ Web 配置文件

---

## 📋 需要完成的步骤

### 1. 添加 Servlet API 依赖

由于我们使用的是原生 Servlet，需要 Servlet API 才能编译。

**选项 A：使用 Tomcat 的 servlet-api.jar**

如果你已安装 Tomcat，可以从 Tomcat 的 lib 目录复制：
```bash
copy "C:\path\to\tomcat\lib\servlet-api.jar" lib\
```

**选项 B：下载 Servlet API**

从 Maven Central 下载：
- https://repo1.maven.org/maven2/javax/servlet/javax.servlet-api/4.0.1/javax.servlet-api-4.0.1.jar
- 下载后放到 `lib/` 目录

**选项 C：使用 IntelliJ IDEA**

1. File → Project Structure → Libraries
2. 添加 Tomcat 库
3. 在 IDE 中直接运行，不需要手动编译

---

### 2. 编译项目

添加 Servlet API 后，运行：
```bash
deploy.bat
```

或手动编译：
```bash
javac -encoding UTF-8 -cp "lib/gson-2.13.2.jar;lib/servlet-api.jar" -d out src/com/bupt/ta/**/*.java
```

---

### 3. 部署到 Tomcat

**方法一：手动部署**
1. 将 `web` 目录复制到 `%CATALINA_HOME%\webapps\`
2. 重命名为 `ta-recruitment`
3. 启动 Tomcat
4. 访问 http://localhost:8080/ta-recruitment/

**方法二：使用 IDE**
1. 在 IntelliJ IDEA 中配置 Tomcat
2. 设置 Deployment
3. 点击运行

---

### 4. 测试接口

使用 Postman 或浏览器测试：

**测试登录：**
```bash
POST http://localhost:8080/ta-recruitment/api/auth/login
Content-Type: application/json

{
  "email": "zhangsan@bupt.edu.cn",
  "password": "123456",
  "role": "student"
}
```

**测试职位列表：**
```bash
GET http://localhost:8080/ta-recruitment/api/jobs
```

---

### 5. 前后端联调

1. 修改前端 `web/static/js/utils/api.js` 中的 API_BASE：
   ```javascript
   const API_BASE = '/api';  // 如果前后端同域
   // 或
   const API_BASE = 'http://localhost:8080/ta-recruitment/api';  // 跨域
   ```

2. 打开前端页面测试：
   - 登录页面：`http://localhost:8080/ta-recruitment/login.html`
   - 首页：`http://localhost:8080/ta-recruitment/index.html`

---

## 🚀 继续开发 MO端

学生端完成后，可以继续开发 MO端：

### MO端需要实现的接口

1. **模块管理**
   - GET /api/mo/modules - 获取我的模块
   - GET /api/mo/modules/{id} - 获取模块详情

2. **职位管理**
   - GET /api/mo/jobs - 获取我的职位
   - POST /api/mo/jobs - 创建职位
   - PUT /api/mo/jobs/{id} - 更新职位
   - POST /api/mo/jobs/{id}/submit - 提交职位（直接发布）
   - DELETE /api/mo/jobs/{id} - 删除职位

3. **申请人管理**
   - GET /api/mo/applicants - 获取申请人列表
   - PUT /api/mo/applicants/{id}/status - 更新申请状态

4. **工时审核**
   - GET /api/mo/timesheets - 获取工时列表
   - PUT /api/mo/timesheets/{id}/review - 审核工时

---

## 📝 开发建议

### 如果时间紧张

1. **先测试学生端**
   - 确保所有接口正常工作
   - 前后端联调通过

2. **快速实现 MO端**
   - 复用学生端的代码结构
   - 重点实现核心功能

3. **简化非核心功能**
   - 跳过复杂的数据验证
   - 简化错误处理

### 如果时间充足

1. **完善学生端**
   - 添加更多数据验证
   - 优化错误提示
   - 添加日志

2. **完整实现 MO端**
   - 实现所有功能
   - 添加完整的业务逻辑

3. **优化和测试**
   - 性能优化
   - 全面测试
   - 修复 bug

---

## 🎯 今晚的目标

根据你的时间安排，建议：

**最小目标（2-3小时）：**
- ✅ 学生端后端已完成
- ⏳ 部署并测试学生端
- ⏳ 实现 MO端核心接口（职位管理、申请审核）

**理想目标（4-5小时）：**
- ✅ 学生端后端已完成
- ⏳ 部署并测试学生端
- ⏳ 完整实现 MO端所有接口
- ⏳ 前后端联调

---

## 💡 提示

1. **使用 IntelliJ IDEA 会更快**
   - 自动配置 Servlet API
   - 内置 Tomcat 支持
   - 热重载功能

2. **可以先跳过编译**
   - 直接在 IDE 中运行
   - 等全部完成后再打包部署

3. **测试数据已准备好**
   - 直接使用测试账号登录
   - 数据文件在 `resources/data/`

---

你现在想：
- A. 配置 IDE 并测试学生端
- B. 继续开发 MO端（先不测试）
- C. 手动配置 Servlet API 并部署

选哪个？
