# 快速修复指南

## 问题：缺少 Jakarta Servlet API JAR 包

编译失败是因为缺少 `jakarta.servlet-api` JAR 包。

## 解决方案

### 方法一：手动下载（推荐）

1. 访问 Maven Central：
   https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/

2. 下载文件：
   `jakarta.servlet-api-6.0.0.jar`

3. 将下载的 JAR 文件放到项目的 `lib` 目录下

4. 重新运行 `QUICK-START.bat`

### 方法二：使用 curl 下载（如果有 curl）

```bash
curl -o lib/jakarta.servlet-api-6.0.0.jar https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/jakarta.servlet-api-6.0.0.jar
```

### 方法三：使用 PowerShell 下载

```powershell
Invoke-WebRequest -Uri "https://repo1.maven.org/maven2/jakarta/servlet/jakarta.servlet-api/6.0.0/jakarta.servlet-api-6.0.0.jar" -OutFile "lib/jakarta.servlet-api-6.0.0.jar"
```

## 验证

下载完成后，`lib` 目录应该包含：
- `gson-2.13.2.jar`
- `jakarta.servlet-api-6.0.0.jar`

然后重新运行启动脚本即可。
