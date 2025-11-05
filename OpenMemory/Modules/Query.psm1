# OpenMemory Query Module
# Cosine similarity + composite scoring

function Search-OMMemory {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Query,
        
        [string]$UserId,
        
        [int]$K = 5,
        
        [string[]]$Sectors = @('Semantic', 'Episodic'),
        
        [hashtable]$Weights = @{
            similarity = 0.6
            salience   = 0.2
            recency    = 0.2
        }
    )
    
    # Generate query embedding
    $queryVector = Get-OMEmbedding $Query
    
    # Filter vectors by sector
    $candidates = $script:Vectors | Where-Object { $Sectors -contains $_.sector }
    
    # Calculate similarity scores
    $scored = foreach ($vec in $candidates) {
        $similarity = Get-OMCosineSimilarity $queryVector $vec.vector
        
        # Find corresponding memory
        $memory = $script:Memories | Where-Object { $_.id -eq $vec.id }
        
        if (-not $memory) { continue }
        
        # Filter by user if specified
        if ($UserId -and $memory.user_id -ne $UserId) { continue }
        
        # Calculate recency boost
        $created = [datetime]::Parse($memory.created)
        $age = ([datetime]::UtcNow - $created).TotalMinutes
        $recencyBoost = [Math]::Exp(-$age / 1440.0) # Decay over 24 hours
        
        # Composite score
        $score = ($Weights.similarity * $similarity) + 
                 ($Weights.salience * $memory.salience / 10.0) +
                 ($Weights.recency * $recencyBoost * $memory.decay)
        
        [PSCustomObject]@{
            Memory     = $memory
            Similarity = [Math]::Round($similarity, 4)
            Score      = [Math]::Round($score, 4)
        }
    }
    
    # Return top K results
    $results = $scored | Sort-Object Score -Descending | Select-Object -First $K
    
    # Update access times
    foreach ($result in $results) {
        $result.Memory.accessed = [datetime]::UtcNow.ToString('o')
    }
    
    Save-OMStorage -Quiet
    
    Write-Host "[OpenMemory] 🔍 Found $($results.Count) memories for query: $($Query.Substring(0, [Math]::Min(50, $Query.Length)))..." -ForegroundColor Cyan
    
    return $results
}

function Get-OMContextWindow {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Query,
        
        [string]$UserId,
        
        [int]$MaxTokens = 2000
    )
    
    $results = Search-OMMemory -Query $Query -UserId $UserId -K 10
    
    $context = @()
    $totalLength = 0
    
    foreach ($result in $results) {
        $content = $result.Memory.content
        $length = $content.Length
        
        if (($totalLength + $length) -gt $MaxTokens) {
            break
        }
        
        $context += "[Score: $($result.Score)] $content"
        $totalLength += $length
    }
    
    return $context -join "`n`n"
}

Export-ModuleMember -Function @(
    'Search-OMMemory',
    'Get-OMContextWindow'
)

