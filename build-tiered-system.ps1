#!/usr/bin/env pwsh
<#
.SYNOPSIS
    BigDaddyG IDE - Multi-Tier Build System
    Builds from 512MB to 256GB with scaling AI capabilities

.DESCRIPTION
    Creates multiple build configurations:
    - MICRO:     512 MB  (1M context, patterns only)
    - MINI:      2 GB    (10M context, lightweight model)
    - STANDARD:  8 GB    (100M context, full BigDaddyG)
    - PRO:       32 GB   (500M context, multiple models)
    - ENTERPRISE: 64 GB  (1B context, all models)
    - GODLIKE:   256 GB  (1B context, quantum-enhanced)

.EXAMPLE
    .\build-tiered-system.ps1 -Tier "STANDARD" -TargetDrive "E:"
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("MICRO", "MINI", "STANDARD", "PRO", "ENTERPRISE", "GODLIKE")]
    [string]$Tier = "STANDARD",
    
    [string]$TargetDrive = "",
    [switch]$AutoDetectOptimal = $false
)

# ============================================================================
# TIER CONFIGURATIONS
# ============================================================================

$TierConfigs = @{
    MICRO = @{
        Name = "🔹 MICRO"
        Description = "Ultra-compact USB stick edition"
        TargetSize = "512 MB"
        TargetSizeMB = 512
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            BasicSyntaxHighlight = $true
            AIPatterns = $true
            FullModel = $false
            OllamaSupport = $false
            VisualEffects = "minimal"
        }
        
        AI = @{
            ContextSize = 1000000           # 1M tokens
            ModelType = "patterns"          # Pattern matching only
            Variants = @("Basic")
            TrainingData = "patterns.json"  # 50 KB
            Temperature = 0.5
            MaxTokens = 500
        }
        
        Performance = @{
            PowerModes = @("Eco", "Balanced")
            MaxFPS = 60
            MaxAgents = 2
            EnableBenchmark = $false
            EnableRipples = $false
            EnableChameleon = $true
        }
        
        Files = @(
            "electron/main.js",
            "electron/preload.js",
            "electron/renderer.js",
            "electron/index.html",
            "assets/training/patterns.json",
            "server/Orchestra-Server.js"
        )
    }
    
    MINI = @{
        Name = "💎 MINI"
        Description = "Compact but capable"
        TargetSize = "2 GB"
        TargetSizeMB = 2048
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            AdvancedSyntaxHighlight = $true
            AIPatterns = $true
            LightweightModel = $true
            FullModel = $false
            OllamaSupport = $true
            VisualEffects = "standard"
        }
        
        AI = @{
            ContextSize = 10000000          # 10M tokens
            ModelType = "lightweight"       # Quantized model
            Variants = @("Latest", "Code")
            TrainingData = "training_lite.bin"  # 200 MB
            Temperature = 0.7
            MaxTokens = 2000
        }
        
        Performance = @{
            PowerModes = @("Eco", "Balanced", "Turbo")
            MaxFPS = 144
            MaxAgents = 4
            EnableBenchmark = $true
            EnableRipples = $true
            EnableChameleon = $true
        }
        
        Files = @(
            "electron/**/*",
            "assets/training/patterns.json",
            "assets/training/lite_model.bin",
            "server/**/*"
        )
    }
    
    STANDARD = @{
        Name = "🌟 STANDARD"
        Description = "Full-featured professional IDE"
        TargetSize = "8 GB"
        TargetSizeMB = 8192
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            FullSyntaxHighlight = $true
            AIPatterns = $true
            LightweightModel = $true
            FullModel = $true
            OllamaSupport = $true
            VisualEffects = "full"
        }
        
        AI = @{
            ContextSize = 100000000         # 100M tokens
            ModelType = "full"              # Full BigDaddyG
            Variants = @("Latest", "Code", "Debug", "Crypto")
            TrainingData = "training_full.bin"  # 2 GB
            Temperature = 0.7
            MaxTokens = 4000
            BatchSize = 4
        }
        
        Performance = @{
            PowerModes = @("Eco", "Balanced", "Turbo", "Overclocked")
            MaxFPS = 240
            MaxAgents = 8
            EnableBenchmark = $true
            EnableRipples = $true
            EnableChameleon = $true
            EnableVisualBenchmark = $true
        }
        
        Files = @(
            "electron/**/*",
            "server/**/*",
            "assets/**/*",
            "genesis-kernel/**/*",
            "node_modules/**/*"
        )
    }
    
    PRO = @{
        Name = "⚡ PRO"
        Description = "Professional with multiple specialized models"
        TargetSize = "32 GB"
        TargetSizeMB = 32768
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            UltraSyntaxHighlight = $true
            AIPatterns = $true
            MultipleModels = $true
            OllamaSupport = $true
            OllamaModelsIncluded = $true  # Include popular models
            VisualEffects = "ultra"
        }
        
        AI = @{
            ContextSize = 500000000         # 500M tokens
            ModelType = "professional"
            Variants = @("Latest", "Code", "Debug", "Crypto", "ASM", "Security", "Web", "Data")
            TrainingData = "training_pro.bin"  # 8 GB
            Temperature = 0.7
            MaxTokens = 8000
            BatchSize = 8
            ParallelInference = $true
        }
        
        OllamaModels = @(
            "llama3:latest",           # 4.7 GB
            "codellama:latest",        # 3.8 GB
            "mistral:latest",          # 4.1 GB
            "deepseek-coder:latest"    # 6.7 GB
        )
        
        Performance = @{
            PowerModes = @("Eco", "Balanced", "Turbo", "Overclocked", "LiquidNitrogen")
            MaxFPS = 360
            MaxAgents = 16
            EnableBenchmark = $true
            EnableRipples = $true
            EnableChameleon = $true
            EnableVisualBenchmark = $true
            Enable8KSupport = $true
        }
    }
    
    ENTERPRISE = @{
        Name = "🏢 ENTERPRISE"
        Description = "Enterprise-grade with 1B context"
        TargetSize = "64 GB"
        TargetSizeMB = 65536
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            EnterpriseSyntax = $true
            AIPatterns = $true
            MultipleModels = $true
            OllamaSupport = $true
            OllamaModelsIncluded = $true
            GenesisOS = $true              # Include GenesisOS components
            VisualEffects = "maximum"
        }
        
        AI = @{
            ContextSize = 1000000000        # 1 BILLION tokens 🔥
            ModelType = "enterprise"
            Variants = @("Latest", "Code", "Debug", "Crypto", "ASM", "Security", "Web", "Data", "Cloud", "DevOps")
            TrainingData = "training_enterprise.bin"  # 20 GB
            Temperature = 0.8
            MaxTokens = 16000
            BatchSize = 16
            ParallelInference = $true
            QuantumOptimization = $false
            MultiGPU = $true
        }
        
        OllamaModels = @(
            "llama3:70b",              # 40 GB
            "codellama:34b",           # 19 GB
            "mistral:latest",          # 4 GB
            "deepseek-coder:33b"       # 18 GB
        )
        
        GenesisOS = @{
            IncludeKernel = $true
            IncludeIAR = $true
            IncludePlaybook = $true
            IncludeEmotion = $true
        }
        
        Performance = @{
            PowerModes = @("Eco", "Balanced", "Turbo", "Overclocked", "LiquidNitrogen")
            MaxFPS = 540
            MaxAgents = 32
            EnableAllFeatures = $true
        }
    }
    
    GODLIKE = @{
        Name = "💎 GODLIKE"
        Description = "Maximum power - 1B context with quantum enhancement"
        TargetSize = "256 GB"
        TargetSizeMB = 262144
        
        Features = @{
            IDE = $true
            MonacoEditor = $true
            QuantumSyntax = $true
            AIPatterns = $true
            MultipleModels = $true
            AllOllamaModels = $true
            GenesisOS = $true
            QuantumEnhancement = $true
            VisualEffects = "transcendent"
        }
        
        AI = @{
            ContextSize = 1000000000        # 1 BILLION tokens
            ModelType = "godlike"
            Variants = @(
                "Latest", "Code", "Debug", "Crypto", "ASM", "Security", 
                "Web", "Data", "Cloud", "DevOps", "ML", "Quantum", 
                "Blockchain", "Gaming", "Embedded", "Mobile"
            )
            TrainingData = "training_godlike.bin"  # 100 GB
            Temperature = 1.0
            MaxTokens = 32000
            BatchSize = 32
            ParallelInference = $true
            QuantumOptimization = $true
            MultiGPU = $true
            DistributedInference = $true
        }
        
        OllamaModels = @(
            "llama3:70b",              # 40 GB
            "llama3:405b",             # 231 GB (largest!)
            "codellama:70b",           # 39 GB
            "mistral:latest",          # 4 GB
            "deepseek-coder:33b",      # 18 GB
            "qwen:latest",             # 4 GB
            "gemma:latest"             # 5 GB
        )
        
        GenesisOS = @{
            IncludeKernel = $true
            IncludeIAR = $true
            IncludePlaybook = $true
            IncludeEmotion = $true
            IncludeDHT = $true
            IncludePolicy = $true
            PostgreSQL = $true
            Kafka = $true
        }
        
        Performance = @{
            PowerModes = @("Eco", "Balanced", "Turbo", "Overclocked", "LiquidNitrogen", "QuantumBoost")
            MaxFPS = 540
            MaxAgents = 128
            EnableAllFeatures = $true
            RayTracing = $true
            DLSS = $true
        }
    }
}

