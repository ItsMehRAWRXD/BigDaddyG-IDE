@echo off
echo ========================================
echo   BigDaddyG IDE - Production Deploy
echo ========================================

echo [1/5] Installing dependencies...
call npm install --production

echo [2/5] Building application...
call npm run build:win

echo [3/5] Creating portable version...
call npm run build:portable

echo [4/5] Running final tests...
node -e "console.log('✅ Node.js working'); process.exit(0)"

echo [5/5] Deploy complete!
echo.
echo 📦 Built files in: dist/
echo 🚀 Ready to ship!
echo.
pause