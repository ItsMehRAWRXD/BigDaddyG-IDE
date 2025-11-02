#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integrates Background Agents into BigDaddyG IDE

.DESCRIPTION
    Adds autonomous background agent functionality to BigDaddyG IDE
#>

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🤖 BigDaddyG IDE - Background Agents Installer           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================================================
# Verify Files
# ============================================================================

Write-Host "📋 Checking files..." -ForegroundColor Yellow

$requiredFiles = @(
    "electron\index.html",
    "electron\background-agent-worker.js",
    "electron\background-agent-manager.js",
    "electron\background-agent.css"
)

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Error: $file not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All files found!`n" -ForegroundColor Green

# ============================================================================
# Backup
# ============================================================================

Write-Host "💾 Creating backup..." -ForegroundColor Yellow

if (-not (Test-Path "electron\index.html.backup")) {
    Copy-Item "electron\index.html" "electron\index.html.backup"
    Write-Host "✅ Backup created`n" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backup exists, skipping...`n" -ForegroundColor Gray
}

# ============================================================================
# Integrate
# ============================================================================

Write-Host "🔧 Integrating background agents..." -ForegroundColor Yellow

$html = Get-Content "electron\index.html" -Raw

if ($html -match "background-agent-manager\.js") {
    Write-Host "✅ Background agents already installed!`n" -ForegroundColor Green
    exit 0
}

# Add CSS and JS
$cssLine = '    <link rel="stylesheet" href="background-agent.css">'
$managerLine = '    <script src="background-agent-manager.js"></script>'

if ($html -match '</head>') {
    $html = $html -replace '</head>', "$cssLine`n$managerLine`n</head>"
    Write-Host "✅ Added CSS and JS references" -ForegroundColor Green
} else {
    $html += "`n$cssLine`n$managerLine`n"
}

# Write
$html | Set-Content "electron\index.html" -NoNewline

Write-Host "✅ Integration complete!`n" -ForegroundColor Green

# ============================================================================
# Summary
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ BACKGROUND AGENTS INSTALLED!                 ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🤖 AVAILABLE AGENTS:`n" -ForegroundColor Cyan

Write-Host "   🐛 Fix Bug       - Automatically fix bugs in code" -ForegroundColor White
Write-Host "   ✨ Implement     - Implement new features" -ForegroundColor White
Write-Host "   ♻️  Refactor     - Improve code quality" -ForegroundColor White
Write-Host "   🧪 Generate Tests - Create unit tests" -ForegroundColor White
Write-Host "   ⚡ Optimize      - Improve performance`n" -ForegroundColor White

Write-Host "🚀 NEXT STEPS:`n" -ForegroundColor Yellow

Write-Host "1️⃣  Launch BigDaddyG IDE:" -ForegroundColor Yellow
Write-Host "   npm start`n" -ForegroundColor White

Write-Host "2️⃣  Open Agent Panel:" -ForegroundColor Yellow
Write-Host "   Look for '🤖 Background Agents' in sidebar`n" -ForegroundColor White

Write-Host "3️⃣  Create Your First Agent:" -ForegroundColor Yellow
Write-Host "   • Select agent type (e.g., Fix Bug)" -ForegroundColor White
Write-Host "   • Describe the task" -ForegroundColor White
Write-Host "   • Click 'Start Agent'" -ForegroundColor White
Write-Host "   • Agent works in background!" -ForegroundColor White
Write-Host "   • Get notified when complete`n" -ForegroundColor White

Write-Host "🎉 Enjoy autonomous coding with BigDaddyG!`n" -ForegroundColor Green

