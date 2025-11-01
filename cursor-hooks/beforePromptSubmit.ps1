# PowerShell Cursor Hook - Native Windows Version
param()

try {
    # Read and process stdin
    $payload = if ($input) {
        $input | Out-String
    } else {
        "{}"
    }

    # Auto-delete history if log gets too large (keep only last 100 lines)
    $LOG_FILE = "$env:TEMP\agent.log"
    $MAX_LINES = 100
    
    # Check if log exists and has too many lines
    if (Test-Path $LOG_FILE) {
        $lineCount = (Get-Content $LOG_FILE -ErrorAction SilentlyContinue | Measure-Object -Line).Lines
        if ($lineCount -gt $MAX_LINES) {
            # Keep only last 100 lines
            Get-Content $LOG_FILE -Tail $MAX_LINES -ErrorAction SilentlyContinue | Set-Content "$LOG_FILE.tmp" -ErrorAction SilentlyContinue
            if (Test-Path "$LOG_FILE.tmp") {
                Move-Item "$LOG_FILE.tmp" $LOG_FILE -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    # Log current entry
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    Add-Content $LOG_FILE "$timestamp beforeSubmitPrompt" -ErrorAction SilentlyContinue
    Add-Content $LOG_FILE $payload -ErrorAction SilentlyContinue

    # Auto-clear conversation history if payload is too large
    $payloadSize = [System.Text.Encoding]::UTF8.GetByteCount($payload)
    $MAX_PAYLOAD_SIZE = 500000  # 500KB threshold

    if ($payloadSize -gt $MAX_PAYLOAD_SIZE) {
        Add-Content $LOG_FILE "$timestamp AUTO-CLEAR: Payload too large ($payloadSize bytes). Clearing conversation history..." -ErrorAction SilentlyContinue
        
        # Clear conversation history using PowerShell JSON handling
        try {
            $jsonObj = $payload | ConvertFrom-Json -ErrorAction Stop
            if ($jsonObj.PSObject.Properties.Name -contains "conversationHistory") {
                $jsonObj.conversationHistory = @()
                $payload = $jsonObj | ConvertTo-Json -Depth 100 -Compress
            }
        } catch {
            # If JSON parsing fails, keep original payload
        }
    }

    # Return the (potentially modified) payload
    Write-Output $payload
} catch {
    # Fallback: return original input or empty JSON
    Write-Output "{}"
}