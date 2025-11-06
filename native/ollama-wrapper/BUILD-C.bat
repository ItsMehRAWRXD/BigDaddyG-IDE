@echo off
echo ========================================
echo Building BigDaddyG Native Ollama (Pure C)
echo ========================================
echo.

REM Try MSVC first (Visual Studio)
where cl >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [MSVC] Building with Visual Studio compiler...
    cl ollama-native.c /Fe:ollama-native.exe winhttp.lib /O2
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo BUILD SUCCESS! (MSVC)
        echo ========================================
        echo.
        echo Executable: ollama-native.exe
        echo.
        echo Test it:
        echo   ollama-native.exe deepseek-r1:1.5b "Write hello world"
        echo.
        goto :success
    )
)

REM Try Clang
where clang >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Clang] Building with Clang compiler...
    clang ollama-native.c -o ollama-native.exe -lwinhttp -O3
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo BUILD SUCCESS! (Clang)
        echo ========================================
        echo.
        echo Executable: ollama-native.exe
        echo.
        echo Test it:
        echo   ollama-native.exe deepseek-r1:1.5b "Write hello world"
        echo.
        goto :success
    )
)

REM Try MinGW
where gcc >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [GCC/MinGW] Building with GCC compiler...
    gcc ollama-native.c -o ollama-native.exe -lwinhttp -O3
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ========================================
        echo BUILD SUCCESS! (GCC/MinGW)
        echo ========================================
        echo.
        echo Executable: ollama-native.exe
        echo.
        echo Test it:
        echo   ollama-native.exe deepseek-r1:1.5b "Write hello world"
        echo.
        goto :success
    )
)

:error
echo.
echo ========================================
echo BUILD FAILED!
echo ========================================
echo.
echo No compiler found!
echo.
echo You have:
where cl 2>nul
where clang 2>nul
where gcc 2>nul
echo.
echo Please make sure Visual Studio Developer Command Prompt is active,
echo or add your compiler to PATH.
echo.
pause
exit /b 1

:success
echo Copy ollama-native.exe to ../..electron/ to use in IDE
echo.
pause

