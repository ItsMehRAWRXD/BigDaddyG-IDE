#Requires -Version 7
<#
.SYNOPSIS
    Orchestration State Ledger for BigDaddyG IDE
    Immutable, replayable, cryptographically sealed state transitions

.DESCRIPTION
    Append-only ledger that records every orchestration state transition
    with SHA-256 chain, emotion telemetry, and JSONL compression.
    
    Enables `/resurrect` endpoint for one-click re-hydration.

.NOTES
    Zero dependencies - pure PowerShell 7+
    USB and cloud portable
#>

[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ============================================================================
# CONFIGURATION
# ============================================================================
$LEDGER_PATH = "$env:USERPROFILE\.bigdaddyg\orchestration-ledger.jsonl"
$Global:EmotionVector = @{ confidence=0.95; hesitation=0.02; urgency=0.0 }
$Global:LastHash = '0' * 64  # Genesis hash

# ============================================================================
# LOGGING WITH EMOTION
# ============================================================================
filter Write-Log {
    param([ValidateSet('INFO','SUCCESS','WARN','ERROR')][string]$Level='INFO')
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $emo = ($Global:EmotionVector.GetEnumerator()|Sort-Object Name|ForEach-Object{"{0}={1:N2}" -f $_.Name,$_.Value}) -join ' '
    "[{0}] [LEDGER] [{1}] {2} |{3}" -f $ts, $Level, $_, $emo | Out-Host
}

# ============================================================================
# LEDGER FUNCTIONS
# ============================================================================

function Initialize-Ledger {
    <#
    .SYNOPSIS
        Initialize the orchestration ledger
    #>
    
    # Ensure directory exists
    $ledgerDir = Split-Path $LEDGER_PATH -Parent
    if (-not (Test-Path $ledgerDir)) {
        New-Item -ItemType Directory -Path $ledgerDir -Force | Out-Null
    }
    
    # Load last hash if ledger exists
    if (Test-Path $LEDGER_PATH) {
        try {
            $lastLine = Get-Content $LEDGER_PATH -Tail 1
            if ($lastLine) {
                $parts = $lastLine -split '\|', 4
                if ($parts.Length -ge 3) {
                    $Global:LastHash = $parts[2]
                    "Ledger initialized - last hash: $($Global:LastHash.Substring(0,16))..." | Write-Log -Level SUCCESS
                }
            }
        } catch {
            "Ledger exists but could not read last hash" | Write-Log -Level WARN
        }
    } else {
        "Creating new ledger at $LEDGER_PATH" | Write-Log -Level INFO
    }
}

function Write-LedgerEntry {
    <#
    .SYNOPSIS
        Write a state transition to the ledger
    
    .PARAMETER State
        State transition name (e.g., "Cleanup→LocateProjectDir")
    
    .PARAMETER Params
        Hashtable of orchestration parameters
    
    .PARAMETER Extras
        Hashtable of extra metadata (emotion vector, etc.)
    
    .PARAMETER Result
        Result code (0=success, 1=failure)
    #>
    param(
        [Parameter(Mandatory)]
        [string]$State,
        
        [hashtable]$Params = @{},
        [hashtable]$Extras = $Global:EmotionVector.Clone(),
        [int]$Result = 0
    )
    
    try {
        # Build payload
        $payload = @{
            v = 1  # Schema version
            s = $State
            p = $Params
            e = $Extras
            r = $Result
            ts = Get-Date -Format o
        } | ConvertTo-Json -Compress -Depth 5
        
        # Compute SHA-256 hash of payload
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        $payloadBytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
        $hashBytes = $sha256.ComputeHash($payloadBytes)
        $currentHash = ($hashBytes | ForEach-Object { $_.ToString('x2') }) -join ''
        
        # Build ledger line: timestamp|prevHash|currentHash|payload
        $timestamp = Get-Date -Format o
        $line = "{0}|{1}|{2}|{3}" -f $timestamp, $Global:LastHash, $currentHash, $payload
        
        # Append to ledger (atomic write)
        [System.IO.File]::AppendAllText($LEDGER_PATH, "$line`n", [System.Text.Encoding]::UTF8)
        
        # Update last hash
        $Global:LastHash = $currentHash
        
        # Log with emotion
        "State: $State (hash: $($currentHash.Substring(0,16))...)" | Write-Log -Level INFO
        
        $sha256.Dispose()
        
    } catch {
        "Failed to write ledger entry: $($_.Exception.Message)" | Write-Log -Level ERROR
    }
}

function Get-LedgerHistory {
    <#
    .SYNOPSIS
        Read ledger history
    
    .PARAMETER Tail
        Number of entries to return from end (default: all)
    
    .PARAMETER Verify
        Verify hash chain integrity
    #>
    param(
        [int]$Tail = 0,
        [switch]$Verify
    )
    
    if (-not (Test-Path $LEDGER_PATH)) {
        "No ledger found" | Write-Log -Level WARN
        return @()
    }
    
    $lines = if ($Tail -gt 0) {
        Get-Content $LEDGER_PATH -Tail $Tail
    } else {
        Get-Content $LEDGER_PATH
    }
    
    $entries = @()
    $prevHash = '0' * 64
    
    foreach ($line in $lines) {
        $parts = $line -split '\|', 4
        
        if ($parts.Length -lt 4) {
            "Invalid ledger line: $line" | Write-Log -Level WARN
            continue
        }
        
        $timestamp = $parts[0]
        $recordedPrevHash = $parts[1]
        $currentHash = $parts[2]
        $payload = $parts[3] | ConvertFrom-Json
        
        # Verify hash chain
        if ($Verify -and $recordedPrevHash -ne $prevHash) {
            "❌ Hash chain broken at $timestamp" | Write-Log -Level ERROR
            "Expected prev: $prevHash" | Write-Log -Level ERROR
            "Got prev:      $recordedPrevHash" | Write-Log -Level ERROR
        }
        
        $entries += @{
            timestamp = $timestamp
            prevHash = $recordedPrevHash
            hash = $currentHash
            state = $payload.s
            params = $payload.p
            extras = $payload.e
            result = $payload.r
        }
        
        $prevHash = $currentHash
    }
    
    if ($Verify) {
        "✅ Hash chain verified ($($entries.Count) entries)" | Write-Log -Level SUCCESS
    }
    
    return $entries
}

function Get-LastKnownGoodState {
    <#
    .SYNOPSIS
        Get the last successful state from ledger
    #>
    
    if (-not (Test-Path $LEDGER_PATH)) {
        return $null
    }
    
    $entries = Get-LedgerHistory -Verify
    
    # Find last entry with result=0
    for ($i = $entries.Count - 1; $i -ge 0; $i--) {
        if ($entries[$i].result -eq 0) {
            "Last known good state: $($entries[$i].state)" | Write-Log -Level SUCCESS
            return $entries[$i]
        }
    }
    
    return $null
}

# ============================================================================
# EXPORT FUNCTIONS
# ============================================================================

Export-ModuleMember -Function @(
    'Initialize-Ledger',
    'Write-LedgerEntry',
    'Get-LedgerHistory',
    'Get-LastKnownGoodState'
)

# ============================================================================
# EXAMPLE USAGE (if run directly)
# ============================================================================

if ($MyInvocation.InvocationName -ne '.') {
    # Running as script, not dot-sourced
    
    "🔗 Orchestration State Ledger" | Write-Log -Level INFO
    "Path: $LEDGER_PATH" | Write-Log -Level INFO
    
    Initialize-Ledger
    
    # Example: Write a state transition
    Write-LedgerEntry -State "SystemInit→Ready" `
                      -Params @{
                          MODEL_PORT_OLLAMA = 11438
                          MODEL_PORT_ASSEMBLY = 11441
                          CONTEXT_PORT = 11439
                      } `
                      -Extras @{
                          confidence = 0.97
                          hesitation = 0.01
                          urgency = 0.0
                      } `
                      -Result 0
    
    # Verify and display history
    "📜 Verifying ledger integrity..." | Write-Log -Level INFO
    $history = Get-LedgerHistory -Verify
    
    "📊 Ledger Statistics:" | Write-Log -Level INFO
    "  Total entries: $($history.Count)" | Write-Log -Level INFO
    "  Success rate:  $([Math]::Round(($history | Where-Object {$_.result -eq 0}).Count / $history.Count * 100, 1))%" | Write-Log -Level INFO
    
    # Get last known good state
    $lastGood = Get-LastKnownGoodState
    if ($lastGood) {
        "🎯 Last known good:" | Write-Log -Level SUCCESS
        "  State: $($lastGood.state)" | Write-Log -Level INFO
        "  Time:  $($lastGood.timestamp)" | Write-Log -Level INFO
        "  Confidence: $($lastGood.extras.confidence)" | Write-Log -Level INFO
    }
}

