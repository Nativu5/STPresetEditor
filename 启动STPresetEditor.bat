@echo off
chcp 65001 >nul
title STPresetEditor ������

echo ========================================
echo    STPresetEditor ������
echo ========================================
echo.

:: �л����ű�����Ŀ¼
cd /d "%~dp0"

:: ����Ƿ�����ȷ��Ŀ¼
if not exist "package.json" (
    echo ����δ�ҵ� package.json �ļ�
    echo ��ǰĿ¼��%CD%
    echo ��ȷ���� STPresetEditor ��Ŀ��Ŀ¼�����д˽ű�
    echo.
    pause
    exit /b 1
)

:: ��� node_modules �Ƿ����
if not exist "node_modules" (
    echo ���ڰ�װ����...
    npm install
    if errorlevel 1 (
        echo ������װʧ�ܣ�
        pause
        exit /b 1
    )
    echo ������װ��ɣ�
    echo.
)

echo ������������������...
echo Ӧ�ý�����������Զ��򿪣�http://localhost:5173
echo.
echo �� Ctrl+C ����ֹͣ������
echo.

:: ��������������
npm run dev

pause
