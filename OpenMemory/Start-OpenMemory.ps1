#Requires -Version 5.1
<#
.SYNOPSIS
    Starts OpenMemory with full services
.DESCRIPTION
    Initializes OpenMemory storage, starts decay job, and launches HTTP API
.EXAMPLE
    .\Start-OpenMemory.ps1
.EXAMPLE
    .\Start-OpenMemory.ps1 -Port 9000 -NoDecay
#>

param(
    [int]$Port = 8765,
    [switch]$NoDecay,
    [switch]$NoAPI
)

$ErrorActionPreference = 'Stop'

Write-Host @"

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🧠  OpenMemory - PowerShell Cognitive Engine  🧠          ║
║                                                              ║
║   Local-First | Vector Embeddings | Adaptive Decay          ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Import module
$modulePath = $PSScriptRoot
Import-Module "$modulePath\OpenMemory.psd1" -Force

# Initialize with services
Initialize-OpenMemory `
    -Path "$modulePath\Store" `
    -StartDecayJob:(-not $NoDecay) `
    -StartHttpAPI:(-not $NoAPI) `
    -HttpPort $Port

Write-Host @"

📊 Status:
   Storage: ✅ Ready
   Decay:   $(if($NoDecay){'⏸️ Disabled'}else{'✅ Active'})
   API:     $(if($NoAPI){'⏸️ Disabled'}else{"✅ http://localhost:$Port"})

💡 Usage Examples:
   Add-OMMemory "User prefers dark mode" -UserId "ada" -Sector Semantic
   Search-OMMemory "preferences" -UserId "ada" -K 5
   Get-OMUserSummary -UserId "ada"

🌐 API Endpoints:
   POST http://localhost:$Port/memory/add
   POST http://localhost:$Port/memory/query
   GET  http://localhost:$Port/memory/list
   POST http://localhost:$Port/config/update
   GET  http://localhost:$Port/dashboard

Press Ctrl+C to stop OpenMemory services...

"@ -ForegroundColor Gray

# Keep running
try {
    if (-not $NoAPI) {
        Write-Host "[OpenMemory] 🌐 API server running... (Press Ctrl+C to stop)" -ForegroundColor Green
        while ($true) {
            Start-Sleep -Seconds 1
        }
    }
} finally {
    Stop-OpenMemory
}

