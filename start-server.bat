@echo off
echo ========================================
echo 启动智灵新知内容生成服务器
echo ========================================
echo.

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装
    pause
    exit /b 1
)

REM 检查 SSL 证书
if exist "ssl\cert.pem" (
    if exist "ssl\key.pem" (
        echo [✓] 检测到 SSL 证书，将使用 HTTPS 模式
    ) else (
        echo [!] SSL 密钥文件不存在，将使用 HTTP 模式
    )
) else (
    echo [!] SSL 证书文件不存在，将使用 HTTP 模式
    echo [i] 参考 SSL-SETUP.md 配置 HTTPS
)

echo.
echo 正在启动服务器...
echo.

node server.js

pause
