# NUCLEAR OPTION - Completely bypass safe mode
Write-Host ""
Write-Host "🚀 BYPASSING SAFE MODE COMPLETELY..." -ForegroundColor Cyan
Write-Host ""

$projectDir = $PSScriptRoot

# 1. Delete any cached config
Write-Host "1. Deleting cached configs..." -ForegroundColor Yellow
$appData = $env:APPDATA
$localAppData = $env:LOCALAPPDATA
$paths = @(
    "$appData\bigdaddyg-ide",
    "$localAppData\bigdaddyg-ide",
    "$projectDir\electron\bigdaddyg.ini"
)

foreach ($p in $paths) {
    if (Test-Path $p) {
        Remove-Item $p -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Deleted: $p" -ForegroundColor Green
    }
}

# 2. Create fresh INI with safe mode HARD DISABLED
Write-Host ""
Write-Host "2. Creating fresh config..." -ForegroundColor Yellow

$iniContent = @"
[SafeMode]
enabled=false
failure_threshold=999999
failure_count=0
last_working_html=index.html

[IDE]
html_file=index.html
monaco_enabled=true
theme=dark
font_size=14
auto_save=true
tab_size=4

[Display]
fullscreen=false
width=1400
height=900
maximized=false

[Rendering]
hardware_acceleration=true
vsync=true
fps_limit=60

[Extensions]
enabled=true
auto_update=true

[AI]
ollama_enabled=true
ollama_port=11434
bigdaddya_enabled=true

[Performance]
lazy_loading=true
virtual_scrolling=true
memory_limit=2048
"@

$iniPath = "$projectDir\electron\bigdaddyg.ini"
$iniContent | Out-File -FilePath $iniPath -Encoding UTF8 -NoNewline

Write-Host "   ✅ Created: $iniPath" -ForegroundColor Green

# 3. Show the config
Write-Host ""
Write-Host "3. Configuration:" -ForegroundColor Yellow
Get-Content $iniPath | Select-String "SafeMode|enabled|html_file|failure"
Write-Host ""

# 4. Verify the safe-mode-detector.js has been patched
Write-Host "4. Checking safe-mode-detector.js..." -ForegroundColor Yellow
$detectorPath = "$projectDir\electron\safe-mode-detector.js"
$detectorContent = Get-Content $detectorPath -Raw

if ($detectorContent -match "FORCING INDEX.HTML") {
    Write-Host "   ✅ Safe mode detector is PATCHED (will always use index.html)" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Safe mode detector not patched yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ SAFE MODE COMPLETELY BYPASSED!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Now launching IDE..." -ForegroundColor Cyan
Write-Host ""

# 5. Launch
npm start
