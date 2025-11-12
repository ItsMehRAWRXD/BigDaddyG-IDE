# 📦 PowerShell Compiler & Tooling Guide

## 🎯 Current Status

### ✅ **What's Included**

**PowerShell Support in BigDaddyG IDE:**

1. **PowerShell CLI** (`bigdaddyg-cli.ps1`)
   - Custom AI-powered PowerShell interface
   - File operations, project management, AI commands
   - Full integration with IDE features

2. **PowerShell Script Execution**
   - Run `.ps1` scripts directly in integrated terminal
   - Full PowerShell 5.1 and PowerShell 7+ support
   - Windows PowerShell and pwsh compatibility

3. **24+ Built-in PowerShell Scripts**
   - Build automation scripts
   - Testing scripts
   - Deployment scripts
   - System monitoring scripts
   - Integration scripts

4. **PowerShell Syntax Highlighting**
   - Full syntax highlighting for `.ps1` files
   - IntelliSense for PowerShell cmdlets
   - Auto-completion for PowerShell variables

5. **Terminal Integration**
   - PowerShell as default terminal option
   - Run PowerShell commands directly
   - Output parsing and formatting

---

## ❌ **What's NOT Included (But Can Be Added)**

### **PowerShell Compilers/Converters**

The following PowerShell compilation tools are **NOT included** by default but can be easily added:

1. **ps2exe** - Convert PowerShell scripts to executable files
2. **PowerShell Pro Tools** - Commercial PowerShell IDE with packaging
3. **PS2EXE-GUI** - GUI version of ps2exe
4. **IronPS2EXE** - Alternative PowerShell to EXE converter
5. **MSBuild PowerShell** - Build PowerShell modules
6. **PackageManagement** - PowerShell module packaging

---

## 🚀 How to Add PowerShell Compilers

### **Option 1: Install ps2exe (Recommended)**

**ps2exe** is the most popular PowerShell to EXE converter.

#### Installation:

```powershell
# In BigDaddyG IDE Terminal:

# Install ps2exe from PowerShell Gallery
Install-Module -Name ps2exe -Scope CurrentUser

# Verify installation
Get-Command Invoke-ps2exe
```

#### Usage in BigDaddyG IDE:

```powershell
# Compile PowerShell script to EXE
Invoke-ps2exe -inputFile script.ps1 -outputFile script.exe

# With icon
Invoke-ps2exe -inputFile script.ps1 -outputFile script.exe -iconFile icon.ico

# With admin rights required
Invoke-ps2exe -inputFile script.ps1 -outputFile script.exe -requireAdmin

# Hide console window (GUI apps)
Invoke-ps2exe -inputFile script.ps1 -outputFile script.exe -noConsole
```

---

### **Option 2: PowerShell Pro Tools**

**Commercial solution with advanced features.**

#### Features:
- Visual Studio integration
- Module packaging
- Code signing
- Advanced obfuscation
- Professional support

#### Installation:
```powershell
# Purchase from: https://ironmansoftware.com/powershell-pro-tools

# Install via installer
# Then use in BigDaddyG IDE terminal
```

---

### **Option 3: PS2EXE-GUI**

**User-friendly GUI for ps2exe.**

#### Installation:

```powershell
# Download from: https://github.com/MScholtes/PS2EXE

# Or install via Chocolatey
choco install ps2exe

# Or install PowerShell module
Install-Module ps2exe -Scope CurrentUser
```

#### Usage:
- Launch GUI from terminal
- Select `.ps1` file
- Configure options
- Click "Compile"

---

## 🤖 AI-Powered PowerShell Compilation

### **Use BigDaddyG's AI to Compile**

Once ps2exe is installed, you can use AI commands:

```powershell
# In BigDaddyG IDE:

# Voice command:
"Compile this PowerShell script to an executable"

# Chat command:
> ai compile myscript.ps1 to exe

# CLI command:
.\bigdaddyg-cli.ps1 ai "compile PowerShell script to executable with icon"
```

