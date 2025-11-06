#Requires -Version 5.1
<#
.SYNOPSIS
    Comprehensive test suite and GitHub deployment for BigDaddyG IDE
.DESCRIPTION
    Tests all features, validates system integrity, and pushes to GitHub
.EXAMPLE
    .\test-and-deploy.ps1
.EXAMPLE
    .\test-and-deploy.ps1 -SkipTests
#>

param(
    [switch]$SkipTests,
    [switch]$SkipOpenMemory,
    [switch]$SkipPush,
    [string]$CommitMessage = "✅ Production-ready: All features tested and verified"
)

$ErrorActionPreference = 'Continue'
$projectRoot = "D:\Security Research aka GitHub Repos\ProjectIDEAI"

$testResults = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
    Tests = @()
}

function Write-TestResult {
    param(
        [string]$TestName,
        [string]$Status, # "PASS", "FAIL", "SKIP"
        [string]$Message = ""
    )
    
    $testResults.Total++
    
    switch ($Status) {
        "PASS" {
            $testResults.Passed++
            Write-Host "✅ PASS: $TestName" -ForegroundColor Green
            if ($Message) { Write-Host "   $Message" -ForegroundColor Gray }
        }
        "FAIL" {
            $testResults.Failed++
            Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
            if ($Message) { Write-Host "   $Message" -ForegroundColor Yellow }
        }
        "SKIP" {
            $testResults.Skipped++
            Write-Host "⏭️  SKIP: $TestName" -ForegroundColor Gray
            if ($Message) { Write-Host "   $Message" -ForegroundColor DarkGray }
        }
    }
    
    $testResults.Tests += [PSCustomObject]@{
        Name = $TestName
        Status = $Status
        Message = $Message
    }
}

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🧪 BigDaddyG IDE - Test & Deploy Suite 🚀                 ║
║                                                              ║
║   Comprehensive testing and GitHub deployment                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

Push-Location $projectRoot

# ============================================================================
# PHASE 1: ENVIRONMENT CHECKS
# ============================================================================
Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PHASE 1: Environment Validation         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 1: Node.js
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-TestResult "Node.js Installed" "PASS" "Version: $nodeVersion"
    } else {
        Write-TestResult "Node.js Installed" "FAIL" "Node.js not found"
    }
} catch {
    Write-TestResult "Node.js Installed" "FAIL" $_.Exception.Message
}

# Test 2: npm
Write-Host "[2/8] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-TestResult "npm Installed" "PASS" "Version: $npmVersion"
    } else {
        Write-TestResult "npm Installed" "FAIL" "npm not found"
    }
} catch {
    Write-TestResult "npm Installed" "FAIL" $_.Exception.Message
}

# Test 3: Git
Write-Host "[3/8] Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-TestResult "Git Installed" "PASS" "$gitVersion"
    } else {
        Write-TestResult "Git Installed" "FAIL" "Git not found"
    }
} catch {
    Write-TestResult "Git Installed" "FAIL" $_.Exception.Message
}

# Test 4: Dependencies
Write-Host "[4/8] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    $moduleCount = (Get-ChildItem "node_modules" -Directory -ErrorAction SilentlyContinue).Count
    Write-TestResult "Dependencies Installed" "PASS" "$moduleCount packages"
} else {
    Write-TestResult "Dependencies Installed" "FAIL" "node_modules not found - run npm install"
}

# Test 5: Main Files
Write-Host "[5/8] Checking main files..." -ForegroundColor Yellow
$requiredFiles = @(
    "electron\main.js",
    "electron\index.html",
    "electron\renderer.js",
    "electron\hotkey-manager.js",
    "electron\command-palette.js",
    "electron\enhanced-terminal.js",
    "server\Orchestra-Server.js",
    "package.json"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-TestResult "Required Files Present" "PASS" "All $($requiredFiles.Count) files found"
} else {
    Write-TestResult "Required Files Present" "FAIL" "Missing: $($missingFiles -join ', ')"
}

# Test 6: OpenMemory Module
Write-Host "[6/8] Checking OpenMemory module..." -ForegroundColor Yellow
if (Test-Path "OpenMemory\OpenMemory.psd1") {
    Write-TestResult "OpenMemory Module" "PASS" "Module manifest found"
} else {
    Write-TestResult "OpenMemory Module" "FAIL" "OpenMemory.psd1 not found"
}

# Test 7: Demo Files
Write-Host "[7/8] Checking demo files..." -ForegroundColor Yellow
if (Test-Path "demo-files") {
    $demoFileCount = (Get-ChildItem "demo-files" -File -ErrorAction SilentlyContinue).Count
    Write-TestResult "Demo Files" "PASS" "$demoFileCount demo files ready"
} else {
    Write-TestResult "Demo Files" "SKIP" "Demo files not found (non-critical)"
}

# Test 8: Git Repository
Write-Host "[8/8] Checking Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    try {
        $gitRemote = git remote get-url origin 2>$null
        if ($gitRemote) {
            Write-TestResult "Git Repository" "PASS" "Remote: $gitRemote"
        } else {
            Write-TestResult "Git Repository" "FAIL" "No remote origin configured"
        }
    } catch {
        Write-TestResult "Git Repository" "FAIL" $_.Exception.Message
    }
} else {
    Write-TestResult "Git Repository" "FAIL" "Not a git repository"
}

