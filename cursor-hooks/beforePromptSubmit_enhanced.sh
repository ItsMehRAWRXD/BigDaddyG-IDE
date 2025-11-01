#!/bin/sh
set -e

# Read and process stdin
payload=$(cat)

# Auto-delete history if log gets too large (keep only last 100 lines)
if [ -w /tmp ]; then
    LOG_FILE="/tmp/agent.log"
    MAX_LINES=100
    
    # Check if log exists and has too many lines
    if [ -f "$LOG_FILE" ]; then
        LINE_COUNT=$(wc -l < "$LOG_FILE" 2>/dev/null || echo "0")
        if [ "$LINE_COUNT" -gt "$MAX_LINES" ]; then
            # Keep only last 100 lines
            tail -n "$MAX_LINES" "$LOG_FILE" > "$LOG_FILE.tmp" 2>/dev/null && mv "$LOG_FILE.tmp" "$LOG_FILE" 2>/dev/null || true
        fi
    fi
    
    # Log current entry
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") beforeSubmitPrompt" >> "$LOG_FILE" 2>/dev/null || true
    echo "$payload" >> "$LOG_FILE" 2>/dev/null || true
fi

# Auto-clear conversation history if payload is too large
payload_size=$(echo "$payload" | wc -c)
MAX_PAYLOAD_SIZE=500000  # 500KB threshold

if [ "$payload_size" -gt "$MAX_PAYLOAD_SIZE" ]; then
    if [ -w /tmp ]; then
        echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") AUTO-CLEAR: Payload too large ($payload_size bytes). Clearing conversation history..." >> "$LOG_FILE" 2>/dev/null || true
    fi
    
    # Use jq if available to clear conversation history
    if command -v jq >/dev/null 2>&1; then
        payload=$(echo "$payload" | jq 'if .conversationHistory then .conversationHistory = [] else . end' 2>/dev/null || echo "$payload")
    fi
fi

# ENHANCEMENT: Validate Core Architecture Components (Methodology Point #10)
if [ -w /tmp ]; then
    ARCH_LOG="/tmp/architecture_health.log"
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") Architecture Health Check" >> "$ARCH_LOG" 2>/dev/null || true
    
    # Check Multi-AI Server (localhost:3003)
    if command -v curl >/dev/null 2>&1; then
        if curl -s --max-time 2 http://localhost:3003/health >/dev/null 2>&1; then
            echo "  [OK] Multi-AI Server (localhost:3003)" >> "$ARCH_LOG" 2>/dev/null || true
        else
            echo "  [WARN] Multi-AI Server (localhost:3003) unreachable" >> "$ARCH_LOG" 2>/dev/null || true
        fi
        
        # Check Ollama (localhost:11434)
        if curl -s --max-time 2 http://localhost:11434/api/tags >/dev/null 2>&1; then
            echo "  [OK] Ollama (localhost:11434)" >> "$ARCH_LOG" 2>/dev/null || true
        else
            echo "  [WARN] Ollama (localhost:11434) unreachable" >> "$ARCH_LOG" 2>/dev/null || true
        fi
        
        # Check LM Studio (localhost:5272)
        if curl -s --max-time 2 http://localhost:5272/v1/models >/dev/null 2>&1; then
            echo "  [OK] LM Studio (localhost:5272)" >> "$ARCH_LOG" 2>/dev/null || true
        else
            echo "  [INFO] LM Studio (localhost:5272) not running (optional)" >> "$ARCH_LOG" 2>/dev/null || true
        fi
    fi
    
    # Check D:\ workspace accessibility
    if [ -d "/d" ] || [ -d "D:/" ] || [ -d "/mnt/d" ]; then
        echo "  [OK] D:\\ workspace accessible" >> "$ARCH_LOG" 2>/dev/null || true
    else
        echo "  [WARN] D:\\ workspace not accessible via standard paths" >> "$ARCH_LOG" 2>/dev/null || true
    fi
    
    # Rotate architecture log (keep last 200 lines)
    if [ -f "$ARCH_LOG" ]; then
        LINE_COUNT=$(wc -l < "$ARCH_LOG" 2>/dev/null || echo "0")
        if [ "$LINE_COUNT" -gt 200 ]; then
            tail -n 200 "$ARCH_LOG" > "$ARCH_LOG.tmp" 2>/dev/null && mv "$ARCH_LOG.tmp" "$ARCH_LOG" 2>/dev/null || true
        fi
    fi
fi

# ENHANCEMENT: Consent System Integration Flag
# When payload contains write operations, inject consent reminder
if command -v jq >/dev/null 2>&1; then
    has_write_intent=$(echo "$payload" | jq -r 'if (.messages // [] | last | .content // "") | test("write|create|modify|delete|update"; "i") then "true" else "false" end' 2>/dev/null || echo "false")
    
    if [ "$has_write_intent" = "true" ]; then
        # Log write intent detection
        if [ -w /tmp ]; then
            echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") WRITE-INTENT detected - consent system should activate" >> "$LOG_FILE" 2>/dev/null || true
        fi
    fi
fi

# Return the (potentially modified) payload
echo "$payload"

