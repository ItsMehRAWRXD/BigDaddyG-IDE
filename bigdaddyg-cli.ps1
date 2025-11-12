# BigDaddyG IDE - PowerShell CLI Wrapper
# Agentic coding from PowerShell (Windows/Linux/macOS)
# Usage: .\bigdaddyg-cli.ps1 <command> [args]
#
# Examples:
#   .\bigdaddyg-cli.ps1 tab:open chat
#   .\bigdaddyg-cli.ps1 ai:send "Create a REST API"
#   .\bigdaddyg-cli.ps1 interactive
#
# Add to PowerShell profile for global access:
#   Set-Alias bigdaddy "$PSScriptRoot\bigdaddyg-cli.ps1"

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

# Get script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Run Node.js CLI
$nodeCLI = Join-Path $scriptDir "bigdaddyg.js"

if (Test-Path $nodeCLI) {
    & node $nodeCLI $Command $Arguments
} else {
    Write-Host "❌ Error: bigdaddyg.js not found at $nodeCLI" -ForegroundColor Red
    Write-Host "💡 Make sure you're running from the correct directory" -ForegroundColor Yellow
    exit 1
}
