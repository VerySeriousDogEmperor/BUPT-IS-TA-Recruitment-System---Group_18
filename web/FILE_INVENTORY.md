# Web文件夹完整清单

> 生成时间: 2026-04-07
> 状态: 已清理旧文件，可直接部署

---

## 📁 目录结构概览

```
web/
├── admin/          # 管理员端页面
├── mo/             # Module Organizer端页面
├── student/        # 学生端页面
├── static/         # 静态资源（CSS、JS）
├── WEB-INF/        # Java Web配置（可选）
└── *.html          # 公共页面（首页、登录等）
```

---

## 🌐 公共页面 (web/)

| 文件名 | 说明 | 用途 |
|--------|------|------|
| `index.html` | 系统首页 | 学生端主页，展示系统介绍和职位推荐 |
| `login.html` | 登录页面 | 统一登录入口（学生/MO/Admin） |
| `apply.html` | 职位列表 | 学生浏览和搜索所有可申请职位 |
| `job-detail.html` | 职位详情 | 显示单个职位的详细信息和申请表单 |
| `announcements.html` | 系统公告 | 显示系统通知和重要公告 |
| `guide.html` | 使用指南 | 系统使用说明和帮助文档 |
| `about.html` | 关于页面 | 系统介绍和联系方式 |
| `test-auth.html` | 认证测试 | 开发测试用，验证登录认证功能 |

---

## 👨‍🎓 学生端页面 (web/student/)

| 文件名 | 说明 | 功能描述 |
|--------|------|----------|
| `dashboard.html` | 学生仪表板 | 显示学生的申请状态、工时记录、待办事项 |

---

## 👨‍💼 Module Organizer端页面 (web/mo/)

| 文件名 | 说明 | 功能描述 |
|--------|------|----------|
| `index.html` | MO Dashboard | Kanban看板，管理模块和任务 |
| `jobs.html` | My Modules | 模块管理页面，包含Active Modules和My Requests两个标签页，带Workflow Banner |
| `post-job.html` | Post Job | 职位发布页面，管理Draft/Pending/Published/Completed状态，带Workflow Banner |
| `applicants.html` | Applicants | 申请人管理，表格视图展示所有申请人信息 |
| `timesheets.html` | Timesheets | 工时管理，审批学生提交的工时记录 |
| `knowledge-base.html` | Knowledge Base | 知识库，存储常见问题和文档 |

### MO端特色功能
- ✅ 所有页面包含退出登录按钮
- ✅ 统一的lucide图标风格
- ✅ Workflow Banner（jobs和post-job页面）
- ✅ 侧边栏导航统一

---

## 👨‍💻 管理员端页面 (web/admin/)

| 文件名 | 说明 | 功能描述 |
|--------|------|----------|
| `index.html` | Admin Dashboard | 管理员仪表板，显示系统概览和关键指标 |
| `recruitment.html` | Recruitment Status | 招聘状态监控，查看所有职位的招聘进度 |
| `workload.html` | Workload Control | 工作量控制，管理和分配工作负载 |
| `users.html` | User Management | 用户管理，管理学生、MO和管理员账户 |
| `settings.html` | RAG Settings | RAG系统设置，配置AI助手和知识库 |

---

## 🎨 CSS样式文件 (web/static/css/)

### 公共样式
| 文件名 | 说明 |
|--------|------|
| `common.css` | 全局通用样式（字体、颜色、布局） |
| `components.css` | 可复用组件样式（按钮、卡片、表单） |
| `home.css` | 首页样式 |
| `login.css` | 登录页样式 |
| `apply.css` | 职位列表页样式 |
| `job-detail.css` | 职位详情页样式 |
| `announcements.css` | 公告页样式 |
| `guide.css` | 指南页样式 |
| `about.css` | 关于页样式 |
| `student.css` | 学生端通用样式 |
| `dashboard.css` | 学生仪表板样式 |

### Admin端样式 (web/static/css/admin/)
| 文件名 | 对应页面 |
|--------|----------|
| `admin.css` | Admin通用样式 |
| `recruitment.css` | recruitment.html |
| `workload.css` | workload.html |
| `users.css` | users.html |
| `settings.css` | settings.html |

### MO端样式 (web/static/css/mo/)
| 文件名 | 对应页面 |
|--------|----------|
| `dashboard.css` | index.html (MO Dashboard) |
| `jobs.css` | jobs.html (My Modules) |
| `post-job.css` | post-job.html (Post Job) |
| `applicants.css` | applicants.html (Applicants) |
| `timesheets.css` | timesheets.html (Timesheets) |
| `knowledge-base.css` | knowledge-base.html (Knowledge Base) |

