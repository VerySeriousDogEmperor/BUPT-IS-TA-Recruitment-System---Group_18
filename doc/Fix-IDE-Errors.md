# 修复 IDE 错误指南

## 问题：找不到 javax.servlet.http 包

### 原因
IntelliJ IDEA 没有正确识别 Servlet API 库。

---

## 解决方案

### 方法 1：手动添加库（推荐）

1. **打开 Project Structure**
   - 快捷键：`Ctrl + Alt + Shift + S`
   - 或菜单：File → Project Structure

2. **添加 Servlet API 库**
   - 左侧选择 "Libraries"
   - 点击 "+" 号
   - 选择 "Java"
   - 浏览到项目的 `lib/servlet-api.jar`
   - 点击 OK

3. **应用到模块**
   - 在弹出的对话框中选择你的模块
   - 点击 OK

4. **应用更改**
   - 点击 "Apply"
   - 点击 "OK"

---

### 方法 2：配置 Tomcat 库

1. **打开 Project Structure**
   - `Ctrl + Alt + Shift + S`

2. **添加 Tomcat 库**
   - 左侧选择 "Libraries"
   - 点击 "+" 号
   - 选择 "From Maven..." 或 "Java"
   - 如果你已安装 Tomcat，浏览到：
     ```
     C:\path\to\tomcat\lib\servlet-api.jar
     ```

3. **应用更改**

---

### 方法 3：使用 Tomcat 配置

1. **配置 Tomcat Server**
   - Run → Edit Configurations
   - 添加 Tomcat Server → Local
   - 配置 Tomcat 安装路径

2. **IDEA 会自动添加 Servlet API**
   - Tomcat 配置完成后，IDEA 会自动识别 Servlet API

---

### 方法 4：重新加载项目

1. **Invalidate Caches**
   - File → Invalidate Caches / Restart
   - 选择 "Invalidate and Restart"

2. **重新导入项目**
   - File → Close Project
   - 重新打开项目

---

## 验证修复

修复后，检查：

1. **错误消失**
   - 红色波浪线消失
   - 编译错误清除

2. **可以编译**
   - Build → Build Project
   - 没有错误

3. **可以运行**
   - 配置 Tomcat
   - 点击运行按钮

---

## 如果还是有问题

### 检查 JDK 配置

1. **File → Project Structure → Project**
2. 确认 Project SDK 是 JDK 17 或更高
3. 确认 Language level 是 17

### 检查模块配置

1. **File → Project Structure → Modules**
2. 确认 src 目录被标记为 Sources（蓝色）
3. 确认 Dependencies 中包含：
   - JDK
   - gson-2.13.2
   - servlet-api

### 重新编译

```bash
# 清理
rmdir /s /q out
mkdir out

# 重新编译
javac -encoding UTF-8 -cp "lib/gson-2.13.2.jar;lib/servlet-api.jar" -d out src/com/bupt/ta/**/*.java
```

---

## 临时解决方案

如果 IDE 配置太麻烦，可以：

1. **使用命令行编译**
   ```bash
   deploy.bat
   ```

2. **直接部署到 Tomcat**
   - 不依赖 IDE
   - 手动启动 Tomcat

3. **使用其他 IDE**
   - Eclipse
   - VS Code + Java Extension

---

## 常见错误

### 错误 1：程序包 javax.servlet.http 不存在
```
解决：添加 servlet-api.jar 到 Libraries
```

### 错误 2：找不到符号 HttpServlet
```
解决：确保 servlet-api.jar 在 classpath 中
```

### 错误 3：类文件具有错误的版本
```
解决：检查 JDK 版本，确保使用 JDK 17+
```

---

## 推荐配置

### 最简单的方式

1. 安装 Tomcat
2. 在 IDEA 中配置 Tomcat Server
3. IDEA 会自动处理所有依赖
4. 直接运行

### 不使用 IDE

1. 使用 `deploy.bat` 编译
2. 手动部署到 Tomcat
3. 使用文本编辑器修改代码
4. 重新运行 `deploy.bat`

---

**建议：** 如果 IDE 配置太复杂，直接使用 Tomcat + 命令行编译会更快！
