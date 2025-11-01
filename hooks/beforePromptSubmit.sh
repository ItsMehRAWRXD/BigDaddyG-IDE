#!/bin/bash
# BigDaddyG IDE - Before Prompt Submit Hook
# Production-ready pre-prompt processing with security hardening
# Like Cursor's hook but BETTER and SAFER

# ============================================================================
# CONFIGURATION
# ============================================================================

# Service ports
MODEL_PORT_OLLAMA=${MODEL_PORT_OLLAMA:-11434}
MODEL_PORT_BIGDADDYG=${MODEL_PORT_BIGDADDYG:-11441}
ORCHESTRA_PORT=${ORCHESTRA_PORT:-3000}
CONTEXT_PORT=${CONTEXT_PORT:-11439}

# Retry settings
MAX_ATTEMPTS=${MAX_ATTEMPTS:-10}
SLEEP_INTERVAL=${SLEEP_INTERVAL:-0.5}
CLEANUP_DELAY=${CLEANUP_DELAY:-1}
HEALTH_CHECK_DELAY=${HEALTH_CHECK_DELAY:-2}

# Security settings
ENABLE_SHELL_INJECTION_CHECK=${ENABLE_SHELL_INJECTION_CHECK:-true}
ENABLE_SECRET_SCRUBBING=${ENABLE_SECRET_SCRUBBING:-true}
ENABLE_CONTEXT_ANALYSIS=${ENABLE_CONTEXT_ANALYSIS:-true}

# ============================================================================
# LOGGING
# ============================================================================

log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [BigDaddyG Hook] [$level] $message" >&2
}

# ============================================================================
# PLATFORM DETECTION
# ============================================================================

detect_platform() {
    case "$(uname -s)" in
        MINGW*|MSYS*|CYGWIN*) echo "windows" ;;
        Darwin*) echo "macos" ;;
        Linux*) echo "linux" ;;
        *) echo "unknown" ;;
    esac
}

PLATFORM=$(detect_platform)
log_message "INFO" "Platform detected: $PLATFORM"

# ============================================================================
# PORT CHECKING
# ============================================================================

check_port() {
    local port=$1
    
    if ! [[ "$port" =~ ^[0-9]+$ ]] || [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
        log_message "ERROR" "Invalid port number: $port"
        return 1
    fi
    
    case "$PLATFORM" in
        windows)
            powershell -Command "Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue" >/dev/null 2>&1
            return $?
            ;;
        macos|linux)
            if command -v lsof >/dev/null 2>&1; then
                lsof -i ":$port" >/dev/null 2>&1
                return $?
            elif command -v netstat >/dev/null 2>&1; then
                netstat -an | grep ":$port " | grep LISTEN >/dev/null 2>&1
                return $?
            else
                log_message "ERROR" "No port checking utility available"
                return 1
            fi
            ;;
    esac
}

