@echo off
%SystemRoot%\System32\chcp.com 65001 >nul
title STPresetEditor Launcher

echo ========================================
echo    STPresetEditor Launcher
echo ========================================
echo.

::: Switch to the script directory
cd /d "%~dp0"

::: Check if we are in the correct directory
if not exist "package.json" (
    echo Error: package.json file not found
    echo Current directory: %CD%
    echo Please run this script from the STPresetEditor project directory
    echo.
    pause
    exit /b 1
)

::: Ensure dependencies (install if node_modules missing or vite not present)
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error: Installation failed
        pause
        exit /b 1
    )
    echo Dependencies installed successfully
    echo.
) else (
    if not exist "node_modules\.bin\vite.cmd" (
        echo vite not found. Installing dev dependencies...
        call npm install
        if errorlevel 1 (
            echo Error: Installation failed
            pause
            exit /b 1
        )
        echo Dependencies installed successfully
        echo.
    )
)

echo Starting development server...
echo Application will automatically open at: http://localhost:5173
echo.
echo Press Ctrl+C to stop the server
echo.

::: Start the development server
call npm run dev

pause