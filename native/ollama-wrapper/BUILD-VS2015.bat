@echo off
echo ========================================
echo Building with Visual Studio 2015
echo ========================================
echo.

REM Try to find VS 2015 Developer Command Prompt
set VS2015_PATH=C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\Tools\VsDevCmd.bat

if exist "%VS2015_PATH%" (
    echo Found VS 2015 at: %VS2015_PATH%
    echo Setting up environment...
    call "%VS2015_PATH%"
    echo.
    
    echo Compiling ollama-native.c...
    cl ollama-native.c /Fe:ollama-native.exe winhttp.lib /O2
    
    if exist ollama-native.exe (
        echo.
        echo ========================================
        echo BUILD SUCCESS!
        echo ========================================
        echo.
        echo Executable: ollama-native.exe
        dir ollama-native.exe | find "ollama-native.exe"
        echo.
        
        echo Copying to electron folder...
        copy ollama-native.exe ..\..\electron\ >nul 2>&1
        if exist ..\..\electron\ollama-native.exe (
            echo ✓ Copied to electron folder!
        )
        echo.
        echo Test it:
        echo   ollama-native.exe deepseek-r1:1.5b "Write hello world"
        echo.
    ) else (
        echo.
        echo BUILD FAILED!
        echo.
    )
) else (
    echo VS 2015 not found at expected location.
    echo Please run this from "Developer Command Prompt for VS 2015"
    echo Or open that prompt and run:
    echo   cd "D:\Security Research aka GitHub Repos\ProjectIDEAI\native\ollama-wrapper"
    echo   cl ollama-native.c /Fe:ollama-native.exe winhttp.lib /O2
)

pause

