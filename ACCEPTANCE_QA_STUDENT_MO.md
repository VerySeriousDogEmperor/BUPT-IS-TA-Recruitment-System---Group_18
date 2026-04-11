# BUPT IS TA Recruitment System 验收问答稿

## 说明

这份文档用于准备项目验收时助教/老师可能提出的问题。  
根据你提供的图片，当前能清晰看到的是 **第 4 到第 20 题**，因此本文按这些问题整理。

文档写法采用四段式：

- 问题原文
- 建议回答
- 可适当发散的点
- 对应项目代码位置

说明：

- 以下内容已经尽量结合当前项目真实实现来写。
- 像“你用了什么 IDE”“每个成员做了什么”这种问题，最终要以你的真实情况为准。
- 我在这类问题下会给出一个 **安全、自然、适合验收场景** 的回答模板。

---

## 4. Pick up a class and ask if any good design principle applied, e.g. single responsibility.

### 建议回答

可以举 `BaseServlet` 这个类。它体现了比较明显的单一职责和模板化设计思想。  
`BaseServlet` 主要只做几件通用的事情：解析 JSON 请求体、检查用户是否登录、检查角色权限、提供获取当前用户 ID 的方法。  
具体业务，例如学生资料更新、申请提交、MO 审核申请，都没有写在这个基类里，而是分别放在各自的 Servlet 中实现。

所以它的好处是：

- 把所有 Servlet 的公共逻辑收敛到一个地方
- 避免每个接口重复写 JSON 解析和权限判断
- 让具体业务类更聚焦在自己的业务规则上

这其实就是一种单一职责原则的体现：  
`BaseServlet` 负责“接口层公共能力”，而不是负责某个具体业务。

### 可适当发散

如果老师继续追问，还可以再举一个例子：`StudentRepository`。  
它主要负责学生数据的读写，比如 `findById`、`findByEmail`、`save`、`delete`、`generateId`。  
它不处理 HTTP，不处理页面逻辑，也不负责 session，这样职责边界就比较清晰。

也就是说，这个项目虽然比较轻量，但还是尽量做到了：

- Servlet 负责接口与请求响应
- Repository 负责数据访问
- Domain 对象负责表达业务数据

### 对应代码位置

- `src/com/bupt/ta/shared/interfaces/BaseServlet.java`
- `src/com/bupt/ta/shared/infrastructure/StudentRepository.java`
- `src/com/bupt/ta/student/interfaces/StudentProfileServlet.java`

---

## 5. Any architecture level consideration, such as modular.

### 建议回答

有的。我们在架构层面主要考虑了两点：**按业务域拆分** 和 **按层次拆分**。

先说按业务域拆分，项目目录分成了：

- `shared`
- `student`
- `mo`

其中：

- `shared` 放公共模型、公共仓储、公共接口能力
- `student` 放学生侧的业务接口
- `mo` 放 MO 侧的业务接口

再说按层次拆分，每个业务域里又尽量按照 DDD 的轻量思路分成：

- `domain`
- `interfaces`
- `infrastructure`
- `application`

虽然 `application` 层目前还比较轻，但整体思路是保留出来的。  
这样做的目的是让代码不要按“技术杂糅”堆在一起，而是按“业务对象和职责边界”来组织。

### 可适当发散

如果老师继续问“为什么不直接全部写在一个 controller 里”，可以这样回答：

因为这个项目虽然是课程项目，但我们希望它至少具备可维护性。  
如果把学生、MO、公共认证、岗位、申请、工时都塞在一处，后面一改就容易互相影响。  
现在这种拆法的好处是：

- 功能边界更清楚
- 更容易定位问题
- 后续如果要换数据库，只需要重点调整 repository 和 datastore 部分

### 对应代码位置

- `src/com/bupt/ta/shared`
- `src/com/bupt/ta/student`
- `src/com/bupt/ta/mo`
- `src/EmbeddedServer.java`

---

## 6. Any code shows the reusability.

### 建议回答

有，项目里复用性比较明显的代码主要有前后端两类。

后端方面：

- `BaseServlet`：给所有 Servlet 复用请求解析和权限校验
- `ResponseUtil`：统一返回格式
- `SessionUtil`：统一 session 处理
- 各类 Repository：统一复用 JSON 数据读写模式

前端方面：

- `api.js`：所有页面都通过它访问后端，不重复写 fetch
- `auth.js`：公共页、学生页、MO 页共用登录态同步与退出逻辑
- MO 端的 `common.js` 和 `theme.css`：复用公共页面行为和统一视觉风格

