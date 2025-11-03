# BigDaddyG IDE - Build with Auto-Cleanup
# Builds 115GB EXE and cleans up temp files automatically

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   BigDaddyG IDE - Full Build (115GB)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Magenta

$projectPath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"
cd $projectPath

Write-Host "📊 Pre-build disk usage:" -ForegroundColor Yellow
$drive = Get-PSDrive D
$freeBefore = [math]::Round($drive.Free / 1GB, 2)
Write-Host "  Free space: $freeBefore GB`n" -ForegroundColor White

Write-Host "🏗️ Starting build (this will take 20-40 minutes)...`n" -ForegroundColor Green
Write-Host "⏳ Progress:" -ForegroundColor Cyan
Write-Host "  1. Packaging Electron (2-3 min)" -ForegroundColor White
Write-Host "  2. Copying 114GB models (15-25 min)" -ForegroundColor White
Write-Host "  3. Creating portable EXE (3-5 min)" -ForegroundColor White
Write-Host "  4. Auto-cleanup temp files`n" -ForegroundColor White

# Run the build
$buildStart = Get-Date
npm run build:portable 2>&1 | Tee-Object -FilePath "build-log.txt"
$buildEnd = Get-Date
$buildTime = $buildEnd - $buildStart

Write-Host "`n═══════════════════════════════════════════════" -ForegroundColor Cyan

if (Test-Path "dist\BigDaddyG-Portable-2.0.0.exe") {
    $exeSize = (Get-Item "dist\BigDaddyG-Portable-2.0.0.exe").Length / 1GB
    
    if ($exeSize -gt 100) {
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "`n📦 Output:" -ForegroundColor Cyan
        Write-Host "  File: BigDaddyG-Portable-2.0.0.exe" -ForegroundColor White
        Write-Host "  Size: $([math]::Round($exeSize, 2)) GB" -ForegroundColor Yellow
        Write-Host "  Location: dist\" -ForegroundColor White
        Write-Host "  Build time: $($buildTime.ToString('hh\:mm\:ss'))`n" -ForegroundColor White
        
        Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
        
        # Delete win-unpacked folder (~114GB)
        if (Test-Path "dist\win-unpacked") {
            $unpackedSize = (Get-ChildItem "dist\win-unpacked" -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
            Write-Host "  Deleting win-unpacked ($([math]::Round($unpackedSize, 2)) GB)..." -ForegroundColor DarkGray
            Remove-Item "dist\win-unpacked" -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Deleted" -ForegroundColor Green
        }
        
        # Delete other build artifacts
        Remove-Item "dist\*.yaml" -Force -ErrorAction SilentlyContinue
        Remove-Item "dist\*.yml" -Force -ErrorAction SilentlyContinue
        Remove-Item "dist\*.7z" -Force -ErrorAction SilentlyContinue
        
        Write-Host "`n📊 Disk space recovered:" -ForegroundColor Cyan
        $drive = Get-PSDrive D
        $freeAfter = [math]::Round($drive.Free / 1GB, 2)
        $recovered = $freeAfter - $freeBefore
        Write-Host "  Freed: $([math]::Round($recovered, 2)) GB" -ForegroundColor Green
        Write-Host "  Free now: $freeAfter GB`n" -ForegroundColor White
        
        Write-Host "🎉 READY TO USE!" -ForegroundColor Magenta
        Write-Host "`nTo deploy:" -ForegroundColor Yellow
        Write-Host "  1. Copy dist\BigDaddyG-Portable-2.0.0.exe to USB (64GB+ required)" -ForegroundColor White
        Write-Host "  2. Run directly - no installation needed!" -ForegroundColor White
        Write-Host "  3. All 8 AI models included and ready`n" -ForegroundColor White
        
    } else {
        Write-Host "⚠️ Build completed but EXE is too small ($([math]::Round($exeSize, 2)) GB)" -ForegroundColor Yellow
        Write-Host "Models may not have been included. Check build-log.txt`n" -ForegroundColor Red
    }
} else {
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Check build-log.txt for errors`n" -ForegroundColor Yellow
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

