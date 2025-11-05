# OpenMemory HTTP Module
# Lightweight REST API via HttpListener

$script:Listener = $null
$script:ListenerRunning = $false

function Start-OMHttpAPI {
    param(
        [int]$Port = 8765,
        [switch]$Async
    )
    
    if ($script:ListenerRunning) {
        Write-Warning "[OpenMemory] ⚠️ HTTP API already running"
        return
    }
    
    $script:Listener = [System.Net.HttpListener]::new()
    $script:Listener.Prefixes.Add("http://localhost:$Port/")
    
    try {
        $script:Listener.Start()
        $script:ListenerRunning = $true
        Write-Host "[OpenMemory] 🌐 HTTP API listening on http://localhost:$Port/" -ForegroundColor Green
        Write-Host "[OpenMemory] 💡 Endpoints:" -ForegroundColor Cyan
        Write-Host "   POST /memory/add" -ForegroundColor Gray
        Write-Host "   POST /memory/query" -ForegroundColor Gray
        Write-Host "   GET  /memory/list" -ForegroundColor Gray
        Write-Host "   POST /config/update" -ForegroundColor Gray
        Write-Host "   GET  /dashboard" -ForegroundColor Gray
    } catch {
        Write-Error "[OpenMemory] ❌ Failed to start HTTP API: $_"
        return
    }
    
    $listenerLoop = {
        while ($script:Listener.IsListening) {
            try {
                $context = $script:Listener.GetContext()
                $request = $context.Request
                $response = $context.Response
                
                $json = Handle-OMRequest -Request $request
                
                $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
                $response.ContentType = 'application/json'
                $response.ContentLength64 = $buffer.Length
                $response.Headers.Add('Access-Control-Allow-Origin', '*')
                $response.OutputStream.Write($buffer, 0, $buffer.Length)
                $response.Close()
            } catch {
                Write-Warning "[OpenMemory] ⚠️ Request error: $_"
            }
        }
    }
    
    if ($Async) {
        Start-Job -ScriptBlock $listenerLoop -Name 'OpenMemory-HTTP' | Out-Null
        Write-Host "[OpenMemory] 🔄 API running in background job" -ForegroundColor Green
    } else {
        & $listenerLoop
    }
}

function Stop-OMHttpAPI {
    if ($script:Listener -and $script:ListenerRunning) {
        $script:Listener.Stop()
        $script:Listener.Close()
        $script:ListenerRunning = $false
        
        Get-Job -Name 'OpenMemory-HTTP' -ErrorAction SilentlyContinue | Stop-Job | Remove-Job
        
        Write-Host "[OpenMemory] ⏸️ HTTP API stopped" -ForegroundColor Yellow
    }
}

function Handle-OMRequest {
    param($Request)
    
    $method = $Request.HttpMethod
    $url = $Request.RawUrl
    
    try {
        # Parse request body if present
        $body = $null
        if ($Request.HasEntityBody) {
            $reader = [System.IO.StreamReader]::new($Request.InputStream)
            $bodyText = $reader.ReadToEnd()
            $body = $bodyText | ConvertFrom-Json
        }
        
        # Route requests
        if ($method -eq 'POST' -and $url -eq '/memory/add') {
            $memory = Add-OMMemory -Content $body.content -UserId $body.user_id -Sector $body.sector -Salience $body.salience
            return $memory | ConvertTo-Json -Depth 10
        }
        elseif ($method -eq 'POST' -and $url -eq '/memory/query') {
            $results = Search-OMMemory -Query $body.query -UserId $body.user_id -K $body.k
            return $results | ConvertTo-Json -Depth 10
        }
        elseif ($method -eq 'GET' -and $url -eq '/memory/list') {
            return $script:Memories | ConvertTo-Json -Depth 10
        }
        elseif ($method -eq 'POST' -and $url -eq '/config/update') {
            Update-OMConfig -Config $body
            return '{"status":"ok","message":"Config updated"}' | ConvertTo-Json
        }
        elseif ($method -eq 'GET' -and $url -eq '/dashboard') {
            $dashboardPath = "$PSScriptRoot\..\Dashboard\dashboard.html"
            if (Test-Path $dashboardPath) {
                return Get-Content $dashboardPath -Raw
            }
            return '{"error":"Dashboard not found"}'
        }
        else {
            return '{"error":"Not found","method":"' + $method + '","url":"' + $url + '"}'
        }
    } catch {
        Write-Warning "[OpenMemory] ⚠️ Handler error: $_"
        return '{"error":"' + $_.Exception.Message + '"}'
    }
}

function Update-OMConfig {
    param([hashtable]$Config)
    
    if (-not $script:OMConfig) {
        $script:OMConfig = @{}
    }
    
    foreach ($key in $Config.Keys) {
        $script:OMConfig[$key] = $Config[$key]
    }
    
    Write-Host "[OpenMemory] ⚙️ Config updated: $($Config.Keys -join ', ')" -ForegroundColor Cyan
}

Export-ModuleMember -Function @(
    'Start-OMHttpAPI',
    'Stop-OMHttpAPI',
    'Update-OMConfig'
)

Export-ModuleMember -Variable @('OMConfig')

