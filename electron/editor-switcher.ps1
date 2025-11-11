# Editor Switcher PowerShell Script
# Switch between Monaco and BigDaddy editors

param(
    [Parameter(Position=0)]
    [string]$Command = "status"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cliScript = Join-Path $scriptDir "editor-switcher-cli.js"

# Check if Node.js is available
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCmd) {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Run the CLI
& node $cliScript $Command

# Check result
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Command failed" -ForegroundColor Red
    exit $LASTEXITCODE
}
