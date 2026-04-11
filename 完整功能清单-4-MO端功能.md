# 完整功能清单 - 第4部分：MO端功能

## 15. MO 职位管理

### 功能作用
MO（Module Organizer）可以创建、编辑、删除和发布 TA 职位，管理自己负责课程的招聘需求。

### 涉及文件
**后端**
- `src/com/bupt/ta/mo/interfaces/MOJobServlet.java`
- `src/com/bupt/ta/shared/infrastructure/JobRepository.java`
- `src/com/bupt/ta/shared/domain/Job.java`

**前端**
- `web/mo/dashboard.html` - MO 仪表板
- `web/mo/job-create.html` - 创建职位页面
- `web/mo/job-edit.html` - 编辑职位页面

### 数据链路

#### 创建职位
```
前端提交职位信息
  ↓
API.mo.createJob(jobData)
  ↓
POST /api/mo/jobs
  ↓
MOJobServlet.doPost()
  ↓
验证：用户已登录且角色为 MO
  ↓
验证：必填字段（title）
  ↓
生成职位 ID (JobRepository.generateId)
  ↓
创建 Job 对象
  - createdBy: 当前 MO ID
  - status: 'draft'
  - createdAt: 当前时间
  ↓
JobRepository.save()
  ↓
写入 jobs.json
  ↓
返回职位信息
```

#### 编辑职位
```
前端提交更新数据
  ↓
API.mo.updateJob(jobId, jobData)
  ↓
PUT /api/mo/jobs/{id}
  ↓
MOJobServlet.doPut()
  ↓
验证：职位存在
  ↓
验证：职位属于当前 MO
  ↓
验证：职位状态为 draft
  ↓
更新字段（title, description, requirements 等）
  ↓
JobRepository.save()
  ↓
返回更新后的职位
```

#### 发布职位
```
前端点击发布
  ↓
API.mo.submitJob(jobId)
  ↓
POST /api/mo/jobs/{id}/submit
  ↓
MOJobServlet.handleSubmitJob()
  ↓
验证：职位存在且属于当前 MO
  ↓
验证：职位状态为 draft
  ↓
更新状态：draft → published
  ↓
设置 publishedAt 时间
  ↓
JobRepository.save()
  ↓
返回成功（职位立即可见）
```

#### 删除职位
```
前端点击删除
  ↓
API.mo.deleteJob(jobId)
  ↓
DELETE /api/mo/jobs/{id}
  ↓
MOJobServlet.doDelete()
  ↓
验证：职位存在且属于当前 MO
  ↓
验证：职位状态为 draft
  ↓
JobRepository.delete(jobId)
  ↓
从 jobs.json 删除
  ↓
返回成功
```

### 设计思路
**草稿-发布模式 + 权限控制**
- 新建职位初始状态为 draft（草稿）
- 只有草稿状态可以编辑和删除
- 发布后直接变为 published（跳过 Admin 审核）
- 只能管理自己创建的职位（createdBy 验证）
- 支持按状态筛选职位列表

### 实现逻辑

#### 权限验证
```java
// 验证 MO 角色
User currentUser = SessionUtil.getCurrentUser(request);
if (currentUser == null || !"mo".equals(currentUser.getRole())) {
    ResponseUtil.sendError(response, 401, "未授权");
    return;
}

// 验证职位所有权
if (!currentUser.getId().equals(job.getCreatedBy())) {
    ResponseUtil.sendError(response, 403, "无权操作");
    return;
}
```

#### 状态控制
```java
// 只有草稿可以编辑
if (!"draft".equals(existingJob.getStatus())) {
    ResponseUtil.sendError(response, 400, "只能修改草稿状态的职位");
    return;
}

// 只有草稿可以删除
if (!"draft".equals(job.getStatus())) {
    ResponseUtil.sendError(response, 400, "只能删除草稿状态的职位");
    return;
}
```

#### 直接发布（无需审核）
```java
// 提交即发布
job.setStatus("published");
job.setPublishedAt(LocalDateTime.now());
jobRepo.save(job);
```

