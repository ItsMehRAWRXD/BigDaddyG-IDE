# OpenMemory Decay Module
# Manages memory salience and decay over time

$script:DecayJobRunning = $false

function Start-OMDecayJob {
    param(
        [int]$IntervalMinutes = 5,
        
        [double]$DecayMultiplier = 0.95,
        
        [double]$SalienceReduction = 0.05
    )
    
    if ($script:DecayJobRunning) {
        Write-Warning "[OpenMemory] ⚠️ Decay job already running"
        return
    }
    
    $script:DecayJobRunning = $true
    
    $decayScript = {
        param($StoreRoot, $DecayMultiplier, $SalienceReduction)
        
        Import-Module "$using:PSScriptRoot\Storage.psm1" -Force
        Initialize-OMStorage -Root $StoreRoot
        
        $threshold = [datetime]::UtcNow.AddMinutes(-5)
        $updated = 0
        
        foreach ($memory in $script:Memories) {
            $accessed = [datetime]::Parse($memory.accessed)
            
            if ($accessed -lt $threshold) {
                # Apply decay
                $memory.decay = [Math]::Max(0.1, $memory.decay * $DecayMultiplier)
                $memory.salience = [Math]::Max(0, $memory.salience - $SalienceReduction)
                $updated++
            }
        }
        
        if ($updated -gt 0) {
            Save-OMStorage -Quiet
            Write-Host "[OpenMemory] 🔄 Decayed $updated memories" -ForegroundColor Yellow
        }
    }
    
    # Register scheduled job
    try {
        $trigger = New-JobTrigger -Once -At (Get-Date).AddMinutes($IntervalMinutes) -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) -RepeatIndefinitely
        
        Register-ScheduledJob -Name 'OpenMemory-Decay' `
            -ScriptBlock $decayScript `
            -ArgumentList $script:StoreRoot, $DecayMultiplier, $SalienceReduction `
            -Trigger $trigger `
            -ErrorAction Stop | Out-Null
        
        Write-Host "[OpenMemory] ⏰ Decay job started (interval: $IntervalMinutes min)" -ForegroundColor Green
    } catch {
        Write-Warning "[OpenMemory] ⚠️ Could not register scheduled job, using timer instead"
        
        # Fallback to timer
        $timer = New-Object System.Timers.Timer
        $timer.Interval = $IntervalMinutes * 60 * 1000
        $timer.AutoReset = $true
        
        Register-ObjectEvent -InputObject $timer -EventName Elapsed -Action $decayScript | Out-Null
        $timer.Start()
        
        $script:DecayTimer = $timer
    }
}

function Stop-OMDecayJob {
    try {
        Unregister-ScheduledJob -Name 'OpenMemory-Decay' -Force -ErrorAction SilentlyContinue
        
        if ($script:DecayTimer) {
            $script:DecayTimer.Stop()
            $script:DecayTimer.Dispose()
        }
        
        $script:DecayJobRunning = $false
        Write-Host "[OpenMemory] ⏸️ Decay job stopped" -ForegroundColor Yellow
    } catch {
        Write-Warning "[OpenMemory] ⚠️ Error stopping decay job: $_"
    }
}

function Invoke-OMDecay {
    param(
        [double]$DecayMultiplier = 0.95,
        [double]$SalienceReduction = 0.05
    )
    
    $threshold = [datetime]::UtcNow.AddMinutes(-5)
    $updated = 0
    
    foreach ($memory in $script:Memories) {
        $accessed = [datetime]::Parse($memory.accessed)
        
        if ($accessed -lt $threshold) {
            $memory.decay = [Math]::Max(0.1, $memory.decay * $DecayMultiplier)
            $memory.salience = [Math]::Max(0, $memory.salience - $SalienceReduction)
            $updated++
        }
    }
    
    if ($updated -gt 0) {
        Save-OMStorage -Quiet
        Write-Host "[OpenMemory] 🔄 Manually decayed $updated memories" -ForegroundColor Yellow
    } else {
        Write-Host "[OpenMemory] ℹ️ No memories needed decay" -ForegroundColor Gray
    }
}

Export-ModuleMember -Function @(
    'Start-OMDecayJob',
    'Stop-OMDecayJob',
    'Invoke-OMDecay'
)

