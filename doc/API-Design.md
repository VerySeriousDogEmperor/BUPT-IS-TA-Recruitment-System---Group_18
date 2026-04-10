# BUPT TA Recruitment System - API 设计文档

> 版本：v1.0  
> 更新时间：2026-04-07  
> 负责人：Tech Lead (Yifei)

---

## 📋 目录

1. [设计原则](#设计原则)
2. [统一响应格式](#统一响应格式)
3. [认证模块 API](#认证模块-api)
4. [学生端 API](#学生端-api)
5. [MO端 API](#mo端-api)
6. [Admin端 API](#admin端-api)
7. [AI模块 API](#ai模块-api)
8. [数据模型定义](#数据模型定义)
9. [错误码规范](#错误码规范)

---

## 设计原则

### RESTful 风格
- 使用资源导向的 URL 设计
- HTTP 方法语义化（GET/POST/PUT/DELETE）
- 统一的响应格式

### 路径规范
```
/api/{module}/{resource}/{id?}/{action?}
```

### 认证方式
- 使用 Session + Cookie
- 前端请求携带 `credentials: 'include'`
- 后端通过 HttpSession 管理用户状态

---

## 统一响应格式

所有接口返回统一的 JSON 结构：

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 实际数据
  }
}
```

### 失败响应
```json
{
  "code": 400,
  "message": "错误描述",
  "data": null
}
```

### 分页响应
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "size": 10
  }
}
```

---

## 认证模块 API

### 1. 用户注册

**接口：** `POST /api/auth/register`

**请求参数：**
```json
{
  "name": "张三",
  "email": "zhangsan@bupt.edu.cn",
  "studentId": "2021211001",
  "phone": "13800138000",
  "major": "计算机科学与技术",
  "password": "password123"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "id": "S001",
    "name": "张三",
    "email": "zhangsan@bupt.edu.cn",
    "role": "student"
  }
}
```

**业务规则：**
- 邮箱必须是 @bupt.edu.cn 结尾
- 学号必须唯一
- 密码长度至少 6 位


### 2. 用户登录

**接口：** `POST /api/auth/login`

**请求参数：**
```json
{
  "email": "zhangsan@bupt.edu.cn",
  "password": "password123",
  "role": "student"  // student | mo | admin
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "id": "S001",
    "name": "张三",
    "email": "zhangsan@bupt.edu.cn",
    "role": "student"
  }
}
```

**业务规则：**
- 验证邮箱和密码
- 根据 role 参数判断用户类型
- 登录成功后创建 Session

---

### 3. 获取当前用户信息

**接口：** `GET /api/auth/me`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "S001",
    "name": "张三",
    "email": "zhangsan@bupt.edu.cn",
    "role": "student"
  }
}
```

---

### 4. 用户登出

**接口：** `POST /api/auth/logout`

**响应数据：**
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

## 学生端 API

### 1. 获取个人信息

**接口：** `GET /api/student/profile`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "S001",
    "name": "张三",
    "email": "zhangsan@bupt.edu.cn",
    "studentId": "2021211001",
    "phone": "13800138000",
    "major": "计算机科学与技术",
    "grade": "大三",
    "gpa": 3.8,
    "skills": ["Java", "Python", "React"],
    "resume": {
      "education": [...],
      "experience": [...],
      "awards": [...]
    },
    "schedule": {
      "monday": ["08:00-10:00", "14:00-16:00"],
      "tuesday": [...],
      ...
    }
  }
}
```


### 2. 更新个人信息

**接口：** `PUT /api/student/profile`

**请求参数：**
```json
{
  "phone": "13900139000",
  "major": "软件工程",
  "gpa": 3.9,
  "skills": ["Java", "Python", "React", "Vue"],
  "resume": {
    "education": [
      {
        "school": "北京邮电大学",
        "degree": "本科",
        "major": "计算机科学与技术",
        "startDate": "2021-09",
        "endDate": "2025-06",
        "gpa": 3.8
      }
    ],
    "experience": [
      {
        "company": "字节跳动",
        "position": "前端实习生",
        "startDate": "2024-06",
        "endDate": "2024-09",
        "description": "负责..."
      }
    ],
    "awards": [
      {
        "name": "国家奖学金",
        "date": "2023-12",
        "description": "..."
      }
    ]
  }
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    // 更新后的完整个人信息
  }
}
```

---

### 3. 获取我的申请列表

**接口：** `GET /api/student/applications`

**查询参数：**
- `status` - 申请状态筛选（pending/approved/rejected）
- `page` - 页码（默认 1）
- `size` - 每页数量（默认 10）

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "APP001",
        "jobId": "JOB001",
        "jobTitle": "数据结构课程助教",
        "department": "计算机学院",
        "status": "pending",  // pending | approved | rejected | withdrawn
        "appliedAt": "2026-04-01T10:00:00Z",
        "updatedAt": "2026-04-01T10:00:00Z",
        "timeline": [
          {
            "status": "submitted",
            "time": "2026-04-01T10:00:00Z",
            "note": "申请已提交"
          }
        ]
      }
    ],
    "total": 5,
    "page": 1,
    "size": 10
  }
}
```


### 4. 申请职位

**接口：** `POST /api/student/applications`

**请求参数：**
```json
{
  "jobId": "JOB001",
  "coverLetter": "我对这个职位很感兴趣..."
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "申请成功",
  "data": {
    "id": "APP001",
    "jobId": "JOB001",
    "status": "pending",
    "appliedAt": "2026-04-01T10:00:00Z"
  }
}
```

**业务规则：**
- 学生不能重复申请同一职位
- 只能申请状态为 "published" 的职位
- 检查排课时间冲突（可选警告）

---

### 5. 撤回申请

**接口：** `DELETE /api/student/applications/{applicationId}`

**响应数据：**
```json
{
  "code": 200,
  "message": "申请已撤回",
  "data": null
}
```

**业务规则：**
- 只能撤回状态为 "pending" 的申请
- 已批准或已拒绝的申请不能撤回

---

### 6. 获取工时记录

**接口：** `GET /api/student/timesheets`

**查询参数：**
- `status` - 状态筛选（pending/approved/rejected）
- `startDate` - 开始日期
- `endDate` - 结束日期

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "TS001",
      "jobId": "JOB001",
      "jobTitle": "数据结构课程助教",
      "date": "2026-04-01",
      "hours": 4,
      "description": "批改作业",
      "status": "pending",
      "submittedAt": "2026-04-01T18:00:00Z",
      "reviewedAt": null,
      "reviewNote": null
    }
  ]
}
```

---

### 7. 提交工时

**接口：** `POST /api/student/timesheets`

**请求参数：**
```json
{
  "jobId": "JOB001",
  "date": "2026-04-01",
  "hours": 4,
  "description": "批改作业"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "工时提交成功",
  "data": {
    "id": "TS001",
    "status": "pending"
  }
}
```


### 8. 更新排课时间

**接口：** `POST /api/student/schedule`

**请求参数：**
```json
{
  "schedule": {
    "monday": ["08:00-10:00", "14:00-16:00"],
    "tuesday": ["10:00-12:00"],
    "wednesday": [],
    "thursday": ["14:00-16:00", "16:00-18:00"],
    "friday": ["08:00-10:00"],
    "saturday": [],
    "sunday": []
  }
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "排课时间已更新",
  "data": null
}
```

---

### 9. 浏览职位列表（公开接口）

**接口：** `GET /api/jobs`

**查询参数：**
- `department` - 院系筛选
- `type` - 职位类型（TA/RA/Grader）
- `keyword` - 关键词搜索
- `page` - 页码
- `size` - 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "JOB001",
        "title": "数据结构课程助教",
        "department": "计算机学院",
        "type": "TA",
        "description": "协助教师完成课程教学...",
        "requirements": ["熟悉数据结构", "有耐心"],
        "requiredSkills": ["C++", "算法"],
        "hoursPerWeek": 10,
        "hourlyRate": 50,
        "schedule": {
          "monday": ["14:00-16:00"],
          "wednesday": ["14:00-16:00"]
        },
        "startDate": "2026-09-01",
        "endDate": "2027-01-15",
        "slots": 2,
        "applicants": 15,
        "status": "published",
        "postedAt": "2026-04-01T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 10
  }
}
```

---

### 10. 获取职位详情（公开接口）

**接口：** `GET /api/jobs/{jobId}`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "JOB001",
    "title": "数据结构课程助教",
    "department": "计算机学院",
    "type": "TA",
    "description": "协助教师完成课程教学...",
    "responsibilities": [
      "批改作业",
      "答疑辅导",
      "监考"
    ],
    "requirements": ["熟悉数据结构", "有耐心"],
    "requiredSkills": ["C++", "算法"],
    "hoursPerWeek": 10,
    "hourlyRate": 50,
    "schedule": {
      "monday": ["14:00-16:00"],
      "wednesday": ["14:00-16:00"]
    },
    "startDate": "2026-09-01",
    "endDate": "2027-01-15",
    "slots": 2,
    "applicants": 15,
    "status": "published",
    "moName": "李老师",
    "moEmail": "liteacher@bupt.edu.cn",
    "postedAt": "2026-04-01T10:00:00Z"
  }
}
```

