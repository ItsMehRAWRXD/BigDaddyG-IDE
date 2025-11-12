@echo off
REM BigDaddyG IDE - Universal Startup Script
REM This script handles everything needed to start the IDE

echo.
echo ================================================================
echo    BigDaddyG IDE - Starting Up
echo ================================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [1/5] Checking Node.js...
node --version
npm --version
echo.

echo [2/5] Installing dependencies (if needed)...
if not exist "node_modules" (
    echo Installing packages...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo Dependencies already installed.
)
echo.

echo [3/5] Checking Ollama service...
curl -s http://localhost:11434/api/version >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Ollama is running
) else (
    echo Ollama is not running (optional - AI features will be limited)
)
echo.

echo [4/5] Starting BigDaddyG IDE...
echo ================================================================
echo.
echo The IDE will now launch with:
echo   - Auto-update check from GitHub
echo   - Full tab system (23+ tab types)
echo   - AI features (if Ollama is running)
echo   - Orchestra server on port 11441
echo   - Remote log server on port 11442
echo.
echo To stop the IDE, close the window or press Ctrl+C
echo.
echo ================================================================
echo.

REM Start the IDE
npm start

REM If npm start fails, show error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] IDE failed to start!
    echo Check the error messages above.
    echo.
    pause
    exit /b 1
)

echo.
echo IDE has closed.
pause