### 可适当发散

如果老师追问“有没有具体例子”，可以举这个例子：

学生端和 MO 端虽然是不同角色，但它们都复用了：

- 同一个登录体系
- 同一种接口返回格式
- 同一套 session 机制
- 同一种 Repository 持久化方式

所以复用不只是函数层面，也体现在“系统基础设施”的复用上。

### 对应代码位置

- `src/com/bupt/ta/shared/interfaces/BaseServlet.java`
- `src/com/bupt/ta/shared/util/ResponseUtil.java`
- `src/com/bupt/ta/shared/util/SessionUtil.java`
- `web/static/js/utils/api.js`
- `web/static/js/utils/auth.js`
- `web/static/js/pages/mo/common.js`
- `web/static/css/mo/theme.css`

---

## 7. What IDE did you use?

### 建议回答

这个问题最好按真实情况回答。  
如果你主要是在本地 Java 项目环境里开发，可以说：

我主要使用的是 `IntelliJ IDEA` 来开发后端和查看整个项目结构，因为 Java 项目在 IDEA 里看类结构、跳转接口和调试会更方便。  
前端页面和一些快速修改我也会配合使用轻量编辑器，但主开发环境还是 IDEA。

### 可适当发散

如果老师追问“为什么选这个 IDE”，可以说：

- Java 类和包结构比较多，IDEA 对导航和重构更友好
- 看 Servlet、Repository、Domain 之间跳转很方便
- 对课程项目来说效率更高

### 备注

如果你实际上主要用的是 VS Code，那就改成真实情况。  
这个问题本身没有标准答案，重点是说得自然、真实。

---

## 8. Did you use AI to assist in writing code? What is your evaluation of the AI result?

### 建议回答

有使用，但我们是把 AI 当作辅助工具，而不是直接替代开发。  
主要用它做了几类工作：

- 帮助生成一些初版代码结构
- 辅助补全重复性逻辑
- 帮助检查前后端字段不一致的问题
- 协助整理页面脚本、接口对接和文档说明

但 AI 生成的结果我们没有直接照搬，而是一定会做二次检查。  
因为项目里有不少地方如果不结合真实后端模型，AI 很容易生成“看起来合理、但实际跑不通”的代码。

我的评价是：

- 在提高开发效率、给出思路方面很有帮助
- 在业务正确性上不能完全信任，尤其是涉及字段、状态、权限和数据链路时必须人工校验

### 可适当发散

可以补一句比较成熟的话：

AI 比较适合做“提速器”，不适合做“最终裁判”。  
真正决定代码能不能进项目的，还是要看它是否和当前架构、数据模型、业务流程一致。

---

## 9. Did you use AI to assist in debugging? What is your evaluation of the AI result?

### 建议回答

有。AI 在调试时比较适合做两类事情：

1. 帮助快速定位可能的原因
2. 帮助整理修复思路和排查顺序

比如这个项目里，前后端字段不一致、session 没有正确维持、页面脚本用了旧 mock 字段，这些问题用 AI 来辅助排查会比较快。  
但 AI 的问题是，它有时会给出“表面合理”的解释，所以最终还是要结合真实代码和真实数据去验证。

我的评价是：

- AI 对“缩小排查范围”很有帮助
- 对“最终确认 bug 根因”仍然要靠人和真实运行结果

### 可适当发散

如果老师追问“有没有具体例子”，可以说：

比如学生端工时提交后 MO 看不到，真正根因不是页面没刷新，而是工时记录里缺了 `applicationId`，导致后端链路断了。  
这种问题 AI 可以提示可能是“字段没传完整”，但最后还是要靠我们去看接口和数据文件才能确认。

---

## 10. Ask their experience about using GitHub.

### 建议回答

我们有使用 Git 和 GitHub 来管理项目代码。  
实际体验是 GitHub 对团队协作非常重要，尤其是在多人并行开发的时候，它能帮助我们：

- 保存清晰的提交历史
- 避免大家直接改同一份代码导致混乱
- 让每次功能迭代都有记录
- 出现问题时更容易回溯

从当前仓库里也能看到比较清晰的提交记录，比如：

- `feat: 修复已知bug`
- `feat: 添加服务器基础和首页`
- `feat(frontend): 新增 home/about/announcements/apply/guide 和 login 前端页面及静态资源`

