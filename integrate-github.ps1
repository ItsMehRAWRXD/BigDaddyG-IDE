#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integrates GitHub functionality into BigDaddyG IDE

.DESCRIPTION
    This script automatically adds GitHub integration to your BigDaddyG IDE:
    - Adds script and CSS references to index.html
    - Creates backup of original files
    - Verifies integration

.EXAMPLE
    .\integrate-github.ps1
#>

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    🐙 BigDaddyG IDE - GitHub Integration Installer          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================================================
# Configuration
# ============================================================================

$indexPath = "electron\index.html"
$backupPath = "electron\index.html.backup"

# ============================================================================
# Verify Files Exist
# ============================================================================

Write-Host "📋 Checking files..." -ForegroundColor Yellow

if (-not (Test-Path $indexPath)) {
    Write-Host "❌ Error: $indexPath not found!" -ForegroundColor Red
    Write-Host "   Make sure you're in the BigDaddyG IDE root directory" -ForegroundColor Gray
    exit 1
}

if (-not (Test-Path "electron\github-integration.js")) {
    Write-Host "❌ Error: github-integration.js not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "electron\github-integration.css")) {
    Write-Host "❌ Error: github-integration.css not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All files found!`n" -ForegroundColor Green

# ============================================================================
# Backup Original
# ============================================================================

Write-Host "💾 Creating backup..." -ForegroundColor Yellow

if (Test-Path $backupPath) {
    Write-Host "⚠️  Backup already exists, skipping..." -ForegroundColor Gray
} else {
    Copy-Item $indexPath $backupPath
    Write-Host "✅ Backup created: $backupPath`n" -ForegroundColor Green
}

# ============================================================================
# Read HTML
# ============================================================================

Write-Host "📖 Reading index.html..." -ForegroundColor Yellow
$html = Get-Content $indexPath -Raw

# ============================================================================
# Check if Already Integrated
# ============================================================================

if ($html -match "github-integration\.js") {
    Write-Host "✅ GitHub integration already installed!`n" -ForegroundColor Green
    Write-Host "📄 Setup guide: GITHUB-INTEGRATION-SETUP.md" -ForegroundColor Cyan
    exit 0
}

# ============================================================================
# Add Integration
# ============================================================================

Write-Host "🔧 Integrating GitHub module..." -ForegroundColor Yellow

# Find the closing </head> tag and insert before it
$cssLine = '    <link rel="stylesheet" href="github-integration.css">'
$jsLine = '    <script src="github-integration.js"></script>'

if ($html -match '</head>') {
    $html = $html -replace '</head>', "$cssLine`n$jsLine`n</head>"
    Write-Host "✅ Added CSS and JS references" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not find </head> tag, adding at end of file..." -ForegroundColor Yellow
    $html += "`n$cssLine`n$jsLine`n"
}

# ============================================================================
# Write Modified HTML
# ============================================================================

Write-Host "💾 Writing updated index.html..." -ForegroundColor Yellow
$html | Set-Content $indexPath -NoNewline

Write-Host "✅ Integration complete!`n" -ForegroundColor Green

# ============================================================================
# Setup Instructions
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ INSTALLATION COMPLETE!                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🎯 NEXT STEPS:`n" -ForegroundColor Cyan

Write-Host "1️⃣  Register GitHub OAuth App:" -ForegroundColor Yellow
Write-Host "   • Go to: https://github.com/settings/developers" -ForegroundColor White
Write-Host "   • Click 'OAuth Apps' → 'New OAuth App'" -ForegroundColor White
Write-Host "   • Application name: BigDaddyG IDE" -ForegroundColor White
Write-Host "   • Homepage URL: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE" -ForegroundColor White
Write-Host "   • Callback URL: http://localhost:3000/callback" -ForegroundColor White
Write-Host "   • Copy your Client ID`n" -ForegroundColor White

Write-Host "2️⃣  Update Client ID:" -ForegroundColor Yellow
Write-Host "   • Open: electron\github-integration.js" -ForegroundColor White
Write-Host "   • Find line 17: this.clientId = 'Ov23li...'" -ForegroundColor White
Write-Host "   • Replace with YOUR Client ID" -ForegroundColor White
Write-Host "   • Save the file`n" -ForegroundColor White

Write-Host "3️⃣  Launch BigDaddyG IDE:" -ForegroundColor Yellow
Write-Host "   npm start`n" -ForegroundColor White

Write-Host "4️⃣  Test GitHub Integration:" -ForegroundColor Yellow
Write-Host "   • Look for '🐙 GitHub Integration' panel" -ForegroundColor White
Write-Host "   • Click 'Connect GitHub'" -ForegroundColor White
Write-Host "   • Follow the authentication flow" -ForegroundColor White
Write-Host "   • Browse your repositories!`n" -ForegroundColor White

Write-Host "📄 Full guide: " -NoNewline -ForegroundColor Cyan
Write-Host "GITHUB-INTEGRATION-SETUP.md`n" -ForegroundColor White

Write-Host "🎉 Happy coding with GitHub integration!`n" -ForegroundColor Green

# ============================================================================
# Rollback Instructions
# ============================================================================

Write-Host "💡 To rollback (if needed):" -ForegroundColor Gray
Write-Host "   Copy-Item $backupPath $indexPath -Force`n" -ForegroundColor DarkGray

