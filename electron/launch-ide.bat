@echo off
echo.
echo ========================================
echo   BigDaddyG IDE - Professional Edition
echo ========================================
echo.
echo Starting IDE with all features...
echo - YouTube Browser Integration
echo - AI-Powered Coding Assistant  
echo - Multi-Agent Swarm Engine
echo - AMD 7800X3D Optimization
echo - 200+ Professional Features
echo.

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

REM Check if Monaco Editor is installed
if not exist "node_modules\monaco-editor" (
    echo Installing Monaco Editor...
    npm install monaco-editor
    echo.
)

REM Check if Electron is installed
if not exist "node_modules\electron" (
    echo Installing Electron...
    npm install electron --save-dev
    echo.
)

echo Launching BigDaddyG IDE...
echo.

REM Start the IDE
npx electron main.js

echo.
echo IDE closed. Press any key to exit...
pause >nul