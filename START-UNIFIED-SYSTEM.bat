@echo off
title ProjectIDEAI - Unified System Starting...
color 0A

echo.
echo ================================================
echo   PROJECT IDE AI - Unified System
echo ================================================
echo.
echo 🧬 Model Trainer: Integrated
echo 🎼 Orchestra Server: Enhanced
echo 🧠 Unlimited Generator: Active
echo 💻 IDE: Full-featured
echo 📦 Models: Auto-trained on startup
echo.

cd /d "%~dp0"

echo [Starting] Unified Orchestra Server...
echo   - Auto-training models: Cheetah, Supernova, Grok Mini
echo   - Loading unlimited generator
echo   - Scanning 14,878 models + 4,176 agents
echo.

start "ProjectIDEAI Orchestra" cmd /k "cd server && node Orchestra-Server.js"
timeout /t 4 /nobreak >nul

echo [Opening] IDE with all models available...
start "" "ide\BigDaddyG-IDE.html"

echo.
echo ================================================
echo   ✅ SYSTEM ONLINE
echo ================================================
echo.
echo   Orchestra: http://localhost:11441
echo   Models: Auto-trained + Cataloged
echo   Status: All systems operational
echo.
echo   Available models:
echo     🧠 BigDaddyG (Latest, Code, Debug, Crypto)
echo     🐆 Cheetah Stealth (1M - Auto-trained)
echo     💫 Code Supernova (1M - Auto-trained)
echo     ⚡ Grok Mini (Auto-trained)
echo     💎 Gemma 3 (1B, 12B - via Ollama)
echo     🦙 Llama 3.2 (via Ollama)
echo.
echo Press any key to stop everything...
pause >nul

echo.
echo [Stopping] Orchestra server...
taskkill /F /FI "WINDOWTITLE eq ProjectIDEAI Orchestra*" >nul 2>&1
echo ✅ Stopped.
