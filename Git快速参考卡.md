# Git 快速参考卡

## 🎯 你的流程是对的！

```
Person 1: 本地 → feature/person1 → dev
Person 2: 拉取 dev → 本地 → feature/person2 → dev
Person 3: 拉取 dev → 本地 → feature/person3 → dev
...以此类推
```

---

## ⚡ 超快速命令

### Person 1（第一个人）
```bash
git checkout feature/person1
git add <your-files>
git commit -m "feat: 添加服务器基础和首页"
git push origin feature/person1
git checkout dev
git merge feature/person1
git push origin dev
```

### Person 2-6（后续的人）
```bash
git checkout feature/person2      # 改成自己的分支
git pull origin dev               # ⭐ 重要：拉取前面人的代码
git add <your-files>
git commit -m "feat: <your-feature>"
git push origin feature/person2
git checkout dev
git pull origin dev               # ⭐ 再次确认最新
git merge feature/person2
git push origin dev
```

---

## 📋 检查清单

### 开始前
- [ ] 确认自己的分支名（feature/person1-6）
- [ ] 查看分工文档，知道要添加哪些文件
- [ ] 等待前一个人完成通知

### 工作中
- [ ] 切换到个人分支
- [ ] 从 dev 拉取最新代码（Person 2-6）
- [ ] 复制文件到项目目录
- [ ] 添加文件 `git add`
- [ ] 提交 `git commit`
- [ ] 推送到个人分支 `git push`

### 合并时
- [ ] 切换到 dev 分支
- [ ] 拉取最新 dev
- [ ] 合并个人分支到 dev
- [ ] 推送 dev
- [ ] 通知下一个人

---

## 🔥 最常用的 5 个命令

```bash
1. git checkout <branch>     # 切换分支
2. git pull origin dev        # 拉取最新代码
3. git add <files>            # 添加文件
4. git commit -m "message"    # 提交
5. git push origin <branch>   # 推送
```

---

## ⚠️ 注意事项

### ❌ 不要做
- ❌ 不要直接推送到 main
- ❌ 不要跳过 `git pull`
- ❌ 不要强制推送 `git push -f`
- ❌ 不要在别人的分支上工作

### ✅ 要做
- ✅ 每次都先 `git pull origin dev`
- ✅ 提交前检查 `git status`
- ✅ 使用清晰的提交信息
- ✅ 遇到问题及时沟通

---

## 🆘 遇到问题？

### 问题 1: 推送失败
```bash
git pull origin dev
# 解决冲突（如果有）
git push origin dev
```

### 问题 2: 不知道在哪个分支
```bash
git branch  # 查看当前分支（带 * 的是当前分支）
```

### 问题 3: 添加了错误的文件
```bash
git reset HEAD <file>  # 取消添加
```

### 问题 4: 提交信息写错了
```bash
git commit --amend -m "新的提交信息"
```

---

## 📞 协作流程

```
Person 1 完成 → 在群里说 "✅ Person 1 完成"
Person 2 看到 → 开始工作
Person 2 完成 → 在群里说 "✅ Person 2 完成"
Person 3 看到 → 开始工作
...
```

---

## ✅ 完成标志

所有 6 个人都完成后：

```bash
git checkout dev
git pull origin dev
./QUICK-START.bat
# 访问 http://localhost:9191
# 测试登录和功能
```

成功 = 大功告成！🎉

---

**打印这张卡片，贴在电脑旁边！**
