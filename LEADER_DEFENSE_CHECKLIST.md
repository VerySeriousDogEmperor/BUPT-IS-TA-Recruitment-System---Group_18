# BUPT IS TA Recruitment System 组长必须掌握的答辩提纲

## 1. 文档目的

这份文档是给组长准备的答辩提纲，目标不是覆盖每一行代码，而是帮助你掌握那些 **必须讲清楚、讲明白、讲得像组长** 的内容。

作为组长，你最重要的任务不是替所有成员背全部实现细节，而是：

- 讲清项目整体架构
- 讲清主业务链路
- 讲清关键设计取舍
- 讲清团队分工和整合逻辑
- 在老师追问时，能把问题落到具体代码和具体数据链路上

因此，本文按三个层级整理：

- 必会：必须熟练讲清楚
- 次重点：最好掌握，老师追问时能答上
- 可发散：用于加分和显示你对项目理解比较深入

---

## 2. 必会内容

## 2.1 项目是什么，解决什么问题

### 你必须能讲清的话

“这是一个面向教学助理招聘场景的 Web 系统，主要服务于学生和 MO 两类角色。  
学生可以浏览岗位、投递申请、维护个人资料、上传简历、提交工时；MO 可以查看自己负责的课程模块、发布岗位、审核申请、审核工时。  
本次验收重点是学生端和 MO 端的完整业务闭环。”

### 必须会说的关键词

- TA 招聘系统
- 学生端
- MO 端
- 申请流程
- 工时流程
- 业务闭环

---

## 2.2 技术栈与整体实现方式

### 你必须能讲清的话

“项目后端使用 Java 17，采用内嵌 `HttpServer` 启动服务，并用 Servlet 风格封装接口。  
前端使用原生 HTML、CSS、JavaScript。  
数据持久化目前采用 JSON 文件存储。  
这个技术方案的优点是轻量、部署简单、适合课程项目快速完成端到端闭环和演示验收。”

### 必须知道的文件

- [EmbeddedServer.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/EmbeddedServer.java)
- [BaseServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/shared/interfaces/BaseServlet.java)
- [DataStore.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/shared/infrastructure/DataStore.java)

### 必须会解释的选择理由

- 为什么不用大型框架：课程项目，优先轻量与可控
- 为什么不用数据库：降低部署复杂度，方便直接查看数据与验收
- 为什么前端不用 React/Vue：当前目标是快速实现完整流程，不追求重型工程化

---

## 2.3 架构怎么分层，为什么这样分

### 你必须能讲清的话

“项目主要按业务域和职责来组织代码。  
后端按领域分成 `shared`、`student`、`mo`。  
每个领域下又尽量按 `domain`、`interfaces`、`infrastructure` 来分层。  
其中：

- `domain` 表达核心业务对象
- `interfaces` 负责 HTTP 接口
- `infrastructure` 负责仓储和持久化

这是一种轻量 DDD 的组织方式，有助于把不同角色和业务职责分开。”

### 必须知道的目录

- `src/com/bupt/ta/shared`
- `src/com/bupt/ta/student`
- `src/com/bupt/ta/mo`

### 老师可能追问的两个点

#### 1. 为什么 `application` 层没东西？

标准回答：

“我们有 application 层的设计预留，但当前项目还处在轻量实现阶段，很多业务编排逻辑仍在 Servlet 中，还没有完全下沉到 application/service 层。如果后续继续演进，学生申请、MO 审核、工时提交流程都适合继续抽到 application 层。”

#### 2. 为什么 `mo/domain` 是空的？

标准回答：

“因为当前 MO 更多是一个角色身份，而不是一个拥有大量独立属性的业务实体。MO 主要操作的是共享领域对象，比如模块、岗位、申请和工时，所以这些对象放在 `shared/domain` 中。`mo/domain` 目前是架构预留。”

---

## 2.4 学生端完整主链路

### 你必须能完整讲出这条链路

1. 学生登录/注册
2. 浏览岗位
3. 查看岗位详情
4. 提交申请
5. 在个人空间查看申请状态
6. 编辑资料、简历、课表
7. 对已通过岗位提交工时

### 必须知道的核心文件

#### 登录与认证

- [AuthServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/shared/interfaces/AuthServlet.java)
- [login.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/login.js)
- [auth.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/utils/auth.js)

#### 岗位浏览与详情

- [JobServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/shared/interfaces/JobServlet.java)
- [apply.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/student/apply.js)
- [job-detail.html](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/job-detail.html)

#### 申请

- [StudentApplicationServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentApplicationServlet.java)

#### 个人空间

- [dashboard.html](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/student/dashboard.html)
- [dashboard.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/student/dashboard.js)
- [StudentProfileServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentProfileServlet.java)
- [StudentTimesheetServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentTimesheetServlet.java)

### 你必须能强调的点