**BigDaddyG AI will:**
1. Check if ps2exe is installed
2. If not, offer to install it
3. Compile the script with optimal settings
4. Handle errors automatically
5. Test the compiled executable

---

## 📦 PowerShell Module Packaging

### **Create PowerShell Modules**

BigDaddyG IDE supports PowerShell module development:

```powershell
# Create module structure
New-Item -ItemType Directory -Path "MyModule"
Set-Location MyModule

# Create module manifest
New-ModuleManifest -Path "MyModule.psd1" `
    -RootModule "MyModule.psm1" `
    -Author "Your Name" `
    -Description "My awesome module"

# Create module file
@"
function Get-Awesome {
    Write-Host "This is awesome!"
}
Export-ModuleMember -Function Get-Awesome
"@ | Out-File -FilePath "MyModule.psm1"

# Test module
Import-Module .\MyModule.psd1
Get-Awesome

# Publish to PowerShell Gallery
Publish-Module -Path . -NuGetApiKey "your-api-key"
```

---

## 🔧 Advanced PowerShell Features in BigDaddyG

### **1. PowerShell Script Analysis**

```powershell
# Built-in linting
Invoke-ScriptAnalyzer -Path script.ps1

# AI-powered analysis
.\bigdaddyg-cli.ps1 analyze script.ps1
```

### **2. PowerShell Debugging**

```powershell
# Set breakpoints
Set-PSBreakpoint -Script script.ps1 -Line 10

# Run with debugger
Debug-PSScript script.ps1
```

### **3. PowerShell Profiling**

```powershell
# Measure script performance
Measure-Command { .\script.ps1 }

# Profile with AI
.\bigdaddyg-cli.ps1 profile script.ps1
```

---

## 🎮 PowerShell for Game Development

### **Automation Scripts**

```powershell
# Build game with PowerShell
.\build-game.ps1 -Engine "Godot" -Platform "Windows"

# Deploy game
.\deploy-game.ps1 -Destination "Steam"

# Run tests
.\test-game.ps1 -TestSuite "All"
```

**Example: Godot Build Script**

```powershell
# build-godot-game.ps1

param(
    [string]$ProjectPath = ".",
    [string]$Platform = "Windows",
    [string]$BuildType = "Release"
)

Write-Host "Building Godot game..." -ForegroundColor Green

# Find Godot executable
$godot = "C:\Program Files\Godot\godot.exe"

# Export game
& $godot --headless --export $Platform "$ProjectPath\builds\game.exe"

Write-Host "Build complete!" -ForegroundColor Green
```

---

## 🔒 Code Signing PowerShell Scripts

### **Sign Scripts for Security**

```powershell
# Get code signing certificate
$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert

# Sign script
Set-AuthenticodeSignature -FilePath script.ps1 -Certificate $cert

# Verify signature
Get-AuthenticodeSignature script.ps1
```

---

## 📊 PowerShell Best Practices in BigDaddyG

### **1. Use Strict Mode**

```powershell
Set-StrictMode -Version Latest
```

### **2. Error Handling**

```powershell
try {
    # Your code
}
catch {
    Write-Error "Error: $_"
}
finally {
    # Cleanup
}
```

### **3. Parameter Validation**

```powershell
param(
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string]$Required,
    
    [ValidateSet("Option1", "Option2")]
    [string]$Limited = "Option1"
)
```

---

## 🚀 Quick Setup Guide

### **Complete PowerShell Development Environment**

```powershell
# 1. Install ps2exe
Install-Module -Name ps2exe -Scope CurrentUser -Force

# 2. Install PSScriptAnalyzer (linting)
Install-Module -Name PSScriptAnalyzer -Scope CurrentUser -Force

# 3. Install Pester (testing)
Install-Module -Name Pester -Scope CurrentUser -Force

# 4. Install Plaster (templating)
Install-Module -Name Plaster -Scope CurrentUser -Force

# 5. Verify installations
Get-Module -ListAvailable ps2exe, PSScriptAnalyzer, Pester, Plaster
```

---

## 🎯 Integration with BigDaddyG Features

### **AI-Powered PowerShell Development**

```powershell
# Generate PowerShell script with AI
> ai generate a PowerShell script to monitor system resources