---

## MO端 API


### 1. 获取我的模块列表

**接口：** `GET /api/mo/modules`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "MOD001",
      "name": "数据结构",
      "code": "CS201",
      "semester": "2026春季",
      "activeJobs": 3,
      "totalApplicants": 45
    }
  ]
}
```

---

### 2. 获取模块详情

**接口：** `GET /api/mo/modules/{moduleId}`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": "MOD001",
    "name": "数据结构",
    "code": "CS201",
    "semester": "2026春季",
    "description": "...",
    "jobs": [
      {
        "id": "JOB001",
        "title": "数据结构课程助教",
        "status": "published",
        "applicants": 15
      }
    ]
  }
}
```

---

### 3. 获取我的职位列表

**接口：** `GET /api/mo/jobs`

**查询参数：**
- `status` - 状态筛选（draft/pending/published/completed）
- `page` - 页码
- `size` - 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "JOB001",
        "title": "数据结构课程助教",
        "moduleId": "MOD001",
        "moduleName": "数据结构",
        "status": "published",  // draft | pending | published | completed
        "slots": 2,
        "applicants": 15,
        "hired": 2,
        "createdAt": "2026-03-15T10:00:00Z",
        "publishedAt": "2026-04-01T10:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "size": 10
  }
}
```

---

### 4. 创建职位

**接口：** `POST /api/mo/jobs`

**请求参数：**
```json
{
  "moduleId": "MOD001",
  "title": "数据结构课程助教",
  "type": "TA",
  "description": "协助教师完成课程教学...",
  "responsibilities": ["批改作业", "答疑辅导"],
  "requirements": ["熟悉数据结构", "有耐心"],
  "requiredSkills": ["C++", "算法"],
  "hoursPerWeek": 10,
  "hourlyRate": 50,
  "schedule": {
    "monday": ["14:00-16:00"],
    "wednesday": ["14:00-16:00"]
  },
  "startDate": "2026-09-01",
  "endDate": "2027-01-15",
  "slots": 2
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "职位创建成功",
  "data": {
    "id": "JOB001",
    "status": "draft"
  }
}
```


### 5. 更新职位

**接口：** `PUT /api/mo/jobs/{jobId}`

**请求参数：** 同创建职位

**响应数据：**
```json
{
  "code": 200,
  "message": "职位更新成功",
  "data": null
}
```

**业务规则：**
- 只能更新状态为 "draft" 的职位
- 已发布的职位不能修改核心信息

---

### 6. 提交职位审核

**接口：** `POST /api/mo/jobs/{jobId}/submit`

**响应数据：**
```json
{
  "code": 200,
  "message": "职位已提交审核",
  "data": {
    "status": "pending"
  }
}
```

**业务规则：**
- 只能提交状态为 "draft" 的职位
- 提交后状态变为 "pending"，等待 Admin 审核

---

### 7. 删除职位

**接口：** `DELETE /api/mo/jobs/{jobId}`

**响应数据：**
```json
{
  "code": 200,
  "message": "职位已删除",
  "data": null
}
```

**业务规则：**
- 只能删除状态为 "draft" 的职位
- 已发布的职位不能删除

---

### 8. 获取申请人列表

**接口：** `GET /api/mo/applicants`

**查询参数：**
- `jobId` - 职位ID筛选
- `status` - 申请状态筛选
- `sortBy` - 排序字段（aiScore/appliedAt）
- `page` - 页码
- `size` - 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "APP001",
        "studentId": "S001",
        "studentName": "张三",
        "studentEmail": "zhangsan@bupt.edu.cn",
        "jobId": "JOB001",
        "jobTitle": "数据结构课程助教",
        "status": "pending",
        "appliedAt": "2026-04-01T10:00:00Z",
        "aiScore": 85,
        "aiRank": 3,
        "matchedSkills": ["C++", "算法"],
        "missingSkills": [],
        "gpa": 3.8,
        "coverLetter": "我对这个职位很感兴趣..."
      }
    ],
    "total": 15,
    "page": 1,
    "size": 10
  }
}
```

