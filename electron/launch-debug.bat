@echo off
REM BigDaddyG IDE - Debug Launch Script
REM Tests black screen fixes with maximum safety

echo ===============================================
echo   BigDaddyG IDE - DEBUG LAUNCH
echo ===============================================
echo.

REM Clear GPU cache
echo [1/4] Clearing GPU cache...
if exist "%APPDATA%\BigDaddyG IDE\GPUCache" (
    rmdir /s /q "%APPDATA%\BigDaddyG IDE\GPUCache"
    echo    ✓ GPU cache cleared
) else (
    echo    ℹ No GPU cache found
)

REM Clear main cache
echo [2/4] Clearing main cache...
if exist "%APPDATA%\BigDaddyG IDE\Cache" (
    rmdir /s /q "%APPDATA%\BigDaddyG IDE\Cache"
    echo    ✓ Main cache cleared
) else (
    echo    ℹ No main cache found
)

echo [3/4] Setting environment variables...
set NODE_ENV=development
set ELECTRON_ENABLE_LOGGING=1
echo    ✓ Logging enabled

echo [4/4] Launching with safety flags...
echo.
echo FLAGS:
echo   • --disable-gpu
echo   • --disable-gpu-compositing
echo   • --disable-software-rasterizer
echo   • --no-sandbox
echo   • --disable-dev-shm-usage
echo.

cd /d "%~dp0"
npm start -- ^
    --disable-gpu ^
    --disable-gpu-compositing ^
    --disable-software-rasterizer ^
    --no-sandbox ^
    --disable-dev-shm-usage ^
    --enable-logging

echo.
echo ===============================================
echo   Launch complete. Check for errors above.
echo ===============================================
pause
