#Requires -Version 5.1
<#
.SYNOPSIS
    Diagnose BigDaddyG IDE portable executable issues
.DESCRIPTION
    Checks for common issues preventing the portable exe from launching
#>

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🔍 BigDaddyG IDE Exe Diagnostic Tool 🔍                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$projectRoot = "D:\Security Research aka GitHub Repos\ProjectIDEAI"
$distFolder = Join-Path $projectRoot "dist"

# ============================================================================
# 1. Check if dist folder exists
# ============================================================================
Write-Host "`n[1] Checking dist folder..." -ForegroundColor Yellow

if (Test-Path $distFolder) {
    Write-Host "✅ Dist folder exists: $distFolder" -ForegroundColor Green
    
    # List all executables
    $exeFiles = Get-ChildItem -Path $distFolder -Filter "*.exe" -Recurse -ErrorAction SilentlyContinue
    
    if ($exeFiles.Count -gt 0) {
        Write-Host "   Found $($exeFiles.Count) executable(s):" -ForegroundColor Gray
        foreach ($exe in $exeFiles) {
            $sizeM

B = [math]::Round($exe.Length / 1MB, 2)
            Write-Host "   - $($exe.Name) ($sizeMB MB)" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠️ No .exe files found in dist folder" -ForegroundColor Yellow
        Write-Host "   Run: npm run build:portable" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Dist folder not found" -ForegroundColor Red
    Write-Host "   Need to build first. Run: npm run build:portable" -ForegroundColor Cyan
}

# ============================================================================
# 2. Check Node.js and Electron installation
# ============================================================================
Write-Host "`n[2] Checking Node.js and Electron..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found or not in PATH" -ForegroundColor Red
}

try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found" -ForegroundColor Red
}

# Check if electron is installed
Push-Location $projectRoot
try {
    $electronInstalled = Test-Path "node_modules\electron"
    if ($electronInstalled) {
        Write-Host "✅ Electron is installed" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Electron not found in node_modules" -ForegroundColor Yellow
        Write-Host "   Run: npm install" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️ Could not verify Electron installation" -ForegroundColor Yellow
}
Pop-Location

# ============================================================================
# 3. Check for missing dependencies
# ============================================================================
Write-Host "`n[3] Checking dependencies..." -ForegroundColor Yellow

Push-Location $projectRoot

if (Test-Path "package.json") {
    Write-Host "✅ package.json exists" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        $moduleCount = (Get-ChildItem "node_modules" -Directory).Count
        Write-Host "✅ node_modules exists ($moduleCount packages)" -ForegroundColor Green
    } else {
        Write-Host "❌ node_modules not found" -ForegroundColor Red
        Write-Host "   Run: npm install" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ package.json not found" -ForegroundColor Red
}

Pop-Location

# ============================================================================
# 4. Check main files
# ============================================================================
Write-Host "`n[4] Checking main files..." -ForegroundColor Yellow

$mainFile = Join-Path $projectRoot "electron\main.js"
$indexFile = Join-Path $projectRoot "electron\index.html"
$rendererFile = Join-Path $projectRoot "electron\renderer.js"

if (Test-Path $mainFile) {
    Write-Host "✅ main.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ main.js not found at: $mainFile" -ForegroundColor Red
}

if (Test-Path $indexFile) {
    Write-Host "✅ index.html exists" -ForegroundColor Green
} else {
    Write-Host "❌ index.html not found at: $indexFile" -ForegroundColor Red
}

if (Test-Path $rendererFile) {
    Write-Host "✅ renderer.js exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ renderer.js not found (may not be critical)" -ForegroundColor Yellow
}

# ============================================================================
# 5. Check for antivirus/Windows Defender blocks
# ============================================================================
Write-Host "`n[5] Checking for potential blocks..." -ForegroundColor Yellow

Write-Host "   Checking Windows Defender status..." -ForegroundColor Gray
try {
    $defenderStatus = Get-MpComputerStatus -ErrorAction SilentlyContinue
    if ($defenderStatus.RealTimeProtectionEnabled) {
        Write-Host "⚠️ Windows Defender Real-Time Protection is ENABLED" -ForegroundColor Yellow
        Write-Host "   This may block unsigned executables" -ForegroundColor Gray
        Write-Host "   Consider adding an exclusion for: $distFolder" -ForegroundColor Cyan
    } else {
        Write-Host "✅ Windows Defender Real-Time Protection is disabled" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not check Windows Defender status" -ForegroundColor Yellow
}

# ============================================================================
# 6. Check build configuration
# ============================================================================
Write-Host "`n[6] Checking build configuration..." -ForegroundColor Yellow

Push-Location $projectRoot

if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    
    if ($packageJson.build) {
        Write-Host "✅ Build configuration exists in package.json" -ForegroundColor Green
        
        # Check for asar setting
        if ($packageJson.build.asar -eq $false) {
            Write-Host "✅ asar is disabled (files not packed)" -ForegroundColor Green
        } else {
            Write-Host "⚠️ asar is enabled (files are packed)" -ForegroundColor Yellow
        }
        
        # Check for portable target
        if ($packageJson.build.win.target -contains "portable") {
            Write-Host "✅ Portable target is configured" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Portable target not in configuration" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️ No build configuration found in package.json" -ForegroundColor Yellow
    }
}

Pop-Location

# ============================================================================
# 7. Recommendations
# ============================================================================
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                     RECOMMENDATIONS                          ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Write-Host "To fix the portable exe issue:" -ForegroundColor White
Write-Host ""
Write-Host "1️⃣ Clean build:" -ForegroundColor Cyan
Write-Host "   cd 'D:\Security Research aka GitHub Repos\ProjectIDEAI'" -ForegroundColor Gray
Write-Host "   Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue" -ForegroundColor Gray
Write-Host "   npm install" -ForegroundColor Gray
Write-Host "   npm run build:portable" -ForegroundColor Gray
Write-Host ""
Write-Host "2️⃣ Test with npm start (already running):" -ForegroundColor Cyan
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "3️⃣ If exe still won't launch:" -ForegroundColor Cyan
Write-Host "   - Check Windows Defender exclusions" -ForegroundColor Gray
Write-Host "   - Run exe as Administrator" -ForegroundColor Gray
Write-Host "   - Check Windows Event Viewer for crash logs" -ForegroundColor Gray
Write-Host "   - Try building with: electron-builder --win --x64" -ForegroundColor Gray
Write-Host ""
Write-Host "4️⃣ Alternative: Use NSIS installer instead:" -ForegroundColor Cyan
Write-Host "   npm run build:installer" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

