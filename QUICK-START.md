# 🚀 快速启动指南

## ✅ 已完成的准备工作

- ✅ 代码已编译
- ✅ 文件已复制到 web/WEB-INF
- ✅ 测试数据已生成
- ✅ 配置文件已就绪

---

## 📋 现在只需 3 步

### 步骤 1：安装 Tomcat（如果还没有）

1. 下载 Tomcat 9：https://tomcat.apache.org/download-90.cgi
2. 选择 "64-bit Windows zip"
3. 解压到任意目录，比如 `C:\apache-tomcat-9.0.xx`

### 步骤 2：部署项目

**方法 A：复制整个 web 目录**
```
1. 复制整个 web 文件夹
2. 粘贴到 Tomcat 的 webapps 目录
3. 重命名为 ta-recruitment
```

**方法 B：使用 IntelliJ IDEA**
```
1. Run → Edit Configurations
2. 添加 Tomcat Server → Local
3. 配置 Tomcat 路径
4. Deployment 标签 → 添加 web 目录
5. 点击运行
```

### 步骤 3：启动并测试

1. **启动 Tomcat**
   - Windows: 运行 `%CATALINA_HOME%\bin\startup.bat`
   - 或在 IDE 中点击运行按钮

2. **打开测试工具**
   - 在浏览器中打开：`test-api.html`
   - 或直接访问：`http://localhost:8080/ta-recruitment/`

3. **测试登录**
   - 邮箱：`zhangsan@bupt.edu.cn`
   - 密码：`123456`

---

## 🎯 测试清单

### 使用 test-api.html 测试

1. ✅ 打开 `test-api.html`
2. ✅ 修改 API Base URL 为：`http://localhost:8080/ta-recruitment/api`
3. ✅ 点击"测试登录"
4. ✅ 点击"测试获取职位"
5. ✅ 点击"测试获取个人信息"

### 使用前端页面测试

1. ✅ 访问：`http://localhost:8080/ta-recruitment/login.html`
2. ✅ 使用测试账号登录
3. ✅ 查看个人信息
4. ✅ 浏览职位列表
5. ✅ 申请职位

---

## 📱 测试账号

### 学生账号
```
邮箱：zhangsan@bupt.edu.cn
密码：123456
角色：student

邮箱：lisi@bupt.edu.cn
密码：123456
角色：student
```

### MO账号
```
邮箱：mo1@bupt.edu.cn
密码：123456
角色：mo
```

---

## 🔧 如果遇到问题

### 问题 1：端口被占用
```
错误：Address already in use: bind
解决：修改 Tomcat 端口（conf/server.xml）或关闭占用 8080 端口的程序
```

### 问题 2：404 错误
```
检查：
1. Tomcat 是否正常启动
2. web 目录是否正确部署到 webapps
3. URL 是否正确（包含 /ta-recruitment）
```

### 问题 3：500 错误
```
检查：
1. Tomcat 日志：logs/catalina.out
2. 数据文件是否存在：resources/data/*.json
3. 类文件是否正确复制到 WEB-INF/classes
```

### 问题 4：CORS 跨域错误
```
解决：
1. 确保 web.xml 中的 CORS 过滤器已配置
2. 或者使用同域访问（不要用 file:// 协议打开 HTML）
```

---

## 💡 提示

1. **使用 IntelliJ IDEA 最方便**
   - 自动配置
   - 热重载
   - 调试方便

2. **查看日志**
   - Tomcat 日志：`logs/catalina.out`
   - 浏览器控制台：F12

3. **数据文件位置**
   - `resources/data/*.json`
   - 可以直接编辑测试数据

---

## 🎉 成功标志

如果看到以下内容，说明部署成功：

1. ✅ Tomcat 启动无错误
2. ✅ 访问 `http://localhost:8080/ta-recruitment/` 能看到首页
3. ✅ test-api.html 中登录测试返回成功
4. ✅ 前端页面能正常登录和浏览职位

---

## 📞 需要帮助？

如果还有问题，检查：
1. Tomcat 是否正确安装
2. JDK 版本是否正确（需要 JDK 17+）
3. 文件权限是否正确
4. 防火墙是否阻止了端口

---

**祝你测试顺利！** 🚀
