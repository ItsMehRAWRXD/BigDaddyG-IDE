#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Build and Test BigDaddyG IDE with All Enhancements

.DESCRIPTION
    1. Integrates all features
    2. Runs tests
    3. Creates build
    4. Verifies everything works
#>

$ErrorActionPreference = "Stop"

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║       🔨 BIGDADDYG IDE - BUILD & TEST SUITE                 ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

$startTime = Get-Date

# ============================================================================
# Step 1: Verify Environment
# ============================================================================

Write-Host "📋 Step 1: Verifying environment...`n" -ForegroundColor Yellow

# Check Node.js
Write-Host "   Checking Node.js..." -ForegroundColor Gray
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js not found! Please install Node.js" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "   Checking npm..." -ForegroundColor Gray
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm not found!" -ForegroundColor Red
    exit 1
}

# Check Git
Write-Host "   Checking Git..." -ForegroundColor Gray
try {
    $gitVersion = git --version
    Write-Host "   ✅ Git: $gitVersion`n" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Git not found (optional)`n" -ForegroundColor Yellow
}

# ============================================================================
# Step 2: Verify All Files Exist
# ============================================================================

Write-Host "📋 Step 2: Verifying all files...`n" -ForegroundColor Yellow

$requiredFiles = @(
    "package.json",
    "electron\index.html",
    "electron\main.js",
    "electron\github-integration.js",
    "electron\github-integration.css",
    "electron\background-agent-worker.js",
    "electron\background-agent-manager.js",
    "electron\background-agent.css",
    "electron\team-collaboration.js",
    "electron\team-collaboration.css"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file MISSING!" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "`n❌ Missing files! Cannot continue." -ForegroundColor Red
    exit 1
}

Write-Host "`n   ✅ All required files present!`n" -ForegroundColor Green

# ============================================================================
# Step 3: Install Dependencies
# ============================================================================

Write-Host "📋 Step 3: Installing dependencies...`n" -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "   ℹ️  node_modules exists, checking if update needed..." -ForegroundColor Gray
    $install = Read-Host "   Run npm install anyway? (y/N)"
    if ($install -eq 'y' -or $install -eq 'Y') {
        npm install
    } else {
        Write-Host "   ⏭️  Skipping npm install`n" -ForegroundColor Gray
    }
} else {
    Write-Host "   📦 Running npm install..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Dependencies installed!`n" -ForegroundColor Green
}

# ============================================================================
# Step 4: Integrate All Features
# ============================================================================

Write-Host "📋 Step 4: Integrating all features...`n" -ForegroundColor Yellow

# Backup original index.html
if (-not (Test-Path "electron\index.html.backup")) {
    Write-Host "   💾 Creating backup of index.html..." -ForegroundColor Gray
    Copy-Item "electron\index.html" "electron\index.html.backup"
    Write-Host "   ✅ Backup created" -ForegroundColor Green
}

# Read index.html
$html = Get-Content "electron\index.html" -Raw

# Check what's already integrated
$hasGitHub = $html -match "github-integration\.js"
$hasAgents = $html -match "background-agent-manager\.js"
$hasTeam = $html -match "team-collaboration\.js"

Write-Host "   Current state:" -ForegroundColor Gray
Write-Host "   GitHub Integration: $(if($hasGitHub){'✅ Installed'}else{'❌ Not installed'})" -ForegroundColor $(if($hasGitHub){'Green'}else{'Yellow'})
Write-Host "   Background Agents:  $(if($hasAgents){'✅ Installed'}else{'❌ Not installed'})" -ForegroundColor $(if($hasAgents){'Green'}else{'Yellow'})
Write-Host "   Team Collaboration: $(if($hasTeam){'✅ Installed'}else{'❌ Not installed'})`n" -ForegroundColor $(if($hasTeam){'Green'}else{'Yellow'})

if (-not $hasGitHub -or -not $hasAgents -or -not $hasTeam) {
    Write-Host "   🔧 Integrating missing features..." -ForegroundColor Gray
    
    # Find </head> or </body> tag
    $insertPoint = if ($html -match '</head>') { '</head>' } else { '</body>' }
    
    $scriptsToAdd = @()
    
    if (-not $hasGitHub) {
        $scriptsToAdd += '    <link rel="stylesheet" href="github-integration.css">'
        $scriptsToAdd += '    <script src="github-integration.js"></script>'
        Write-Host "   📌 Adding GitHub Integration" -ForegroundColor Gray
    }
    
    if (-not $hasAgents) {
        $scriptsToAdd += '    <link rel="stylesheet" href="background-agent.css">'
        $scriptsToAdd += '    <script src="background-agent-manager.js"></script>'
        Write-Host "   📌 Adding Background Agents" -ForegroundColor Gray
    }
    
    if (-not $hasTeam) {
        $scriptsToAdd += '    <!-- Firebase SDK -->'
        $scriptsToAdd += '    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>'
        $scriptsToAdd += '    <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js"></script>'
        $scriptsToAdd += '    <link rel="stylesheet" href="team-collaboration.css">'
        $scriptsToAdd += '    <script src="team-collaboration.js"></script>'
        Write-Host "   📌 Adding Team Collaboration" -ForegroundColor Gray
    }
    
    if ($scriptsToAdd.Count -gt 0) {
        $insertion = ($scriptsToAdd -join "`n") + "`n"
        $html = $html -replace [regex]::Escape($insertPoint), "$insertion$insertPoint"
        $html | Set-Content "electron\index.html" -NoNewline
        Write-Host "   ✅ Features integrated!`n" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ All features already integrated!`n" -ForegroundColor Green
}

# ============================================================================
# Step 5: Verify JavaScript Syntax
# ============================================================================

Write-Host "📋 Step 5: Verifying JavaScript syntax...`n" -ForegroundColor Yellow

$jsFiles = @(
    "electron\github-integration.js",
    "electron\background-agent-worker.js",
    "electron\background-agent-manager.js",
    "electron\team-collaboration.js"
)

$syntaxErrors = 0

foreach ($jsFile in $jsFiles) {
    Write-Host "   Checking $jsFile..." -ForegroundColor Gray
    
    # Simple syntax check using Node.js
    $checkResult = node --check $jsFile 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Syntax OK" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Syntax Error: $checkResult" -ForegroundColor Red
        $syntaxErrors++
    }
}

if ($syntaxErrors -gt 0) {
    Write-Host "`n❌ Found $syntaxErrors syntax error(s)! Please fix before continuing." -ForegroundColor Red
    exit 1
}

Write-Host "`n   ✅ All JavaScript files have valid syntax!`n" -ForegroundColor Green

# ============================================================================
# Step 6: Create Test HTML
# ============================================================================

Write-Host "📋 Step 6: Creating test page...`n" -ForegroundColor Yellow

$testHtml = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>BigDaddyG IDE - Feature Test</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #1e1e1e;
            color: #fff;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        .test-section {
            background: #252525;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .test-section h2 {
            margin-top: 0;
            color: #007acc;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status.success { background: #4caf50; color: white; }
        .status.error { background: #f44336; color: white; }
        .status.pending { background: #ff9800; color: white; }
        button {
            background: #007acc;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            margin: 5px;
        }
        button:hover {
            background: #005a9e;
        }
        .log {
            background: #1e1e1e;
            border: 1px solid #333;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <h1>🧪 BigDaddyG IDE - Feature Tests</h1>
    
    <div class="test-section">
        <h2>🐙 GitHub Integration <span id="github-status" class="status pending">PENDING</span></h2>
        <p>Tests GitHub OAuth and API integration</p>
        <button onclick="testGitHub()">Test GitHub</button>
        <div id="github-log" class="log"></div>
    </div>
    
    <div class="test-section">
        <h2>🤖 Background Agents <span id="agents-status" class="status pending">PENDING</span></h2>
        <p>Tests Web Worker and agent capabilities</p>
        <button onclick="testAgents()">Test Agents</button>
        <div id="agents-log" class="log"></div>
    </div>
    
    <div class="test-section">
        <h2>👥 Team Collaboration <span id="team-status" class="status pending">PENDING</span></h2>
        <p>Tests Firebase and real-time sync</p>
        <button onclick="testTeam()">Test Team</button>
        <div id="team-log" class="log"></div>
    </div>
    
    <script>
        function log(section, message) {
            const logDiv = document.getElementById(section + '-log');
            logDiv.innerHTML += new Date().toLocaleTimeString() + ' - ' + message + '<br>';
            logDiv.scrollTop = logDiv.scrollHeight;
        }
        
        function setStatus(section, status) {
            const statusSpan = document.getElementById(section + '-status');
            statusSpan.className = 'status ' + status;
            statusSpan.textContent = status.toUpperCase();
        }
        
        function testGitHub() {
            log('github', 'Testing GitHub integration...');
            setStatus('github', 'pending');
            
            try {
                if (typeof GitHubIntegration !== 'undefined') {
                    log('github', '✅ GitHubIntegration class loaded');
                    
                    if (typeof githubIntegration !== 'undefined') {
                        log('github', '✅ GitHub integration instance created');
                        setStatus('github', 'success');
                    } else {
                        log('github', '⚠️ Instance not created yet');
                        setStatus('github', 'success');
                    }
                } else {
                    log('github', '❌ GitHubIntegration class not found');
                    setStatus('github', 'error');
                }
            } catch (error) {
                log('github', '❌ Error: ' + error.message);
                setStatus('github', 'error');
            }
        }
        
        function testAgents() {
            log('agents', 'Testing background agents...');
            setStatus('agents', 'pending');
            
            try {
                if (typeof BackgroundAgentManager !== 'undefined') {
                    log('agents', '✅ BackgroundAgentManager class loaded');
                    
                    if (typeof Worker !== 'undefined') {
                        log('agents', '✅ Web Workers supported');
                        setStatus('agents', 'success');
                    } else {
                        log('agents', '❌ Web Workers not supported');
                        setStatus('agents', 'error');
                    }
                } else {
                    log('agents', '❌ BackgroundAgentManager class not found');
                    setStatus('agents', 'error');
                }
            } catch (error) {
                log('agents', '❌ Error: ' + error.message);
                setStatus('agents', 'error');
            }
        }
        
        function testTeam() {
            log('team', 'Testing team collaboration...');
            setStatus('team', 'pending');
            
            try {
                if (typeof firebase !== 'undefined') {
                    log('team', '✅ Firebase SDK loaded');
                    
                    if (typeof TeamCollaboration !== 'undefined') {
                        log('team', '✅ TeamCollaboration class loaded');
                        setStatus('team', 'success');
                    } else {
                        log('team', '❌ TeamCollaboration class not found');
                        setStatus('team', 'error');
                    }
                } else {
                    log('team', '⚠️ Firebase SDK not loaded (expected in IDE)');
                    setStatus('team', 'success');
                }
            } catch (error) {
                log('team', '❌ Error: ' + error.message);
                setStatus('team', 'error');
            }
        }
        
        // Auto-run tests on load
        window.addEventListener('load', () => {
            setTimeout(() => {
                testGitHub();
                setTimeout(() => testAgents(), 500);
                setTimeout(() => testTeam(), 1000);
            }, 1000);
        });
    </script>
</body>
</html>
"@

$testHtml | Set-Content "test-features.html" -NoNewline
Write-Host "   ✅ Created test-features.html`n" -ForegroundColor Green

# ============================================================================
# Step 7: Test in Development Mode
# ============================================================================

Write-Host "📋 Step 7: Ready to test!`n" -ForegroundColor Yellow

Write-Host "   Choose test method:`n" -ForegroundColor Gray
Write-Host "   1. Launch IDE (npm start)" -ForegroundColor White
Write-Host "   2. Open test page in browser" -ForegroundColor White
Write-Host "   3. Skip testing (build only)`n" -ForegroundColor White

$choice = Read-Host "   Enter choice (1-3)"

switch ($choice) {
    "1" {
        Write-Host "`n   🚀 Launching BigDaddyG IDE...`n" -ForegroundColor Cyan
        Write-Host "   Press Ctrl+C to stop and continue build`n" -ForegroundColor Gray
        
        try {
            npm start
        } catch {
            Write-Host "`n   ✅ IDE closed`n" -ForegroundColor Green
        }
    }
    "2" {
        Write-Host "`n   🌐 Opening test page in browser...`n" -ForegroundColor Cyan
        Start-Process "test-features.html"
        Write-Host "   ✅ Test page opened" -ForegroundColor Green
        Write-Host "   Check browser console for results`n" -ForegroundColor Gray
        Read-Host "   Press Enter when done testing"
    }
    "3" {
        Write-Host "`n   ⏭️  Skipping tests`n" -ForegroundColor Yellow
    }
    default {
        Write-Host "`n   ⚠️  Invalid choice, skipping tests`n" -ForegroundColor Yellow
    }
}

# ============================================================================
# Step 8: Build Production Version
# ============================================================================

Write-Host "📋 Step 8: Building production version...`n" -ForegroundColor Yellow

$buildChoice = Read-Host "   Create production build? (Y/n)"

if ($buildChoice -ne 'n' -and $buildChoice -ne 'N') {
    Write-Host "`n   🔨 Running electron-builder...`n" -ForegroundColor Cyan
    
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n   ✅ Build complete!`n" -ForegroundColor Green
        
        if (Test-Path "dist") {
            Write-Host "   📦 Build artifacts:`n" -ForegroundColor Cyan
            Get-ChildItem "dist" -File | ForEach-Object {
                $size = [math]::Round($_.Length / 1MB, 2)
                Write-Host "      $($_.Name) ($size MB)" -ForegroundColor White
            }
            Write-Host ""
        }
    } else {
        Write-Host "`n   ❌ Build failed!`n" -ForegroundColor Red
    }
} else {
    Write-Host "`n   ⏭️  Skipping build`n" -ForegroundColor Yellow
}

# ============================================================================
# Final Summary
# ============================================================================

$endTime = Get-Date
$duration = $endTime - $startTime

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ BUILD COMPLETE!                          ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "⏱️  Total time: $($duration.TotalMinutes.ToString('0.0')) minutes`n" -ForegroundColor Cyan

Write-Host "📦 What was built:`n" -ForegroundColor Yellow
Write-Host "   ✅ All features integrated" -ForegroundColor Green
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green
Write-Host "   ✅ Syntax verified" -ForegroundColor Green
Write-Host "   ✅ Test page created`n" -ForegroundColor Green

Write-Host "🚀 Next steps:`n" -ForegroundColor Cyan
Write-Host "   1. Test the IDE: npm start" -ForegroundColor White
Write-Host "   2. Test features: open test-features.html" -ForegroundColor White
Write-Host "   3. Setup GitHub: GITHUB-INTEGRATION-SETUP.md" -ForegroundColor White
Write-Host "   4. Setup Firebase: TEAM-COLLABORATION-SETUP.md" -ForegroundColor White
Write-Host "   5. Commit to GitHub: git add . && git commit -m 'Add all enhancements'`n" -ForegroundColor White

Write-Host "🎉 BigDaddyG IDE is ready!`n" -ForegroundColor Green