wait_for_service() {
    local port=$1
    local service_name=${2:-"service"}
    local max_attempts=${3:-$MAX_ATTEMPTS}
    local attempt=0
    
    log_message "INFO" "Waiting for $service_name on port $port..."
    
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            log_message "SUCCESS" "$service_name is ready on port $port"
            return 0
        fi
        sleep $SLEEP_INTERVAL
        attempt=$((attempt + 1))
    done
    
    log_message "ERROR" "$service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

# ============================================================================
# SECURITY: SHELL INJECTION DETECTION
# ============================================================================

check_shell_injection() {
    local prompt="$1"
    
    if [ "$ENABLE_SHELL_INJECTION_CHECK" != "true" ]; then
        return 0
    fi
    
    # Dangerous patterns
    local dangerous_patterns=(
        "&&"
        "||"
        ";"
        "|"
        "\`"
        "\$("
        "rm -rf /"
        "format"
        "dd if="
        "> /dev/"
    )
    
    for pattern in "${dangerous_patterns[@]}"; do
        if echo "$prompt" | grep -qF "$pattern"; then
            log_message "WARNING" "Potentially dangerous pattern detected: $pattern"
            log_message "WARNING" "Prompt will be flagged for review"
            
            # Add warning to prompt
            echo "🛡️ SECURITY WARNING: Detected potentially dangerous pattern: $pattern"
            echo "The AI has been instructed to be extra cautious with this request."
            echo ""
        fi
    done
    
    return 0
}

# ============================================================================
# SECURITY: SECRET SCRUBBING
# ============================================================================

scrub_secrets() {
    local text="$1"
    
    if [ "$ENABLE_SECRET_SCRUBBING" != "true" ]; then
        echo "$text"
        return 0
    fi
    
    # Scrub common secret patterns (safe for shell - no complex regex)
    text=$(echo "$text" | sed -E 's/Bearer [A-Za-z0-9._-]{20,}/Bearer [REDACTED]/g')
    text=$(echo "$text" | sed -E 's/api[_-]?key[=:][A-Za-z0-9]{20,}/api_key=[REDACTED]/gi')
    text=$(echo "$text" | sed -E 's/sk-[A-Za-z0-9]{48}/sk-[REDACTED]/g')
    text=$(echo "$text" | sed -E 's/ghp_[A-Za-z0-9]{36}/ghp_[REDACTED]/g')
    
    echo "$text"
}

# ============================================================================
# CONTEXT ANALYSIS
# ============================================================================

analyze_context() {
    local prompt="$1"
    
    if [ "$ENABLE_CONTEXT_ANALYSIS" != "true" ]; then
        return 0
    fi
    
    # Detect intent
    local intent="general"
    
    if echo "$prompt" | grep -qiE "(compile|build|make)"; then
        intent="compilation"
        log_message "INFO" "Intent detected: Compilation task"
    elif echo "$prompt" | grep -qiE "(create|generate|write).*file"; then
        intent="file_creation"
        log_message "INFO" "Intent detected: File creation"
    elif echo "$prompt" | grep -qiE "(fix|debug|error)"; then
        intent="debugging"
        log_message "INFO" "Intent detected: Debugging"
    elif echo "$prompt" | grep -qiE "(explain|what|how)"; then
        intent="explanation"
        log_message "INFO" "Intent detected: Explanation request"
    elif echo "$prompt" | grep -qiE "@[a-zA-Z0-9._-]+"; then
        intent="file_reference"
        log_message "INFO" "Intent detected: File reference"
    fi
    
    echo "$intent"
}

# ============================================================================
# FILE REFERENCE EXTRACTION
# ============================================================================

extract_file_references() {
    local prompt="$1"
    local references=()
    
    # Extract @filename patterns
    while IFS= read -r line; do
        if [[ $line =~ @([a-zA-Z0-9._/-]+) ]]; then
            local filename="${BASH_REMATCH[1]}"
            if [ -f "$filename" ]; then
                references+=("$filename")
                log_message "INFO" "File reference found: $filename"
            else
                log_message "WARNING" "Referenced file not found: $filename"
            fi
        fi
    done <<< "$prompt"
    
    # Return comma-separated list
    if [ ${#references[@]} -gt 0 ]; then
        printf '%s\n' "${references[@]}" | paste -sd ','
    fi
}

# ============================================================================
# CONTEXT INJECTION
# ============================================================================

inject_context() {
    local prompt="$1"
    local references="$2"
    local intent="$3"
    
    # Build enhanced prompt
    local enhanced_prompt="$prompt"
    
    # Add file contents if references found
    if [ -n "$references" ]; then
        enhanced_prompt+="\n\n--- Referenced Files ---\n"
        
        IFS=',' read -ra FILES <<< "$references"
        for file in "${FILES[@]}"; do
            if [ -f "$file" ]; then
                enhanced_prompt+="\n--- $file ---\n"
                enhanced_prompt+=$(cat "$file")
                enhanced_prompt+="\n"
                log_message "INFO" "Injected file content: $file"
            fi
        done
    fi
    
    # Add intent-specific context
    case "$intent" in
        compilation)
            enhanced_prompt+="\n\n[System: User wants to compile code. Provide compilation commands and error fixing.]"
            ;;
        file_creation)
            enhanced_prompt+="\n\n[System: User wants to create files. Provide complete, working code.]"
            ;;
        debugging)
            enhanced_prompt+="\n\n[System: User needs debugging help. Analyze for errors and provide fixes.]"
            ;;
        explanation)
            enhanced_prompt+="\n\n[System: User wants an explanation. Be clear and detailed.]"
            ;;
    esac
    
    echo "$enhanced_prompt"
}

# ============================================================================
# MODEL SELECTION
# ============================================================================

