# BigDaddyG IDE - Cognitive Modes PowerShell Wrapper
# Control cognitive modes from PowerShell

param(
    [string]$Command = "help",
    [string]$Mode = "",
    [string]$Value = ""
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cliPath = Join-Path $scriptDir "cli.js"

function Show-Header {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  🧠 COGNITIVE MODES CLI" -ForegroundColor White
    Write-Host "  BigDaddyG IDE - AI Reasoning Control" -ForegroundColor Gray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Show-Header
    
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\cognitive-modes.ps1 -Command <cmd> [-Mode <mode>] [-Value <val>]`n"
    
    Write-Host "COMMANDS:" -ForegroundColor Yellow
    Write-Host "  list              List all modes and their status"
    Write-Host "  toggle            Toggle a specific mode on/off"
    Write-Host "  enable            Enable a specific mode"
    Write-Host "  disable           Disable a specific mode"
    Write-Host "  preset            Load a preset configuration"
    Write-Host "  weight            Set mode priority (0.0-2.0)"
    Write-Host "  stats             Show usage statistics"
    Write-Host "  export            Export configuration"
    Write-Host "  import            Import configuration from file"
    Write-Host "  interactive       Start interactive mode"
    Write-Host "  help              Show this help message`n"
    
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\cognitive-modes.ps1 -Command list"
    Write-Host "  .\cognitive-modes.ps1 -Command toggle -Mode thinking"
    Write-Host "  .\cognitive-modes.ps1 -Command preset -Mode coding"
    Write-Host "  .\cognitive-modes.ps1 -Command weight -Mode search -Value 1.5"
    Write-Host "  .\cognitive-modes.ps1 -Command interactive`n"
}

# Check if Node.js is available
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if CLI exists
if (-not (Test-Path $cliPath)) {
    Write-Host "❌ Error: CLI script not found at: $cliPath" -ForegroundColor Red
    exit 1
}

# Build arguments
$args = @($Command)
if ($Mode) { $args += $Mode }
if ($Value) { $args += $Value }

# Run CLI
if ($Command -eq "help" -or $Command -eq "") {
    Show-Help
} else {
    node $cliPath @args
}
