# Git 上传流程指南

## 📋 分支结构

```
main (生产分支，稳定版本)
  └── dev (开发分支，集成所有功能)
       ├── feature/person1 (Person 1 的个人分支)
       ├── feature/person2 (Person 2 的个人分支)
       ├── feature/person3 (Person 3 的个人分支)
       ├── feature/person4 (Person 4 的个人分支)
       ├── feature/person5 (Person 5 的个人分支)
       └── feature/person6 (Person 6 的个人分支)
```

---

## 🔄 标准工作流程

### 阶段 1: 初始化（项目负责人）

```bash
# 1. 创建并推送 dev 分支
git checkout -b dev
git push -u origin dev

# 2. 为每个人创建个人分支
git checkout -b feature/person1
git push -u origin feature/person1

git checkout dev
git checkout -b feature/person2
git push -u origin feature/person2

# ... 重复创建 person3-6 的分支
```

---

## 👤 Person 1 的工作流程（第一个人）

### Step 1: 克隆仓库并切换到个人分支
```bash
# 克隆仓库
git clone <repository-url>
cd BUPT-IS-TA-Recruitment-System

# 切换到自己的分支
git checkout feature/person1

# 确认当前分支
git branch
```

### Step 2: 添加自己负责的文件
```bash
# 复制文件到项目目录
# 然后添加文件
git add src/Embedded*.java src/Http*.java lib/
git add web/index.html web/static/css/home.css web/static/css/common.css web/static/css/components.css
git add web/static/js/utils/ web/static/js/components/toast.js
git add QUICK-START.bat README.md

# 查看状态
git status
```

### Step 3: 提交到个人分支
```bash
# 提交
git commit -m "feat: 添加服务器基础和首页

- 实现嵌入式 HTTP 服务器
- 实现 Servlet 适配器
- 添加首页 HTML/CSS
- 添加通用样式和组件
- 添加 API 和认证工具类"

# 推送到个人分支
git push origin feature/person1
```

### Step 4: 合并到 dev 分支
```bash
# 切换到 dev 分支
git checkout dev

# 拉取最新的 dev（第一个人可能是空的）
git pull origin dev

# 合并个人分支到 dev
git merge feature/person1

# 推送到远程 dev
git push origin dev
```

### Step 5: 通知下一个人
```
✅ Person 1 完成，Person 2 可以开始了
```

---

## 👤 Person 2-6 的工作流程（后续的人）

### Step 1: 克隆仓库并切换到个人分支
```bash
# 克隆仓库（如果还没克隆）
git clone <repository-url>
cd BUPT-IS-TA-Recruitment-System

# 切换到自己的分支
git checkout feature/person2  # 改成自己的分支名

# 从 dev 拉取最新代码（重要！）
git pull origin dev
```

### Step 2: 添加自己负责的文件
```bash
# 复制文件到项目目录
# 然后添加文件（根据分工文档）
git add <your-files>

# 查看状态
git status
```

### Step 3: 提交到个人分支
```bash
# 提交（使用分工文档中的提交信息）
git commit -m "feat: <your-feature>"

# 推送到个人分支
git push origin feature/person2  # 改成自己的分支名
```

### Step 4: 合并到 dev 分支
```bash
# 切换到 dev 分支
git checkout dev

# 拉取最新的 dev（获取前面人的代码）
git pull origin dev

# 合并个人分支到 dev
git merge feature/person2  # 改成自己的分支名

# 如果有冲突，解决冲突后：
# git add <resolved-files>
# git commit -m "merge: 解决合并冲突"

# 推送到远程 dev
git push origin dev
```

### Step 5: 通知下一个人
```
✅ Person 2 完成，Person 3 可以开始了
```

---

## 📊 完整流程图

```
Person 1:
  本地工作 → feature/person1 → dev → 通知 Person 2
  
Person 2:
  拉取 dev → 本地工作 → feature/person2 → dev → 通知 Person 3
  
Person 3:
  拉取 dev → 本地工作 → feature/person3 → dev → 通知 Person 4
  
Person 4:
  拉取 dev → 本地工作 → feature/person4 → dev → 通知 Person 5
  
Person 5:
  拉取 dev → 本地工作 → feature/person5 → dev → 通知 Person 6
  
Person 6:
  拉取 dev → 本地工作 → feature/person6 → dev → 完成！
```

