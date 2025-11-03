# BigDaddyG IDE Build Monitor
# Tracks the massive 114GB model packaging process

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   BigDaddyG IDE - Build Progress Monitor" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

$projectPath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"
$distPath = Join-Path $projectPath "dist"
$targetFile = Join-Path $distPath "BigDaddyG-Portable-2.0.0.exe"
$unpackedPath = Join-Path $distPath "win-unpacked"

$startTime = Get-Date
$iteration = 0

Write-Host "📊 Monitoring:" -ForegroundColor Yellow
Write-Host "  Target: BigDaddyG-Portable-2.0.0.exe" -ForegroundColor White
Write-Host "  Expected size: ~115 GB" -ForegroundColor White
Write-Host "  Check interval: 30 seconds`n" -ForegroundColor White

while ($true) {
    $iteration++
    $elapsed = (Get-Date) - $startTime
    
    Write-Host "[$($elapsed.ToString('hh\:mm\:ss'))] Check #$iteration" -ForegroundColor Cyan
    
    # Check unpacked directory (intermediate stage)
    if (Test-Path $unpackedPath) {
        $unpackedSize = (Get-ChildItem $unpackedPath -Recurse -ErrorAction SilentlyContinue | 
                         Measure-Object -Property Length -Sum).Sum / 1GB
        Write-Host "  📂 Unpacked folder: $([math]::Round($unpackedSize, 2)) GB" -ForegroundColor Yellow
        
        # Check if models are being copied
        $modelsPath = Join-Path $unpackedPath "models\blobs"
        if (Test-Path $modelsPath) {
            $modelCount = (Get-ChildItem $modelsPath -ErrorAction SilentlyContinue).Count
            Write-Host "  ✅ Models being copied: $modelCount files" -ForegroundColor Green
        }
    }
    
    # Check final EXE
    if (Test-Path $targetFile) {
        $fileSize = (Get-Item $targetFile).Length / 1GB
        $lastWrite = (Get-Item $targetFile).LastWriteTime
        
        Write-Host "  📦 EXE file: $([math]::Round($fileSize, 2)) GB" -ForegroundColor Green
        Write-Host "  ⏰ Last modified: $lastWrite" -ForegroundColor White
        
        # If size is > 100GB, build is complete!
        if ($fileSize -gt 100) {
            Write-Host "`n╔════════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║                                            ║" -ForegroundColor Green
            Write-Host "║        🎉 BUILD COMPLETE! 🎉               ║" -ForegroundColor Green
            Write-Host "║                                            ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════════╝`n" -ForegroundColor Green
            
            Write-Host "📦 Final file: BigDaddyG-Portable-2.0.0.exe" -ForegroundColor White
            Write-Host "💾 Size: $([math]::Round($fileSize, 2)) GB" -ForegroundColor Yellow
            Write-Host "⏱️ Build time: $($elapsed.ToString('hh\:mm\:ss'))" -ForegroundColor White
            Write-Host "`n✅ Ready to deploy to USB or run locally!`n" -ForegroundColor Green
            break
        }
    }
    
    Write-Host "  ⏳ Still building... (waiting 30s)`n" -ForegroundColor DarkGray
    Start-Sleep -Seconds 30
}

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

