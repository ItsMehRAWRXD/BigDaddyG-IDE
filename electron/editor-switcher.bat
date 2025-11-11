@echo off
REM Editor Switcher Batch Script
REM Switch between Monaco and BigDaddy editors

setlocal

REM Get script directory
set SCRIPT_DIR=%~dp0
set CLI_SCRIPT=%SCRIPT_DIR%editor-switcher-cli.js

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [31mNode.js not found. Please install Node.js first.[0m
    exit /b 1
)

REM Run the CLI
if "%~1"=="" (
    node "%CLI_SCRIPT%" status
) else (
    node "%CLI_SCRIPT%" %*
)

endlocal
