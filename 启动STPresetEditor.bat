@echo off
chcp 65001 >nul
title STPresetEditor 启动器

echo ========================================
echo    STPresetEditor 启动器
echo ========================================
echo.

:: 切换到脚本所在目录
cd /d "%~dp0"

:: 检查是否在正确的目录
if not exist "package.json" (
    echo 错误：未找到 package.json 文件
    echo 当前目录：%CD%
    echo 请确保在 STPresetEditor 项目根目录下运行此脚本
    echo.
    pause
    exit /b 1
)

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo 正在安装依赖...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败！
        pause
        exit /b 1
    )
    echo 依赖安装完成！
    echo.
)

echo 正在启动开发服务器...
echo 应用将在浏览器中自动打开：http://localhost:5173
echo.
echo 按 Ctrl+C 可以停止服务器
echo.

:: 启动开发服务器
npm run dev

pause
