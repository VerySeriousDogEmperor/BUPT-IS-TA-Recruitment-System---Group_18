# MO 端功能说明

## ✅ 已完成的功能

### 1. 职位管理 (MOJobServlet)

**API 端点：** `/api/mo/jobs`

#### 功能列表
- ✅ 获取职位列表 - `GET /api/mo/jobs`
  - 只显示当前 MO 创建的职位
  - 支持按状态过滤 (`?status=draft|published`)
  
- ✅ 获取职位详情 - `GET /api/mo/jobs/{id}`
  
- ✅ 创建新职位 - `POST /api/mo/jobs`
  - 自动生成 ID
  - 初始状态为 `draft`（草稿）
  
- ✅ 更新职位 - `PUT /api/mo/jobs/{id}`
  - 只能更新草稿状态的职位
  
- ✅ 删除职位 - `DELETE /api/mo/jobs/{id}`
  - 只能删除草稿状态的职位
  
- ✅ 发布职位 - `POST /api/mo/jobs/{id}/submit`
  - 直接发布（跳过 Admin 审核）
  - 状态变为 `published`

### 2. 申请人管理 (MOApplicantServlet)

**API 端点：** `/api/mo/applicants`

#### 功能列表
- ✅ 获取申请人列表 - `GET /api/mo/applicants`
  - 只显示当前 MO 职位的申请
  - 支持按职位过滤 (`?jobId=xxx`)
  - 支持按状态过滤 (`?status=pending|accepted|rejected`)
  - 包含学生和职位信息
  
- ✅ 获取申请详情 - `GET /api/mo/applicants/{id}`
  - 包含完整的学生、职位、申请信息
  
- ✅ 审核申请 - `PUT /api/mo/applicants/{id}/status`
  - 录用：`{"action": "accept", "comment": "..."}`
  - 拒绝：`{"action": "reject", "comment": "..."}`
  - 只能审核 `pending` 状态的申请

### 3. 工时审核 (MOTimesheetServlet)

**API 端点：** `/api/mo/timesheets`

#### 功能列表
- ✅ 获取工时表列表 - `GET /api/mo/timesheets`
  - 只显示当前 MO 职位相关的工时表
  - 支持按状态过滤 (`?status=pending|approved|rejected`)
  - 支持按职位过滤 (`?jobId=xxx`)
  - 包含学生和职位信息
  
- ✅ 获取工时表详情 - `GET /api/mo/timesheets/{id}`
  
- ✅ 审核工时表 - `PUT /api/mo/timesheets/{id}/review`
  - 批准：`{"action": "approve", "approvedHours": 10.5, "comment": "..."}`
  - 拒绝：`{"action": "reject", "comment": "..."}`
  - 只能审核 `pending` 状态的工时表

### 4. 课程模块 (MOModuleServlet)

**API 端点：** `/api/mo/modules`

#### 功能列表
- ✅ 获取课程列表 - `GET /api/mo/modules`
  - 只显示当前 MO 负责的课程
  
- ✅ 获取课程详情 - `GET /api/mo/modules/{id}`

## 🔐 权限控制

所有 MO 端接口都需要：
1. 用户已登录
2. 用户角色为 `mo`
3. 只能访问自己创建/负责的数据

## 📊 数据流程

### 职位发布流程
```
1. MO 创建职位（draft）
2. MO 编辑职位信息
3. MO 提交职位
4. 职位状态变为 published（直接发布，无需 Admin 审核）
5. 学生可以看到并申请
```

### 申请审核流程
```
1. 学生申请职位（pending）
2. MO 查看申请列表
3. MO 审核申请
   - 录用 → accepted
   - 拒绝 → rejected
4. 学生收到通知
```

### 工时审核流程
```
1. 学生提交工时表（pending）
2. MO 查看工时表列表
3. MO 审核工时表
   - 批准 → approved（可调整工时）
   - 拒绝 → rejected
4. 学生查看审核结果
```

## 🧪 测试

### 测试账号
```
MO 账号: mo1@bupt.edu.cn / 123456
学生账号: zhangsan@bupt.edu.cn / 123456
```

### 测试步骤

1. **登录 MO 账号**
   - 访问 http://localhost:9191/login.html?mode=staff
   - 选择 MO 角色
   - 登录

2. **创建职位**
   - 访问 /mo/post-job.html
   - 填写职位信息
   - 保存为草稿或直接发布

3. **查看申请**
   - 访问 /mo/applicants.html
   - 查看学生申请
   - 录用或拒绝

4. **审核工时**
   - 访问 /mo/timesheets.html
   - 查看工时表
   - 批准或拒绝

## 📝 API 示例

### 创建职位
```javascript
POST /api/mo/jobs
{
  "title": "数据结构 TA",
  "moduleCode": "CS101",
  "moduleName": "数据结构",
  "description": "协助教学...",
  "requirements": "熟悉 C++...",
  "responsibilities": "批改作业...",
  "hoursPerWeek": 10,
  "duration": "一学期",
  "startDate": "2024-09-01",
  "endDate": "2025-01-15",
  "positions": 2
}
```

### 审核申请
```javascript
PUT /api/mo/applicants/{id}/status
{
  "action": "accept",
  "comment": "符合要求，录用"
}
```

### 审核工时
```javascript
PUT /api/mo/timesheets/{id}/review
{
  "action": "approve",
  "approvedHours": 10.5,
  "comment": "工作认真，批准"
}
```

## ⚠️ 注意事项

1. **职位状态**
   - `draft` - 草稿，可编辑、删除
   - `published` - 已发布，不可编辑、删除

2. **申请状态**
   - `pending` - 待审核
   - `accepted` - 已录用
   - `rejected` - 已拒绝

3. **工时状态**
   - `pending` - 待审核
   - `approved` - 已批准
   - `rejected` - 已拒绝

4. **权限验证**
   - 所有操作都会验证 MO 身份
   - 只能操作自己创建的职位相关数据

## 🚀 启动服务器

```bash
双击运行: QUICK-START.bat
访问: http://localhost:9191
```

## ❌ 未实现的功能

- AI 智能匹配（已跳过）
- AI 排名推荐（已跳过）
- AI 聊天助手（已跳过）
- AI 异常检测（已跳过）

## 📂 文件结构

```
src/com/bupt/ta/mo/interfaces/
├── MOJobServlet.java          ✅ 职位管理
├── MOApplicantServlet.java    ✅ 申请人管理
├── MOTimesheetServlet.java    ✅ 工时审核
└── MOModuleServlet.java       ✅ 课程模块
```

---

**MO 端后端功能已全部完成！** 🎉

现在可以重新启动服务器测试 MO 端的所有功能。