- 学生端不是只有页面展示，而是真实调用后端接口
- 资料、简历、课表都是真实持久化
- 工时已经和 MO 审核链路打通

---

## 2.5 MO 端完整主链路

### 你必须能完整讲出这条链路

1. MO 登录
2. 查看自己负责的课程模块
3. 创建/编辑/发布岗位
4. 查看申请人
5. 审核申请
6. 查看工时
7. 审核工时

### 必须知道的核心文件

#### 模块与岗位

- [MOModuleServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOModuleServlet.java)
- [MOJobServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOJobServlet.java)
- [jobs.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/mo/jobs.js)
- [post-job.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/mo/post-job.js)

#### 申请审核

- [MOApplicantServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOApplicantServlet.java)
- [applicants.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/mo/applicants.js)

#### 工时审核

- [MOTimesheetServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOTimesheetServlet.java)
- [timesheets.js](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/web/static/js/pages/mo/timesheets.js)

### 你必须能强调的点

- MO 只能管理属于自己岗位的数据
- 岗位、申请、工时三者之间是有关联关系的
- MO 端的审核结果会反映回学生端

---

## 2.6 数据链路必须讲明白

这是组长最重要的部分之一。

### 你至少要会讲的 3 条链路

#### 1. 学生申请链路

“学生在前端申请岗位后，请求进入 `StudentApplicationServlet`，然后写入 `applications.json`。  
MO 端的申请审核会读取这些申请，并根据岗位归属筛选出当前 MO 能管理的记录。  
审核结果再回写申请状态，学生端 Dashboard 会再读取并展示。”

对应文件：

- [StudentApplicationServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentApplicationServlet.java)
- [MOApplicantServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOApplicantServlet.java)
- [applications.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/applications.json)

#### 2. 学生资料链路

“学生编辑个人资料、简历、课表时，前端通过 `PUT /api/student/profile` 提交到后端，由 `StudentProfileServlet` 更新学生对象，最后写入 `students.json`。”

对应文件：

- [StudentProfileServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentProfileServlet.java)
- [students.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/students.json)

#### 3. 工时链路

“学生提交工时后，记录进入 `timesheets.json`。  
MO 端再根据岗位归属和申请关联读取工时记录，完成审核并更新状态。  
所以学生提交工时和 MO 工时审核之间是同一条真实链路。”

对应文件：

- [StudentTimesheetServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/student/interfaces/StudentTimesheetServlet.java)
- [MOTimesheetServlet.java](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/src/com/bupt/ta/mo/interfaces/MOTimesheetServlet.java)
- [timesheets.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/timesheets.json)

### 必须知道的全部数据文件

- [users.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/users.json)
- [students.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/students.json)
- [modules.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/modules.json)
- [jobs.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/jobs.json)
- [applications.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/applications.json)
- [timesheets.json](/C:/Users/23648/Desktop/BUPT-IS-TA-Recruitment-System/resources/data/timesheets.json)

---

## 2.7 当前项目的边界与取舍

### 你必须能讲清的话

“我们这次重点验收的是学生端和 MO 端，因为这两部分已经形成了相对完整的业务闭环。  
Admin 端目前不是最完整的部分，AI 功能也不是这次验收主线。  
另外，项目当前采用 JSON 持久化和轻量 DDD 组织方式，是课程项目下在复杂度、时间和可演示性之间做的权衡。”

### 必须主动说清的边界

- Admin 端完成度不如学生端和 MO 端
- AI 相关功能不作为这次重点
- `application` 层有设计预留，但还未完全实现
- JSON 存储是课程项目阶段的方案，不是生产化方案

这样说的好处是：

- 显得你对项目边界很清楚
- 老师会觉得你不是在“硬吹全做完”

---

## 2.8 团队分工必须讲清楚

### 你必须能讲清的话

“我们采用的是模块化分工。  
我作为组长，主要负责整体架构、公共基础设施、认证与 session、核心数据链路和最后联调，大约承担 35% 的工作量。  
其余五位成员各自负责一个明确子模块，工作量大约各 13%。  
虽然分工有侧重，但每个人都参与了实际代码开发，最后由我统一整合成完整版本。”

### 你必须知道的 5 个组员方向

- A：学生端岗位浏览与申请主流程
- B：学生个人空间与个人资料系统
- C：学生简历与课表模块
- D：MO 端模块与岗位管理
- E：MO 端申请审核、工时审核、测试与演示支撑

### 你必须能解释为什么你是 35%

- 你承担架构设计
- 你搭公共基础设施
- 你负责跨模块联调
- 你负责最后整合与验收准备

---

## 3. 次重点内容

## 3.1 关键 bug 和修复案例

作为组长，最好至少会讲 3 到 5 个代表性问题。

### 推荐一定会讲的几个

#### 1. 登录态以前只看本地，后来改为后端 session 校验

你可以说：

