@echo off
echo ========================================
echo BigDaddyG Native Ollama - BUILD SCRIPT
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found! Please install Node.js first.
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version
echo.

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)

echo [2/5] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo.

echo [3/5] Cleaning previous builds...
call npm run clean 2>nul
echo.

echo [4/5] Building native module...
echo This may take 1-2 minutes...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo.
    echo Possible causes:
    echo   - Visual Studio Build Tools not installed
    echo   - node-gyp not configured
    echo   - Python not found
    echo.
    echo Solutions:
    echo   1. Install Visual Studio Build Tools from:
    echo      https://visualstudio.microsoft.com/downloads/
    echo   2. Run: npm install -g windows-build-tools
    echo   3. Run: npm install -g node-gyp
    echo.
    pause
    exit /b 1
)
echo.

echo [5/5] Testing module...
call npm test
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Tests failed, but module may still work
)
echo.

echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Module location: build\Release\bigdaddyg_ollama.node
echo.
echo Next steps:
echo   1. Restart BigDaddyG IDE
echo   2. Native mode will activate automatically
echo   3. Check console for "Native mode activated!"
echo.
pause

