#!/bin/sh
set -e

# Read response from stdin
if [ -t 0 ]; then
    response="{}"
else
    response=$(cat)
fi

# Get session data from temp file
SESSION_ID=""
START_TIME=""
if [ -f "/tmp/cursor_session.tmp" ]; then
    SESSION_ID=$(grep "SESSION_ID=" "/tmp/cursor_session.tmp" 2>/dev/null | cut -d'=' -f2 || echo "")
    START_TIME=$(grep "START_TIME=" "/tmp/cursor_session.tmp" 2>/dev/null | cut -d'=' -f2 || echo "")
fi

# Calculate duration
END_TIME=$(date +%s)
if [ -n "$START_TIME" ]; then
    DURATION=$((END_TIME - START_TIME))
else
    DURATION=0
fi

# Log response
if [ -w /tmp ]; then
    LOG_FILE="/tmp/agent.log"
    METRICS_FILE="/tmp/agent_metrics.json"
    
    # Log response size instead of full content for brevity
    response_size=$(printf "%s" "$response" | wc -c)
    
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [SESSION:$SESSION_ID] [AFTER] Completed in ${DURATION}s" >> "$LOG_FILE" 2>/dev/null || true
    echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [SESSION:$SESSION_ID] [AFTER] Response size: $response_size bytes" >> "$LOG_FILE" 2>/dev/null || true
    
    # Detect errors in response
    if echo "$response" | grep -qi "error\|exception\|failed" 2>/dev/null; then
        echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") [SESSION:$SESSION_ID] [AFTER] WARNING: Error detected in response" >> "$LOG_FILE" 2>/dev/null || true
    fi
    
    # Update metrics
    if [ -f "$METRICS_FILE" ]; then
        total_responses=$(grep -o '"total_responses":[0-9]*' "$METRICS_FILE" 2>/dev/null | cut -d':' -f2 || echo "0")
        total_responses=$((total_responses + 1))
        
        avg_duration=$(grep -o '"avg_duration_s":[0-9.]*' "$METRICS_FILE" 2>/dev/null | cut -d':' -f2 || echo "0")
        # Simple moving average
        if [ "$total_responses" -gt 1 ]; then
            avg_duration=$(echo "scale=2; ($avg_duration * ($total_responses - 1) + $DURATION) / $total_responses" | bc 2>/dev/null || echo "$DURATION")
        else
            avg_duration=$DURATION
        fi
    else
        total_responses=1
        avg_duration=$DURATION
    fi
    
    # Write updated metrics
    cat > "$METRICS_FILE" 2>/dev/null <<EOF || true
{
  "total_responses": $total_responses,
  "avg_duration_s": $avg_duration,
  "last_duration_s": $DURATION,
  "last_response": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "last_session_id": "$SESSION_ID"
}
EOF
fi

# Clean up session temp file
rm -f "/tmp/cursor_session.tmp" 2>/dev/null || true

# Return response unchanged
echo "$response"