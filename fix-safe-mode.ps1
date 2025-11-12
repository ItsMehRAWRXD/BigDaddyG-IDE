# BigDaddyG IDE - Fix Safe Mode (Windows)
# Ensures the IDE loads index.html instead of safe mode

Write-Host ""
Write-Host "🔧 FIXING SAFE MODE..." -ForegroundColor Cyan
Write-Host ""

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$iniPath = Join-Path $scriptDir "electron\bigdaddyg.ini"

# Check if file exists
if (Test-Path $iniPath) {
    Write-Host "✅ Found bigdaddyg.ini" -ForegroundColor Green
    Write-Host "   Location: $iniPath" -ForegroundColor Gray
    Write-Host ""
    
    # Read current content
    $content = Get-Content $iniPath -Raw
    Write-Host "📄 Current Configuration:" -ForegroundColor Yellow
    Write-Host $content
    Write-Host ""
} else {
    Write-Host "⚠️  bigdaddyg.ini not found, creating new one..." -ForegroundColor Yellow
    Write-Host "   Location: $iniPath" -ForegroundColor Gray
    Write-Host ""
}

# Create/Update INI content
$iniContent = @"
[SafeMode]
enabled=false
failure_threshold=3
failure_count=0
last_working_html=index.html

[IDE]
html_file=index.html
monaco_enabled=true
theme=dark
font_size=14
auto_save=true
tab_size=4
line_numbers=true

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
marketplace_url=https://marketplace.visualstudio.com

[AI]
ollama_enabled=true
ollama_port=11434
bigdaddya_enabled=true
api_keys_encrypted=true

[Performance]
lazy_loading=true
virtual_scrolling=true
memory_limit=2048
"@

# Write the file
$iniContent | Out-File -FilePath $iniPath -Encoding UTF8 -NoNewline

Write-Host "✅ Configuration Updated!" -ForegroundColor Green
Write-Host ""
Write-Host "📄 New Configuration:" -ForegroundColor Cyan
Write-Host $iniContent
Write-Host ""
Write-Host "🎯 KEY SETTINGS:" -ForegroundColor Yellow
Write-Host "   SafeMode.enabled = false ✅" -ForegroundColor Green
Write-Host "   IDE.html_file = index.html ✅" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Safe mode is now DISABLED!" -ForegroundColor Green
Write-Host "   The IDE will load index.html on next launch." -ForegroundColor Gray
Write-Host ""
Write-Host "▶️  Run 'npm start' to launch the IDE" -ForegroundColor Cyan
Write-Host ""
"@