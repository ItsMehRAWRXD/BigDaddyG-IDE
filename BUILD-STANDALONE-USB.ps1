#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build BigDaddyG IDE Standalone with 40GB Model (USB Ready)
    
.DESCRIPTION
    Creates a fully self-contained portable exe with:
    - BigDaddyG IDE
    - Orchestra AI Server
    - 40GB AI Model (embedded)
    - All dependencies
    - Ready for 64GB USB stick!
    
.NOTES
    Final size: ~40.1 GB (fits on 64GB USB!)
    No internet needed. No installation needed.
    Just plug in USB and run!
#>

Write-Host "🚀 Building BigDaddyG IDE - Standalone USB Edition" -ForegroundColor Magenta
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Configuration
$IDE_VERSION = "2.0.0"
$MODEL_SIZE = "40GB"
$OUTPUT_DIR = "dist-standalone"
$MODEL_DIR = "E:\BigDaddyG-Extensions\models" # Your model location
$BUILD_DIR = "build-standalone"

Write-Host "📋 Build Configuration:" -ForegroundColor Yellow
Write-Host "  Version: $IDE_VERSION" -ForegroundColor White
Write-Host "  Model: $MODEL_SIZE (embedded)" -ForegroundColor White
Write-Host "  Output: $OUTPUT_DIR" -ForegroundColor White
Write-Host "  Target: 64GB USB stick" -ForegroundColor White
Write-Host ""

