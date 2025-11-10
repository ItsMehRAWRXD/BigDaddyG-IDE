# BigDaddyG IDE - PowerShell CLI
# Agentic coding via PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$Version = "1.0.0"
$WorkingDirectory = Get-Location

function Show-Banner {
    Write-Host "BigDaddyG IDE PowerShell CLI v$Version" -ForegroundColor Cyan
    Write-Host "Type 'help' for available commands" -ForegroundColor Gray
    Write-Host ""
}

function Show-Help {
    Write-Host @"

📚 BigDaddyG IDE PowerShell Commands:

File Operations:
  open <file>          - Open file in editor
  create <file>        - Create new file
  edit <file>          - Edit file
  delete <file>        - Delete file
  ls [path]            - List files
  cd <path>            - Change directory
  pwd                  - Print working directory

Project Operations:
  init [type]          - Initialize new project
  run                  - Run current project
  build                - Build project
  test                 - Run tests

AI-Powered Commands:
  ai <prompt>          - Ask AI anything
  chat                 - Start AI chat session
  explain <file>       - Explain code
  fix <file>           - Fix bugs
  refactor <file>      - Refactor code
  generate <desc>      - Generate code

Git Commands:
  git <args>           - Execute git command

Utility:
  settings             - Show settings
  version              - Show version
  help                 - Show this help
  exit                 - Exit

Examples:
  .\bigdaddyg-cli.ps1 ai "create REST API"
  .\bigdaddyg-cli.ps1 fix main.js
  .\bigdaddyg-cli.ps1 generate "user auth system"

"@ -ForegroundColor Yellow
}

function Invoke-AI {
    param([string]$Prompt)
    
    Write-Host "🤖 AI: Processing..." -ForegroundColor Magenta
    Write-Host "Prompt: $Prompt" -ForegroundColor Gray
    
    # Connect to Node.js AI backend
    node bigdaddyg-cli.js ai $Prompt
}

function Initialize-Project {
    param([string]$Type = "node")
    
    Write-Host "Initializing $Type project..." -ForegroundColor Green
    
    $ProjectName = Read-Host "Project name"
    
    if (Test-Path $ProjectName) {
        Write-Host "Error: Directory already exists" -ForegroundColor Red
        return
    }
    
    New-Item -ItemType Directory -Path $ProjectName | Out-Null
    Set-Location $ProjectName
    
    switch ($Type) {
        "node" {
            npm init -y
            "console.log('Hello, World!');" | Out-File -FilePath "index.js"
            "# $ProjectName`n`nCreated with BigDaddyG IDE" | Out-File -FilePath "README.md"
        }
        "godot" {
            @"
config_version=5

[application]
config/name="$ProjectName"
run/main_scene="res://main.tscn"
config/features=PackedStringArray("4.2")
"@ | Out-File -FilePath "project.godot"
        }
        default {
            Write-Host "Unknown project type: $Type" -ForegroundColor Yellow
        }
    }
    
    Write-Host "✅ Project created!" -ForegroundColor Green
}

function Open-FileInEditor {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "Error: File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    Start-Process $FilePath
}

function New-ProjectFile {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        Write-Host "Error: File already exists" -ForegroundColor Red
        return
    }
    
    $Directory = Split-Path -Parent $FilePath
    if ($Directory -and -not (Test-Path $Directory)) {
        New-Item -ItemType Directory -Path $Directory -Force | Out-Null
    }
    
    "" | Out-File -FilePath $FilePath
    Write-Host "✅ Created: $FilePath" -ForegroundColor Green
}

function Remove-ProjectFile {
    param([string]$FilePath)
    
    if (-not (Test-Path $FilePath)) {
        Write-Host "Error: File not found: $FilePath" -ForegroundColor Red
        return
    }
    
    Remove-Item $FilePath -Force
    Write-Host "✅ Deleted: $FilePath" -ForegroundColor Green
}

function Show-Files {
    param([string]$Path = ".")
    
    Get-ChildItem -Path $Path | ForEach-Object {
        $Icon = if ($_.PSIsContainer) { "📁" } else { "📄" }
        Write-Host "  $Icon $($_.Name)"
    }
}

function Invoke-Git {
    param([string[]]$GitArgs)
    
    git @GitArgs
}

function Show-Version {
    Write-Host "BigDaddyG IDE CLI v$Version" -ForegroundColor Cyan
    Write-Host "PowerShell $($PSVersionTable.PSVersion)" -ForegroundColor Gray
    Write-Host "Platform: $($PSVersionTable.Platform)" -ForegroundColor Gray
}

function Show-Settings {
    Write-Host "CLI Settings:" -ForegroundColor Cyan
    Write-Host "  Working Directory: $(Get-Location)" -ForegroundColor Gray
    Write-Host "  PowerShell Version: $($PSVersionTable.PSVersion)" -ForegroundColor Gray
}

# Main execution
if (-not $Command) {
    Show-Banner
    
    # Interactive mode
    while ($true) {
        Write-Host "BigDaddyG> " -NoNewline -ForegroundColor Cyan
        $Input = Read-Host
        
        if ($Input -eq "exit") {
            Write-Host "Goodbye!" -ForegroundColor Green
            break
        }
        
        if ($Input) {
            $Parts = $Input -split " "
            $Cmd = $Parts[0]
            $CmdArgs = $Parts[1..($Parts.Length - 1)]
            
            switch ($Cmd) {
                "help" { Show-Help }
                "version" { Show-Version }
                "settings" { Show-Settings }
                "init" { Initialize-Project $CmdArgs[0] }
                "open" { Open-FileInEditor $CmdArgs[0] }
                "create" { New-ProjectFile $CmdArgs[0] }
                "delete" { Remove-ProjectFile $CmdArgs[0] }
                "ls" { Show-Files $CmdArgs[0] }
                "cd" { Set-Location $CmdArgs[0] }
                "pwd" { Get-Location }
                "ai" { Invoke-AI ($CmdArgs -join " ") }
                "git" { Invoke-Git $CmdArgs }
                "run" { node bigdaddyg-cli.js run }
                "build" { node bigdaddyg-cli.js build }
                "test" { node bigdaddyg-cli.js test }
                default { Write-Host "Unknown command: $Cmd" -ForegroundColor Red }
            }
        }
    }
} else {
    # Single command mode
    switch ($Command) {
        "help" { Show-Help }
        "version" { Show-Version }
        "settings" { Show-Settings }
        "init" { Initialize-Project $Args[0] }
        "open" { Open-FileInEditor $Args[0] }
        "create" { New-ProjectFile $Args[0] }
        "delete" { Remove-ProjectFile $Args[0] }
        "ls" { Show-Files $Args[0] }
        "ai" { Invoke-AI ($Args -join " ") }
        "git" { Invoke-Git $Args }
        default { node bigdaddyg-cli.js $Command @Args }
    }
}