# Explain PowerShell code
> ai explain Get-Process | Where-Object {$_.CPU -gt 100}

# Fix PowerShell errors
> ai fix syntax error in script.ps1

# Optimize PowerShell script
> ai optimize this PowerShell script for performance
```

### **Team Collaboration**

- Share PowerShell scripts via team collaboration
- Code review PowerShell modules
- Pair program PowerShell automation

### **Version Control**

- Git integration for PowerShell projects
- Track `.ps1` file changes
- Branch management for PowerShell modules

---

## 📚 Included PowerShell Scripts

**BigDaddyG IDE comes with 24+ PowerShell scripts:**

1. `bigdaddyg-cli.ps1` - Main CLI interface
2. `build-tiered-system.ps1` - Build system
3. `build-ultimate-880gb.ps1` - Large build automation
4. `BUILD-STANDALONE-USB.ps1` - Portable USB creator
5. `create-bundled-installer.ps1` - Installer creation
6. `TEST-BIGDADDYG.ps1` - Testing framework
7. `integrate-team.ps1` - Team integration
8. `monitor-build.ps1` - Build monitoring
9. And 16+ more in `/orchestration/` folder

---

## ❓ FAQ

### **Q: Can I compile PowerShell to native executable?**

**A:** Yes, but with limitations. ps2exe converts to .NET executable, not native code. For true native compilation, consider rewriting in C# or Rust.

### **Q: Will compiled PowerShell scripts run on Linux?**

**A:** No, ps2exe creates Windows-only executables. For cross-platform, use:
- PowerShell scripts directly (works on Linux/Mac with pwsh)
- .NET Core for cross-platform binaries

### **Q: How do I hide my PowerShell source code?**

**A:** Options:
1. ps2exe compiles to .NET IL (can be decompiled)
2. Use code obfuscation tools
3. PowerShell Pro Tools has better obfuscation
4. For true protection, use compiled languages

### **Q: Can BigDaddyG AI write PowerShell scripts?**

**A:** YES! All 13 AI providers can generate, fix, and optimize PowerShell code. Just ask:
```powershell
> ai write a PowerShell script to backup files
```

---

## 🎉 Summary

### **What You Have:**
✅ PowerShell CLI built-in
✅ PowerShell script execution
✅ 24+ PowerShell automation scripts
✅ Syntax highlighting and IntelliSense
✅ AI-powered PowerShell development
✅ Terminal integration

### **What You Can Add (5 minutes):**
⚙️ ps2exe (PowerShell to EXE)
⚙️ PSScriptAnalyzer (linting)
⚙️ Pester (testing)
⚙️ Plaster (templating)
⚙️ PowerShell Pro Tools (optional, paid)

### **What You Get:**
🚀 Complete PowerShell development environment
🚀 Script compilation to executables
🚀 Professional module development
🚀 AI-powered automation
🚀 Team collaboration

---

## 🔗 Resources

**Official Documentation:**
- [PowerShell Docs](https://docs.microsoft.com/powershell)
- [ps2exe GitHub](https://github.com/MScholtes/PS2EXE)
- [PowerShell Gallery](https://www.powershellgallery.com/)

**BigDaddyG CLI Usage:**
```powershell
# Get help
.\bigdaddyg-cli.ps1 help

# Run AI command
.\bigdaddyg-cli.ps1 ai "your prompt here"
```

---

**⚡ Quick Install Command:**

```powershell
# Install everything you need in one command:
Install-Module ps2exe, PSScriptAnalyzer, Pester, Plaster -Scope CurrentUser -Force

# Verify:
Write-Host "✅ PowerShell development environment ready!" -ForegroundColor Green
```

---

*PowerShell compilers are not included by default, but can be installed in 5 minutes. BigDaddyG IDE provides full PowerShell development support out of the box!*

---

**Last Updated:** 2025-11-10
**Status:** ✅ PowerShell Development Ready
**Compiler Installation:** ⚙️ 5-Minute Setup Required
