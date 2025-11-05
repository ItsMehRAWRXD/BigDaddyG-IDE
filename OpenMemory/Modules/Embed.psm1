# OpenMemory Embedding Module
# Generates embeddings via Ollama or synthetic fallback

function Get-OMEmbedding {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Text,
        
        [string]$Model = 'nomic-embed-text'
    )
    
    # 1. Try local Ollama first
    try {
        $body = @{
            model  = $Model
            prompt = $Text
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri 'http://localhost:11434/api/embeddings' `
            -Method Post `
            -Body $body `
            -ContentType 'application/json' `
            -TimeoutSec 2 `
            -ErrorAction Stop
        
        if ($response.embedding) {
            Write-Verbose "[OpenMemory] ✅ Got embedding from Ollama ($Model)"
            return $response.embedding
        }
    } catch {
        Write-Verbose "[OpenMemory] ⚠️ Ollama not available, using synthetic fallback"
    }
    
    # 2. Fallback: Synthetic hash vector (38 dimensions)
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha.ComputeHash($bytes)
    
    $vector = @()
    for ($i = 0; $i -lt 38; $i++) {
        $vector += [double]($hash[$i]) / 255.0
    }
    
    Write-Verbose "[OpenMemory] ✅ Generated synthetic embedding (38-dim)"
    return $vector
}

function Get-OMCosineSimilarity {
    param(
        [Parameter(Mandatory=$true)]
        [array]$VectorA,
        
        [Parameter(Mandatory=$true)]
        [array]$VectorB
    )
    
    if ($VectorA.Count -ne $VectorB.Count) {
        throw "Vector dimensions must match"
    }
    
    $dotProduct = 0.0
    $magA = 0.0
    $magB = 0.0
    
    for ($i = 0; $i -lt $VectorA.Count; $i++) {
        $dotProduct += $VectorA[$i] * $VectorB[$i]
        $magA += $VectorA[$i] * $VectorA[$i]
        $magB += $VectorB[$i] * $VectorB[$i]
    }
    
    $magA = [Math]::Sqrt($magA)
    $magB = [Math]::Sqrt($magB)
    
    if ($magA -eq 0 -or $magB -eq 0) {
        return 0.0
    }
    
    return $dotProduct / ($magA * $magB)
}

Export-ModuleMember -Function @(
    'Get-OMEmbedding',
    'Get-OMCosineSimilarity'
)

