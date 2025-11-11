@echo off
REM BigDaddyG IDE - Quick Safe Mode Fix (CMD Version)

echo.
echo 🔧 FIXING SAFE MODE...
echo.

set "INI_PATH=%~dp0electron\bigdaddyg.ini"

echo Creating configuration...
echo [SafeMode] > "%INI_PATH%"
echo enabled=false >> "%INI_PATH%"
echo failure_threshold=3 >> "%INI_PATH%"
echo failure_count=0 >> "%INI_PATH%"
echo last_working_html=index.html >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [IDE] >> "%INI_PATH%"
echo html_file=index.html >> "%INI_PATH%"
echo monaco_enabled=true >> "%INI_PATH%"
echo theme=dark >> "%INI_PATH%"
echo font_size=14 >> "%INI_PATH%"
echo auto_save=true >> "%INI_PATH%"
echo tab_size=4 >> "%INI_PATH%"
echo line_numbers=true >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [Display] >> "%INI_PATH%"
echo fullscreen=false >> "%INI_PATH%"
echo width=1400 >> "%INI_PATH%"
echo height=900 >> "%INI_PATH%"
echo maximized=false >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [Rendering] >> "%INI_PATH%"
echo hardware_acceleration=true >> "%INI_PATH%"
echo vsync=true >> "%INI_PATH%"
echo fps_limit=60 >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [Extensions] >> "%INI_PATH%"
echo enabled=true >> "%INI_PATH%"
echo auto_update=true >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [AI] >> "%INI_PATH%"
echo ollama_enabled=true >> "%INI_PATH%"
echo ollama_port=11434 >> "%INI_PATH%"
echo bigdaddya_enabled=true >> "%INI_PATH%"
echo. >> "%INI_PATH%"
echo [Performance] >> "%INI_PATH%"
echo lazy_loading=true >> "%INI_PATH%"
echo virtual_scrolling=true >> "%INI_PATH%"
echo memory_limit=2048 >> "%INI_PATH%"

echo.
echo ✅ Configuration created at:
echo    %INI_PATH%
echo.
echo 🎯 KEY SETTINGS:
echo    SafeMode.enabled = false ✅
echo    IDE.html_file = index.html ✅
echo.
echo 🚀 Safe mode is now DISABLED!
echo.
echo ▶️  Run 'npm start' to launch the IDE
echo.
pause