这说明我们不是只在最后一次性提交，而是按阶段推进的。

### 可适当发散

如果老师问“你觉得 GitHub 最有价值的点是什么”，可以回答：

我觉得最重要的是让开发过程可追踪。  
课程项目最怕的是“代码都在一个人电脑里，最后才合起来”，这样风险很高。  
GitHub 让团队可以更有节奏地协作，也更方便验收时解释开发过程。

---

## 11. Did you do Unit testing? What is your test case and test result?

### 建议回答

如果要实话实说，可以这样回答：

我们目前 **没有做非常完整的自动化单元测试体系**，比如 JUnit 全覆盖这种级别目前还没有。  
这个项目当前做得更多的是 **接口联调测试、功能测试和场景测试**，因为它是一个前后端联动比较强的课程项目。

我们重点验证了这些关键场景：

1. 学生登录/注册是否成功
2. 学生是否能浏览岗位、查看详情并投递
3. 申请后 Dashboard 是否能看到正确状态
4. 学生资料、简历、课表是否能真实保存
5. 学生提交工时后，MO 端是否能看到并审核
6. MO 创建岗位后，学生端是否能看到已发布岗位

测试结果上，当前学生端和 MO 端的主链路已经可以闭环：

- 学生申请能进入 `applications.json`
- MO 审核后学生端能看到状态变化
- 学生工时能进入 `timesheets.json`
- MO 审核工时后状态会更新

### 可适当发散

如果老师继续追问“为什么没做很多 Unit Test”，可以这样说：

这个项目当前更偏向一个完整业务原型，优先保证端到端流程跑通。  
如果后续时间更充足，我们会优先给 Repository 层和 Servlet 层补 JUnit 测试，例如：

- 学生注册重复邮箱测试
- 申请状态流转测试
- MO 工时审批边界测试
- 权限校验测试

这个回答会比较稳，因为既诚实，也说明你知道后续该怎么补。

---

## 12. Ask about how did they do version control.

### 建议回答

我们是用 Git 做版本控制的，核心做法是：

- 按功能阶段提交
- 提交信息尽量描述清楚
- 修改前先拉最新代码，减少冲突
- 大改动尽量不要和小修复混在同一个提交里

从仓库当前记录看，也能看到这种按阶段推进的方式，比如：

- 原型和 README
- 首页和服务器基础
- 前端页面补充
- bug 修复

### 可适当发散

如果老师问“你们是怎么避免代码乱掉的”，可以回答：

我们尽量把一次提交控制在一个主题里，比如：

- 一次只做学生端登录问题
- 一次只做 MO 工时审核逻辑
- 一次只做页面样式统一

这样回看历史的时候比较清楚，也方便定位问题。

---

## 13. How is the code organised?

### 建议回答

代码组织主要是按“领域 + 分层”来做的。

后端按领域分成：

- `shared`
- `student`
- `mo`

每个领域再按职责分层：

- `domain`：领域对象
- `interfaces`：接口层
- `infrastructure`：仓储和持久化
- `application`：预留应用服务层

前端则按“页面 + 公共工具”组织：

- 页面 HTML
- 页面对应 JS
- 公共 API 工具
- 公共认证工具
- 公共样式

### 可适当发散

可以补一句：

这种组织方式的优点是老师或者同学第一次进入项目，也能比较快找到：

- 某个业务对象在哪里定义
- 某个接口在哪里处理
- 某份数据最终保存到哪里

### 对应代码位置

- `src/com/bupt/ta/shared`
- `src/com/bupt/ta/student`
- `src/com/bupt/ta/mo`
- `web/static/js/utils`
- `web/static/js/pages/student`
- `web/static/js/pages/mo`

---

## 14. How are responsibilities divided across classes?

### 建议回答

我们在类职责划分上尽量遵循“谁负责什么，就只做那部分”的思路。

例如：

- `AuthServlet`：负责登录、注册、登出、当前用户查询
- `StudentProfileServlet`：负责学生资料、简历、课表、密码修改
- `StudentApplicationServlet`：负责学生申请和撤回
- `StudentTimesheetServlet`：负责学生工时提交
- `MOJobServlet`：负责 MO 创建、更新、发布岗位
- `MOApplicantServlet`：负责 MO 查看和审核申请
- `MOTimesheetServlet`：负责 MO 查看和审核工时

而数据访问则由 Repository 负责，比如：

- `StudentRepository`
- `JobRepository`
- `ApplicationRepository`
- `TimesheetRepository`

