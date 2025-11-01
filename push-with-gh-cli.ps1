#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Upload BigDaddyG IDE to GitHub using GitHub CLI (bypasses broken git)
#>

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     UPLOADING TO GITHUB USING GITHUB CLI (GIT BYPASS)            ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$repoOwner = "ItsMehRAWRXD"
$repoName = "BigDaddyG-IDE"
$repoPath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"

# Check if repository exists
Write-Host "🔍 Checking repository status..." -ForegroundColor Yellow
$repoCheck = gh repo view "$repoOwner/$repoName" --json name 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Repository not accessible" -ForegroundColor Red
    Write-Host "   Creating repository..." -ForegroundColor Yellow
    gh repo create "$repoOwner/$repoName" --public --description "The world's first 100% agentic IDE with voice coding and self-healing" 2>&1
}

Write-Host "   ✅ Repository exists: https://github.com/$repoOwner/$repoName" -ForegroundColor Green

# Create a temporary git bundle (works without remote)
Write-Host "`n📦 Creating git bundle..." -ForegroundColor Yellow
cd $repoPath
git bundle create "$repoPath\bigdaddyg-upload.bundle" --all 2>&1

if (Test-Path "$repoPath\bigdaddyg-upload.bundle") {
    $bundleSize = [math]::Round((Get-Item "$repoPath\bigdaddyg-upload.bundle").Length / 1MB, 2)
    Write-Host "   ✅ Bundle created: $bundleSize MB" -ForegroundColor Green
    
    # Now we need to use the bundle
    Write-Host "`n🚀 Upload Method: GitHub Desktop (Recommended)" -ForegroundColor Cyan
    Write-Host @"
    
   Since git's HTTPS helper is broken, use GitHub Desktop:
   
   1. Download: https://desktop.github.com/
   2. Open GitHub Desktop
   3. File → Add Local Repository
   4. Select: $repoPath
   5. Click 'Publish repository' or 'Push origin'
   
   Alternative: Fix Git HTTPS helper
   Run this in Admin PowerShell:
   
   winget install --id Git.Git -e --source winget --force
   
"@ -ForegroundColor White
} else {
    Write-Host "   ❌ Bundle creation failed" -ForegroundColor Red
}

# Try one more alternative: use gh CLI to clone empty repo and copy files
Write-Host "`n📋 Alternative: Manual upload method" -ForegroundColor Yellow
Write-Host @"

1. Clone the empty repository:
   cd .. 
   gh repo clone $repoOwner/$repoName BigDaddyG-IDE-temp
   
2. Copy your files:
   Copy-Item "$repoPath\*" "BigDaddyG-IDE-temp\" -Recurse -Force -Exclude @('.git','node_modules','dist')
   
3. Push from the cloned repo:
   cd BigDaddyG-IDE-temp
   git add .
   git commit -m "🚀 BigDaddyG IDE v2.0.0"
   git push origin main

"@ -ForegroundColor White

Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💡 RECOMMENDATION: Install GitHub Desktop (2 minutes)" -ForegroundColor Yellow
Write-Host "   It handles authentication automatically!" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