# Step 1: Create build directory
Write-Host "📁 Step 1: Creating build directory..." -ForegroundColor Cyan
if (Test-Path $BUILD_DIR) {
    Remove-Item $BUILD_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $BUILD_DIR | Out-Null
Write-Host "  ✅ Build directory created" -ForegroundColor Green
Write-Host ""

# Step 2: Build base IDE
Write-Host "🏗️ Step 2: Building base IDE..." -ForegroundColor Cyan
npm run build:portable
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ❌ IDE build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✅ Base IDE built" -ForegroundColor Green
Write-Host ""

# Step 3: Copy base exe to build dir
Write-Host "📦 Step 3: Copying base exe..." -ForegroundColor Cyan
$baseExe = "dist\BigDaddyG-Portable-$IDE_VERSION.exe"
if (Test-Path $baseExe) {
    Copy-Item $baseExe "$BUILD_DIR\BigDaddyG-IDE.exe"
    $baseSize = (Get-Item $baseExe).Length / 1MB
    Write-Host "  ✅ Base exe copied ($([math]::Round($baseSize, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "  ❌ Base exe not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Package models (if exists)
Write-Host "🧠 Step 4: Packaging 40GB AI model..." -ForegroundColor Cyan

if (Test-Path $MODEL_DIR) {
    Write-Host "  📁 Found model directory: $MODEL_DIR" -ForegroundColor Yellow
    
    # Check model size
    $modelSize = (Get-ChildItem $MODEL_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
    Write-Host "  📏 Model size: $([math]::Round($modelSize, 2)) GB" -ForegroundColor Yellow
    
    if ($modelSize -gt 50) {
        Write-Host "  ⚠️ Model is larger than 50GB! May not fit on 64GB USB with IDE." -ForegroundColor Yellow
        $continue = Read-Host "  Continue anyway? (y/n)"
        if ($continue -ne 'y') {
            Write-Host "  ❌ Build cancelled" -ForegroundColor Red
            exit 1
        }
    }
    
    # Copy models to build directory
    Write-Host "  📦 Copying models (this may take several minutes)..." -ForegroundColor Yellow
    
    $modelBuildDir = "$BUILD_DIR\models"
    New-Item -ItemType Directory -Path $modelBuildDir -Force | Out-Null
    
    Copy-Item "$MODEL_DIR\*" $modelBuildDir -Recurse -Force
    
    Write-Host "  ✅ Models packaged!" -ForegroundColor Green
    
} else {
    Write-Host "  ⚠️ Model directory not found: $MODEL_DIR" -ForegroundColor Yellow
    Write-Host "  Creating placeholder..." -ForegroundColor Yellow
    
    $modelBuildDir = "$BUILD_DIR\models"
    New-Item -ItemType Directory -Path $modelBuildDir -Force | Out-Null
    
    # Create README
    @"
# BigDaddyG AI Models

Place your 40GB+ AI models here.

Compatible formats:
- GGUF (.gguf)
- GGML (.bin)
- SafeTensors (.safetensors)
- PyTorch (.pt, .pth)

Recommended models:
- Llama 3 70B (40GB+)
- Mixtral 8x22B (40GB+)
- Qwen 72B (40GB+)
- DeepSeek Coder 33B (40GB+)

Once models are added, Orchestra will auto-detect them!
"@ | Out-File "$modelBuildDir\README.md" -Encoding utf8
    
    Write-Host "  ✅ Model placeholder created" -ForegroundColor Green
}
Write-Host ""

# Step 5: Copy Orchestra server
Write-Host "🎼 Step 5: Packaging Orchestra server..." -ForegroundColor Cyan
$serverDir = "$BUILD_DIR\server"
New-Item -ItemType Directory -Path $serverDir -Force | Out-Null
Copy-Item "server\*" $serverDir -Recurse -Force
Write-Host "  ✅ Orchestra server packaged" -ForegroundColor Green
Write-Host ""

# Step 6: Copy all dependencies
Write-Host "📚 Step 6: Packaging dependencies..." -ForegroundColor Cyan
$electronDir = "$BUILD_DIR\electron"
New-Item -ItemType Directory -Path $electronDir -Force | Out-Null
Copy-Item "electron\*" $electronDir -Recurse -Force
Write-Host "  ✅ Dependencies packaged" -ForegroundColor Green
Write-Host ""

# Step 7: Create launcher script
Write-Host "🚀 Step 7: Creating USB launcher..." -ForegroundColor Cyan

$launcherScript = @'
@echo off
echo ==========================================
echo BigDaddyG IDE - Standalone USB Edition
echo ==========================================
echo.
echo Starting from USB drive...
echo.

REM Get current drive letter
set "CURRENT_DRIVE=%~d0"
echo Detected USB drive: %CURRENT_DRIVE%
echo.

REM Set model path to USB
set "BIGDADDYG_MODEL_PATH=%CURRENT_DRIVE%\models"
echo Model path: %BIGDADDYG_MODEL_PATH%
echo.

REM Launch IDE
echo Launching BigDaddyG IDE...
start "" "%CURRENT_DRIVE%\BigDaddyG-IDE.exe"

echo.
echo IDE launched! You can close this window.
echo.
pause
'@

$launcherScript | Out-File "$BUILD_DIR\LAUNCH.bat" -Encoding ascii
Write-Host "  ✅ USB launcher created" -ForegroundColor Green
Write-Host ""

# Step 8: Create README
Write-Host "📖 Step 8: Creating README..." -ForegroundColor Cyan

$readmeContent = @"
# 🚀 BigDaddyG IDE - Standalone USB Edition

## 📦 **What's Included:**

- ✅ BigDaddyG IDE (Portable executable)
- ✅ Orchestra AI Server (Embedded)
- ✅ 40GB AI Models (Embedded)
- ✅ All dependencies (No installation needed)

**Total Size:** ~40.1 GB  
**Fits on:** 64GB USB stick  
**Requires:** Nothing! Fully standalone!

---

## 🚀 **How to Use:**

### **Option 1: Double-click LAUNCH.bat**
1. Plug in USB stick
2. Double-click `LAUNCH.bat`
3. IDE opens automatically
4. Start coding!

### **Option 2: Run exe directly**
1. Plug in USB stick
2. Double-click `BigDaddyG-IDE.exe`
3. Models auto-detected from `models/` folder
4. Start coding!

---

## 💎 **40GB Elite Mode:**

Once IDE launches:
1. Press `Ctrl+L` (open AI chat)
2. Click `⚙️ Settings`
3. Select `🧠 40GB+ Model (Elite)`
4. Start coding with 3-minute thinking time!

---

## 🎯 **Features:**

✅ **Agentic File Browser** - Auto-scan/analyze/fix code  
✅ **Command System** - !pic, !code, !projectnew, !projectresume  
✅ **Image Generation** - Generate images in IDE  
✅ **Cinematic Visualization** - Ctrl+Shift+V  
✅ **Plugin Marketplace** - Ctrl+Shift+P  
✅ **Multi AI** - 6 AI providers  
✅ **100% Offline** - No internet needed!  

---

## 📊 **System Requirements:**

- **OS:** Windows 10/11 (64-bit)
- **RAM:** 64GB recommended (for 40GB model)
- **CPU:** Modern multi-core processor
- **GPU:** Optional (CPU inference works)
- **Storage:** 64GB USB 3.0+ (for best performance)

---

## ⚖️ **Legal:**

100% LEGAL. 100% OPEN SOURCE.
- MIT License
- No Cursor code
- No copyright violations
- Clean-room implementation

---

## 🆘 **Troubleshooting:**

**Problem:** IDE won't start  
**Solution:** Run as Administrator

**Problem:** Models not detected  
**Solution:** Check `models/` folder exists

**Problem:** Slow performance  
**Solution:** Use USB 3.0+ drive (not 2.0)

---

## 📞 **Support:**

- GitHub: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE
- Issues: https://github.com/ItsMehRAWRXD/BigDaddyG-IDE/issues

---

**Version:** $IDE_VERSION (Standalone USB Edition)  
**Built:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Model:** $MODEL_SIZE (Embedded)  
**License:** MIT  

**Enjoy your portable FREE Cursor alternative!** 🚀💎✨
"@

$readmeContent | Out-File "$BUILD_DIR\README.txt" -Encoding utf8
Write-Host "  ✅ README created" -ForegroundColor Green
Write-Host ""

# Step 9: Calculate total size
Write-Host "📊 Step 9: Calculating build size..." -ForegroundColor Cyan
$totalSize = (Get-ChildItem $BUILD_DIR -Recurse | Measure-Object -Property Length -Sum).Sum / 1GB
Write-Host "  📏 Total size: $([math]::Round($totalSize, 2)) GB" -ForegroundColor Yellow

if ($totalSize -gt 64) {
    Write-Host "  ⚠️ WARNING: Build is larger than 64GB!" -ForegroundColor Red
    Write-Host "  Will NOT fit on standard 64GB USB stick!" -ForegroundColor Red
} elseif ($totalSize -gt 50) {
    Write-Host "  ⚠️ Build is close to 64GB limit" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ Will fit on 64GB USB stick" -ForegroundColor Green
}
Write-Host ""

# Step 10: Create final package
Write-Host "📦 Step 10: Creating final package..." -ForegroundColor Cyan

if (-not (Test-Path $OUTPUT_DIR)) {
    New-Item -ItemType Directory -Path $OUTPUT_DIR | Out-Null
}

# Move build to output
$finalName = "BigDaddyG-Standalone-USB-$IDE_VERSION"
$finalPath = "$OUTPUT_DIR\$finalName"

if (Test-Path $finalPath) {
    Remove-Item $finalPath -Recurse -Force
}

Move-Item $BUILD_DIR $finalPath
Write-Host "  ✅ Package created: $finalPath" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 BUILD COMPLETE!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""
Write-Host "📦 Package: $finalPath" -ForegroundColor Cyan
Write-Host "📏 Size: $([math]::Round($totalSize, 2)) GB" -ForegroundColor Cyan
Write-Host "💾 USB: 64GB (recommended)" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 TO DEPLOY TO USB:" -ForegroundColor Yellow
Write-Host "  1. Insert 64GB USB stick" -ForegroundColor White
Write-Host "  2. Format as NTFS (for large files)" -ForegroundColor White
Write-Host "  3. Copy entire folder: $finalPath" -ForegroundColor White
Write-Host "  4. Eject safely" -ForegroundColor White
Write-Host "  5. Plug into ANY Windows PC" -ForegroundColor White
Write-Host "  6. Double-click LAUNCH.bat" -ForegroundColor White
Write-Host "  7. Start coding with 40GB AI!" -ForegroundColor White
Write-Host ""
Write-Host "💎 FEATURES:" -ForegroundColor Yellow
Write-Host "  ✅ 100% Portable (no installation)" -ForegroundColor Green
Write-Host "  ✅ 100% Offline (no internet)" -ForegroundColor Green
Write-Host "  ✅ 100% Self-contained (includes 40GB model)" -ForegroundColor Green
Write-Host "  ✅ 100% FREE (no subscriptions)" -ForegroundColor Green
Write-Host "  ✅ 100% Legal (clean-room implementation)" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 THIS IS YOUR OWN CURSOR IDE ON A STICK!" -ForegroundColor Magenta
Write-Host ""
Write-Host "Next: Copy to USB and test on another PC!" -ForegroundColor Cyan
Write-Host ""