---

### 9. 更新申请状态

**接口：** `PUT /api/mo/applicants/{applicationId}/status`

**请求参数：**
```json
{
  "status": "approved",  // approved | rejected
  "note": "符合要求，录用"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "申请状态已更新",
  "data": null
}
```


### 10. 获取工时列表

**接口：** `GET /api/mo/timesheets`

**查询参数：**
- `jobId` - 职位ID筛选
- `studentId` - 学生ID筛选
- `status` - 状态筛选
- `startDate` - 开始日期
- `endDate` - 结束日期

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "TS001",
      "studentId": "S001",
      "studentName": "张三",
      "jobId": "JOB001",
      "jobTitle": "数据结构课程助教",
      "date": "2026-04-01",
      "hours": 4,
      "description": "批改作业",
      "status": "pending",
      "submittedAt": "2026-04-01T18:00:00Z",
      "hasAnomaly": false,
      "anomalyReason": null
    }
  ]
}
```

---

### 11. 审核工时

**接口：** `PUT /api/mo/timesheets/{timesheetId}/review`

**请求参数：**
```json
{
  "status": "approved",  // approved | rejected
  "note": "工时合理"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "工时审核完成",
  "data": null
}
```

---

## Admin端 API

### 1. 获取仪表板数据

**接口：** `GET /api/admin/dashboard`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "stats": {
      "totalJobs": 50,
      "activeJobs": 30,
      "totalApplicants": 500,
      "totalStudents": 200,
      "totalMOs": 20,
      "budgetUsed": 150000,
      "budgetTotal": 200000
    },
    "recentJobs": [
      {
        "id": "JOB001",
        "title": "数据结构课程助教",
        "moName": "李老师",
        "status": "pending",
        "submittedAt": "2026-04-01T10:00:00Z"
      }
    ],
    "aiPrediction": {
      "budgetExhaustDate": "2026-12-15",
      "warning": "预算可能在学期结束前耗尽",
      "recommendation": "建议控制新职位发布"
    }
  }
}
```

