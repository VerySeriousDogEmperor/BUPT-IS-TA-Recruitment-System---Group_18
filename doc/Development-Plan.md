# 开发计划 - 今晚完成两个 Sprint

> 目标：今晚完成学生端 + MO端全部功能  
> 策略：最小可用实现 + 快速迭代

---

## 时间分配建议

- **Phase 1: 基础架构** (1小时)
  - 共享数据模型
  - Repository 层
  - 测试数据初始化

- **Phase 2: 学生端** (2-3小时)
  - 认证 + 个人信息
  - 职位浏览 + 申请
  - 工时管理

- **Phase 3: MO端** (2-3小时)
  - MO 认证
  - 职位管理
  - 申请人管理
  - 工时审核

- **Phase 4: 联调测试** (1小时)
  - 前后端联调
  - 修复 bug

---

## 简化策略

### 去掉的功能
- ❌ Admin 审核流程（MO 提交后直接发布）
- ❌ 所有 AI 功能
- ❌ 复杂的权限控制
- ❌ 邮件通知
- ❌ 文件上传（简历用 JSON 存储）

### 保留的核心功能
- ✅ 用户认证（Session）
- ✅ 学生端完整业务流程
- ✅ MO端完整业务流程
- ✅ JSON 文件持久化

---

## Phase 1: 基础架构 (1小时)

### 1.1 共享数据模型 (20分钟)
创建 `shared/domain/` 下的实体类：
- `User.java` - 用户基类
- `Student.java` - 学生
- `Job.java` - 职位
- `Application.java` - 申请
- `Timesheet.java` - 工时
- `Module.java` - 模块
- `Resume.java` - 简历
- `Schedule.java` - 排课

### 1.2 Repository 接口和实现 (20分钟)
创建 `shared/infrastructure/` 下的仓储：
- `DataStore.java` - 统一数据存储管理器
- `UserRepository.java`
- `JobRepository.java`
- `ApplicationRepository.java`
- `TimesheetRepository.java`

### 1.3 测试数据初始化 (20分钟)
创建 `resources/data/init-data.json`：
- 3个学生账号
- 2个MO账号
- 5个职位
- 10个申请记录
- 一些工时记录

---

## Phase 2: 学生端 (2-3小时)

### 2.1 认证模块 (30分钟)
- `AuthServlet.java` - 统一认证接口
  - POST /api/auth/login
  - POST /api/auth/register
  - POST /api/auth/logout
  - GET /api/auth/me

### 2.2 学生信息管理 (30分钟)
- `StudentProfileServlet.java`
  - GET /api/student/profile
  - PUT /api/student/profile

### 2.3 职位浏览 (30分钟)
- `JobServlet.java`
  - GET /api/jobs (列表)
  - GET /api/jobs/{id} (详情)

### 2.4 申请管理 (40分钟)
- `StudentApplicationServlet.java`
  - GET /api/student/applications
  - POST /api/student/applications
  - DELETE /api/student/applications/{id}

### 2.5 工时管理 (30分钟)
- `StudentTimesheetServlet.java`
  - GET /api/student/timesheets
  - POST /api/student/timesheets

---

## Phase 3: MO端 (2-3小时)

### 3.1 模块管理 (20分钟)
- `MOModuleServlet.java`
  - GET /api/mo/modules
  - GET /api/mo/modules/{id}

### 3.2 职位管理 (50分钟)
- `MOJobServlet.java`
  - GET /api/mo/jobs
  - POST /api/mo/jobs
  - PUT /api/mo/jobs/{id}
  - POST /api/mo/jobs/{id}/submit (直接发布)
  - DELETE /api/mo/jobs/{id}

### 3.3 申请人管理 (40分钟)
- `MOApplicantServlet.java`
  - GET /api/mo/applicants
  - PUT /api/mo/applicants/{id}/status

### 3.4 工时审核 (30分钟)
- `MOTimesheetServlet.java`
  - GET /api/mo/timesheets
  - PUT /api/mo/timesheets/{id}/review

---

## Phase 4: 配置和测试 (1小时)

### 4.1 Web配置 (10分钟)
- 配置 `web.xml` 注册所有 Servlet
- 配置 CORS（如果需要）

### 4.2 前后端联调 (30分钟)
- 测试登录注册
- 测试学生端流程
- 测试MO端流程

### 4.3 Bug修复 (20分钟)
- 修复发现的问题

---

## 开发顺序建议

按依赖关系从底层到上层：

1. **数据模型** → 2. **Repository** → 3. **测试数据** → 4. **认证** → 5. **学生端** → 6. **MO端**

---

## 快速开发技巧

1. **复用代码**
   - 创建 `BaseServlet` 统一处理请求响应
   - 创建 `ResponseUtil` 统一返回格式
   - 创建 `SessionUtil` 统一 Session 管理

2. **最小实现**
   - 先实现核心逻辑，不做复杂校验
   - 错误处理简单化
   - 日志可以先不加

3. **边写边测**
   - 每完成一个 Servlet 立即用前端测试
   - 不要等全部写完再测

---

## 测试数据设计

### 学生账号
```
zhangsan@bupt.edu.cn / 123456
lisi@bupt.edu.cn / 123456
wangwu@bupt.edu.cn / 123456
```

### MO账号
```
mo1@bupt.edu.cn / 123456
mo2@bupt.edu.cn / 123456
```

### 职位
- 数据结构课程助教 (已发布)
- 操作系统课程助教 (已发布)
- 计算机网络助教 (已发布)
- 数据库助教 (草稿)
- 算法分析助教 (已发布)

---

准备好了吗？我们从哪里开始？

建议：
- **选项A**: 我帮你一次性生成所有基础代码框架，你再填充细节
- **选项B**: 我们一步步来，每完成一个模块测试通过再继续
- **选项C**: 你告诉我你想先做哪个部分，我重点帮你搞定

你选哪个？