“早期页面有时会只根据本地状态判断是否登录，这会出现假登录问题。后来我们统一通过 `/api/auth/me` 校验真实 session，并把登出也接入了后端接口。”

#### 2. 学生资料以前只写本地缓存，后来改为真实持久化

你可以说：

“资料编辑最初存在只改前端状态的问题，刷新后会丢。后来统一接到了 `StudentProfileServlet`，并写入 `students.json`。”

#### 3. 申请状态前后端不一致

你可以说：

“早期前端状态枚举和后端返回值不完全一致，导致状态显示和统计不准确。后来统一了申请状态枚举，并按真实状态渲染。”

#### 4. 工时提交流程早期断链

你可以说：

“学生端提交工时后，MO 一开始不能正确识别。后来补齐了工时记录中的 `applicationId` 等关联字段，工时审核链路才真正打通。”

#### 5. MO 审核增加了权限边界和审计信息

你可以说：

“MO 审核不是简单改个状态，我们还补充了审核人、审核时间、审核备注和 timeline，这样业务过程更可追踪。”

---

## 3.2 你自己的核心技术贡献

你最好能说清楚你作为组长真正做了哪些“不可替代”的事情。

### 建议强调的点

- 统一了项目目录和层次
- 搭了内嵌服务和适配器
- 搭了认证和 session 机制
- 做了公共接口基类和公共工具层
- 把学生端和 MO 端主链路打通
- 在最后联调中修复关键 bug

这样老师会更容易理解为什么你的工作量更高。

---

## 3.3 测试怎么讲

如果老师问测试，不要说得太虚。

### 推荐说法

“目前项目没有做到特别完整的自动化单元测试体系，比如 JUnit 全覆盖还没有完成。  
但我们做了比较完整的联调测试和场景测试，重点验证了学生申请、MO 审核、学生工时提交、MO 工时审核这些主链路。  
如果后续继续做，优先会补 Repository 层和关键用例的自动化测试。”

---

## 4. 可发散内容

## 4.1 如果继续做，下一步怎么演进

这是老师很喜欢问的问题，组长最好会答。

### 标准回答

“如果继续迭代，我们会优先做三件事：

1. 把业务编排从 Servlet 下沉到 `application/service` 层
2. 补关键用例和仓储层的自动化测试
3. 进一步完善 Admin 端，并考虑引入数据库替代 JSON 持久化”

### 为什么这个回答好

- 体现你知道项目目前的结构边界
- 体现你知道后续演进方向
- 不会让老师觉得你对架构只停留在表面

---

## 4.2 为什么说这是“轻量 DDD”

你可以这样说：

“因为我们借鉴了 DDD 的核心思想，即按业务域划分和按职责分层，但没有完整引入重型的 application service、aggregate、domain service 那套复杂模型。  
更准确地说，这是一个带 DDD 意识的轻量实现，比较适合课程项目阶段。”

---

## 4.3 为什么这个项目不是“纯页面拼接”

你可以这样说：

“因为项目有真实后端接口、真实 session、真实数据文件持久化，以及跨角色的数据流转。  
比如学生申请会写入 `applications.json`，MO 审核会更新申请状态，学生端再读取最新状态，所以它不是静态页面集合，而是有业务流转的系统。”

---

## 5. 组长现场发言最稳的讲法

如果你在答辩一开始要做简短总述，可以直接用下面这段：

“我们这个项目的重点不是单独做几个页面，而是把学生端和 MO 端的招聘主流程真正打通。  
后端采用 Java 17 和内嵌 HttpServer，接口层用 Servlet 风格组织，前端使用原生 HTML、CSS、JavaScript，数据目前使用 JSON 持久化。  
在架构上，我们按照 `shared`、`student`、`mo` 三个业务域组织代码，并采用轻量 DDD 的分层思路。  
这次验收重点是学生浏览岗位、提交申请、维护资料和提交工时，以及 MO 发布岗位、审核申请和审核工时这两条主线。  
我作为组长主要负责整体架构、公共基础设施、认证与 session、核心链路打通和最终联调整合。” 

---

## 6. 你最少必须记住的 10 个点

如果时间来不及，你至少要把下面这 10 个点记住。

1. 项目是什么系统，服务哪些角色
2. 技术栈是什么
3. 为什么选择内嵌 HttpServer + JSON
4. 为什么目录分成 `shared / student / mo`
5. 学生端完整主链路
6. MO 端完整主链路
7. 申请数据怎么流转
8. 工时数据怎么流转
9. 你们团队怎么分工
10. 当前项目的边界和后续改进方向

---

## 7. 最终建议

正式验收前，你最好至少做一遍下面这件事：

- 按照“学生端主链路”和“MO 端主链路”各自完整讲一遍
- 每讲到一步，都能说出对应的大致文件和数据去向

只要你能把这两条主链讲顺，再把架构分层和团队分工说清楚，组长这一角色基本就稳了。