---

### 2. 获取所有职位

**接口：** `GET /api/admin/jobs`

**查询参数：**
- `status` - 状态筛选
- `department` - 院系筛选
- `page` - 页码
- `size` - 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "JOB001",
        "title": "数据结构课程助教",
        "department": "计算机学院",
        "moName": "李老师",
        "status": "pending",
        "slots": 2,
        "applicants": 15,
        "budgetImpact": 10000,
        "submittedAt": "2026-04-01T10:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "size": 10
  }
}
```


### 3. 审核职位

**接口：** `PUT /api/admin/jobs/{jobId}/review`

**请求参数：**
```json
{
  "action": "approve",  // approve | reject
  "comment": "职位信息完整，批准发布"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "审核完成",
  "data": {
    "status": "published"  // 或 "rejected"
  }
}
```

**业务规则：**
- 批准后职位状态变为 "published"
- 拒绝后职位状态变为 "draft"，MO 可以修改后重新提交

---

### 4. 获取用户列表

**接口：** `GET /api/admin/users`

**查询参数：**
- `role` - 角色筛选（student/mo/admin）
- `status` - 状态筛选（active/inactive）
- `keyword` - 关键词搜索
- `page` - 页码
- `size` - 每页数量

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "S001",
        "name": "张三",
        "email": "zhangsan@bupt.edu.cn",
        "role": "student",
        "status": "active",
        "createdAt": "2026-01-01T10:00:00Z",
        "lastLoginAt": "2026-04-01T10:00:00Z"
      }
    ],
    "total": 200,
    "page": 1,
    "size": 10
  }
}
```

---

### 5. 创建用户

**接口：** `POST /api/admin/users`

**请求参数：**
```json
{
  "name": "李四",
  "email": "lisi@bupt.edu.cn",
  "role": "mo",
  "password": "defaultPassword123",
  "department": "计算机学院"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "用户创建成功",
  "data": {
    "id": "MO001",
    "name": "李四",
    "email": "lisi@bupt.edu.cn",
    "role": "mo"
  }
}
```

---

### 6. 更新用户状态

**接口：** `PUT /api/admin/users/{userId}/status`

**请求参数：**
```json
{
  "status": "inactive"  // active | inactive
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "用户状态已更新",
  "data": null
}
```

---

### 7. 获取招聘统计

