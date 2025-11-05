# OpenMemory - PowerShell-Native Cognitive Memory System
# Main module file - imports all submodules

# Import all modules
$modulePath = $PSScriptRoot
Import-Module "$modulePath\Modules\Storage.psm1" -Force -Global
Import-Module "$modulePath\Modules\Embed.psm1" -Force -Global
Import-Module "$modulePath\Modules\Query.psm1" -Force -Global
Import-Module "$modulePath\Modules\Decay.psm1" -Force -Global
Import-Module "$modulePath\Modules\Http.psm1" -Force -Global

# Initialize config
$script:OMConfig = @{
    memoryLength   = 5
    decayRate      = 0.95
    embeddingModel = 'nomic-embed-text'
    salienceBoost  = 0.2
    recencyBoost   = 0.2
}

function Initialize-OpenMemory {
    param(
        [string]$Path = "$PSScriptRoot\Store",
        [switch]$LocalOnly,
        [switch]$StartDecayJob,
        [switch]$StartHttpAPI,
        [int]$HttpPort = 8765
    )
    
    Write-Host "`n🧠 Initializing OpenMemory..." -ForegroundColor Cyan
    
    # Initialize storage
    Initialize-OMStorage -Root $Path
    
    # Start decay job if requested
    if ($StartDecayJob) {
        Start-OMDecayJob -IntervalMinutes 5
    }
    
    # Start HTTP API if requested
    if ($StartHttpAPI) {
        Start-OMHttpAPI -Port $HttpPort -Async
    }
    
    Write-Host "✅ OpenMemory ready!" -ForegroundColor Green
    Write-Host "💡 Quick start:" -ForegroundColor Cyan
    Write-Host "   Add-OMMemory 'Your memory' -UserId 'user123'" -ForegroundColor Gray
    Write-Host "   Search-OMMemory 'query' -UserId 'user123'" -ForegroundColor Gray
    Write-Host ""
}

function Stop-OpenMemory {
    Write-Host "`n⏸️ Stopping OpenMemory..." -ForegroundColor Yellow
    
    Stop-OMDecayJob
    Stop-OMHttpAPI
    Save-OMStorage
    
    Write-Host "✅ OpenMemory stopped cleanly" -ForegroundColor Green
}

# Export main functions
Export-ModuleMember -Function @(
    'Initialize-OpenMemory',
    'Stop-OpenMemory',
    # Storage
    'Add-OMMemory',
    'Get-OMMemory',
    'Remove-OMMemory',
    'Get-OMUserSummary',
    'Update-OMUserSummary',
    'Clear-OMStorage',
    # Embedding
    'Get-OMEmbedding',
    'Get-OMCosineSimilarity',
    # Query
    'Search-OMMemory',
    'Get-OMContextWindow',
    # Decay
    'Start-OMDecayJob',
    'Stop-OMDecayJob',
    'Invoke-OMDecay',
    # HTTP
    'Start-OMHttpAPI',
    'Stop-OMHttpAPI',
    'Update-OMConfig'
)

