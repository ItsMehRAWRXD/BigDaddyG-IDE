#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Integrates Team Collaboration into BigDaddyG IDE

.DESCRIPTION
    Adds real-time team collaboration features to BigDaddyG IDE
#>

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    👥 BigDaddyG IDE - Team Collaboration Installer          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ============================================================================
# Verify Files
# ============================================================================

Write-Host "📋 Checking files..." -ForegroundColor Yellow

$requiredFiles = @(
    "electron\index.html",
    "electron\team-collaboration.js",
    "electron\team-collaboration.css"
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

Write-Host "🔧 Integrating team collaboration..." -ForegroundColor Yellow

$html = Get-Content "electron\index.html" -Raw

if ($html -match "team-collaboration\.js") {
    Write-Host "✅ Team collaboration already installed!`n" -ForegroundColor Green
    Write-Host "📄 Setup guide: TEAM-COLLABORATION-SETUP.md`n" -ForegroundColor Cyan
    exit 0
}

# Add Firebase SDK and team scripts
$firebaseScripts = @"
    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>

    <!-- Team Collaboration -->
    <link rel="stylesheet" href="team-collaboration.css">
    <script src="team-collaboration.js"></script>
"@

if ($html -match '</body>') {
    $html = $html -replace '</body>', "$firebaseScripts`n</body>"
    Write-Host "✅ Added Firebase SDK and team scripts" -ForegroundColor Green
} else {
    $html += "`n$firebaseScripts`n"
}

# Write
$html | Set-Content "electron\index.html" -NoNewline

Write-Host "✅ Integration complete!`n" -ForegroundColor Green

# ============================================================================
# Summary
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║           ✅ TEAM COLLABORATION INSTALLED!                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "👥 FEATURES ENABLED:`n" -ForegroundColor Cyan

Write-Host "   ✅ Room-based collaboration (simple codes)" -ForegroundColor White
Write-Host "   ✅ Real-time code sharing" -ForegroundColor White
Write-Host "   ✅ Live cursor positions" -ForegroundColor White
Write-Host "   ✅ Team chat" -ForegroundColor White
Write-Host "   ✅ Member presence" -ForegroundColor White
Write-Host "   ✅ File sharing`n" -ForegroundColor White

Write-Host "🚀 NEXT STEPS (10 minutes):`n" -ForegroundColor Yellow

Write-Host "1️⃣  Create Firebase Project:" -ForegroundColor Yellow
Write-Host "   • Go to: https://console.firebase.google.com" -ForegroundColor White
Write-Host "   • Create new project: 'bigdaddyg-ide'" -ForegroundColor White
Write-Host "   • Enable Firestore (test mode)" -ForegroundColor White
Write-Host "   • Get Firebase config`n" -ForegroundColor White

Write-Host "2️⃣  Update Config:" -ForegroundColor Yellow
Write-Host "   • Open: electron\team-collaboration.js" -ForegroundColor White
Write-Host "   • Find line 17: this.firebaseConfig = {...}" -ForegroundColor White
Write-Host "   • Replace with YOUR Firebase config" -ForegroundColor White
Write-Host "   • Save the file`n" -ForegroundColor White

Write-Host "3️⃣  Test It:" -ForegroundColor Yellow
Write-Host "   npm start`n" -ForegroundColor White

Write-Host "   • Look for '👥 Team Collaboration' panel" -ForegroundColor White
Write-Host "   • Click 'Create Room'" -ForegroundColor White
Write-Host "   • Share room code with teammates!" -ForegroundColor White
Write-Host "   • Join and collaborate in real-time`n" -ForegroundColor White

Write-Host "📄 Full guide: TEAM-COLLABORATION-SETUP.md`n" -ForegroundColor Cyan

Write-Host "💰 Cost: " -NoNewline -ForegroundColor Yellow
Write-Host "100% FREE (Firebase free tier!)`n" -ForegroundColor Green

Write-Host "🎉 Enjoy real-time team coding!`n" -ForegroundColor Green

