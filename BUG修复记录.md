# Bug 修复记录

## 问题描述
项目无法启动，编译失败。

## 发现的问题

### 1. 缺少 Jakarta Servlet API JAR 包
**问题**：编译时报错 `程序包jakarta.servlet.http不存在`

**原因**：`lib` 目录中只有 `gson-2.13.2.jar`，缺少 `jakarta.servlet-api-6.0.0.jar`

**解决方案**：
- 从 Maven Central 下载 `jakarta.servlet-api-6.0.0.jar`
- 下载地址：https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/jakarta.servlet-api-6.0.0.jar
- 放置到 `lib` 目录

### 2. Job 类缺少字段和方法
**问题**：编译 MO Servlet 时报错找不到方法

**缺少的字段**：
- `createdBy` - 创建者 ID
- `updatedAt` - 更新时间
- `moduleCode` - 课程代码
- `moduleName` - 课程名称
- `positions` - 招聘人数
- `duration` - 持续时间

**解决方案**：在 `Job.java` 中添加这些字段及对应的 getter/setter 方法

### 3. Application 类缺少字段和方法
**问题**：编译 MO Servlet 时报错找不到方法

**缺少的字段**：
- `reviewedBy` - 审核人 ID
- `reviewedAt` - 审核时间
- `reviewComment` - 审核意见

**解决方案**：在 `Application.java` 中添加这些字段及对应的 getter/setter 方法

### 4. Timesheet 类缺少字段和方法
**问题**：编译 MO Servlet 时报错找不到方法

**缺少的字段**：
- `applicationId` - 关联的申请 ID
- `hoursWorked` - 实际工作时长
- `approvedHours` - 批准的工时
- `reviewedBy` - 审核人 ID
- `reviewComment` - 审核意见
- `updatedAt` - 更新时间

**解决方案**：在 `Timesheet.java` 中添加这些字段及对应的 getter/setter 方法

### 5. CourseModule 类缺少字段和方法
**问题**：编译 MO Servlet 时报错找不到方法

**缺少的字段**：
- `coordinatorId` - 课程负责人 ID（用于权限验证）

**解决方案**：在 `CourseModule.java` 中添加该字段及对应的 getter/setter 方法

### 6. SessionUtil 返回类型问题
**问题**：`getCurrentUser()` 返回 `Object` 类型，导致 MO Servlet 中需要强制类型转换

**解决方案**：
- 保留原有的 `getCurrentUser()` 返回 `Object`
- 添加 `getCurrentStudent()` 返回 `Student` 类型
- 添加 `getCurrentMOUser()` 返回 `User` 类型
- 修改所有 MO Servlet 使用 `getCurrentMOUser()` 方法

### 7. HttpServletResponseAdapter 方法签名错误
**问题**：`sendRedirect(String location, int sc, boolean clearBuffer)` 方法不存在于 Jakarta Servlet API 6.0

**解决方案**：删除该方法（该方法不是标准 Servlet API 的一部分）

## 修复后的文件列表

### Domain 层
- `src/com/bupt/ta/shared/domain/Job.java` - 添加 7 个字段
- `src/com/bupt/ta/shared/domain/Application.java` - 添加 3 个字段
- `src/com/bupt/ta/shared/domain/Timesheet.java` - 添加 6 个字段
- `src/com/bupt/ta/shared/domain/CourseModule.java` - 添加 1 个字段

### Util 层
- `src/com/bupt/ta/shared/util/SessionUtil.java` - 添加 2 个方法

### Interfaces 层
- `src/com/bupt/ta/mo/interfaces/MOJobServlet.java` - 修改 4 处
- `src/com/bupt/ta/mo/interfaces/MOApplicantServlet.java` - 修改 2 处
- `src/com/bupt/ta/mo/interfaces/MOTimesheetServlet.java` - 修改 2 处
- `src/com/bupt/ta/mo/interfaces/MOModuleServlet.java` - 修改 1 处

### Adapter 层
- `src/HttpServletResponseAdapter.java` - 删除 1 个方法

### 依赖库
- `lib/jakarta.servlet-api-6.0.0.jar` - 新增

## 编译顺序

正确的编译顺序（避免循环依赖）：

```bash
# 1. 清理输出目录
Remove-Item -Recurse -Force out
New-Item -ItemType Directory -Path out

# 2. 编译 Domain 层
javac -encoding UTF-8 -cp "lib/*" -d out src/com/bupt/ta/shared/domain/*.java src/com/bupt/ta/student/domain/*.java

# 3. 编译基础 Util 类
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/shared/util/JsonFileUtil.java src/com/bupt/ta/shared/util/ResponseUtil.java src/com/bupt/ta/shared/util/SessionUtil.java

# 4. 编译 Infrastructure 层
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/shared/infrastructure/*.java

# 5. 编译 DataInitializer
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/shared/util/DataInitializer.java

# 6. 编译 Interfaces 层
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/shared/interfaces/*.java
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/student/interfaces/*.java
javac -encoding UTF-8 -cp "lib/*;out" -d out src/com/bupt/ta/mo/interfaces/*.java

# 7. 编译适配器和服务器
javac -encoding UTF-8 -cp "lib/*;out" -d out src/*.java

# 8. 启动服务器
java -cp "out;lib/*" EmbeddedServer
```

## 验证结果

服务器成功启动，输出：
```
========================================
✓ 服务器已启动
访问地址:
  主页:   http://localhost:9191
  登录:   http://localhost:9191/login.html
测试账号:
  学生:   zhangsan@bupt.edu.cn / 123456
  MO:     mo1@bupt.edu.cn / 123456
  管理员: admin@bupt.edu.cn / 123456
按 Ctrl+C 停止服务器
========================================
```

## 后续使用

现在可以直接使用 `QUICK-START.bat` 启动项目：
```bash
.\QUICK-START.bat
```

该脚本会自动：
1. 编译所有 Java 文件
2. 启动嵌入式服务器
3. 打开浏览器访问主页

## 注意事项

1. 确保 `lib` 目录包含两个 JAR 包：
   - `gson-2.13.2.jar`
   - `jakarta.servlet-api-6.0.0.jar`

2. 如果遇到端口占用问题，可以：
   - 停止所有 Java 进程：`Get-Process | Where-Object {$_.ProcessName -eq "java"} | Stop-Process -Force`
   - 或修改 `EmbeddedServer.java` 中的端口号

3. 编译警告（unchecked operations）可以忽略，不影响运行

---

**修复完成时间**：2026-04-08
**修复人员**：Kiro AI Assistant