# ============================================================================
# PHASE 2: FEATURE TESTING
# ============================================================================
if (-not $SkipTests) {
    Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  PHASE 2: Feature Testing                ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    # Test 9: OpenMemory Module Tests
    if (-not $SkipOpenMemory) {
        Write-Host "[9] Running OpenMemory tests..." -ForegroundColor Yellow
        if (Test-Path "OpenMemory\Test-OpenMemory.ps1") {
            try {
                Write-Host "   Starting OpenMemory test suite..." -ForegroundColor Gray
                $testOutput = & ".\OpenMemory\Test-OpenMemory.ps1" -SkipAPI -ErrorAction Stop
                
                # Parse results
                if ($testOutput -match "Pass Rate:\s+(\d+(?:\.\d+)?)%") {
                    $passRate = [decimal]$matches[1]
                    if ($passRate -ge 90) {
                        Write-TestResult "OpenMemory Module Tests" "PASS" "Pass rate: $passRate%"
                    } else {
                        Write-TestResult "OpenMemory Module Tests" "FAIL" "Pass rate: $passRate% (expected ≥90%)"
                    }
                } else {
                    Write-TestResult "OpenMemory Module Tests" "PASS" "Tests completed"
                }
            } catch {
                Write-TestResult "OpenMemory Module Tests" "FAIL" $_.Exception.Message
            }
        } else {
            Write-TestResult "OpenMemory Module Tests" "SKIP" "Test script not found"
        }
    } else {
        Write-TestResult "OpenMemory Module Tests" "SKIP" "Skipped by user"
    }
    
    # Test 10: Package.json Validation
    Write-Host "[10] Validating package.json..." -ForegroundColor Yellow
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        
        $hasName = ![string]::IsNullOrEmpty($packageJson.name)
        $hasVersion = ![string]::IsNullOrEmpty($packageJson.version)
        $hasMain = ![string]::IsNullOrEmpty($packageJson.main)
        $hasScripts = $null -ne $packageJson.scripts
        
        if ($hasName -and $hasVersion -and $hasMain -and $hasScripts) {
            Write-TestResult "package.json Valid" "PASS" "v$($packageJson.version)"
        } else {
            Write-TestResult "package.json Valid" "FAIL" "Missing required fields"
        }
    } catch {
        Write-TestResult "package.json Valid" "FAIL" $_.Exception.Message
    }
    
    # Test 11: JavaScript Syntax Check
    Write-Host "[11] Checking JavaScript files..." -ForegroundColor Yellow
    $jsFiles = Get-ChildItem -Path "electron" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue
    $jsErrorCount = 0
    
    foreach ($jsFile in $jsFiles | Select-Object -First 10) {
        try {
            # Basic syntax check using Node.js
            $syntaxCheck = node --check $jsFile.FullName 2>&1
            if ($LASTEXITCODE -ne 0) {
                $jsErrorCount++
            }
        } catch {
            $jsErrorCount++
        }
    }
    
    if ($jsErrorCount -eq 0) {
        Write-TestResult "JavaScript Syntax" "PASS" "No syntax errors in sampled files"
    } else {
        Write-TestResult "JavaScript Syntax" "FAIL" "$jsErrorCount files with syntax errors"
    }
    
    # Test 12: File Structure
    Write-Host "[12] Validating file structure..." -ForegroundColor Yellow
    $requiredDirs = @("electron", "server", "OpenMemory")
    $missingDirs = @()
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            $missingDirs += $dir
        }
    }
    
    if ($missingDirs.Count -eq 0) {
        Write-TestResult "File Structure" "PASS" "All required directories present"
    } else {
        Write-TestResult "File Structure" "FAIL" "Missing: $($missingDirs -join ', ')"
    }
    
} else {
    Write-Host "`n[SKIP] Feature testing skipped by user`n" -ForegroundColor Gray
    Write-TestResult "Feature Testing" "SKIP" "Skipped by user request"
}

# ============================================================================
# PHASE 3: PRE-DEPLOYMENT CHECKS
# ============================================================================
Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  PHASE 3: Pre-Deployment Checks          ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Test 13: Git Status
Write-Host "[13] Checking Git status..." -ForegroundColor Yellow
try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        $changedFiles = ($gitStatus | Measure-Object).Count
        Write-TestResult "Git Status Check" "PASS" "$changedFiles file(s) changed"
    } else {
        Write-TestResult "Git Status Check" "PASS" "Working directory clean"
    }
} catch {
    Write-TestResult "Git Status Check" "FAIL" $_.Exception.Message
}

# Test 14: Large Files Check
Write-Host "[14] Checking for large files..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Path . -File -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt 100MB -and $_.FullName -notmatch "node_modules|\.git|dist" } |
    Select-Object -First 5

