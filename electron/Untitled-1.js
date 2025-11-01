/**
 * BigDaddyG IDE - Ultra-Fast Autocomplete Engine
 * Copilot-style inline suggestions with sub-100ms latency
 * Powered by BigDaddyG in lightweight mode + smart caching
 */

// ============================================================================
// AUTOCOMPLETE CONFIGURATION
// ============================================================================

const AutocompleteConfig = {
    // Performance
    enabled: true,
    triggerDelay: 150,              // ms after typing stops
    maxLatency: 100,                // target response time (ms)
    streamTokens: true,             // stream suggestions character-by-character
    
    // Suggestion settings
    maxSuggestionLength: 200,       // characters
    multiLineSuggestions: true,     // suggest multiple lines
    minTriggerLength: 3,            // min characters before suggesting
    
    // Smart triggers
    triggerOnNewline: true,         // suggest after Enter
    triggerOnSpace: false,          // suggest after space
    triggerOnPunctuation: true,     // suggest after . ( { [ etc.
    triggerChars: ['\n', '.', '(', '{', '[', ':', '=', ';'],
    
    // Context
    contextLines: 50,               // lines of context to send
    useRecentEdits: true,           // include recent edits
    useOpenFiles: true,             // include other open files
    
    // Cache
    cacheEnabled: true,
    cacheSize: 1000,                // max cached suggestions
    cacheTTL: 300000,               // 5 minutes
    
    // BigDaddyG lightweight mode
    useStream: true,
    temperature: 0.2,               // low for predictable suggestions
    maxTokens: 50,                  // short for speed
    stopSequences: ['\n\n', '```', '---'],
    
    // UI
    showGhostText: true,            // show suggestion as gray text
    showInlineWidget: false,        // alternative: show as popup
    acceptKey: 'Tab',               // key to accept
    partialAcceptKey: 'Ctrl+Right', // accept word-by-word
    dismissKey: 'Escape'
};

// ============================================================================
// SUGGESTION CACHE
// ============================================================================

class SuggestionCache {
    constructor() {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
    }
    
    generateKey(context, cursorPos) {
        // Create cache key from context + cursor position
        const snippet = context.substring(Math.max(0, cursorPos - 100), cursorPos);
        return this.hashCode(snippet);
    }
    
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    
    get(context, cursorPos) {
        const key = this.generateKey(context, cursorPos);
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < AutocompleteConfig.cacheTTL) {
            this.hits++;
            console.log(`[Autocomplete] 🎯 Cache HIT (${this.hits}/${this.hits + this.misses})`);
            return cached.suggestion;
        }
        
