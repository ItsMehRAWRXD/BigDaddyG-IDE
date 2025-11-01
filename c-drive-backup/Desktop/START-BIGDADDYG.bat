@echo off
title 🎼 BigDaddyG Orchestra Launcher
color 0B

echo.
echo ========================================
echo   🎼 BigDaddyG Orchestra Launcher
echo ========================================
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
start "BigDaddyG Orchestra" cmd /k "cd /d "D:\Security Research aka GitHub Repos\ProjectIDEAI\server" && node Orchestra-Server.js"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Agent WebSocket Server (Port 8001)...
start "BigDaddyG Agents" cmd /k "cd /d "D:\Security Research aka GitHub Repos\ProjectIDEAI\server" && node Agent-WebSocket-Server.js"
timeout /t 2 /nobreak >nul

echo [3/3] Starting Micro Model Server (Port 3000)...
start "BigDaddyG Micro Models" cmd /k "cd /d "D:\Security Research aka GitHub Repos\ProjectIDEAI\server" && node Micro-Model-Server.js"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   ✅ All Services Started!
echo ========================================
echo.
echo   🎼 Orchestra:   http://localhost:11441
echo   🤖 Agents:      ws://localhost:8001
echo   🔬 Micro Models: ws://localhost:3000
echo.
echo Opening BigDaddyG IDE...
timeout /t 2 /nobreak >nul

:: Open the IDE
start "" "C:\Users\HiH8e\OneDrive\Desktop\ProjectIDEAI-FINAL.html"

echo.
echo ========================================
echo   🚀 BigDaddyG IDE is now running!
echo ========================================
echo.
echo ✅ IDE opened in your default browser
echo ✅ All backend services are running
echo.
echo 💡 Keep the server windows open
echo 💡 Close them to stop the servers
echo.
echo Press any key to exit this launcher...
pause >nul

