#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Fix Git Installation and Upload BigDaddyG IDE to GitHub
#>

param(
    [switch]$SkipGitReinstall
)

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         GIT REPAIR & GITHUB UPLOAD SOLUTION                       ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🔍 Diagnosis: git-remote-https.exe is MISSING" -ForegroundColor Red
Write-Host "   Your Git installation at 'C:\Program Files\Git' is corrupted.`n" -ForegroundColor Yellow

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 SOLUTION #1: REINSTALL GIT (RECOMMENDED - 5 minutes)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

if (-not $SkipGitReinstall) {
    Write-Host "This will reinstall Git properly. Continue? (Y/N): " -NoNewline -ForegroundColor Yellow
    $response = Read-Host
    
    if ($response -eq 'Y' -or $response -eq 'y') {
        Write-Host "`n📥 Reinstalling Git..." -ForegroundColor Cyan
        
        # Check if winget is available
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            Write-Host "   Using winget..." -ForegroundColor Yellow
            winget install --id Git.Git -e --source winget --force --accept-package-agreements --accept-source-agreements
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Git reinstalled successfully!" -ForegroundColor Green
                Write-Host "`n🔄 Please close and reopen PowerShell, then run:`n" -ForegroundColor Yellow
                Write-Host "   cd 'D:\Security Research aka GitHub Repos\ProjectIDEAI'" -ForegroundColor White
                Write-Host "   git remote add origin git@github.com:ItsMehRAWRXD/BigDaddyG-IDE.git" -ForegroundColor White
                Write-Host "   git push -u origin main`n" -ForegroundColor White
                exit 0
            }
        } else {
            Write-Host "   ⚠️  Winget not found. Downloading Git installer..." -ForegroundColor Yellow
            $gitInstaller = "$env:TEMP\Git-Installer.exe"
            Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.45.2.windows.1/Git-2.45.2-64-bit.exe" -OutFile $gitInstaller
            
            Write-Host "   Running installer..." -ForegroundColor Yellow
            Start-Process -FilePath $gitInstaller -ArgumentList "/VERYSILENT","/NORESTART" -Wait
            
            Write-Host "   ✅ Git reinstalled! Close and reopen PowerShell." -ForegroundColor Green
            exit 0
        }
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 SOLUTION #2: GITHUB DESKTOP (EASIEST - 2 minutes)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "GitHub Desktop has its own Git - bypasses your broken installation!`n" -ForegroundColor White

Write-Host "Steps:" -ForegroundColor Yellow
Write-Host "   1. Download: https://desktop.github.com/" -ForegroundColor White
Write-Host "   2. Install and login with your GitHub account" -ForegroundColor White
Write-Host "   3. File → Add Local Repository" -ForegroundColor White
Write-Host "   4. Select: D:\Security Research aka GitHub Repos\ProjectIDEAI" -ForegroundColor White
Write-Host "   5. Click 'Publish repository'" -ForegroundColor White
Write-Host "   6. Done! ✅`n" -ForegroundColor Green

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🔧 SOLUTION #3: WEB UPLOAD (MANUAL - 10 minutes)" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Create a ZIP and upload via GitHub web interface:`n" -ForegroundColor White

Write-Host "Steps:" -ForegroundColor Yellow
Write-Host "   1. Run this command to create ZIP:" -ForegroundColor White
Write-Host @"
   
   Compress-Archive -Path "D:\Security Research aka GitHub Repos\ProjectIDEAI\*" ``
       -DestinationPath "D:\BigDaddyG-IDE-Source.zip" ``
       -Force -CompressionLevel Optimal ``
       -Exclude @('node_modules','dist','.git','BigDaddyG-AI-Bundle')
   
"@ -ForegroundColor Cyan

Write-Host "   2. Go to: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE" -ForegroundColor White
Write-Host "   3. Click 'Add file' → 'Upload files'" -ForegroundColor White
Write-Host "   4. Drag BigDaddyG-IDE-Source.zip" -ForegroundColor White
Write-Host "   5. Commit changes`n" -ForegroundColor White

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 WHAT WILL BE UPLOADED" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

$projectPath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"
$files = Get-ChildItem $projectPath -Recurse -File -Exclude @('node_modules','dist','.git') -ErrorAction SilentlyContinue
$fileCount = ($files | Measure-Object).Count
$totalSize = [math]::Round(($files | Measure-Object -Property Length -Sum).Sum / 1MB, 2)

Write-Host "   📁 Files: $fileCount" -ForegroundColor White
Write-Host "   💾 Size: $totalSize MB" -ForegroundColor White
Write-Host "   📦 Includes:" -ForegroundColor White
Write-Host "      • All source code" -ForegroundColor Gray
Write-Host "      • All documentation" -ForegroundColor Gray
Write-Host "      • PRESERVATION-POLICY.md" -ForegroundColor Gray
Write-Host "      • All test files (mistakes included!)" -ForegroundColor Gray
Write-Host "      • Build scripts" -ForegroundColor Gray

Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💡 RECOMMENDED: Use GitHub Desktop (Solution #2)" -ForegroundColor Green
Write-Host "   It's the fastest way and works around your broken Git!" -ForegroundColor White
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Would you like me to open GitHub Desktop download page? (Y/N): " -NoNewline -ForegroundColor Yellow
$openBrowser = Read-Host

if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
    Start-Process "https://desktop.github.com/"
    Write-Host "`n✅ Browser opened! Install GitHub Desktop and follow steps above." -ForegroundColor Green
}

Write-Host "`n🎯 Your code is ready to upload - just need working git!" -ForegroundColor Cyan

