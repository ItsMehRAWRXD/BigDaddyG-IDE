# PowerShell script to create audit package for ProjectIDEAI
$sourceDir = "d:\Security Research aka GitHub Repos\ProjectIDEAI\electron"
$desktopPath = "C:\Users\HiH8e\OneDrive\Desktop"
$zipFileName = "ProjectIDEAI-Audit-Package-$(Get-Date -Format 'yyyy-MM-dd-HHmm').zip"
$zipPath = Join-Path $desktopPath $zipFileName

Write-Host "Creating audit package for ProjectIDEAI..." -ForegroundColor Green
Write-Host "Source: $sourceDir" -ForegroundColor Yellow
Write-Host "Destination: $zipPath" -ForegroundColor Yellow

# Create the zip file
try {
    Compress-Archive -Path "$sourceDir\*" -DestinationPath $zipPath -Force
    Write-Host "✅ Audit package created successfully!" -ForegroundColor Green
    Write-Host "📦 Package location: $zipPath" -ForegroundColor Cyan
    Write-Host "📊 Package size: $([math]::Round((Get-Item $zipPath).Length / 1MB, 2)) MB" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating package: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Display package contents summary
Write-Host "`n📋 Package Contents Summary:" -ForegroundColor Magenta
$fileCount = (Get-ChildItem -Path $sourceDir -Recurse -File).Count
$folderCount = (Get-ChildItem -Path $sourceDir -Recurse -Directory).Count
Write-Host "   • Total Files: $fileCount" -ForegroundColor White
Write-Host "   • Total Folders: $folderCount" -ForegroundColor White

Write-Host "`n🔍 Key Components Included:" -ForegroundColor Magenta
Write-Host "   • Core IDE files (main.js, index.html, etc.)" -ForegroundColor White
Write-Host "   • Security modules and hardening scripts" -ForegroundColor White
Write-Host "   • Extension system and marketplace" -ForegroundColor White
Write-Host "   • AI/ML integration components" -ForegroundColor White
Write-Host "   • Container runtime and sandboxing" -ForegroundColor White
Write-Host "   • UI components and styling" -ForegroundColor White
Write-Host "   • Test suites and documentation" -ForegroundColor White
Write-Host "   • Configuration files and dependencies" -ForegroundColor White

Write-Host "`n✨ Ready for professional audit!" -ForegroundColor Green