---

## 16. MO 申请人管理

### 功能作用
MO 可以查看自己职位的所有申请，审核申请人资料，接受或拒绝申请。

### 涉及文件
**后端**
- `src/com/bupt/ta/mo/interfaces/MOApplicantServlet.java`
- `src/com/bupt/ta/shared/infrastructure/ApplicationRepository.java`
- `src/com/bupt/ta/shared/infrastructure/StudentRepository.java`
- `src/com/bupt/ta/shared/domain/Application.java`

**前端**
- `web/mo/applicants.html` - 申请人列表
- `web/mo/applicant-detail.html` - 申请人详情

### 数据链路

#### 获取申请人列表
```
前端请求
  ↓
API.mo.getApplicants(params)
  ↓
GET /api/mo/applicants?jobId=xxx&status=pending
  ↓
MOApplicantServlet.doGet()
  ↓
验证：用户已登录且角色为 MO
  ↓
查询当前 MO 的所有职位
  ↓
过滤：只显示这些职位的申请
  ↓
按 jobId 和 status 筛选
  ↓
关联查询学生信息（StudentRepository）
  ↓
关联查询职位信息（JobRepository）
  ↓
返回申请列表（含学生和职位详情）
```

#### 审核申请
```
前端提交审核结果
  ↓
API.mo.reviewApplication(applicationId, action, comment)
  ↓
PUT /api/mo/applicants/{id}/status
  ↓
MOApplicantServlet.doPut()
  ↓
验证：申请存在
  ↓
验证：职位属于当前 MO
  ↓
验证：申请状态为 pending
  ↓
验证：action 为 accept 或 reject
  ↓
更新申请状态
  - accept → status = 'accepted'
  - reject → status = 'rejected'
  ↓
记录审核信息
  - reviewedBy: 当前 MO ID
  - reviewedAt: 当前时间
  - reviewComment: 审核意见
  ↓
ApplicationRepository.save()
  ↓
返回更新后的申请
```

### 设计思路
**关联查询 + 权限过滤**
- 只显示当前 MO 职位的申请
- 关联查询学生和职位信息，减少前端请求
- 只能审核 pending 状态的申请
- 记录审核人和审核时间
- 支持添加审核意见

### 实现逻辑

#### 权限过滤
```java
// 获取当前 MO 的所有职位
List<Job> myJobs = jobRepo.findAll().stream()
        .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
        .collect(Collectors.toList());

Set<String> myJobIds = myJobs.stream()
        .map(Job::getId)
        .collect(Collectors.toSet());

// 只显示这些职位的申请
applications = applications.stream()
        .filter(app -> myJobIds.contains(app.getJobId()))
        .collect(Collectors.toList());
```

#### 关联查询
```java
// 补充学生和职位信息
for (Application app : applications) {
    Map<String, Object> item = new HashMap<>();
    item.put("application", app);
    
    // 添加学生信息
    Optional<Student> studentOpt = studentRepo.findById(app.getStudentId());
    if (studentOpt.isPresent()) {
        item.put("student", studentInfo);
    }
    
    // 添加职位信息
    Optional<Job> jobOpt = jobRepo.findById(app.getJobId());
    if (jobOpt.isPresent()) {
        item.put("job", jobInfo);
    }
    
    result.add(item);
}
```

#### 审核处理
```java
// 更新状态
if ("accept".equals(action)) {
    app.setStatus("accepted");
} else {
    app.setStatus("rejected");
}

app.setReviewedBy(currentUser.getId());
app.setReviewedAt(LocalDateTime.now());
app.setReviewComment(comment);
app.setUpdatedAt(LocalDateTime.now());

applicationRepo.save(app);
```

---

## 17. MO 工时审核

### 功能作用
MO 可以查看和审核学生提交的工时表，批准或拒绝工时记录，可以调整批准的工时数。

### 涉及文件
**后端**
- `src/com/bupt/ta/mo/interfaces/MOTimesheetServlet.java`
- `src/com/bupt/ta/shared/infrastructure/TimesheetRepository.java`
- `src/com/bupt/ta/shared/infrastructure/ApplicationRepository.java`
- `src/com/bupt/ta/shared/domain/Timesheet.java`

