@echo off
title BigDaddyG Full System Launcher
color 0B

echo.
echo ========================================
echo   BigDaddyG Full System Launcher
echo ========================================
echo.
echo Starting all services...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Starting Orchestra Server (Port 11441)...
start "BigDaddyG Orchestra Server" cmd /k "cd /d "%~dp0server" && node Orchestra-Server.js"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Agent WebSocket Server (Port 8001)...
start "BigDaddyG Agent WebSocket" cmd /k "cd /d "%~dp0server" && node Agent-WebSocket-Server.js"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Micro Model Server (Port 3000)...
start "BigDaddyG Micro Model Server" cmd /k "cd /d "%~dp0server" && node Micro-Model-Server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo   Orchestra Server:  http://localhost:11441
echo   Agent WebSocket:   ws://localhost:8001
echo   Micro Model WS:    ws://localhost:3000
echo.
echo Press any key to open the IDE in your browser...
pause >nul

:: Open the IDE
start "" "C:\Users\HiH8e\OneDrive\Desktop\ProjectIDEAI-FINAL.html"

echo.
echo IDE opened! Keep these terminal windows open.
echo Close them to stop the servers.
echo.
pause