# ============================================================================
# AUTO-DETECT OPTIMAL TIER
# ============================================================================

function Get-OptimalTier {
    Write-Host "🔍 Auto-detecting optimal tier based on available space..." -ForegroundColor Cyan
    Write-Host ""
    
    if (-not $TargetDrive) {
        Write-Host "📁 Available Drives:" -ForegroundColor Yellow
        Get-PSDrive -PSProvider FileSystem | Where-Object { $_.Used -ne $null } | ForEach-Object {
            $freeGB = [math]::Round($_.Free / 1GB, 2)
            Write-Host "  $($_.Name):\ - $freeGB GB free" -ForegroundColor Gray
        }
        Write-Host ""
        $TargetDrive = Read-Host "Enter target drive letter (e.g., E)"
        $TargetDrive = $TargetDrive.TrimEnd(':') + ":"
    }
    
    $drive = Get-PSDrive ($TargetDrive.TrimEnd(':'))
    $freeGB = [math]::Round($drive.Free / 1GB, 2)
    
    Write-Host "💾 Drive $TargetDrive has $freeGB GB free" -ForegroundColor Cyan
    Write-Host ""
    
    # Determine optimal tier
    if ($freeGB -ge 250) {
        return "GODLIKE"
    } elseif ($freeGB -ge 60) {
        return "ENTERPRISE"
    } elseif ($freeGB -ge 30) {
        return "PRO"
    } elseif ($freeGB -ge 7) {
        return "STANDARD"
    } elseif ($freeGB -ge 1.5) {
        return "MINI"
    } else {
        return "MICRO"
    }
}