---

## 🎯 简化版命令（推荐）

### Person 1
```bash
git checkout feature/person1
# 添加文件...
git add <files>
git commit -m "feat: 添加服务器基础和首页"
git push origin feature/person1
git checkout dev
git merge feature/person1
git push origin dev
```

### Person 2-6
```bash
git checkout feature/person2  # 改成自己的
git pull origin dev           # 重要：拉取前面人的代码
# 添加文件...
git add <files>
git commit -m "feat: <your-feature>"
git push origin feature/person2
git checkout dev
git pull origin dev           # 再次确认最新
git merge feature/person2
git push origin dev
```

---

## ⚠️ 常见问题和解决方案

### 问题 1: 合并冲突
```bash
# 如果出现冲突
git status  # 查看冲突文件

# 手动编辑冲突文件，解决冲突标记
# <<<<<<< HEAD
# 你的代码
# =======
# 别人的代码
# >>>>>>> feature/personX

# 解决后
git add <resolved-files>
git commit -m "merge: 解决合并冲突"
git push origin dev
```

### 问题 2: 忘记拉取最新代码
```bash
# 如果推送失败
git pull origin dev
# 解决可能的冲突
git push origin dev
```

### 问题 3: 推送到错误的分支
```bash
# 撤销最后一次提交（保留文件）
git reset --soft HEAD~1

# 切换到正确的分支
git checkout <correct-branch>

# 重新提交
git commit -m "your message"
git push origin <correct-branch>
```

---

## ✅ 最终验证（所有人完成后）

### 任意一人执行：
```bash
# 1. 切换到 dev 分支
git checkout dev

# 2. 拉取最新代码
git pull origin dev

# 3. 检查文件完整性
ls src/
ls web/
ls resources/data/

# 4. 启动服务器
./QUICK-START.bat

# 5. 测试功能
# 访问 http://localhost:9191
# 登录 zhangsan@bupt.edu.cn / 123456
```

### 如果测试通过，合并到 main：
```bash
git checkout main
git merge dev
git push origin main
```

---

## 📝 最佳实践

### 1. 提交前检查
```bash
git status          # 查看修改的文件
git diff            # 查看具体修改
git add <files>     # 只添加需要的文件
```

### 2. 提交信息规范
```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具变动
```

### 3. 经常同步
```bash
# 每次开始工作前
git checkout dev
git pull origin dev
git checkout feature/personX
git merge dev  # 将 dev 的最新代码合并到个人分支
```

### 4. 保持个人分支干净
```bash
# 完成任务后，可以删除个人分支（可选）
git branch -d feature/person1
git push origin --delete feature/person1
```

---

## 🎯 推荐工作流程总结

### 方案 A: 严格顺序（推荐新手）
- Person 1 完成 → 通知 Person 2
- Person 2 完成 → 通知 Person 3
- ...依此类推
- **优点**: 不会有冲突
- **缺点**: 需要等待

### 方案 B: 并行开发（推荐熟练者）
- 所有人同时在个人分支工作
- 完成后按顺序合并到 dev
- **优点**: 速度快
- **缺点**: 可能有冲突

### 方案 C: 混合模式（推荐）
- Person 1-3 先完成（后端基础）
- Person 4-6 再完成（前端和接口）
- **优点**: 平衡速度和稳定性

---

## 📞 协作建议

### 1. 使用群聊通知
```
Person 1: ✅ 服务器基础完成，已推送到 dev
Person 2: 收到，开始工作
Person 2: ✅ 领域模型完成，已推送到 dev
Person 3: 收到，开始工作
```

### 2. 使用 Pull Request（可选）
```bash
# 推送到个人分支后
# 在 GitHub/GitLab 上创建 PR: feature/person1 → dev
# 让其他人 review 后再合并
```

### 3. 记录问题
```
如果遇到问题，在群里说明：
- 哪个文件有问题
- 什么错误信息
- 需要谁帮忙
```

---

**创建时间**: 2026-04-08  
**版本**: v1.0  
**状态**: ✅ 推荐使用