**前端**
- `web/mo/timesheets.html` - 工时表列表
- `web/mo/timesheet-review.html` - 工时审核页面

### 数据链路

#### 获取工时表列表
```
前端请求
  ↓
API.mo.getTimesheets(params)
  ↓
GET /api/mo/timesheets?status=pending&jobId=xxx
  ↓
MOTimesheetServlet.doGet()
  ↓
验证：用户已登录且角色为 MO
  ↓
查询当前 MO 的所有职位
  ↓
查询这些职位的所有申请
  ↓
过滤：只显示这些申请的工时表
  ↓
按 status 和 jobId 筛选
  ↓
关联查询学生、职位信息
  ↓
返回工时表列表（含关联信息）
```

#### 审核工时表
```
前端提交审核结果
  ↓
API.mo.reviewTimesheet(timesheetId, action, approvedHours, comment)
  ↓
PUT /api/mo/timesheets/{id}/review
  ↓
MOTimesheetServlet.doPut()
  ↓
验证：工时表存在
  ↓
验证：关联的职位属于当前 MO
  ↓
验证：工时表状态为 pending
  ↓
验证：action 为 approve 或 reject
  ↓
更新工时表状态
  - approve → status = 'approved'
    - approvedHours = 传入值或原值
  - reject → status = 'rejected'
    - approvedHours = 0
  ↓
记录审核信息
  - reviewedBy: 当前 MO ID
  - reviewedAt: 当前时间
  - reviewComment: 审核意见
  ↓
TimesheetRepository.save()
  ↓
返回更新后的工时表
```

### 设计思路
**多级关联 + 可调整工时**
- 通过 Application 关联到 Job，验证权限
- 支持调整批准工时（approvedHours）
- 拒绝时批准工时自动设为 0
- 只能审核 pending 状态的工时表
- 记录审核人、时间和意见

### 实现逻辑

#### 多级权限验证
```java
// 获取当前 MO 的所有职位
List<Job> myJobs = jobRepo.findAll().stream()
        .filter(job -> currentUser.getId().equals(job.getCreatedBy()))
        .collect(Collectors.toList());

Set<String> myJobIds = myJobs.stream()
        .map(Job::getId)
        .collect(Collectors.toSet());

// 获取这些职位的所有申请
List<Application> applications = applicationRepo.findAll().stream()
        .filter(app -> myJobIds.contains(app.getJobId()))
        .collect(Collectors.toList());

Set<String> applicationIds = applications.stream()
        .map(Application::getId)
        .collect(Collectors.toSet());

// 只显示这些申请的工时表
timesheets = timesheets.stream()
        .filter(ts -> applicationIds.contains(ts.getApplicationId()))
        .collect(Collectors.toList());
```

#### 可调整工时审核
```java
// 读取审核请求
String action = (String) requestData.get("action");
String comment = (String) requestData.get("comment");
Double approvedHours = requestData.get("approvedHours") != null ? 
        ((Number) requestData.get("approvedHours")).doubleValue() : null;

// 更新状态
if ("approve".equals(action)) {
    ts.setStatus("approved");
    // 如果提供了批准工时，使用提供的值，否则使用原值
    if (approvedHours != null) {
        ts.setApprovedHours(approvedHours);
    } else {
        ts.setApprovedHours(ts.getHoursWorked());
    }
} else {
    ts.setStatus("rejected");
    ts.setApprovedHours(0.0); // 拒绝时工时为 0
}

ts.setReviewedBy(currentUser.getId());
ts.setReviewedAt(LocalDateTime.now());
ts.setReviewComment(comment);
```

---

## 18. MO 课程模块查看

### 功能作用
MO 可以查看自己负责的课程模块信息，包括课程代码、名称、学分等。

