Branch: Yifei-dev
开发者：项目组长 (Tech Lead)
分支定位：本项目的心脏与大脑。包含整个系统的底层 DDD 架构基建、本地 JSON 持久化引擎、全端 AI 核心算法，以及学生端 (Student Portal) 的完整业务落地。

💡 致团队成员：本分支包含大量标准规范代码（如 Servlet 基类、JSON 读写工具类等）。遇到代码规范或接口调用问题时，请优先参考本分支内的代码实现。

🎯 我的职责范围 (My Responsibilities)
作为本项目的技术负责人，我在本分支及整个迭代周期中承担以下核心工作：

1. 🏗️ 项目统筹与技术基建 (Project Leadership & Architecture)
   全局规划：负责 Sprint 迭代计划的制定与任务拆解。

架构设计：主导系统整体技术架构设计，确立 Domain-Driven Design (DDD) 后端包结构规范。

路由与规范：统筹全局路由规划，制定并监督全组的 JavaSE 与原生前端代码规范。

团队指导：指导组员的代码编写，负责核心代码审查 (Code Review) 与各端代码的集成测试协调。

2. 💾 核心数据层引擎 (Data Layer Engine)
   持久化设计：完全基于纯 JavaSE 打造本地 JSON 数据存储与读写引擎。

数据一致性：维护全局 centralMockData，保障学生、MO、Admin 三端数据的高效互通与严格一致性。

共享模型：统一定义并维护跨端的共享数据类型 (Shared Models & DTOs)。

3. 🤖 全端 AI 赋能核心开发 (Full-Stack AI Integration)
   独立负责系统中所有 AI 模块的算法逻辑与接口设计：

学生端 (Student)：Dashboard AI Assistant（智能岗位推荐、技能匹配深度分析、对话式问答）。

MO端 (MO)：

Kanban AI Rank：基于算法对候选人进行匹配分排序与排名徽章展示。

Timesheets 异常检测：均值对比算法、自动异常标记及 AI 解释说明生成。

KnowledgeBase RAG：知识库文档检索、流式输出模拟及来源引用。

Admin端 (Admin)：Dashboard AI 预测横幅（根据历史数据预测预算消耗速率并触发预警）。

4. 🎓 学生端业务全栈开发 (Student Portal Implementation)
   负责实现完整的学生端求职闭环业务逻辑与前端视图：

认证系统：登录/注册表单、数据验证及角色识别动态路由跳转。

学生工作台 (Dashboard)：

概览 (Overview)：资料完整度校验、申请状态快速统计。

基本信息与简历：个人字段编辑、教育/工作/奖项履历管理、简历文件模拟上传。

申请追踪：申请列表实时展示、状态徽章、时间线追踪。

排课冲突引擎：每周时间块动态管理、与目标岗位的排班时间冲突自动化检测与警告。

其他：收藏夹管理、安全设置（密码修改/注销）。

可视化组件：基于用户技能列表动态生成技能雷达图 (Skill Radar Chart)。

🛠️ 本分支开发规范提示 (For Team Members)
不可修改项：团队其他成员请勿直接修改本分支下 shared/ 目录中的 JSON 读写工具类，如有扩展需求请向我提交 Issue。

接口规范：学生端向前端暴露的 Servlet 接口已采用标准 JSON 响应体结构，MO/Admin 端开发人员请以此为参考。

遇到阻塞：如果你在各自的分支遇到了无法解决的本地文件读写锁死、或者原生 Servlet 跨域/转发问题，请立刻与我联系。