**接口：** `GET /api/admin/recruitment`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "byDepartment": [
      {
        "department": "计算机学院",
        "totalJobs": 20,
        "totalSlots": 40,
        "totalApplicants": 200,
        "hired": 35
      }
    ],
    "byStatus": {
      "draft": 5,
      "pending": 10,
      "published": 30,
      "completed": 5
    },
    "timeline": [
      {
        "date": "2026-04-01",
        "newJobs": 3,
        "newApplicants": 25
      }
    ]
  }
}
```


### 8. 获取工作量统计

**接口：** `GET /api/admin/workload`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "byStudent": [
      {
        "studentId": "S001",
        "studentName": "张三",
        "totalHours": 40,
        "totalJobs": 2,
        "totalEarnings": 2000
      }
    ],
    "byJob": [
      {
        "jobId": "JOB001",
        "jobTitle": "数据结构课程助教",
        "totalHours": 80,
        "totalCost": 4000
      }
    ],
    "summary": {
      "totalHours": 5000,
      "totalCost": 250000,
      "averageHoursPerStudent": 25
    }
  }
}
```

---

## AI模块 API

### 1. 技能匹配分析

**接口：** `POST /api/ai/match`

**请求参数：**
```json
{
  "studentId": "S001",
  "jobId": "JOB001"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "score": 85,
    "matchedSkills": ["C++", "算法"],
    "missingSkills": ["数据库"],
    "gpaMatch": true,
    "scheduleConflict": false,
    "recommendation": "强烈推荐申请",
    "analysis": {
      "skillMatch": 0.9,
      "gpaMatch": 0.95,
      "scheduleMatch": 1.0
    }
  }
}
```

---

### 2. 候选人排序

**接口：** `GET /api/ai/rank/{jobId}`

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "applicationId": "APP001",
      "studentId": "S001",
      "studentName": "张三",
      "score": 95,
      "rank": 1,
      "badge": "gold",  // gold | silver | bronze | null
      "matchedSkills": ["C++", "算法", "数据结构"],
      "gpa": 3.9
    },
    {
      "applicationId": "APP002",
      "studentId": "S002",
      "studentName": "李四",
      "score": 88,
      "rank": 2,
      "badge": "silver",
      "matchedSkills": ["C++", "算法"],
      "gpa": 3.7
    }
  ]
}
```

---

### 3. AI 对话

**接口：** `POST /api/ai/chat`

**请求参数：**
```json
{
  "message": "有哪些适合我的职位？",
  "sessionId": "session123"
}
```

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "reply": "根据您的技能和背景，我推荐以下职位...",
    "sessionId": "session123",
    "recommendations": [
      {
        "jobId": "JOB001",
        "jobTitle": "数据结构课程助教",
        "matchScore": 85
      }
    ]
  }
}
```


### 4. 工时异常检测

**接口：** `GET /api/ai/anomaly`

**查询参数：**
- `jobId` - 职位ID筛选
- `startDate` - 开始日期
- `endDate` - 结束日期

**响应数据：**
```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "timesheetId": "TS001",
      "studentId": "S001",
      "studentName": "张三",
      "jobId": "JOB001",
      "date": "2026-04-01",
      "hours": 12,
      "averageHours": 4,
      "deviation": 2.0,
      "isAnomaly": true,
      "reason": "工时超出平均值 2 倍标准差",
      "suggestion": "建议核实工作内容"
    }
  ]
}
```

---

## 数据模型定义

### User（用户基类）
```java
{
  "id": "String",           // 用户ID
  "name": "String",         // 姓名
  "email": "String",        // 邮箱
  "password": "String",     // 密码（加密存储）
  "role": "String",         // 角色：student | mo | admin
  "status": "String",       // 状态：active | inactive
  "createdAt": "DateTime",  // 创建时间
  "lastLoginAt": "DateTime" // 最后登录时间
}
```

### Student（学生）
```java
{
  // 继承 User 的所有字段
  "studentId": "String",    // 学号
  "phone": "String",        // 手机号
  "major": "String",        // 专业
  "grade": "String",        // 年级
  "gpa": "Double",          // GPA
  "skills": ["String"],     // 技能列表
  "resume": "Resume",       // 简历
  "schedule": "Schedule"    // 排课时间
}
```

### Resume（简历）
```java
{
  "education": [
    {
      "school": "String",
      "degree": "String",
      "major": "String",
      "startDate": "String",
      "endDate": "String",
      "gpa": "Double"
    }
  ],
  "experience": [
    {
      "company": "String",
      "position": "String",
      "startDate": "String",
      "endDate": "String",
      "description": "String"
    }
  ],
  "awards": [
    {
      "name": "String",
      "date": "String",
      "description": "String"
    }
  ]
}
```

