# Direct PowerShell build script for BigDaddyG Native Ollama
# Uses your actual compilers!

Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "Building BigDaddyG Native Ollama" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set up MSVC environment
$msvcPath = "D:\New folder\VC\Tools\MSVC\14.44.35207\bin\Hostx64\x64"
$sdkInclude = "D:\New folder\SDK\ScopeCppSDK\vc15\SDK\include"
$msvcInclude = "D:\New folder\VC\Tools\MSVC\14.44.35207\include"

# Add to PATH
$env:PATH = "$msvcPath;$env:PATH"

# Find winhttp.lib
$winhttpLib = Get-ChildItem "D:\New folder" -Recurse -Filter "winhttp.lib" -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName

if (-not $winhttpLib) {
    Write-Host "[ERROR] winhttp.lib not found!" -ForegroundColor Red
    Write-Host "Searching Windows SDK..." -ForegroundColor Yellow
    $winhttpLib = "C:\Program Files (x86)\Windows Kits\10\Lib\*\um\x64\winhttp.lib"
    $winhttpLib = Get-Item $winhttpLib -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty FullName
}

Write-Host "[1/3] Compiler: " -NoNewline
Write-Host "MSVC 19.44" -ForegroundColor Green
Write-Host "[2/3] SDK: " -NoNewline  
Write-Host "$sdkInclude" -ForegroundColor Green
Write-Host "[3/3] Building..." -ForegroundColor Yellow
Write-Host ""

# Compile
$compileArgs = @(
    "ollama-native.c",
    "/Fe:ollama-native.exe",
    "/I", "`"$sdkInclude\um`"",
    "/I", "`"$sdkInclude\shared`"",
    "/I", "`"$sdkInclude\ucrt`"",
    "/I", "`"$msvcInclude`"",
    "/O2",
    "/link"
)

if ($winhttpLib) {
    $compileArgs += "`"$winhttpLib`""
} else {
    $compileArgs += "winhttp.lib"
}

& cl.exe $compileArgs 2>&1 | Out-Host

if (Test-Path "ollama-native.exe") {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "BUILD SUCCESS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Executable: " -NoNewline
    Write-Host "ollama-native.exe" -ForegroundColor Cyan
    Write-Host "Size: " -NoNewline
    $size = (Get-Item "ollama-native.exe").Length / 1KB
    Write-Host "$([math]::Round($size, 2)) KB" -ForegroundColor Cyan
    Write-Host ""
    
    # Copy to electron folder
    Copy-Item "ollama-native.exe" "..\..\electron\" -Force -ErrorAction SilentlyContinue
    if (Test-Path "..\..\electron\ollama-native.exe") {
        Write-Host "✓ Copied to electron folder!" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "Test it:" -ForegroundColor Yellow
    Write-Host '  .\ollama-native.exe deepseek-r1:1.5b "Write hello world"' -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "BUILD FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
}