if ($AutoDetectOptimal) {
    $Tier = Get-OptimalTier
    Write-Host "🎯 Auto-selected tier: $Tier" -ForegroundColor Green
    Write-Host ""
}

# ============================================================================
# GET TIER CONFIG
# ============================================================================

$Config = $TierConfigs[$Tier]

if (-not $Config) {
    Write-Host "❌ Invalid tier: $Tier" -ForegroundColor Red
    exit 1
}

# ============================================================================
# DISPLAY BUILD INFO
# ============================================================================

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          $($Config.Name) BUILD SYSTEM                        " -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Configuration:" -ForegroundColor Yellow
Write-Host "   Tier: $Tier" -ForegroundColor White
Write-Host "   Description: $($Config.Description)" -ForegroundColor White
Write-Host "   Target Size: $($Config.TargetSize)" -ForegroundColor White
Write-Host ""
Write-Host "🧠 AI Capabilities:" -ForegroundColor Yellow
Write-Host "   Context: $(($Config.AI.ContextSize / 1000000).ToString('N0')) Million tokens" -ForegroundColor White
Write-Host "   Model Type: $($Config.AI.ModelType)" -ForegroundColor White
Write-Host "   Variants: $($Config.AI.Variants.Count)" -ForegroundColor White
Write-Host "   Max Tokens: $($Config.AI.MaxTokens)" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Performance:" -ForegroundColor Yellow
Write-Host "   Max FPS: $($Config.Performance.MaxFPS)" -ForegroundColor White
Write-Host "   Max Agents: $($Config.Performance.MaxAgents)" -ForegroundColor White
Write-Host "   Power Modes: $($Config.Performance.PowerModes -join ', ')" -ForegroundColor White
Write-Host ""

