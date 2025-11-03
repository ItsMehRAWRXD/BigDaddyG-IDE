# BigDaddyG IDE - AI Capability Testing Script
# Tests various aspects of the AI models

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   🧪 BigDaddyG AI Capability Test Suite" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Magenta

$orchestraUrl = "http://localhost:11441"

Write-Host "📡 Checking Orchestra Server..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$orchestraUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Orchestra Server online!`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Orchestra Server not running!" -ForegroundColor Red
    Write-Host "   Please launch BigDaddyG IDE first.`n" -ForegroundColor Yellow
    Write-Host "Press any key to exit..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Test Suite
$tests = @(
    @{
        Name = "1. Code Generation (Python)"
        Prompt = "Write a Python function to calculate fibonacci numbers using memoization"
        Category = "Coding"
    },
    @{
        Name = "2. Code Explanation"
        Prompt = "Explain what this does: def fib(n, memo={}): return n if n <= 1 else memo.setdefault(n, fib(n-1, memo) + fib(n-2, memo))"
        Category = "Understanding"
    },
    @{
        Name = "3. Algorithm Complexity"
        Prompt = "What's the time complexity of quicksort in best, average, and worst case?"
        Category = "CS Theory"
    },
    @{
        Name = "4. Debugging"
        Prompt = "Find the bug: int sum = 0; for(int i = 1; i <= 10; i++); { sum += i; } return sum;"
        Category = "Debugging"
    },
    @{
        Name = "5. Assembly Knowledge"
        Prompt = "Write x86 assembly to swap two registers without using a temporary register"
        Category = "Low-level"
    },
    @{
        Name = "6. Security Analysis"
        Prompt = "What's a buffer overflow vulnerability and how can it be exploited?"
        Category = "Security"
    },
    @{
        Name = "7. System Design"
        Prompt = "Design a URL shortener service. What are the key components?"
        Category = "Architecture"
    },
    @{
        Name = "8. Performance Optimization"
        Prompt = "How would you optimize a slow database query with multiple JOINs?"
        Category = "Optimization"
    },
    @{
        Name = "9. Multi-language (C++)"
        Prompt = "Write a C++ template function to reverse a container in-place"
        Category = "Advanced Coding"
    },
    @{
        Name = "10. Creative Problem Solving"
        Prompt = "You have 8 identical balls, one is heavier. Using a balance scale twice, how do you find it?"
        Category = "Logic"
    }
)

$results = @()
$testNum = 0

foreach ($test in $tests) {
    $testNum++
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "🧪 TEST $testNum/10: $($test.Name)" -ForegroundColor Yellow
    Write-Host "══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "Category: $($test.Category)" -ForegroundColor White
    Write-Host "Prompt: $($test.Prompt)`n" -ForegroundColor DarkGray
    
    Write-Host "⏳ Querying AI..." -ForegroundColor Yellow
    
    $startTime = Get-Date
    try {
        $body = @{
            prompt = $test.Prompt
            useContext = $true
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$orchestraUrl/api/chat" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -TimeoutSec 30
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "✅ Response received ($([math]::Round($duration, 2))s)`n" -ForegroundColor Green
        
        # Display response (truncated)
        $responseText = $response.response
        if ($responseText.Length -gt 300) {
            Write-Host "$($responseText.Substring(0, 300))..." -ForegroundColor White
        } else {
            Write-Host "$responseText" -ForegroundColor White
        }
        
        Write-Host "`n📊 Quality Assessment:" -ForegroundColor Cyan
        $score = 0
        
        # Simple quality checks
        if ($responseText.Length -gt 50) { $score += 2; Write-Host "  ✅ Detailed response (+2)" -ForegroundColor Green }
        if ($responseText -match "```|function|def|class|int|void") { $score += 2; Write-Host "  ✅ Contains code (+2)" -ForegroundColor Green }
        if ($responseText.Length -gt 200) { $score += 1; Write-Host "  ✅ Comprehensive (+1)" -ForegroundColor Green }
        if ($duration -lt 5) { $score += 2; Write-Host "  ✅ Fast response (+2)" -ForegroundColor Green }
        if ($duration -lt 3) { $score += 1; Write-Host "  ✅ Very fast! (+1)" -ForegroundColor Green }
        if ($responseText -match "error|sorry|cannot|don't know") { $score -= 2; Write-Host "  ⚠️ Uncertain response (-2)" -ForegroundColor Yellow }
        
        Write-Host "  Score: $score / 8`n" -ForegroundColor $(if($score -ge 6){"Green"}elseif($score -ge 4){"Yellow"}else{"Red"})
        
        $results += @{
            Test = $test.Name
            Category = $test.Category
            Duration = $duration
            Score = $score
            ResponseLength = $responseText.Length
            Success = $true
        }
        
    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        Write-Host "❌ Error: $($_.Exception.Message)`n" -ForegroundColor Red
        
        $results += @{
            Test = $test.Name
            Category = $test.Category
            Duration = $duration
            Score = 0
            ResponseLength = 0
            Success = $false
        }
    }
    
    Write-Host "Press any key to continue..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Write-Host "`n"
}

# Final Report
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "   📊 FINAL RESULTS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Magenta

$successfulTests = ($results | Where-Object { $_.Success }).Count
$avgScore = ($results | Measure-Object -Property Score -Average).Average
$avgDuration = ($results | Measure-Object -Property Duration -Average).Average
$totalScore = ($results | Measure-Object -Property Score -Sum).Sum

Write-Host "✅ Successful Tests: $successfulTests / $($tests.Count)" -ForegroundColor Green
Write-Host "⏱️ Average Response Time: $([math]::Round($avgDuration, 2))s" -ForegroundColor Cyan
Write-Host "📊 Average Score: $([math]::Round($avgScore, 1)) / 8" -ForegroundColor Yellow
Write-Host "🎯 Total Score: $totalScore / $($tests.Count * 8)`n" -ForegroundColor White

# Performance Rating
$percentage = ($totalScore / ($tests.Count * 8)) * 100
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Cyan
if ($percentage -ge 80) {
    Write-Host "🏆 RATING: EXCELLENT ($([math]::Round($percentage, 1))%)" -ForegroundColor Green
    Write-Host "   BigDaddyG AI is highly capable!" -ForegroundColor Green
} elseif ($percentage -ge 60) {
    Write-Host "⭐ RATING: VERY GOOD ($([math]::Round($percentage, 1))%)" -ForegroundColor Yellow
    Write-Host "   BigDaddyG AI performs well!" -ForegroundColor Yellow
} elseif ($percentage -ge 40) {
    Write-Host "✓ RATING: GOOD ($([math]::Round($percentage, 1))%)" -ForegroundColor Cyan
    Write-Host "   BigDaddyG AI is functional!" -ForegroundColor Cyan
} else {
    Write-Host "⚠️ RATING: NEEDS IMPROVEMENT ($([math]::Round($percentage, 1))%)" -ForegroundColor Red
    Write-Host "   Check model configuration!" -ForegroundColor Red
}
Write-Host "═══════════════════════════════════════════════`n" -ForegroundColor Cyan

# Category Breakdown
Write-Host "📋 Performance by Category:`n" -ForegroundColor Yellow
$results | Group-Object Category | ForEach-Object {
    $catScore = ($_.Group | Measure-Object -Property Score -Average).Average
    Write-Host "  $($_.Name): $([math]::Round($catScore, 1)) / 8" -ForegroundColor White
}

Write-Host "`n✅ Test complete! Results saved to test-results.json`n" -ForegroundColor Green

# Save results
$results | ConvertTo-Json | Out-File "test-results.json"

Write-Host "Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

