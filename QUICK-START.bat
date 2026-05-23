@echo off
setlocal

REM Always run from the script directory so downloads / extracted zips work.
cd /d "%~dp0"

title BUPT IS TA Recruitment Quick Start
cls
echo ========================================
echo BUPT IS TA Recruitment Quick Start
echo ========================================
echo.

if not exist "src\EmbeddedServer.java" (
    echo [ERROR] Cannot find src\EmbeddedServer.java
    echo Please run this script from the project root.
    pause
    exit /b 1
)

if not exist "web" (
    echo [ERROR] Cannot find the web directory.
    pause
    exit /b 1
)

if not exist "resources" (
    echo [ERROR] Cannot find the resources directory.
    pause
    exit /b 1
)

if not exist "lib\gson-2.13.2.jar" (
    echo [ERROR] Missing dependency: lib\gson-2.13.2.jar
    pause
    exit /b 1
)

if not exist "lib\jakarta.servlet-api-6.0.0.jar" (
    echo [ERROR] Missing dependency: lib\jakarta.servlet-api-6.0.0.jar
    pause
    exit /b 1
)

where java >nul 2>&1
if errorlevel 1 (
    echo [ERROR] java was not found in PATH.
    echo Please install JDK 17 and make sure java is available in PATH.
    pause
    exit /b 1
)

where javac >nul 2>&1
if errorlevel 1 (
    echo [ERROR] javac was not found in PATH.
    echo Please install JDK 17 instead of JRE only.
    pause
    exit /b 1
)

echo [INFO] Checking Java version...
java -version
echo.

if exist "out" rmdir /s /q "out"
mkdir "out"
mkdir "out\resources"

set "LIB_CP=lib\gson-2.13.2.jar;lib\jakarta.servlet-api-6.0.0.jar"
set "SRC_CP=%LIB_CP%;out"
set "RUN_CP=out;%LIB_CP%"
set "SERVER_PORT=9191"

netstat -ano | findstr /r /c:":%SERVER_PORT% .*LISTENING" >nul
if not errorlevel 1 (
    echo [ERROR] Port %SERVER_PORT% is already in use.
    echo.
    echo [INFO] Current listeners on port %SERVER_PORT%:
    netstat -ano | findstr :%SERVER_PORT%
    echo.
    for /f "tokens=5" %%p in ('netstat -ano ^| findstr /r /c:":%SERVER_PORT% .*LISTENING"') do (
        echo [INFO] Possible PID using this port: %%p
        echo [INFO] To stop it, run: taskkill /PID %%p /F
    )
    echo.
    echo Please close the process using port %SERVER_PORT% and try again.
    pause
    exit /b 1
)

echo [INFO] Compiling domain, repository, utility and servlet classes...
javac -encoding UTF-8 --release 17 -cp "%LIB_CP%" -d out ^
    src\com\bupt\ta\shared\domain\*.java ^
    src\com\bupt\ta\shared\infrastructure\*.java ^
    src\com\bupt\ta\shared\util\*.java ^
    src\com\bupt\ta\shared\interfaces\*.java ^
    src\com\bupt\ta\student\domain\*.java ^
    src\com\bupt\ta\student\interfaces\*.java ^
    src\com\bupt\ta\mo\interfaces\*.java ^
    src\com\bupt\ta\admin\interfaces\*.java

if errorlevel 1 (
    echo.
    echo [ERROR] Business code compilation failed.
    echo Please check the compiler output above.
    pause
    exit /b 1
)

echo.
echo [INFO] Compiling server entry and HTTP adapters...
javac -encoding UTF-8 --release 17 -cp "%SRC_CP%" -d out ^
    src\HttpSessionAdapter.java ^
    src\HttpServletRequestAdapter.java ^
    src\HttpServletResponseAdapter.java ^
    src\EmbeddedServer.java

if errorlevel 1 (
    echo.
    echo [ERROR] Server bootstrap compilation failed.
    echo Please check the compiler output above.
    pause
    exit /b 1
)

echo.
echo [INFO] Copying resources...
xcopy "resources" "out\resources" /E /I /Y >nul

echo.
echo [INFO] Starting server...
echo [INFO] Open http://localhost:%SERVER_PORT% in your browser after startup.
echo.
java -cp "%RUN_CP%" EmbeddedServer

echo.
echo [INFO] Server process finished.
pause