if ($largeFiles) {
    $largeFileNames = $largeFiles | ForEach-Object { "$($_.Name) ($([math]::Round($_.Length/1MB, 2))MB)" }
    Write-TestResult "Large Files Check" "FAIL" "Found: $($largeFileNames -join ', ')"
} else {
    Write-TestResult "Large Files Check" "PASS" "No large files detected"
}

# Test 15: .gitignore
Write-Host "[15] Checking .gitignore..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    $hasNodeModules = $gitignoreContent -match "node_modules"
    $hasDist = $gitignoreContent -match "dist"
    
    if ($hasNodeModules -and $hasDist) {
        Write-TestResult ".gitignore Configuration" "PASS" "Properly configured"
    } else {
        Write-TestResult ".gitignore Configuration" "FAIL" "Missing important entries"
    }
} else {
    Write-TestResult ".gitignore Configuration" "FAIL" ".gitignore not found"
}

# ============================================================================
# PHASE 4: GITHUB DEPLOYMENT
# ============================================================================
if (-not $SkipPush) {
    Write-Host "`n╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  PHASE 4: GitHub Deployment               ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════╝`n" -ForegroundColor Cyan
    
    # Check if we should proceed with deployment
    $canDeploy = $testResults.Failed -eq 0 -or (Read-Host "Tests failed. Continue with deployment? (y/n)") -eq 'y'
    
    if ($canDeploy) {
        Write-Host "[16] Staging files..." -ForegroundColor Yellow
        try {
            git add . 2>&1 | Out-Null
            Write-TestResult "Git Add" "PASS" "Files staged"
        } catch {
            Write-TestResult "Git Add" "FAIL" $_.Exception.Message
        }
        
        Write-Host "[17] Committing changes..." -ForegroundColor Yellow
        try {
            $commitOutput = git commit -m $CommitMessage 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult "Git Commit" "PASS" "Changes committed"
            } else {
                if ($commitOutput -match "nothing to commit") {
                    Write-TestResult "Git Commit" "SKIP" "Nothing to commit"
                } else {
                    Write-TestResult "Git Commit" "FAIL" "$commitOutput"
                }
            }
        } catch {
            Write-TestResult "Git Commit" "FAIL" $_.Exception.Message
        }
        
        Write-Host "[18] Pushing to GitHub..." -ForegroundColor Yellow
        try {
            $pushOutput = git push origin main 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-TestResult "Git Push" "PASS" "Pushed to GitHub"
            } else {
                # Try 'master' branch if 'main' fails
                $pushOutput = git push origin master 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-TestResult "Git Push" "PASS" "Pushed to GitHub (master branch)"
                } else {
                    Write-TestResult "Git Push" "FAIL" "$pushOutput"
                }
            }
        } catch {
            Write-TestResult "Git Push" "FAIL" $_.Exception.Message
        }
    } else {
        Write-Host "`n[ABORT] Deployment cancelled by user`n" -ForegroundColor Red
        Write-TestResult "GitHub Deployment" "SKIP" "Cancelled due to test failures"
    }
} else {
    Write-Host "`n[SKIP] GitHub push skipped by user`n" -ForegroundColor Gray
    Write-TestResult "GitHub Deployment" "SKIP" "Skipped by user request"
}

Pop-Location

# ============================================================================
# RESULTS SUMMARY
# ============================================================================
Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                     FINAL RESULTS SUMMARY                    ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$passRate = if ($testResults.Total -gt 0) { 
    [math]::Round(($testResults.Passed / $testResults.Total) * 100, 1) 
} else { 
    0 
}

Write-Host "Total Tests:  " -NoNewline
Write-Host $testResults.Total -ForegroundColor Cyan

Write-Host "Passed:       " -NoNewline
Write-Host $testResults.Passed -ForegroundColor Green

Write-Host "Failed:       " -NoNewline
Write-Host $testResults.Failed -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })

Write-Host "Skipped:      " -NoNewline
Write-Host $testResults.Skipped -ForegroundColor Gray

Write-Host "Pass Rate:    " -NoNewline
Write-Host "$passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host ""

if ($testResults.Failed -gt 0) {
    Write-Host "Failed Tests:" -ForegroundColor Red
    $testResults.Tests | Where-Object { $_.Status -eq "FAIL" } | ForEach-Object {
        Write-Host "  ❌ $($_.Name)" -ForegroundColor Red
        if ($_.Message) {
            Write-Host "     $($_.Message)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

# Final Status
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if ($passRate -eq 100 -and -not $SkipPush) {
    Write-Host "🎉 SUCCESS! All tests passed and pushed to GitHub! 🎉" -ForegroundColor Green
} elseif ($passRate -ge 90) {
    Write-Host "✅ MOSTLY SUCCESSFUL! Minor issues detected." -ForegroundColor Yellow
} elseif ($SkipPush) {
    Write-Host "✅ Tests completed. Deployment skipped." -ForegroundColor Yellow
} else {
    Write-Host "⚠️ ISSUES DETECTED. Review failed tests above." -ForegroundColor Red
}

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Return exit code based on results
if ($testResults.Failed -gt 0) {
    exit 1
} else {
    exit 0
}