### 可适当发散

如果老师追问“这样分有什么好处”，可以回答：

这样每个类的职责比较单纯，后面修改时影响面更可控。  
比如如果只是调整学生资料保存逻辑，主要改 `StudentProfileServlet` 和 `StudentRepository`，不需要碰 MO 的逻辑。

---

## 15. How did you maintain your code, make it easy to read and understand? Show examples.

### 建议回答

我们主要从四个方面保证代码可读性：

1. 目录结构清晰
2. 命名尽量贴近业务
3. 把公共逻辑抽出来
4. 让前后端数据模型尽量统一

具体例子：

- `StudentProfileServlet` 这个名字一看就知道它是处理学生资料的
- `ApplicationRepository` 一看就知道是处理申请数据的
- `auth.js` 和 `api.js` 是明显的公共工具，不会把它们散落在各页面里

此外，我们也尽量避免“一个文件既做页面渲染又做所有网络请求又做所有状态管理”。  
例如前端统一通过 `api.js` 调接口，页面脚本主要保留页面自己的逻辑。

### 可适当发散

如果老师要“show examples”，你可以直接打开这些文件：

- `src/com/bupt/ta/shared/interfaces/BaseServlet.java`
- `src/com/bupt/ta/student/interfaces/StudentProfileServlet.java`
- `web/static/js/utils/api.js`
- `web/static/js/utils/auth.js`

然后说明：

- 这些文件命名比较直白
- 职责边界比较清楚
- 公共逻辑被抽离出来了

---

## 16. How do you ensure that the code remains clean?

### 建议回答

我们主要通过以下方式保持代码整洁：

1. 不把新逻辑直接堆在旧文件的任意位置
2. 公共逻辑优先抽到工具类或基础类
3. 修 bug 时同步清理旧 mock 或无效代码
4. 尽量让前后端字段保持一致

这个项目里“保持 clean”的一个关键点其实是：  
避免页面看起来能用，但底层还是旧 mock 数据。  
因为这种代码最容易越改越乱。

所以我们在整理时，做了很多“去假功能化”的工作，比如：

- 把只写 `localStorage` 的资料保存改为真实后端持久化
- 把前端错误使用的岗位字段改成和后端模型对齐
- 把工时链路补齐，不再只做前端假提交

### 可适当发散

如果老师继续问“clean code 对你们最难的地方是什么”，可以说：

最难的是项目早期容易有 mock 数据和真实数据并存。  
后面要做的不是只加功能，而是要把假逻辑替换成真实链路，这一步比单纯加页面更重要。

---

## 17. Is there example of refactoring? What part would you refactor if you had more time?

### 建议回答

有。这个项目里一个比较典型的重构方向是：  
把一些原本混杂了 mock 数据、旧字段和页面逻辑的前端脚本，整理成和真实后端接口一致的版本。

例如：

- 学生端的 `apply.js`
- 学生端的 `dashboard.js`
- MO 端的 `jobs.js`
- MO 端的 `timesheets.js`

这些脚本在整理过程中，其实都经历了“从原型式页面逻辑”向“真实接口驱动页面逻辑”的重构。

### 如果老师问“如果有更多时间你还会重构哪里”

可以回答：

如果还有更多时间，我最想重构的有三块：

1. 把更多业务逻辑从 Servlet 继续下沉到 `application/service` 层
2. 给 Repository 和关键接口补自动化测试
3. 进一步拆分超长前端页面脚本，例如 `dashboard.js`

因为当前项目虽然结构已经比较清晰，但有些业务逻辑还集中在 Servlet 或页面脚本里。  
如果继续演进成更正式的系统，Service 层会是下一步重点。

---

## 18. Any reusable components?

### 建议回答

有，而且不仅是 UI 组件，也包括后端基础组件。

前端复用组件/模块：

- `api.js`：统一 API 调用
- `auth.js`：统一登录态与退出逻辑
- 公共 header/footer 结构
- MO 端 `theme.css`：统一主题样式

后端复用组件：

- `BaseServlet`
- `ResponseUtil`
- `SessionUtil`
- Repository 模式
- `DataStore`

### 可适当发散

可以强调一句：

我们这里对“reusable components”的理解不只限于按钮、卡片这类前端组件，  
更重要的是系统级复用，比如权限校验、统一响应、统一持久化，这些对项目长期维护更关键。

---

## 19. How do you ensure consistency when multiple people are working together?

