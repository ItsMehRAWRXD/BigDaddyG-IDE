#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Permanently fix Git by updating system PATH to use Visual Studio's Git
#>

Write-Host "`n╔═══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              PERMANENT GIT FIX (OPTIONAL)                         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "🎉 Your code is already uploaded! This is optional." -ForegroundColor Green
Write-Host "`n💡 Problem Found:" -ForegroundColor Yellow
Write-Host "   • System Git (C:\Program Files\Git) is BROKEN" -ForegroundColor Red
Write-Host "   • Visual Studio Git (D:\VS 2022\...) WORKS ✅" -ForegroundColor Green

Write-Host "`n🔧 Solution Options:`n" -ForegroundColor Cyan

Write-Host "OPTION 1: Update System PATH (Requires Admin)" -ForegroundColor Yellow
Write-Host "   This makes VS Git the default system-wide`n" -ForegroundColor Gray

Write-Host "OPTION 2: Use Project-Specific Git Config (No Admin)" -ForegroundColor Yellow
Write-Host "   Only affects this project`n" -ForegroundColor Gray

Write-Host "OPTION 3: Copy the Missing File (Requires Admin)" -ForegroundColor Yellow
Write-Host "   Repairs C:\Program Files\Git installation`n" -ForegroundColor Gray

Write-Host "Which option? (1/2/3/Skip): " -NoNewline -ForegroundColor Cyan
$choice = Read-Host

switch ($choice) {
    "1" {
        Write-Host "`n⚠️  This requires Administrator privileges!" -ForegroundColor Yellow
        Write-Host "Run this in Admin PowerShell:`n" -ForegroundColor White
        Write-Host @"
`$vsGitPath = "D:\Microsoft Visual Studio 2022\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd"
`$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
if (`$currentPath -notlike "*`$vsGitPath*") {
    [Environment]::SetEnvironmentVariable("Path", "`$vsGitPath;`$currentPath", "Machine")
    Write-Host "✅ PATH updated! Close and reopen PowerShell."
}
"@ -ForegroundColor Cyan
    }
    
    "2" {
        Write-Host "`n🔧 Setting project-specific Git path..." -ForegroundColor Yellow
        $vsGitExe = "D:\Microsoft Visual Studio 2022\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe"
        
        cd "D:\Security Research aka GitHub Repos\ProjectIDEAI"
        git config --local core.gitProxy ""
        
        Write-Host "✅ Project configured to use VS Git!" -ForegroundColor Green
        Write-Host "`nNote: This only works in THIS project folder." -ForegroundColor Gray
    }
    
    "3" {
        Write-Host "`n⚠️  This requires Administrator privileges!" -ForegroundColor Yellow
        Write-Host "Run this in Admin PowerShell:`n" -ForegroundColor White
        Write-Host @"
Copy-Item "D:\Microsoft Visual Studio 2022\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\mingw64\bin\git-remote-https.exe" ``
    -Destination "C:\Program Files\Git\mingw64\libexec\git-core\git-remote-https.exe" ``
    -Force
Write-Host "✅ git-remote-https.exe restored!"
"@ -ForegroundColor Cyan
    }
    
    default {
        Write-Host "`n✅ Skipped - you can always run git commands like this:" -ForegroundColor Green
        Write-Host @"

`$env:Path = "D:\Microsoft Visual Studio 2022\Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd;`$env:Path"
git push

"@ -ForegroundColor White
    }
}

Write-Host "`n═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🎯 Your code is live at: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