---

## ⚙️ JavaScript文件 (web/static/js/)

### 工具类 (web/static/js/utils/)
| 文件名 | 说明 | 主要功能 |
|--------|------|----------|
| `auth.js` | 认证工具 | 登录验证、Token管理、权限检查、退出登录 |
| `api.js` | API调用 | 封装HTTP请求、统一错误处理 |

### 组件 (web/static/js/components/)
| 文件名 | 说明 |
|--------|------|
| `toast.js` | Toast通知组件 | 显示成功/错误/警告消息 |

### 页面脚本 (web/static/js/pages/)

#### 公共页面
| 文件名 | 对应页面 |
|--------|----------|
| `login.js` | login.html |

#### 学生端 (web/static/js/pages/student/)
| 文件名 | 对应页面 |
|--------|----------|
| `dashboard.js` | student/dashboard.html |
| `apply.js` | apply.html |
| `announcements.js` | announcements.html |
| `guide.js` | guide.html |

#### Admin端 (web/static/js/pages/admin/)
| 文件名 | 对应页面 |
|--------|----------|
| `dashboard.js` | admin/index.html |
| `recruitment.js` | admin/recruitment.html |
| `workload.js` | admin/workload.html |
| `users.js` | admin/users.html |
| `settings.js` | admin/settings.html |

#### MO端 (web/static/js/pages/mo/)
| 文件名 | 对应页面 | 主要功能 |
|--------|----------|----------|
| `dashboard.js` | mo/index.html | Kanban看板交互 |
| `jobs.js` | mo/jobs.html | 模块管理、Request Form Drawer |
| `post-job.js` | mo/post-job.html | 职位发布、Posting Form Drawer、Urge Admin |
| `applicants.js` | mo/applicants.html | 申请人表格、筛选排序 |
| `timesheets.js` | mo/timesheets.html | 工时审批 |
| `knowledge-base.js` | mo/knowledge-base.html | 知识库搜索 |

---

## 🔧 配置文件

### WEB-INF/ (可选，Java Web应用配置)
- `web.xml` - Servlet配置
- `classes/` - Java类文件
- `lib/` - Java库文件

> **注意**: 如果是纯前端部署（Nginx/Apache），可以删除WEB-INF文件夹

---

## 📊 技术栈

- **前端框架**: 原生HTML/CSS/JavaScript（无React/Vue等框架）
- **图标库**: Lucide Icons (CDN: https://unpkg.com/lucide@latest)
- **样式**: 自定义CSS，响应式设计
- **API通信**: Fetch API
- **认证**: localStorage/sessionStorage存储Token

---

## 🚀 部署说明

### 1. 开发测试
```bash
# 使用测试服务器（端口8890）
python test-server.py

# 访问地址
http://localhost:8890/
```

### 2. 生产部署

#### 前置条件
- [ ] 后端API已部署并可访问
- [ ] 修改 `web/static/js/utils/api.js` 中的API基础URL
- [ ] 配置CORS跨域设置（如需要）

#### 部署步骤
1. 将整个 `web/` 文件夹上传到Web服务器
2. 配置Nginx/Apache指向 `web/` 目录
3. 确保静态文件可访问
4. 测试所有页面功能

#### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/web;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://backend-server:port;
    }
}
```

---

## ✅ 清理完成项

- ✅ 删除旧版本MO端文件（jobs.html, post-job.html, applicants.html及其CSS/JS）
- ✅ 重命名新文件（去掉-new后缀）
- ✅ 更新所有HTML文件中的CSS/JS引用路径
- ✅ 更新所有页面的导航链接
- ✅ 更新test-server.py中的路径映射

---

## 📝 待办事项

### API集成
- [ ] 修改 `web/static/js/utils/api.js` 配置真实API地址
- [ ] 测试所有API端点
- [ ] 处理API错误和超时

### 功能测试
- [ ] 测试登录/退出功能
- [ ] 测试学生端申请流程
- [ ] 测试MO端模块管理
- [ ] 测试Admin端用户管理
- [ ] 测试跨浏览器兼容性

### 性能优化（可选）
- [ ] 压缩CSS/JS文件
- [ ] 优化图片加载
- [ ] 添加CDN加速
- [ ] 启用Gzip压缩

---

## 📞 技术支持

如有问题，请检查：
1. 浏览器控制台错误信息
2. 网络请求状态（F12 -> Network）
3. API响应数据格式
4. 认证Token是否有效

---

**文档版本**: 1.0  
**最后更新**: 2026-04-07  
**维护者**: Development Team