### 建议回答

我们主要靠四件事来保证一致性：

1. 先统一数据模型和接口命名
2. 按模块分工，减少多人同时改同一块
3. 用 Git 提交历史记录变化
4. 出现分歧时，以真实业务链路是否成立为准

这个项目里一致性最重要的不是“页面颜色一不一样”，而是：

- 状态枚举要一致
- 字段名要一致
- 页面行为要和后端数据一致

例如：

- 申请状态统一成 `pending / approved / rejected / withdrawn`
- 工时必须带 `applicationId`
- 岗位归属统一在 MO 端维护

### 可适当发散

如果老师追问“多人协作最容易不一致的地方是什么”，可以回答：

最容易不一致的是前后端字段和状态。  
所以我们后来特别重视让真实数据模型成为统一标准，而不是各写各的页面逻辑。

---

## 20. Ask each individual their main contributions so far. Try to identify if all members do all the work together to have a common vision of the project.

### 建议回答

这个问题一定要按真实情况回答，不建议临场编。  
但你可以按下面这个结构来讲，会显得很清楚：

我们不是所有人完全做一样的事情，而是有分工，但整体方向是统一的。  
大家共享同一个项目目标：把学生端和 MO 端的招聘主流程闭环做出来。

建议表达结构：

1. 一个人主要负责前端页面与交互
2. 一个人主要负责后端接口与数据结构
3. 一个人主要负责联调、测试、样式统一、文档整理
4. 大的业务流程和关键设计是一起讨论后统一的

### 可直接套用的回答模板

你可以这样说：

“我们在分工上有侧重，但不是完全割裂的。  
例如有人更偏前端页面和交互，有人更偏后端接口和数据持久化，也有人更多负责联调、测试和文档。  
不过像系统流程、核心数据模型、状态设计这些关键问题，我们是一起对齐的，所以项目整体方向是一致的。  
这样既能提高效率，也能避免最后拼不起来。”  

### 如果老师继续追问“怎么证明大家有共同 vision”

你可以回答：

我们最后统一收口到同一条业务主线：  
学生浏览岗位 -> 申请岗位 -> MO 审核 -> 学生提交工时 -> MO 审核工时。  
无论是谁负责页面还是接口，最后都要围绕这条链路工作，所以整体 vision 是统一的。

### 重要提醒

这里请你在正式验收前，把这部分改成你们团队的真实版本。  
这一题老师很容易顺着问到个人贡献细节，所以一定要和队友提前统一口径。

---

## 附加建议：老师可能继续追问的发散点

## 1. 为什么不用数据库？

建议回答：

因为这是课程项目，我们优先考虑的是：

- 快速搭建完整业务闭环
- 让数据可直接查看和验收
- 降低部署复杂度

所以当前用 JSON 持久化是一个权衡。  
它不适合高并发生产环境，但很适合课程项目原型和演示。

---

## 2. 为什么说这个项目不是“纯前端页面”？

建议回答：

因为项目有真实后端接口、真实 session、真实数据持久化。  
比如学生申请会真的写入 `applications.json`，MO 审核也会真的改变申请状态，工时也会真的落到 `timesheets.json`。

---

## 3. 这个项目最值得讲的亮点是什么？

建议回答：

我觉得最值得讲的是它把学生端和 MO 端打通了。  
不是单独做几个页面，而是让申请、审核、工时三个关键流程真正连起来了。  
这说明项目已经有完整业务链，而不只是原型图。

---

## 4. 如果以后继续做，你最想补哪一块？

建议回答：

我最想补的是：

- 更完整的自动化测试
- 更清晰的 application/service 层
- Admin 端真实业务功能
- 更细致的权限控制和异常处理

这样整个项目就会从“可验收的课程项目”进一步走向“更接近正式系统”的结构。

---

## 结尾建议

如果现场时间有限，你可以优先记住下面这几个核心句子：

1. “我们这个项目的重点不是页面堆砌，而是把学生端和 MO 端的业务闭环真正打通。”
2. “代码结构上我们采用了按领域和按层次结合的组织方式，属于轻量 DDD 思路。”
3. “公共能力比如请求解析、权限校验、响应格式、session 管理都做了复用。”
4. “目前自动化单元测试还不算完整，但关键业务流程做了联调和场景测试。”
5. “如果有更多时间，我们会继续把业务逻辑下沉到 application/service 层，并补更多自动化测试。”

这几句基本能覆盖大部分追问。