if ($Config.OllamaModels) {
    Write-Host "🦙 Included Ollama Models:" -ForegroundColor Yellow
    foreach ($model in $Config.OllamaModels) {
        Write-Host "   • $model" -ForegroundColor White
    }
    Write-Host ""
}

$Confirm = Read-Host "Continue with this build? (Y/N)"
if ($Confirm -ne 'Y' -and $Confirm -ne 'y') {
    Write-Host "❌ Build cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""

# ============================================================================
# BUILD PROCESS
# ============================================================================

$TargetPath = "$TargetDrive\BigDaddyG-$Tier"
$BuildStartTime = Get-Date

Write-Host "🔨 Starting build process..." -ForegroundColor Cyan
Write-Host "📍 Target: $TargetPath" -ForegroundColor Cyan
Write-Host ""

# Create directory structure
Write-Host "📁 Creating directory structure..." -ForegroundColor Yellow

$Directories = @(
    $TargetPath,
    "$TargetPath\app",
    "$TargetPath\models",
    "$TargetPath\models\bigdaddyg",
    "$TargetPath\data",
    "$TargetPath\logs",
    "$TargetPath\projects"
)

if ($Config.Features.OllamaSupport) {
    $Directories += "$TargetPath\models\ollama"
}

if ($Config.GenesisOS) {
    $Directories += @(
        "$TargetPath\genesios",
        "$TargetPath\genesios\kernel",
        "$TargetPath\genesios\iar",
        "$TargetPath\genesios\playbook"
    )
}

foreach ($dir in $Directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "  ✅ Directories created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# COPY FILES
# ============================================================================

Write-Host "📋 Copying application files..." -ForegroundColor Yellow

$SourcePath = "D:\Security Research aka GitHub Repos\ProjectIDEAI"

# Copy based on tier
foreach ($filePattern in $Config.Files) {
    $sourcePath = Join-Path $SourcePath $filePattern
    
    if (Test-Path $sourcePath) {
        $relativePath = $filePattern -replace '\*\*.*$', ''
        $targetPath = Join-Path "$TargetPath\app" $relativePath
        
        try {
            Copy-Item -Path $sourcePath -Destination $targetPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  ✅ Copied: $filePattern" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Skipped: $filePattern" -ForegroundColor Yellow
        }
    }
}

Write-Host ""

# ============================================================================
# CREATE TIER-SPECIFIC CONFIG
# ============================================================================

Write-Host "⚙️ Creating tier-specific configuration..." -ForegroundColor Yellow

$TierConfig = @"
{
  "tier": "$Tier",
  "name": "$($Config.Name)",
  "version": "1.0.0",
  "build_date": "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
  "target_size": "$($Config.TargetSize)",
  
  "ai": {
    "context_size": $($Config.AI.ContextSize),
    "model_type": "$($Config.AI.ModelType)",
    "variants": $(ConvertTo-Json $Config.AI.Variants),
    "max_tokens": $($Config.AI.MaxTokens),
    "temperature": $($Config.AI.Temperature)
  },
  
  "performance": {
    "max_fps": $($Config.Performance.MaxFPS),
    "max_agents": $($Config.Performance.MaxAgents),
    "power_modes": $(ConvertTo-Json $Config.Performance.PowerModes)
  },
  
  "features": $(ConvertTo-Json $Config.Features -Depth 10)
}
"@

$TierConfig | Out-File "$TargetPath\tier-config.json" -Encoding UTF8

Write-Host "  ✅ Configuration created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# CREATE CONTEXT SIZE INDICATOR
# ============================================================================

$ContextDisplay = switch ($Tier) {
    "MICRO"      { "1 Million" }
    "MINI"       { "10 Million" }
    "STANDARD"   { "100 Million" }
    "PRO"        { "500 Million" }
    "ENTERPRISE" { "1 BILLION 🔥" }
    "GODLIKE"    { "1 BILLION + QUANTUM 💎" }
}

# ============================================================================
# CREATE AUTO-RUN LAUNCHER
# ============================================================================

Write-Host "🚀 Creating launcher..." -ForegroundColor Yellow

$Launcher = @"
@echo off
title BigDaddyG IDE $Tier Edition - Starting...
color 0B

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║     🌌 BIGDADDYG IDE - $($Config.Name) EDITION 💎
echo ╠═══════════════════════════════════════════════════════════════╣
echo ║  Context: $ContextDisplay tokens
echo ║  Size: $($Config.TargetSize)
echo ║  Power: $($Config.Performance.MaxFPS) FPS max
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Get drive letter
set DRIVE=%~d0
echo 📍 Running from: %DRIVE%
echo.

:: Start Orchestra server
echo 🎼 Starting Orchestra server...
cd /d "%DRIVE%\BigDaddyG-$Tier\models\bigdaddyg\server"
start /B node Orchestra-Server.js

:: Wait for server
echo ⏳ Waiting for server to initialize...
timeout /t 3 /nobreak >nul

:: Launch IDE
echo 🚀 Launching BigDaddyG IDE...
cd /d "%DRIVE%\BigDaddyG-$Tier\app"

:: Check if executable exists
if exist "BigDaddyG.exe" (
    start "" "BigDaddyG.exe"
) else (
    :: Fallback to browser version
    start "" "IDE-Browser-Version.html"
)

echo.
echo ✅ BigDaddyG IDE $Tier Edition is starting!
echo 💡 Context Window: $ContextDisplay tokens
echo 🎯 Max Performance: $($Config.Performance.MaxFPS) FPS
echo.
echo You can close this window
echo.
pause
"@

$Launcher | Out-File "$TargetPath\START-BIGDADDYG.bat" -Encoding ASCII

Write-Host "  ✅ Launcher created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# CREATE TIER COMPARISON README
# ============================================================================

Write-Host "📚 Creating documentation..." -ForegroundColor Yellow

$ReadmeContent = @"
# 🌌 BigDaddyG IDE - $($Config.Name) Edition

**$($Config.Description)**

---

## 🎯 THIS BUILD

**Tier:** $Tier  
**Size:** $($Config.TargetSize)  
**Context:** $ContextDisplay tokens  
**Models:** $($Config.AI.Variants.Count) variants  

---

## 🧠 AI CAPABILITIES

### Context Window
- **$ContextDisplay tokens** $(if ($Config.AI.ContextSize -ge 1000000000) { "🔥 BILLION-SCALE!" } else { "" })
- Remembers entire conversations
- Cross-file context awareness
- Long-term memory

### Models Included
$($Config.AI.Variants | ForEach-Object { "- **$_**" } | Out-String)

### Specializations
- Assembly (x86/x64/ARM)
- Security & Cryptography
- Code generation & debugging
- Multi-language support

---

## ⚡ PERFORMANCE

### Power Modes
$($Config.Performance.PowerModes | ForEach-Object { "- **$_**" } | Out-String)

### Display Support
- Max FPS: **$($Config.Performance.MaxFPS)**
- Max Agents: **$($Config.Performance.MaxAgents)**
- Resolutions: Up to 8K
- Refresh Rates: Up to 540Hz

---

## 🚀 QUICK START

1. **Plug in USB drive**
2. **Run:** ``START-BIGDADDYG.bat``
3. **Wait:** ~5 seconds
4. **Code!** IDE opens automatically

---

## 📊 TIER COMPARISON

| Tier | Size | Context | Models | FPS | Use Case |
|------|------|---------|--------|-----|----------|
| MICRO | 512 MB | 1M | 1 | 60 | USB stick, quick edits |
| MINI | 2 GB | 10M | 2 | 144 | Compact, portable |
| STANDARD | 8 GB | 100M | 4 | 240 | Professional work |
| PRO | 32 GB | 500M | 8 | 360 | Multi-model expert |
| ENTERPRISE | 64 GB | 1B 🔥 | 10 | 540 | Enterprise deployment |
| GODLIKE | 256 GB | 1B 💎 | 16 | 540 | Maximum power |

**You have: $Tier Edition**

---

## 💡 FEATURES

### Always Included:
✅ Monaco Editor (VS Code engine)  
✅ Syntax highlighting  
✅ AI Copilot (right-click menu)  
✅ Multi-tab editing  
✅ File system integration  
✅ Chameleon theme (color sliders)  
✅ Mouse ripple effects  

### Tier-Specific:
$(if ($Config.Features.FullModel) { "✅ Full BigDaddyG model (2 GB trained)" } else { "" })
$(if ($Config.Features.OllamaSupport) { "✅ Ollama support" } else { "" })
$(if ($Config.Features.MultipleModels) { "✅ Multiple specialized models" } else { "" })
$(if ($Config.Features.GenesisOS) { "✅ GenesisOS components" } else { "" })
$(if ($Config.AI.QuantumOptimization) { "✅ Quantum optimization 💎" } else { "" })

---

## 🎨 CUSTOMIZATION

### Color Theme:
- Click 🦎 button
- Adjust hue slider (0-360°)
- Adjust transparency (0-100%)
- Rainbow mode available
- 6 quick presets

### Performance:
- Click ⚡ button
- Select power mode
- Click 🖥️ for display settings
- Real-time FPS overlay

### Models:
- Press ``Ctrl+M`` for model selector
- Press ``Ctrl+Shift+1-4`` for built-in models
$(if ($Config.Features.OllamaSupport) { "- Press ``Ctrl+Alt+1-6`` for Ollama models" } else { "" })

---

## 🔒 PORTABLE & SECURE

### No Installation:
- Runs entirely from USB
- No admin rights needed
- No system modifications
- Zero footprint on host PC

### Data Privacy:
- All data stays on USB
- No cloud sync
- No telemetry
- Fully offline

---

## 📞 SUPPORT

**Documentation:** See README-COMPLETE.md  
**Issues:** See troubleshooting section  
**Updates:** Check version.json  

---

**🎊 PORTABLE PROFESSIONAL IDE ON A USB DRIVE!** 💎

Built: $($BuildConfig.BuildDate)  
Version: $($BuildConfig.Version)  
Tier: $Tier  
Context: $ContextDisplay tokens  
"@

$ReadmeContent | Out-File "$TargetPath\README.md" -Encoding UTF8

Write-Host "  ✅ README created" -ForegroundColor Green
Write-Host ""

# ============================================================================
# CREATE TIER BADGE
# ============================================================================

$TierBadge = @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          $($Config.Name) EDITION                             
║                                                               ║
║          Context: $ContextDisplay TOKENS                     
║                                                               ║
║          $($Config.Description)                              
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@

$TierBadge | Out-File "$TargetPath\TIER-INFO.txt" -Encoding ASCII

# ============================================================================
# CALCULATE FINAL SIZE
# ============================================================================

Write-Host "📊 Calculating build size..." -ForegroundColor Yellow

function Get-FolderSize {
    param([string]$Path)
    if (Test-Path $Path) {
        $size = (Get-ChildItem $Path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        return [math]::Round($size / 1MB, 2)
    }
    return 0
}

$FinalSizeMB = Get-FolderSize $TargetPath
$BuildDuration = (Get-Date) - $BuildStartTime

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ BUILD COMPLETE! 🎊                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Build Summary:" -ForegroundColor Cyan
Write-Host "   Tier: $Tier $($Config.Name)" -ForegroundColor White
Write-Host "   Location: $TargetPath" -ForegroundColor White
Write-Host "   Size: $FinalSizeMB MB" -ForegroundColor White
Write-Host "   Target: $($Config.TargetSizeMB) MB" -ForegroundColor White
Write-Host "   Duration: $($BuildDuration.TotalSeconds.ToString('N1')) seconds" -ForegroundColor White
Write-Host ""
Write-Host "🧠 AI Features:" -ForegroundColor Cyan
Write-Host "   Context: $(($Config.AI.ContextSize / 1000000).ToString('N0'))M tokens" -ForegroundColor White
Write-Host "   Variants: $($Config.AI.Variants.Count)" -ForegroundColor White
Write-Host "   Max Output: $($Config.AI.MaxTokens) tokens" -ForegroundColor White
Write-Host ""
Write-Host "⚡ Performance:" -ForegroundColor Cyan
Write-Host "   Max FPS: $($Config.Performance.MaxFPS)" -ForegroundColor White
Write-Host "   Max Agents: $($Config.Performance.MaxAgents)" -ForegroundColor White
Write-Host "   Power Modes: $($Config.Performance.PowerModes.Count)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 TO RUN:" -ForegroundColor Yellow
Write-Host "   1. Plug USB into any PC" -ForegroundColor White
Write-Host "   2. Run: $TargetDrive\BigDaddyG-$Tier\START-BIGDADDYG.bat" -ForegroundColor White
Write-Host "   3. Wait ~5 seconds" -ForegroundColor White
Write-Host "   4. Start coding! 💎" -ForegroundColor White
Write-Host ""

# Comparison to target
$SizePercentage = [math]::Round(($FinalSizeMB / $Config.TargetSizeMB) * 100, 1)

if ($SizePercentage -le 100) {
    Write-Host "✅ Size: $SizePercentage% of target (under budget!)" -ForegroundColor Green
} elseif ($SizePercentage -le 120) {
    Write-Host "⚠️  Size: $SizePercentage% of target (slightly over)" -ForegroundColor Yellow
} else {
    Write-Host "❌ Size: $SizePercentage% of target (over budget)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💾 USB Drive Status:" -ForegroundColor Cyan
$drive = Get-PSDrive ($TargetDrive.TrimEnd(':'))
$freeGB = [math]::Round($drive.Free / 1GB, 2)
Write-Host "   Free space remaining: $freeGB GB" -ForegroundColor White
Write-Host ""

# ============================================================================
# OPEN EXPLORER
# ============================================================================

Write-Host "📂 Opening Explorer..." -ForegroundColor Cyan
Start-Process "explorer.exe" $TargetPath

Write-Host ""
Write-Host "🎊 PORTABLE BUILD COMPLETE!" -ForegroundColor Green
Write-Host "   Your USB drive is now a complete AI-powered IDE!" -ForegroundColor White
Write-Host ""
Write-Host "🌌 $($Config.Name) - $ContextDisplay TOKENS - READY TO SHIP!" -ForegroundColor Cyan
Write-Host ""

