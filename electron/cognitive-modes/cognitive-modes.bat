@echo off
REM BigDaddyG IDE - Cognitive Modes Command Prompt Wrapper
REM Control cognitive modes from CMD

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "CLI_PATH=%SCRIPT_DIR%cli.js"

REM Check if Node.js is available
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    exit /b 1
)

REM Check if CLI exists
if not exist "%CLI_PATH%" (
    echo Error: CLI script not found at: %CLI_PATH%
    exit /b 1
)

REM Run CLI with all arguments
node "%CLI_PATH%" %*