select_optimal_model() {
    local intent="$1"
    local model="BigDaddyG:Latest"
    
    case "$intent" in
        compilation|file_creation)
            model="BigDaddyG:Code"
            ;;
        debugging)
            model="BigDaddyG:Debug"
            ;;
        explanation)
            model="BigDaddyG:Latest"
            ;;
        *)
            model="BigDaddyG:Latest"
            ;;
    esac
    
    log_message "INFO" "Selected model: $model"
    echo "$model"
}

# ============================================================================
# HEALTH CHECKS
# ============================================================================

check_orchestra_health() {
    if command -v curl >/dev/null 2>&1; then
        curl -s http://localhost:$ORCHESTRA_PORT/health >/dev/null 2>&1
        return $?
    fi
    return 1
}

check_bigdaddyg_health() {
    if command -v curl >/dev/null 2>&1; then
        curl -s http://localhost:$MODEL_PORT_BIGDADDYG/api/health >/dev/null 2>&1
        return $?
    fi
    return 1
}

# ============================================================================
# STARTUP CHECKS
# ============================================================================

ensure_services_running() {
    log_message "INFO" "Checking BigDaddyG services..."
    
    # Check Orchestra server
    if ! check_port $ORCHESTRA_PORT; then
        log_message "WARNING" "Orchestra server not running on port $ORCHESTRA_PORT"
        log_message "INFO" "Attempting to start Orchestra server..."
        
        # Try to start Orchestra (background)
        if [ -f "server/Orchestra-Server.js" ]; then
            node server/Orchestra-Server.js >/dev/null 2>&1 &
            sleep $HEALTH_CHECK_DELAY
        fi
    fi
    
    # Check BigDaddyG model server
    if ! check_port $MODEL_PORT_BIGDADDYG; then
        log_message "WARNING" "BigDaddyG model not running on port $MODEL_PORT_BIGDADDYG"
        log_message "INFO" "Model will be loaded on first query"
    fi
    
    # Verify health
    if check_orchestra_health; then
        log_message "SUCCESS" "Orchestra server healthy"
    else
        log_message "WARNING" "Orchestra server health check failed"
    fi
    
    if check_bigdaddyg_health; then
        log_message "SUCCESS" "BigDaddyG model healthy"
    else
        log_message "INFO" "BigDaddyG model will initialize on first use"
    fi
}

# ============================================================================
# PROMPT ENHANCEMENT
# ============================================================================

enhance_prompt() {
    local original_prompt="$1"
    
    log_message "INFO" "Processing prompt..."
    
    # 1. Security check
    check_shell_injection "$original_prompt"
    
    # 2. Scrub any secrets (in case user pastes sensitive data)
    local scrubbed_prompt=$(scrub_secrets "$original_prompt")
    
    # 3. Analyze context
    local intent=$(analyze_context "$scrubbed_prompt")
    
    # 4. Extract file references
    local references=$(extract_file_references "$scrubbed_prompt")
    
    # 5. Inject context and files
    local enhanced_prompt=$(inject_context "$scrubbed_prompt" "$references" "$intent")
    
    # 6. Select optimal model
    local selected_model=$(select_optimal_model "$intent")
    
    # 7. Add metadata header
    local final_prompt="[BigDaddyG IDE - Enhanced Prompt]
[Intent: $intent]
[Model: $selected_model]
[Safety: BALANCED]
[Context: $(echo "$enhanced_prompt" | wc -c) chars]

$enhanced_prompt"
    
    # Output the enhanced prompt
    echo "$final_prompt"
    
    log_message "SUCCESS" "Prompt enhanced and ready"
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    log_message "INFO" "╔════════════════════════════════════════════╗"
    log_message "INFO" "║  BigDaddyG IDE - Before Prompt Submit    ║"
    log_message "INFO" "╚════════════════════════════════════════════╝"
    
    # Ensure services are running
    ensure_services_running
    
    # Read prompt from stdin
    local prompt=""
    while IFS= read -r line; do
        prompt+="$line"$'\n'
    done
    
    # Enhance the prompt
    local enhanced=$(enhance_prompt "$prompt")
    
    # Output enhanced prompt to stdout
    echo "$enhanced"
    
    log_message "INFO" "Hook execution complete"
    return 0
}

# ============================================================================
# ERROR HANDLING
# ============================================================================

set -euo pipefail
trap 'log_message "ERROR" "Hook failed at line $LINENO"' ERR

# ============================================================================
# RUN
# ============================================================================

main "$@"