        this.misses++;
        return null;
    }
    
    set(context, cursorPos, suggestion) {
        const key = this.generateKey(context, cursorPos);
        
        // Limit cache size
        if (this.cache.size >= AutocompleteConfig.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            suggestion,
            timestamp: Date.now()
        });
    }
    
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
        console.log('[Autocomplete] 🧹 Cache cleared');
    }
    
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(1) : 0;
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`
        };
    }
}

// ============================================================================
// AUTOCOMPLETE ENGINE
// ============================================================================

class AutocompleteEngine {
    constructor(editor) {
        this.editor = editor;
        this.cache = new SuggestionCache();
        this.currentSuggestion = null;
        this.suggestionWidget = null;
        this.debounceTimer = null;
        this.lastTriggerTime = 0;
        this.requestId = 0;
        this.activeRequest = null;
        
        this.init();
    }
    
    init() {
        console.log('[Autocomplete] 🚀 Initializing ultra-fast autocomplete...');
        
        // Create suggestion widget (ghost text)
        this.createSuggestionWidget();
        
        // Hook into editor events
        this.setupEventListeners();
        
        console.log('[Autocomplete] ✅ Autocomplete engine ready');
        console.log(`[Autocomplete] 💡 Press ${AutocompleteConfig.acceptKey} to accept suggestions`);
    }
    
    createSuggestionWidget() {
        if (!AutocompleteConfig.showGhostText) return;
        
        // Monaco editor integration
        if (this.editor && this.editor.createDecorationsCollection) {
            this.decorations = this.editor.createDecorationsCollection();
        }
    }
    
    setupEventListeners() {
        if (!this.editor) return;
        
        // Listen to content changes
        this.editor.onDidChangeModelContent((e) => {
            this.onContentChange(e);
        });
        
        // Listen to cursor position changes
        this.editor.onDidChangeCursorPosition((e) => {
            this.onCursorChange(e);
        });
        
        // Listen to keyboard
        this.editor.onKeyDown((e) => {
            this.onKeyDown(e);
        });
    }
    
    onContentChange(event) {
        if (!AutocompleteConfig.enabled) return;
        
        // Clear existing suggestion
        this.clearSuggestion();
        
        // Cancel previous debounce
        clearTimeout(this.debounceTimer);
        
        // Check if we should trigger
        const changes = event.changes;
        if (changes.length === 0) return;
        
        const lastChange = changes[changes.length - 1];
        const text = lastChange.text;
        
        // Immediate trigger on special chars
        if (this.shouldTriggerImmediate(text)) {
            this.debounceTimer = setTimeout(() => {
                this.triggerSuggestion();
            }, 50); // Very fast for immediate triggers
            return;
        }
        
        // Normal debounced trigger
        this.debounceTimer = setTimeout(() => {
            this.triggerSuggestion();
        }, AutocompleteConfig.triggerDelay);
    }
    
    onCursorChange(event) {
        // Clear suggestion if cursor moved (not just typing)
        if (this.currentSuggestion && event.reason !== 0) {
            this.clearSuggestion();
        }
    }
    
    onKeyDown(event) {
        // Handle accept key (Tab)
        if (event.code === 'Tab' && this.currentSuggestion) {
            event.preventDefault();
            this.acceptSuggestion();
            return;
        }
        
        // Handle partial accept (Ctrl+Right)
        if (event.ctrlKey && event.code === 'ArrowRight' && this.currentSuggestion) {
            event.preventDefault();
            this.acceptPartialSuggestion();
            return;
        }
        
        // Handle dismiss (Escape)
        if (event.code === 'Escape' && this.currentSuggestion) {
            event.preventDefault();
            this.clearSuggestion();
            return;
        }
    }
    
    shouldTriggerImmediate(text) {
        if (!AutocompleteConfig.triggerOnPunctuation) return false;
        return AutocompleteConfig.triggerChars.some(char => text.includes(char));
    }
    
    async triggerSuggestion() {
        const startTime = performance.now();
        this.requestId++;
        const currentRequestId = this.requestId;
        
        // Get context
        const context = this.getContext();
        if (!context) return;
        
        const { text, cursorPos, lineText, language } = context;
        
        // Min trigger length check
        if (lineText.trim().length < AutocompleteConfig.minTriggerLength) {
            return;
        }
        
        // Check cache first
        const cached = this.cache.get(text, cursorPos);
        if (cached) {
            const latency = performance.now() - startTime;
            console.log(`[Autocomplete] ⚡ Cached suggestion (${latency.toFixed(0)}ms)`);
            this.showSuggestion(cached);
            return;
        }
        
        // Cancel previous request
        if (this.activeRequest) {
            this.activeRequest.cancelled = true;
        }
        
        // Create request object
        const request = { cancelled: false };
        this.activeRequest = request;
        
        try {
            // Generate suggestion
            const suggestion = await this.generateSuggestion(context);
            
            // Check if request was cancelled
            if (request.cancelled || currentRequestId !== this.requestId) {
                console.log('[Autocomplete] 🚫 Request cancelled');
                return;
            }
            
            if (suggestion && suggestion.trim()) {
                const latency = performance.now() - startTime;
                console.log(`[Autocomplete] ✨ Suggestion generated (${latency.toFixed(0)}ms)`);
                
                // Cache the suggestion
                this.cache.set(text, cursorPos, suggestion);
                
                // Show it
                this.showSuggestion(suggestion);
                
                // Log performance
                if (latency > AutocompleteConfig.maxLatency * 2) {
                    console.warn(`[Autocomplete] ⚠️ Slow suggestion: ${latency.toFixed(0)}ms`);
                }
            }
        } catch (error) {
            console.error('[Autocomplete] ❌ Error generating suggestion:', error);
        } finally {
            this.activeRequest = null;
        }
    }
    
    getContext() {
        if (!this.editor) return null;
        
        const model = this.editor.getModel();
        if (!model) return null;
        
        const position = this.editor.getPosition();
        const lineContent = model.getLineContent(position.lineNumber);
        const textBeforeCursor = lineContent.substring(0, position.column - 1);
        
        // Get surrounding context
        const startLine = Math.max(1, position.lineNumber - AutocompleteConfig.contextLines);
        const endLine = Math.min(model.getLineCount(), position.lineNumber + 5);
        
        let contextText = '';
        for (let i = startLine; i <= position.lineNumber; i++) {
            contextText += model.getLineContent(i);
            if (i < position.lineNumber) contextText += '\n';
        }
        
        // Detect language
        const language = model.getLanguageId();
        
        return {
            text: contextText,
            cursorPos: contextText.length,
            lineText: lineContent,
            textBeforeCursor,
            position,
            language,
            model
        };
    }
    
    async generateSuggestion(context) {
        const { text, textBeforeCursor, language } = context;
        
        // Build prompt for BigDaddyG
        const prompt = this.buildPrompt(text, textBeforeCursor, language);
        
        // Call BigDaddyG in lightweight mode
        try {
            const response = await fetch('http://localhost:3000/api/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    stream: AutocompleteConfig.useStream,
                    temperature: AutocompleteConfig.temperature,
                    max_tokens: AutocompleteConfig.maxTokens,
                    stop: AutocompleteConfig.stopSequences,
                    // Special flag for autocomplete mode
                    mode: 'autocomplete'
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            let suggestion = data.response || data.completion || '';
            
            // Clean up suggestion
            suggestion = this.cleanSuggestion(suggestion, textBeforeCursor);
            
            return suggestion;
        } catch (error) {
            console.error('[Autocomplete] ❌ Failed to generate suggestion:', error);
            return null;
        }
    }
    
    buildPrompt(context, textBeforeCursor, language) {
        // Lightweight prompt for speed
        return `Complete the following ${language} code. Only provide the completion, no explanations:\n\n${context}`;
    }
    
    cleanSuggestion(suggestion, textBeforeCursor) {
        // Remove any duplicate text
        suggestion = suggestion.trim();
        
        // Don't suggest what's already there
        if (textBeforeCursor.endsWith(suggestion)) {
            return '';
        }
        
        // Limit length
        if (suggestion.length > AutocompleteConfig.maxSuggestionLength) {
            suggestion = suggestion.substring(0, AutocompleteConfig.maxSuggestionLength);
        }
        
        // Only single line if multiline disabled
        if (!AutocompleteConfig.multiLineSuggestions) {
            const firstLine = suggestion.split('\n')[0];
            suggestion = firstLine;
        }
        
        return suggestion;
    }
    
    showSuggestion(suggestion) {
        if (!suggestion || !this.editor) return;
        
        this.currentSuggestion = suggestion;
        
        if (AutocompleteConfig.showGhostText) {
            this.showGhostText(suggestion);
        } else if (AutocompleteConfig.showInlineWidget) {
            this.showInlineWidget(suggestion);
        }
    }
    
    showGhostText(suggestion) {
        const position = this.editor.getPosition();
        
        if (this.decorations) {
            // Monaco editor decoration
            this.decorations.set([{
                range: {
                    startLineNumber: position.lineNumber,
                    startColumn: position.column,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                },
                options: {
                    after: {
                        content: suggestion,
                        inlineClassName: 'autocomplete-ghost-text'
                    }
                }
            }]);
        }
    }
    
    showInlineWidget(suggestion) {
        // Alternative: show as popup widget
        // Implementation depends on editor framework
        console.log('[Autocomplete] Inline widget:', suggestion);
    }
    
    acceptSuggestion() {
        if (!this.currentSuggestion || !this.editor) return;
        
        const position = this.editor.getPosition();
        this.editor.executeEdits('autocomplete', [{
            range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            },
            text: this.currentSuggestion
        }]);
        
        console.log('[Autocomplete] ✅ Suggestion accepted');
        this.clearSuggestion();
    }
    
    acceptPartialSuggestion() {
        if (!this.currentSuggestion || !this.editor) return;
        
        // Accept one word at a time
        const words = this.currentSuggestion.split(/\s+/);
        if (words.length === 0) return;
        
        const firstWord = words[0] + (this.currentSuggestion.includes(' ') ? ' ' : '');
        
        const position = this.editor.getPosition();
        this.editor.executeEdits('autocomplete', [{
            range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            },
            text: firstWord
        }]);
        
        console.log('[Autocomplete] ➡️ Partial suggestion accepted');
        this.clearSuggestion();
    }
    
    clearSuggestion() {
        this.currentSuggestion = null;
        
        if (this.decorations) {
            this.decorations.clear();
        }
    }
    
    toggle() {
        AutocompleteConfig.enabled = !AutocompleteConfig.enabled;
        
        if (!AutocompleteConfig.enabled) {
            this.clearSuggestion();
        }
        
        console.log(`[Autocomplete] ${AutocompleteConfig.enabled ? '✅' : '🛑'} Autocomplete ${AutocompleteConfig.enabled ? 'enabled' : 'disabled'}`);
    }
    
    getStats() {
        return {
            enabled: AutocompleteConfig.enabled,
            cache: this.cache.getStats(),
            latency: `< ${AutocompleteConfig.maxLatency}ms target`
        };
    }
    
    destroy() {
        clearTimeout(this.debounceTimer);
        this.clearSuggestion();
        console.log('[Autocomplete] 🗑️ Autocomplete engine destroyed');
    }
}

// ============================================================================
// CSS STYLES FOR GHOST TEXT
// ============================================================================

function injectAutocompleteStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Autocomplete ghost text */
        .autocomplete-ghost-text {
            color: #666 !important;
            opacity: 0.5;
            font-style: italic;
        }
        
        /* Dark mode */
        .dark-theme .autocomplete-ghost-text {
            color: #888 !important;
        }
        
        /* High contrast for visibility */
        @media (prefers-contrast: high) {
            .autocomplete-ghost-text {
                opacity: 0.7;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let autocompleteEngine = null;

function initAutocomplete(editor) {
    if (!editor) {
        console.error('[Autocomplete] ❌ No editor provided');
        return null;
    }
    
    injectAutocompleteStyles();
    autocompleteEngine = new AutocompleteEngine(editor);
    
    // Global access
    window.autocompleteEngine = autocompleteEngine;
    
    return autocompleteEngine;
}

// ============================================================================
// CONTROL PANEL
// ============================================================================

function createAutocompleteControlPanel() {
    const panel = document.createElement('div');
    panel.id = 'autocomplete-controls';
    panel.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 20px;
        background: rgba(10, 10, 30, 0.95);
        backdrop-filter: blur(20px);
        border: 2px solid var(--cyan);
        border-radius: 12px;
        padding: 15px;
        z-index: 999996;
        display: none;
        min-width: 280px;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--cyan);">
            <div style="color: var(--cyan); font-weight: bold; font-size: 14px;">⚡ Autocomplete</div>
            <button onclick="toggleAutocompletePanel()" style="background: var(--red); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="autocomplete-enabled" checked onchange="toggleAutocomplete()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Enable Autocomplete</span>
            </label>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px;">Trigger Delay (ms):</label>
            <input type="range" id="autocomplete-delay" min="50" max="500" value="150" onchange="updateAutocompleteDelay(this.value)" style="width: 100%;">
            <div style="text-align: center; color: #666; font-size: 10px; margin-top: 3px;">
                <span id="autocomplete-delay-value">150</span>ms
            </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="autocomplete-multiline" checked onchange="toggleMultiline()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Multi-line Suggestions</span>
            </label>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="autocomplete-cache" checked onchange="toggleCache()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Enable Cache</span>
            </label>
        </div>
        
        <div id="autocomplete-stats" style="padding: 10px; background: rgba(0,212,255,0.1); border-radius: 6px; font-size: 10px; color: #888; margin-bottom: 10px;">
            <div style="font-weight: bold; color: #ccc; margin-bottom: 5px;">Stats:</div>
            <div>Cache: <span id="cache-hit-rate">0%</span> hit rate</div>
            <div>Suggestions: <span id="suggestion-count">0</span></div>
            <div>Avg Latency: <span id="avg-latency">0ms</span></div>
        </div>
        
        <div style="display: flex; gap: 5px;">
            <button onclick="clearAutocompleteCache()" style="flex: 1; background: var(--orange); color: white; border: none; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                🧹 Clear Cache
            </button>
            <button onclick="showAutocompleteStats()" style="flex: 1; background: var(--cyan); color: white; border: none; padding: 6px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                📊 Stats
            </button>
        </div>
        
        <div style="padding: 10px; background: rgba(0,255,136,0.1); border-radius: 6px; font-size: 10px; color: #888; text-align: center; margin-top: 10px;">
            <div style="font-weight: bold; color: #0f8;">Keyboard Shortcuts:</div>
            <div>Tab - Accept suggestion</div>
            <div>Ctrl+→ - Accept word</div>
            <div>Esc - Dismiss</div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

function toggleAutocompletePanel() {
    const panel = document.getElementById('autocomplete-controls');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function toggleAutocomplete() {
    if (window.autocompleteEngine) {
        window.autocompleteEngine.toggle();
    }
}

function updateAutocompleteDelay(value) {
    AutocompleteConfig.triggerDelay = parseInt(value);
    document.getElementById('autocomplete-delay-value').textContent = value;
}

function toggleMultiline() {
    const checkbox = document.getElementById('autocomplete-multiline');
    AutocompleteConfig.multiLineSuggestions = checkbox.checked;
}

function toggleCache() {
    const checkbox = document.getElementById('autocomplete-cache');
    AutocompleteConfig.cacheEnabled = checkbox.checked;
    
    if (!AutocompleteConfig.cacheEnabled && window.autocompleteEngine) {
        window.autocompleteEngine.cache.clear();
    }
}

function clearAutocompleteCache() {
    if (window.autocompleteEngine) {
        window.autocompleteEngine.cache.clear();
        alert('✅ Autocomplete cache cleared!');
    }
}

function showAutocompleteStats() {
    if (window.autocompleteEngine) {
        const stats = window.autocompleteEngine.getStats();
        console.log('[Autocomplete] 📊 Stats:', stats);
        alert(JSON.stringify(stats, null, 2));
    }
}

// ============================================================================
// TOGGLE BUTTON
// ============================================================================

function createAutocompleteToggleButton() {
    const button = document.createElement('button');
    button.id = 'autocomplete-toggle-btn';
    button.innerHTML = '⚡';
    button.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ff6600, #ffbb00);
        border: 2px solid var(--orange);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 99996;
        box-shadow: 0 5px 20px rgba(255,102,0,0.5);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1) rotate(15deg)';
        button.style.boxShadow = '0 8px 30px rgba(255,102,0,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1) rotate(0deg)';
        button.style.boxShadow = '0 5px 20px rgba(255,102,0,0.5)';
    };
    
    button.onclick = toggleAutocompletePanel;
    
    document.body.appendChild(button);
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AutocompleteEngine,
        AutocompleteConfig,
        SuggestionCache,
        initAutocomplete
    };
}
