@echo off
echo Building BigDaddyG Native Ollama...
echo.

call "D:\Microsoft Visual Studio 2022\Common7\Tools\VsDevCmd.bat"

echo Compiling...
cl ollama-native.c /Fe:ollama-native.exe winhttp.lib /O2

if exist ollama-native.exe (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
    echo.
    echo Executable: ollama-native.exe
    echo.
    echo Test it:
    echo   ollama-native.exe deepseek-r1:1.5b "Write hello world"
    echo.
    copy ollama-native.exe ..\..\electron\ 2>nul
    if exist ..\..\electron\ollama-native.exe (
        echo ✓ Copied to electron folder!
    )
) else (
    echo.
    echo BUILD FAILED!
)

pause