### Schedule（排课时间）
```java
{
  "monday": ["String"],     // ["08:00-10:00", "14:00-16:00"]
  "tuesday": ["String"],
  "wednesday": ["String"],
  "thursday": ["String"],
  "friday": ["String"],
  "saturday": ["String"],
  "sunday": ["String"]
}
```

### Job（职位）
```java
{
  "id": "String",
  "moduleId": "String",         // 所属模块ID
  "moId": "String",             // 发布者（MO）ID
  "title": "String",            // 职位标题
  "department": "String",       // 院系
  "type": "String",             // 类型：TA | RA | Grader
  "description": "String",      // 描述
  "responsibilities": ["String"], // 职责
  "requirements": ["String"],   // 要求
  "requiredSkills": ["String"], // 必需技能
  "hoursPerWeek": "Integer",    // 每周工时
  "hourlyRate": "Double",       // 时薪
  "schedule": "Schedule",       // 工作时间
  "startDate": "String",        // 开始日期
  "endDate": "String",          // 结束日期
  "slots": "Integer",           // 招聘人数
  "status": "String",           // 状态：draft | pending | published | completed
  "createdAt": "DateTime",
  "publishedAt": "DateTime"
}
```


### Application（申请）
```java
{
  "id": "String",
  "studentId": "String",
  "jobId": "String",
  "status": "String",           // pending | approved | rejected | withdrawn
  "coverLetter": "String",      // 求职信
  "appliedAt": "DateTime",
  "updatedAt": "DateTime",
  "reviewNote": "String",       // 审核备注
  "aiScore": "Integer",         // AI 匹配分数
  "aiRank": "Integer",          // AI 排名
  "timeline": [
    {
      "status": "String",
      "time": "DateTime",
      "note": "String"
    }
  ]
}
```

### Timesheet（工时记录）
```java
{
  "id": "String",
  "studentId": "String",
  "jobId": "String",
  "date": "String",             // 日期：YYYY-MM-DD
  "hours": "Double",            // 工时
  "description": "String",      // 工作描述
  "status": "String",           // pending | approved | rejected
  "submittedAt": "DateTime",
  "reviewedAt": "DateTime",
  "reviewNote": "String",       // 审核备注
  "hasAnomaly": "Boolean",      // 是否异常
  "anomalyReason": "String"     // 异常原因
}
```

### Module（模块/课程）
```java
{
  "id": "String",
  "name": "String",             // 模块名称
  "code": "String",             // 课程代码
  "department": "String",       // 院系
  "semester": "String",         // 学期
  "moId": "String",             // 负责人ID
  "description": "String",
  "createdAt": "DateTime"
}
```

---

## 错误码规范

### HTTP 状态码
- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未登录
- `403` - 无权限
- `404` - 资源不存在
- `409` - 资源冲突（如重复申请）
- `500` - 服务器错误

### 业务错误码（code 字段）
```
200  - 成功
400  - 请求参数错误
401  - 未登录
403  - 无权限
404  - 资源不存在
409  - 资源冲突
1001 - 邮箱已存在
1002 - 学号已存在
1003 - 密码错误
1004 - 用户不存在
2001 - 职位不存在
2002 - 职位已关闭
2003 - 职位名额已满
2004 - 重复申请
2005 - 排课时间冲突
3001 - 工时记录不存在
3002 - 工时已审核，无法修改
4001 - 权限不足
4002 - 操作不允许
```

### 错误响应示例
```json
{
  "code": 1001,
  "message": "该邮箱已被注册",
  "data": null
}
```

---

## 附录

### 认证流程
1. 用户登录成功后，后端创建 HttpSession
2. 前端请求时携带 `credentials: 'include'`
3. 后端通过 Session 获取当前用户信息
4. 未登录时返回 401，前端跳转到登录页

### 数据存储
- 使用 JSON 文件存储在 `resources/data/` 目录
- 文件命名规范：
  - `students.json` - 学生数据
  - `jobs.json` - 职位数据
  - `applications.json` - 申请数据
  - `timesheets.json` - 工时数据
  - `modules.json` - 模块数据

### 开发优先级
1. **Phase 1 - 认证与基础数据**
   - 认证模块（登录/注册）
   - 学生个人信息管理
   - 职位浏览

2. **Phase 2 - 核心业务流程**
   - 学生申请职位
   - MO 创建和管理职位
   - Admin 审核职位

3. **Phase 3 - 高级功能**
   - 工时管理
   - AI 匹配和排序
   - 异常检测

---

**文档版本：** v1.0  
**最后更新：** 2026-04-07  
**维护者：** Tech Lead (Yifei)