### 涉及文件
**后端**
- `src/com/bupt/ta/mo/interfaces/MOModuleServlet.java`
- `src/com/bupt/ta/shared/infrastructure/ModuleRepository.java`
- `src/com/bupt/ta/shared/domain/CourseModule.java`

**前端**
- `web/mo/modules.html` - 课程模块列表
- `web/mo/module-detail.html` - 课程详情

### 数据链路

#### 获取课程列表
```
前端请求
  ↓
API.mo.getModules()
  ↓
GET /api/mo/modules
  ↓
MOModuleServlet.doGet()
  ↓
验证：用户已登录且角色为 MO
  ↓
ModuleRepository.findAll()
  ↓
DataStore.loadModules()
  ↓
读取 modules.json
  ↓
过滤：coordinatorId = 当前 MO ID
  ↓
返回课程列表
```

#### 获取课程详情
```
前端请求
  ↓
API.mo.getModule(moduleId)
  ↓
GET /api/mo/modules/{id}
  ↓
MOModuleServlet.doGet()
  ↓
验证：用户已登录且角色为 MO
  ↓
ModuleRepository.findById(moduleId)
  ↓
验证：coordinatorId = 当前 MO ID
  ↓
返回课程详情
```

### 设计思路
**只读接口 + 权限过滤**
- MO 只能查看自己负责的课程
- 不提供创建、编辑、删除功能（由 Admin 管理）
- 通过 coordinatorId 关联 MO 和课程
- 用于创建职位时选择课程

### 实现逻辑

#### 权限过滤
```java
// 获取课程列表
List<CourseModule> modules = moduleRepo.findAll();

// 只显示当前 MO 负责的课程
modules = modules.stream()
        .filter(module -> currentUser.getId().equals(module.getCoordinatorId()))
        .collect(Collectors.toList());

ResponseUtil.sendSuccess(response, "获取成功", modules);
```

#### 详情权限验证
```java
// 获取课程详情
Optional<CourseModule> moduleOpt = moduleRepo.findById(moduleId);
if (!moduleOpt.isPresent()) {
    ResponseUtil.sendError(response, 404, "课程不存在");
    return;
}

CourseModule module = moduleOpt.get();

// 验证权限：只能查看自己负责的课程
if (!currentUser.getId().equals(module.getCoordinatorId())) {
    ResponseUtil.sendError(response, 403, "无权访问");
    return;
}

ResponseUtil.sendSuccess(response, "获取成功", module);
```

---

## MO端功能总结

### 核心特点
1. **权限隔离**：MO 只能管理自己创建的职位和相关数据
2. **直接发布**：职位提交后直接发布，无需 Admin 审核
3. **完整流程**：职位创建 → 申请审核 → 工时审核
4. **关联查询**：自动补充学生、职位等关联信息
5. **状态控制**：草稿可编辑删除，已发布不可修改

### API 端点汇总
```
职位管理：
  GET    /api/mo/jobs              - 获取职位列表
  GET    /api/mo/jobs/{id}         - 获取职位详情
  POST   /api/mo/jobs              - 创建职位
  PUT    /api/mo/jobs/{id}         - 更新职位
  DELETE /api/mo/jobs/{id}         - 删除职位
  POST   /api/mo/jobs/{id}/submit  - 发布职位

申请人管理：
  GET    /api/mo/applicants        - 获取申请人列表
  GET    /api/mo/applicants/{id}   - 获取申请详情
  PUT    /api/mo/applicants/{id}/status - 审核申请

工时审核：
  GET    /api/mo/timesheets        - 获取工时表列表
  GET    /api/mo/timesheets/{id}   - 获取工时表详情
  PUT    /api/mo/timesheets/{id}/review - 审核工时表

课程模块：
  GET    /api/mo/modules           - 获取课程列表
  GET    /api/mo/modules/{id}      - 获取课程详情
```

### 数据流转
```
MO 创建职位（draft）
  ↓
MO 发布职位（published）
  ↓
学生申请职位（pending）
  ↓
MO 审核申请（accepted/rejected）
  ↓
学生提交工时（pending）
  ↓
MO 审核工时（approved/rejected）
```
