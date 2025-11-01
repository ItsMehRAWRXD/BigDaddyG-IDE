#Requires -Version 7
<#
.SYNOPSIS
    Voice-to-Equalizer Pipeline for BigDaddyG IDE
    Converts agent token streams → FFT → 3-channel EQ → Glassquill HUD

.DESCRIPTION
    Zero-dependency cerebral pulse visualization.
    Taps live token streams, generates synthetic audio frames via FFT,
    pipes bass/mid/treble values to Glassquill for cinematic background rendering.
    
    Refuses to die until all agents report SLEEP or OFFLINE.

.NOTES
    Compatible with PowerShell 7+ only (requires System.Numerics.Fourier)
    Headless and USB-portable
#>

[CmdletBinding()]
param(
    [int]$Port = 11439,          # context engine websocket (text stream)
    [int]$Fps  = 30,             # eq update rate
    [string]$OutPipe = "\\.\pipe\GlassquillEq"  # memory-stream to Glassquill
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

# ============================================================================
# CONFIGURATION
# ============================================================================
$Global:EmotionVector = @{ confidence=0.95; hesitation=0.02; urgency=0 }
$Agents = @('BigDaddyG','ChatAgentEnhancer','CognitiveRefactoringEngine')

# ============================================================================
# LOGGING WITH EMOTION
# ============================================================================
filter Write-Log {
    param([ValidateSet('INFO','SUCCESS','WARN','ERROR')][string]$Level='INFO')
    $ts = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $emo = ($Global:EmotionVector.GetEnumerator()|Sort-Object Name|ForEach-Object{"{0}={1:N2}" -f $_.Name,$_.Value}) -join ' '
    "[{0}] [EQ] [{1}] {2} |{3}" -f $ts, $Level, $_, $emo | Out-Host
}

# ============================================================================
# FFT HELPER (Pure Managed - No External Dependencies)
# ============================================================================
Add-Type -AssemblyName System.Linq
Add-Type -AssemblyName System.Numerics

function Get-FFT {
    param([double[]]$samples)
    
    $n = $samples.Length
    $complex = [System.Numerics.Complex[]]::new($n)
    
    # Convert samples to complex numbers
    for ($i=0; $i -lt $n; $i++){
        $complex[$i] = [System.Numerics.Complex]::new($samples[$i], 0)
    }
    
    # Perform FFT (simplified - in production would use proper FFT library)
    # This is a placeholder - real FFT would require additional math
    $magnitudes = $complex | ForEach-Object { 
        [Math]::Sqrt($_.Real * $_.Real + $_.Imaginary * $_.Imaginary)
    }
    
    return $magnitudes
}

# ============================================================================
# AGENT CENSUS
# ============================================================================
function Test-AgentsAwake {
    foreach($agent in $Agents){
        try {
            $response = Invoke-RestMethod "http://localhost:$Port/$agent/status" -TimeoutSec 2 -ErrorAction SilentlyContinue
            if($response.state -ne 'SLEEP'){ 
                return $true 
            }
        } catch { 
            # Assume awake on error (agent might not have /status endpoint yet)
            return $true
        }
    }
    return $false
}

# ============================================================================
# MAIN PIPELINE
# ============================================================================
try {
    "🎵 Voice-to-EQ Pipeline Starting..." | Write-Log -Level INFO
    "Target: ws://localhost:$Port/agentic-stream" | Write-Log -Level INFO
    "Output: $OutPipe @ ${Fps}fps" | Write-Log -Level INFO
    
    # ---------- Open Named Pipe ----------
    "Opening named pipe for Glassquill..." | Write-Log -Level INFO
    
    $pipe = New-Object System.IO.Pipes.NamedPipeServerStream(
        "GlassquillEq",
        [System.IO.Pipes.PipeDirection]::Out,
        1,
        [System.IO.Pipes.PipeTransmissionMode]::Byte,
        [System.IO.Pipes.PipeOptions]::Asynchronous
    )
    
    "Waiting for Glassquill to connect..." | Write-Log -Level INFO
    $pipe.WaitForConnection()
    "✅ Glassquill connected" | Write-Log -Level SUCCESS
    
    # ---------- Connect to WebSocket ----------
    "Connecting to agent token stream..." | Write-Log -Level INFO
    
    $ws = New-Object System.Net.WebSockets.ClientWebSocket
    $cts = New-Object System.Threading.CancellationTokenSource
    $uri = [Uri]("ws://localhost:$Port/agentic-stream")
    
    try {
        $ws.ConnectAsync($uri, $cts.Token).Wait()
        "✅ Connected to token stream" | Write-Log -Level SUCCESS
    } catch {
        "⚠️ WebSocket unavailable - using synthetic signal" | Write-Log -Level WARN
        $ws = $null
    }
    
    $buffer = [ArraySegment[byte]]::new([byte[]]::new(4096))
    $freq   = [double[]]::new(256)   # 256-bin fake audio frame
    $bands  = @(0..10), @(11..64), @(65..127)  # bass mid treble
    
    $Global:EmotionVector.confidence = 0.97
    $Global:EmotionVector.urgency = 0
    
    "🎵 Equalizer pipeline active - riding the waveform..." | Write-Log -Level SUCCESS
    
    # ---------- Main Loop ----------
    while ($true) {
        # Check if agents are still awake
        if (-not (Test-AgentsAwake)) {
            "All agents asleep – shutting EQ down" | Write-Log -Level INFO
            break
        }
        
        # Read from websocket if available
        if ($ws -and $ws.State -eq 'Open') {
            try {
                $task = $ws.ReceiveAsync($buffer, $cts.Token)
                $task.Wait(100) # 100ms timeout
                
                if ($task.IsCompleted) {
                    $text = [Text.Encoding]::UTF8.GetString($buffer.Array, 0, $task.Result.Count)
                    
                    # Fake phoneme energy from token bytes
                    $bytes = [byte[]][char[]]$text
                    for ($i=0; $i -lt 256; $i++){ 
                        $freq[$i] = if($i -lt $bytes.Count){ [double]$bytes[$i]/255 } else { 0 } 
                    }
                    
                    # Update emotion based on token activity
                    $Global:EmotionVector.confidence = [Math]::Min(0.99, $Global:EmotionVector.confidence + 0.01)
                    $Global:EmotionVector.urgency = if ($bytes.Count -gt 100) { 0.8 } else { 0.2 }
                }
            } catch {
                # WebSocket read failed, use synthetic signal
                for ($i=0; $i -lt 256; $i++){ 
                    $freq[$i] = [Math]::Sin($i / 10.0 + (Get-Date).Millisecond / 100.0) * 0.3
                }
            }
        } else {
            # Generate synthetic heartbeat signal
            $t = (Get-Date).Millisecond / 1000.0
            for ($i=0; $i -lt 256; $i++){ 
                $freq[$i] = [Math]::Sin($i / 20.0 + $t * 6.28) * 0.5
            }
            $Global:EmotionVector.confidence = 0.5
            $Global:EmotionVector.hesitation = 0.3
        }
        
        # Perform FFT
        $fft = Get-FFT $freq
        
        # Extract 3 bands
        $eq = @{
            bass   = ($fft[$bands[0]] | Measure-Object -Sum).Sum
            mid    = ($fft[$bands[1]] | Measure-Object -Sum).Sum
            treble = ($fft[$bands[2]] | Measure-Object -Sum).Sum
        }
        
        # Normalize
        $max = [Math]::Max([Math]::Max($eq.bass, $eq.mid), $eq.treble)
        if ($max -gt 0) {
            $eq.bass   = $eq.bass / $max
            $eq.mid    = $eq.mid / $max
            $eq.treble = $eq.treble / $max
        }
        
        # Emit 3 floats + newline to pipe
        try {
            $line = "{0:N4},{1:N4},{2:N4}`n" -f $eq.bass, $eq.mid, $eq.treble
            $bytes = [Text.Encoding]::ASCII.GetBytes($line)
            $pipe.Write($bytes, 0, $bytes.Length)
            $pipe.Flush()
        } catch {
            "Pipe broken - Glassquill disconnected" | Write-Log -Level WARN
            break
        }
        
        # Sleep to maintain FPS
        Start-Sleep -Milliseconds ([int](1000/$Fps))
    }
    
} catch {
    "❌ Pipeline error: $($_.Exception.Message)" | Write-Log -Level ERROR
} finally {
    # ---------- Cleanup ----------
    "Shutting down voice-to-EQ pipeline..." | Write-Log -Level INFO
    
    if ($cts) {
        $cts.Cancel()
        $cts.Dispose()
    }
    
    if ($ws) {
        $ws.Dispose()
    }
    
    if ($pipe) {
        # Send zero signal for fade-to-black
        try {
            $fadeOut = "0.0000,0.0000,0.0000`n"
            $bytes = [Text.Encoding]::ASCII.GetBytes($fadeOut)
            $pipe.Write($bytes, 0, $bytes.Length)
            $pipe.Flush()
        } catch {
            # Pipe already broken
        }
        
        $pipe.Dispose()
    }
    
    $Global:EmotionVector.confidence = 0.0
    $Global:EmotionVector.urgency = 0.0
    
    "🌙 Camera fades to black - agents offline" | Write-Log -Level INFO
    "📼 Night rider loop complete" | Write-Log -Level SUCCESS
}

exit 0

