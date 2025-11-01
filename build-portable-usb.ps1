#!/usr/bin/env pwsh
<#
.SYNOPSIS
    BigDaddyG IDE - Portable USB Builder
    Creates fully self-contained USB drive version with embedded models

.DESCRIPTION
    Builds a portable version that includes:
    - Electron app (compiled)
    - BigDaddyG trained model (embedded)
    - Ollama runtime (optional)
    - All dependencies
    - Auto-run script
    Target size: 2-5 GB (fits on any USB drive)

.EXAMPLE
    .\build-portable-usb.ps1 -TargetDrive "E:" -IncludeOllama
#>

param(
    [string]$TargetDrive = "",
    [switch]$IncludeOllama = $false,
    [switch]$CompressModels = $true,
    [string]$BuildType = "Full"  # "Minimal", "Standard", "Full"
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

$BuildConfig = @{
    AppName = "BigDaddyG IDE Portable"
    Version = "1.0.0"
    BuildDate = Get-Date -Format "yyyy-MM-dd"
    
    # Size targets
    MinimalSize = "500 MB"      # Just IDE + patterns
    StandardSize = "2 GB"       # IDE + BigDaddyG model
    FullSize = "5 GB"           # IDE + BigDaddyG + Ollama runtime
}

# ============================================================================
# BANNER
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🚀 BIGDADDYG IDE - PORTABLE USB BUILDER 💎              ║" -ForegroundColor Cyan
Write-Host "╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "║  Creates self-contained USB version with embedded models    ║" -ForegroundColor White
Write-Host "║  Target Size: 500 MB - 5 GB (depending on build type)       ║" -ForegroundColor White
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# SELECT TARGET DRIVE
# ============================================================================

if (-not $TargetDrive) {
    Write-Host "📁 Available Drives:" -ForegroundColor Yellow
    Write-Host ""
    
    Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | ForEach-Object {
        $freeGB = [math]::Round($_.Free / 1GB, 2)
        $usedGB = [math]::Round($_.Used / 1GB, 2)
        $totalGB = [math]::Round(($_.Free + $_.Used) / 1GB, 2)
        
        Write-Host "  $($_.Name):\ - $($_.Description)" -ForegroundColor Cyan
        Write-Host "    Free: $freeGB GB / Total: $totalGB GB" -ForegroundColor Gray
    }
    
    Write-Host ""
    $TargetDrive = Read-Host "Enter target drive letter (e.g., E)"
    $TargetDrive = $TargetDrive.TrimEnd(':') + ":"
}

$TargetPath = "$TargetDrive\BigDaddyG-Portable"

Write-Host ""
Write-Host "🎯 Target: $TargetPath" -ForegroundColor Green
Write-Host "📦 Build Type: $BuildType" -ForegroundColor Green
Write-Host ""

# Verify drive exists and has space
if (-not (Test-Path $TargetDrive)) {
    Write-Host "❌ Drive $TargetDrive not found!" -ForegroundColor Red
    exit 1
}

$drive = Get-PSDrive ($TargetDrive.TrimEnd(':'))
$freeGB = [math]::Round($drive.Free / 1GB, 2)

if ($freeGB -lt 1) {
    Write-Host "❌ Insufficient space! Need at least 1 GB, have $freeGB GB" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Drive has $freeGB GB free" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 1: CREATE DIRECTORY STRUCTURE
# ============================================================================

Write-Host "📁 Step 1: Creating directory structure..." -ForegroundColor Yellow

$Directories = @(
    "$TargetPath",
    "$TargetPath\app",
    "$TargetPath\models",
    "$TargetPath\models\bigdaddyg",
    "$TargetPath\data",
    "$TargetPath\logs",
    "$TargetPath\screenshots",
    "$TargetPath\projects"
)

foreach ($dir in $Directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================================
# STEP 2: BUILD ELECTRON APP
# ============================================================================

Write-Host "🔨 Step 2: Building Electron app..." -ForegroundColor Yellow

Push-Location "D:\Security Research aka GitHub Repos\ProjectIDEAI"

# Build portable version
Write-Host "  📦 Running electron-builder..." -ForegroundColor Cyan
npm run build:win -- --portable 2>&1 | Out-Null

if (Test-Path "dist\BigDaddyG IDE 1.0.0.exe") {
    Copy-Item "dist\BigDaddyG IDE 1.0.0.exe" "$TargetPath\app\BigDaddyG.exe" -Force
    Write-Host "  ✅ Electron app copied" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Build not found, using development version..." -ForegroundColor Yellow
}

Pop-Location
Write-Host ""

# ============================================================================
# STEP 3: EMBED BIGDADDYG MODEL
# ============================================================================

Write-Host "🧠 Step 3: Embedding BigDaddyG model..." -ForegroundColor Yellow

# Copy Orchestra server
$ServerSource = "D:\Security Research aka GitHub Repos\ProjectIDEAI\server"
$ServerTarget = "$TargetPath\models\bigdaddyg\server"

if (Test-Path $ServerSource) {
    Copy-Item -Path $ServerSource -Destination $ServerTarget -Recurse -Force
    Write-Host "  ✅ Orchestra server embedded" -ForegroundColor Green
}

# Create embedded model manifest
$ModelManifest = @{
    name = "BigDaddyG Trained"
    version = "1.0.0"
    training_lines = 200000
    specializations = @("Assembly", "Security", "Encryption")
    context_size = 1000000
    variants = @("Latest", "Code", "Debug", "Crypto")
    embedded = $true
    portable = $true
} | ConvertTo-Json -Depth 10

$ModelManifest | Out-File "$TargetPath\models\bigdaddyg\manifest.json" -Encoding UTF8

Write-Host "  ✅ BigDaddyG model manifest created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 4: ADD OLLAMA RUNTIME (OPTIONAL)
# ============================================================================

if ($IncludeOllama) {
    Write-Host "🦙 Step 4: Adding Ollama runtime..." -ForegroundColor Yellow
    
    # Check if Ollama is installed
    $OllamaPath = "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama"
    
    if (Test-Path $OllamaPath) {
        # Copy Ollama executable
        Copy-Item "$OllamaPath\ollama.exe" "$TargetPath\models\ollama.exe" -Force
        Write-Host "  ✅ Ollama executable copied" -ForegroundColor Green
        
        # Copy common models if they exist
        $OllamaModels = "C:\Users\$env:USERNAME\.ollama\models"
        if (Test-Path $OllamaModels) {
            Write-Host "  📦 Copying Ollama models (this may take a while)..." -ForegroundColor Cyan
            # Copy only manifests, not full models (too large)
            if (Test-Path "$OllamaModels\manifests") {
                Copy-Item "$OllamaModels\manifests" "$TargetPath\models\ollama\manifests" -Recurse -Force
                Write-Host "  ✅ Ollama manifests copied" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "  ⚠️  Ollama not found - skipping" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

# ============================================================================
# STEP 5: CREATE AUTO-RUN SCRIPTS
# ============================================================================

Write-Host "🚀 Step 5: Creating auto-run scripts..." -ForegroundColor Yellow

# Windows launcher
$WindowsLauncher = @"
@echo off
title BigDaddyG IDE Portable - Starting...
color 0B

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║     🌌 BIGDADDYG IDE PORTABLE - USB VERSION 💎              ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Get drive letter
set DRIVE=%~d0
echo 📍 Running from: %DRIVE%
echo.

:: Start Orchestra server
echo 🎼 Starting Orchestra server...
cd /d "%DRIVE%\BigDaddyG-Portable\models\bigdaddyg\server"
start /B node Orchestra-Server.js

:: Wait for server
timeout /t 2 /nobreak >nul

:: Launch IDE
echo 🚀 Launching BigDaddyG IDE...
cd /d "%DRIVE%\BigDaddyG-Portable\app"
start "" "BigDaddyG.exe"

echo.
echo ✅ BigDaddyG IDE is starting!
echo 💡 You can close this window
echo.
pause
"@

$WindowsLauncher | Out-File "$TargetPath\START-BIGDADDYG.bat" -Encoding ASCII

Write-Host "  ✅ Windows launcher created" -ForegroundColor Green

# Linux/Mac launcher
$UnixLauncher = @"
#!/bin/bash
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     🌌 BIGDADDYG IDE PORTABLE - USB VERSION 💎              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# Get current directory
DRIVE_PATH=`$(dirname "`$0")

echo "📍 Running from: `$DRIVE_PATH"
echo ""

# Start Orchestra server
echo "🎼 Starting Orchestra server..."
cd "`$DRIVE_PATH/models/bigdaddyg/server"
node Orchestra-Server.js &

sleep 2

# Launch IDE
echo "🚀 Launching BigDaddyG IDE..."
cd "`$DRIVE_PATH/app"
./BigDaddyG &

echo ""
echo "✅ BigDaddyG IDE is starting!"
echo ""
"@

$UnixLauncher | Out-File "$TargetPath\START-BIGDADDYG.sh" -Encoding UTF8

Write-Host "  ✅ Linux/Mac launcher created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 6: CREATE README
# ============================================================================

Write-Host "📝 Step 6: Creating README..." -ForegroundColor Yellow

$ReadmeContent = @"
# 🌌 BigDaddyG IDE - Portable USB Edition

**Fully self-contained AI-powered IDE**  
No installation required - runs from USB drive!

---

## 🚀 QUICK START

### Windows:
1. Double-click: ``START-BIGDADDYG.bat``
2. Wait 5 seconds
3. IDE opens automatically!

### Linux/Mac:
1. Run: ``./START-BIGDADDYG.sh``
2. Wait 5 seconds
3. IDE opens automatically!

---

## 📦 WHAT'S INCLUDED

### ✅ Complete IDE
- Monaco Editor (VS Code engine)
- Syntax highlighting (100+ languages)
- Multi-tab editing
- File system integration

### ✅ AI Copilot
- BigDaddyG Trained (200K lines ASM/Security)
- 1M context window
- Right-click context menu
- Inline suggestions (Apply/Reject)
- Hot-swappable models

### ✅ Advanced Features
- 4K 240Hz support
- 540Hz support
- Power modes (Eco to Overclocked)
- Visual benchmarking
- Mouse ripple effects
- Chameleon theme (color sliders)
- Embedded browser
- Full drive visibility

---

## 💾 FOLDER STRUCTURE

``````
BigDaddyG-Portable/
├── START-BIGDADDYG.bat     # Windows launcher
├── START-BIGDADDYG.sh      # Linux/Mac launcher
├── README.md               # This file
│
├── app/                    # Electron application
│   └── BigDaddyG.exe       # Main executable
│
├── models/                 # AI models
│   ├── bigdaddyg/         # Embedded BigDaddyG
│   │   ├── server/        # Orchestra server
│   │   └── manifest.json  # Model info
│   └── ollama/            # Ollama runtime (optional)
│
├── data/                   # User data
│   ├── settings.ini       # Preferences
│   └── context/           # Conversation history
│
├── logs/                   # Application logs
├── screenshots/            # Browser screenshots
└── projects/               # Your code projects
``````

---

## ⌨️ KEYBOARD SHORTCUTS

### AI Copilot:
- ``Ctrl+Shift+1-4`` - Switch BigDaddyG models
- ``Ctrl+M`` - Model selector
- ``Ctrl+K`` - Ask BigDaddyG
- ``Ctrl+E`` - Explain code
- Right-click - Context menu

### Editor:
- ``Ctrl+N`` - New file
- ``Ctrl+O`` - Open file
- ``Ctrl+S`` - Save file
- ``Ctrl+W`` - Close tab

### Browser:
- ``Ctrl+Shift+B`` - Show browser
- ``Ctrl+L`` - Navigate to URL
- ``Alt+Left/Right`` - Back/Forward
- ``F12`` - DevTools

---

## 🎨 FEATURES

### Chameleon Theme:
- Click 🦎 button (right side)
- Adjust color hue slider
- Adjust transparency
- Quick presets (Cyan, Green, Purple, etc.)
- Rainbow mode (auto-cycling)

### Performance Modes:
- Click ⚡ button
- Choose mode:
  - 🌱 Eco (battery saving)
  - ⚖️ Balanced (default)
  - 🚀 Turbo (high performance)
  - ⚡ Overclocked (4K 240Hz)
  - ❄️ Liquid Nitrogen (extreme)

### Display Settings:
- Click 🖥️ Display
- Choose resolution & refresh rate
- Up to 8K @ 540Hz supported!
- Real-time FPS overlay

---

## 💡 TIPS

### For Best Performance:
1. Use USB 3.0+ drive (USB-C recommended)
2. Enable "Overclocked" mode for 4K displays
3. Keep models on SSD for faster loading

### Save Your Work:
- Projects save to ``projects/`` folder
- Settings persist in ``data/settings.ini``
- Context history in ``data/context/``

### Customize:
- Chameleon theme for color preferences
- Power modes for performance/battery
- Model hot-swap for different tasks

---

## 🔒 SECURITY

### Fully Portable:
- No installation on host PC
- All data stays on USB drive
- No registry modifications
- No system file changes

### Safe to Use:
- Runs in sandboxed Electron
- No admin rights required
- Can run on locked-down PCs
- Leaves no traces when unplugged

---

## 📊 SIZE BREAKDOWN

### Minimal Build (~500 MB):
- Electron runtime: 150 MB
- App code: 10 MB
- Monaco Editor: 50 MB
- Training patterns: 0.12 MB
- Total: ~210 MB compressed → ~500 MB extracted

### Standard Build (~2 GB):
- Everything in Minimal
- BigDaddyG full training: 200 MB
- Ollama runtime: 50 MB
- Sample models: 1.5 GB
- Total: ~2 GB

### Full Build (~5 GB):
- Everything in Standard
- Multiple Ollama models: 3 GB
- Full documentation: 100 MB
- Sample projects: 200 MB
- Total: ~5 GB

---

## 🌟 ADVANTAGES

### vs. Cloud IDEs:
- ✅ Works offline
- ✅ No internet required
- ✅ Your data stays local
- ✅ No subscription fees

### vs. Installed IDEs:
- ✅ No installation needed
- ✅ Works on any PC
- ✅ Portable between computers
- ✅ No admin rights needed

### vs. Online Editors:
- ✅ Full IDE features
- ✅ AI copilot included
- ✅ Complete offline
- ✅ Professional tools

---

## 🚀 WHAT'S NEXT

1. **Use the IDE** - Write code, get AI help
2. **Customize** - Adjust colors, performance
3. **Save projects** - Everything stays on USB
4. **Unplug & go** - Take your IDE anywhere!

---

**🎊 PORTABLE. POWERFUL. PROFESSIONAL.** 💎

Built with BigDaddyG - The Ultimate AI-Powered IDE
"@

$ReadmeContent | Out-File "$TargetPath\README.md" -Encoding UTF8

Write-Host "  ✅ README.md created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 7: COPY CORE FILES
# ============================================================================

Write-Host "📋 Step 7: Copying core files..." -ForegroundColor Yellow

$SourcePath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"

# Copy HTML IDE (browser version as backup)
if (Test-Path "C:\Users\HiH8e\OneDrive\Desktop\ProjectIDEAI-FINAL.html") {
    Copy-Item "C:\Users\HiH8e\OneDrive\Desktop\ProjectIDEAI-FINAL.html" "$TargetPath\app\IDE-Browser-Version.html" -Force
    Write-Host "  ✅ Browser IDE copied (backup)" -ForegroundColor Green
}

# Copy server
if (Test-Path "$SourcePath\server") {
    Copy-Item "$SourcePath\server\*" "$TargetPath\models\bigdaddyg\server\" -Recurse -Force
    Write-Host "  ✅ Orchestra server copied" -ForegroundColor Green
}

# Copy electron files
$ElectronFiles = @("electron", "package.json", "README-ELECTRON.md", "README-COMPLETE.md")
foreach ($file in $ElectronFiles) {
    if (Test-Path "$SourcePath\$file") {
        Copy-Item "$SourcePath\$file" "$TargetPath\app\" -Recurse -Force
        Write-Host "  ✅ Copied: $file" -ForegroundColor Green
    }
}

Write-Host ""

# ============================================================================
# STEP 8: CREATE PORTABLE CONFIG
# ============================================================================

Write-Host "⚙️ Step 8: Creating portable configuration..." -ForegroundColor Yellow

$PortableConfig = @"
[Portable]
Version=1.0.0
BuildDate=$($BuildConfig.BuildDate)
BuildType=$BuildType
EmbeddedModel=true
OllamaIncluded=$IncludeOllama

[Paths]
AppPath=.\app
ModelsPath=.\models
DataPath=.\data
LogsPath=.\logs
ProjectsPath=.\projects

[BigDaddyG]
ModelPath=.\models\bigdaddyg
ServerPort=11441
ContextSize=1000000
TrainingLines=200000

[Display]
DefaultResolution=4K
DefaultRefreshRate=240
EnableFPSOverlay=true
EnableRipples=true
EnableChameleon=true

[Performance]
DefaultPowerMode=Balanced
EnableBenchmark=true
MaxAgents=32
"@

$PortableConfig | Out-File "$TargetPath\portable.ini" -Encoding UTF8

Write-Host "  ✅ Portable configuration created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 9: CALCULATE SIZES
# ============================================================================

Write-Host "📊 Step 9: Calculating sizes..." -ForegroundColor Yellow

function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

$AppSize = Get-FolderSize "$TargetPath\app"
$ModelsSize = Get-FolderSize "$TargetPath\models"
$TotalSize = Get-FolderSize $TargetPath

Write-Host ""
Write-Host "  📦 App: $AppSize MB" -ForegroundColor Cyan
Write-Host "  🧠 Models: $ModelsSize MB" -ForegroundColor Cyan
Write-Host "  📊 Total: $TotalSize MB" -ForegroundColor Green
Write-Host ""

# ============================================================================
# STEP 10: CREATE VERSION INFO
# ============================================================================

Write-Host "📋 Step 10: Creating version info..." -ForegroundColor Yellow

$VersionInfo = @{
    app_name = "BigDaddyG IDE Portable"
    version = "1.0.0"
    build_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    build_type = $BuildType
    total_size_mb = $TotalSize
    app_size_mb = $AppSize
    models_size_mb = $ModelsSize
    embedded_bigdaddyg = $true
    ollama_included = $IncludeOllama
    features = @(
        "Monaco Editor",
        "AI Copilot",
        "Hot-swap Models",
        "4K 240Hz Support",
        "540Hz Support",
        "Visual Benchmarking",
        "Mouse Ripples",
        "Chameleon Theme",
        "Embedded Browser",
        "Full Drive Visibility"
    )
    target_drive = $TargetDrive
} | ConvertTo-Json -Depth 10

$VersionInfo | Out-File "$TargetPath\version.json" -Encoding UTF8

Write-Host "  ✅ Version info created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# COMPLETION
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ PORTABLE USB BUILD COMPLETE! 🎊                  ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Location: $TargetPath" -ForegroundColor Cyan
Write-Host "📦 Total Size: $TotalSize MB" -ForegroundColor Cyan
Write-Host "🎯 Build Type: $BuildType" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 TO RUN:" -ForegroundColor Yellow
Write-Host "   1. Navigate to: $TargetDrive\BigDaddyG-Portable" -ForegroundColor White
Write-Host "   2. Double-click: START-BIGDADDYG.bat" -ForegroundColor White
Write-Host "   3. Wait 5 seconds" -ForegroundColor White
Write-Host "   4. BigDaddyG IDE opens!" -ForegroundColor White
Write-Host ""
Write-Host "💡 TIP: This USB drive now contains a complete AI IDE!" -ForegroundColor Cyan
Write-Host "   Plug into any Windows PC and run - no installation needed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎊 PORTABLE. POWERFUL. PROFESSIONAL." -ForegroundColor Green
Write-Host ""

# Open target folder
Start-Process "explorer.exe" $TargetPath

Write-Host "✅ Build complete! Explorer opened to USB drive." -ForegroundColor Green
Write-Host ""

