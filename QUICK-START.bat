@echo off
chcp 65001 >nul
cls
echo ========================================
echo 快速启动 TA 招聘系统
echo ========================================
echo.

set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo 正在编译和启动...
echo.

REM 编译
javac -encoding UTF-8 -source 17 -target 17 -cp "lib\gson-2.13.2.jar;lib\jakarta.servlet-api-6.0.0.jar" -d out src\com\bupt\ta\shared\domain\*.java src\com\bupt\ta\shared\infrastructure\*.java src\com\bupt\ta\shared\util\*.java src\com\bupt\ta\shared\interfaces\*.java src\com\bupt\ta\student\domain\*.java src\com\bupt\ta\student\interfaces\*.java src\com\bupt\ta\mo\interfaces\*.java >nul 2>&1

if %errorlevel% neq 0 (
    echo ✗ 业务代码编译失败
    pause
    exit /b 1
)

javac -encoding UTF-8 -source 17 -target 17 -cp "lib\gson-2.13.2.jar;lib\jakarta.servlet-api-6.0.0.jar;out" -d out src\HttpSessionAdapter.java src\HttpServletRequestAdapter.java src\HttpServletResponseAdapter.java src\EmbeddedServer.java >nul 2>&1

if %errorlevel% neq 0 (
    echo ✗ 服务器编译失败，请检查代码
    pause
    exit /b 1
)

REM 复制资源
xcopy /E /I /Y /Q resources out\resources >nul 2>&1

REM 启动
echo ✓ 编译成功，正在启动服务器...
echo.
java -cp "out;lib\gson-2.13.2.jar;lib\jakarta.servlet-api-6.0.0.jar" EmbeddedServer

pause 