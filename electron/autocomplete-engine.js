/**
 * BigDaddyG IDE - Ultra-Fast Autocomplete Engine
 * Copilot-style inline suggestions powered by BigDaddyG
 * Optimized for real-time suggestions as you type
 */

// ============================================================================
// AUTOCOMPLETE CONFIGURATION
// ============================================================================

const AutocompleteConfig = {
    // Performance settings
    enabled: true,
    triggerDelay: 150,              // ms delay after typing stops
    maxSuggestionLength: 200,       // Max characters to suggest
    minTriggerLength: 2,            // Min characters before triggering
    streamTokens: true,             // Show tokens as they generate
    
    // Context settings
    contextLines: 50,               // Lines of context to send
    useRecentEdits: true,           // Include recent edit history
    cacheSize: 1000,                // Number of cached suggestions
    
    // Trigger characters
    triggerChars: ['.', '(', '{', '[', ':', ' ', '\n'],
    smartTriggers: true,            // Context-aware triggering
    
    // Display settings
    showGhostText: true,            // Copilot-style ghost text
    ghostOpacity: 0.4,
    highlightColor: 'rgba(0, 212, 255, 0.2)',
    
    // Model settings
    temperature: 0.1,               // Low temp for consistent completions
    topP: 0.9,
    maxTokens: 100,                 // Max tokens per suggestion
    stopSequences: ['\n\n', '```', '};', '];'],
    
    // Smart features
    learnFromAccepted: true,        // Cache accepted suggestions
    prioritizePatterns: true,       // Boost common patterns
    languageAware: true             // Adjust based on file type
};

// ============================================================================
// SUGGESTION CACHE
// ============================================================================

class SuggestionCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.hits = 0;
        this.misses = 0;
        this.patterns = new Map(); // Common code patterns
    }
    
    generateKey(context, cursor) {
        // Create cache key from context + cursor position
        const contextHash = this.hash(context);
        return `${contextHash}:${cursor}`;
    }
    
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }
    
    get(context, cursor) {
        const key = this.generateKey(context, cursor);
        
        if (this.cache.has(key)) {
            this.hits++;
            const cached = this.cache.get(key);
            cached.lastUsed = Date.now();
            cached.useCount++;
            return cached.suggestion;
        }
        
        this.misses++;
        return null;
    }
    
    set(context, cursor, suggestion) {
        const key = this.generateKey(context, cursor);
        
        // Evict oldest if at capacity
        if (this.cache.size >= this.maxSize) {
            const oldest = Array.from(this.cache.entries())
                .sort((a, b) => a[1].lastUsed - b[1].lastUsed)[0];
            this.cache.delete(oldest[0]);
        }
        
        this.cache.set(key, {
            suggestion,
            created: Date.now(),
            lastUsed: Date.now(),
            useCount: 0
        });
    }
    
    learnPattern(prefix, completion) {
        // Store common patterns for boosting
        const pattern = this.hash(prefix);
        
        if (!this.patterns.has(pattern)) {
            this.patterns.set(pattern, []);
        }
        
        const completions = this.patterns.get(pattern);
        completions.push({
            text: completion,
            count: 1,
            lastSeen: Date.now()
        });
        
        // Deduplicate and merge counts
        const merged = new Map();
        completions.forEach(c => {
            if (merged.has(c.text)) {
                merged.get(c.text).count++;
            } else {
                merged.set(c.text, c);
            }
        });
        
        this.patterns.set(pattern, Array.from(merged.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)); // Keep top 10
    }
    
    getPattern(prefix) {
        const pattern = this.hash(prefix);
        if (this.patterns.has(pattern)) {
            const completions = this.patterns.get(pattern);
            if (completions.length > 0) {
                return completions[0].text; // Return most common
            }
        }
        return null;
    }
    
    getStats() {
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total * 100).toFixed(1) : 0;
        
        return {
            size: this.cache.size,
            hits: this.hits,
            misses: this.misses,
            hitRate: `${hitRate}%`,
            patterns: this.patterns.size
        };
    }
    
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
}

// ============================================================================
// AUTOCOMPLETE ENGINE
// ============================================================================

class AutocompleteEngine {
    constructor(editor, apiUrl = 'http://localhost:3000') {
        this.editor = editor;
        this.apiUrl = apiUrl;
        this.cache = new SuggestionCache(AutocompleteConfig.cacheSize);
        this.currentSuggestion = null;
        this.suggestionWidget = null;
        this.typingTimer = null;
        this.isGenerating = false;
        this.abortController = null;
        this.recentEdits = [];
        this.acceptedSuggestions = 0;
        this.rejectedSuggestions = 0;
        
        this.init();
    }
    
    init() {
        console.log('[Autocomplete] 🚀 Initializing ultra-fast autocomplete...');
        
        // Create ghost text widget
        this.createSuggestionWidget();
        
        // Attach event listeners
        this.attachEditorListeners();
        
        console.log('[Autocomplete] ✅ Ready for inline suggestions');
    }
    
    createSuggestionWidget() {
        // Monaco-compatible suggestion widget
        this.suggestionWidget = {
            domNode: null,
            show: (text, position) => {
                if (!AutocompleteConfig.showGhostText) return;
                
                // Remove old widget
                this.hideSuggestion();
                
                // Create ghost text element
                const widget = document.createElement('div');
                widget.className = 'autocomplete-ghost-text';
                widget.style.cssText = `
                    position: absolute;
                    opacity: ${AutocompleteConfig.ghostOpacity};
                    color: #888;
                    pointer-events: none;
                    white-space: pre;
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 14px;
                    z-index: 1000;
                `;
                widget.textContent = text;
                
                // Position widget
                const editorElement = this.editor.getDomNode();
                if (editorElement) {
                    editorElement.appendChild(widget);
                    this.suggestionWidget.domNode = widget;
                    
                    // Calculate position
                    const pos = this.editor.getPosition();
                    const coords = this.editor.getScrolledVisiblePosition(pos);
                    
                    if (coords) {
                        widget.style.top = `${coords.top}px`;
                        widget.style.left = `${coords.left}px`;
                    }
                }
            },
            hide: () => {
                if (this.suggestionWidget.domNode) {
                    this.suggestionWidget.domNode.remove();
                    this.suggestionWidget.domNode = null;
                }
            }
        };
    }
    
    attachEditorListeners() {
        // Trigger on content change
        this.editor.onDidChangeModelContent((e) => {
            if (!AutocompleteConfig.enabled) return;
            
            // Clear existing timer
            clearTimeout(this.typingTimer);
            
            // Hide current suggestion
            this.hideSuggestion();
            
            // Track recent edits
            this.trackEdit(e);
            
            // Check if we should trigger
            const position = this.editor.getPosition();
            const model = this.editor.getModel();
            const line = model.getLineContent(position.lineNumber);
            const char = line[position.column - 2]; // Last typed char
            
            const shouldTrigger = 
                AutocompleteConfig.triggerChars.includes(char) ||
                line.length >= AutocompleteConfig.minTriggerLength;
            
            if (shouldTrigger) {
                // Debounce: wait for typing to stop
                this.typingTimer = setTimeout(() => {
                    this.generateSuggestion();
                }, AutocompleteConfig.triggerDelay);
            }
        });
        
        // Accept suggestion with Tab or Arrow Right
        this.editor.addCommand(monaco.KeyCode.Tab, () => {
            if (this.currentSuggestion) {
                this.acceptSuggestion();
                return;
            }
            // If no suggestion, insert tab normally
            this.editor.trigger('keyboard', 'type', { text: '\t' });
        });
        
        this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyCode.RightArrow, () => {
            if (this.currentSuggestion) {
                this.acceptSuggestion();
            }
        });
        
        // Reject suggestion with Escape
        this.editor.addCommand(monaco.KeyCode.Escape, () => {
            if (this.currentSuggestion) {
                this.rejectSuggestion();
            }
        });
    }
    
    trackEdit(event) {
        // Track recent edits for context
        this.recentEdits.push({
            changes: event.changes,
            timestamp: Date.now()
        });
        
        // Keep only recent edits (last 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        this.recentEdits = this.recentEdits.filter(e => e.timestamp > fiveMinutesAgo);
    }
    
    async generateSuggestion() {
        if (this.isGenerating) {
            // Abort previous generation
            if (this.abortController) {
                this.abortController.abort();
            }
        }
        
        this.isGenerating = true;
        this.abortController = new AbortController();
        
        try {
            const position = this.editor.getPosition();
            const model = this.editor.getModel();
            
            // Get context
            const context = this.getContext(position, model);
            const cursor = `${position.lineNumber}:${position.column}`;
            
            // Check cache first
            const cached = this.cache.get(context, cursor);
            if (cached) {
                console.log('[Autocomplete] 💾 Cache hit!');
                this.showSuggestion(cached, position);
                this.isGenerating = false;
                return;
            }
            
            // Check learned patterns
            if (AutocompleteConfig.prioritizePatterns) {
                const pattern = this.cache.getPattern(context.slice(-100));
                if (pattern) {
                    console.log('[Autocomplete] 🧠 Using learned pattern');
                    this.showSuggestion(pattern, position);
                    this.isGenerating = false;
                    return;
                }
            }
            
            // Generate with BigDaddyG
            const suggestion = await this.queryBigDaddyG(context, cursor);
            
            if (suggestion && suggestion.trim().length > 0) {
                // Cache the suggestion
                this.cache.set(context, cursor, suggestion);
                
                // Show it
                this.showSuggestion(suggestion, position);
            }
            
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('[Autocomplete] ❌ Error:', error);
            }
        } finally {
            this.isGenerating = false;
            this.abortController = null;
        }
    }
    
    getContext(position, model) {
        // Get surrounding context
        const startLine = Math.max(1, position.lineNumber - AutocompleteConfig.contextLines);
        const endLine = position.lineNumber;
        
        let context = '';
        for (let i = startLine; i <= endLine; i++) {
            const line = model.getLineContent(i);
            if (i === endLine) {
                // Current line up to cursor
                context += line.substring(0, position.column - 1);
            } else {
                context += line + '\n';
            }
        }
        
        return context;
    }
    
    async queryBigDaddyG(context, cursor) {
        const prompt = this.buildPrompt(context);
        
        const response = await fetch(`${this.apiUrl}/api/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt,
                temperature: AutocompleteConfig.temperature,
                top_p: AutocompleteConfig.topP,
                max_tokens: AutocompleteConfig.maxTokens,
                stop: AutocompleteConfig.stopSequences,
                stream: false // For now, no streaming
            }),
            signal: this.abortController.signal
        });
        
        const data = await response.json();
        
        if (data.response) {
            // Extract just the completion part
            return this.extractCompletion(data.response);
        }
        
        return null;
    }
    
    buildPrompt(context) {
        // Get file language
        const model = this.editor.getModel();
        const language = model.getLanguageId();
        
        // Build autocomplete prompt
        return `Complete this ${language} code. Only provide the next line or completion, nothing else:\n\n${context}`;
    }
    
    extractCompletion(response) {
        // Extract just the completion
        let completion = response.trim();
        
        // Remove common AI response patterns
        completion = completion
            .replace(/^(Here's|Here is|The completion is|Next line:)/i, '')
            .replace(/^```[a-z]*\n/i, '')
            .replace(/\n```$/i, '')
            .trim();
        
        // Limit length
        if (completion.length > AutocompleteConfig.maxSuggestionLength) {
            completion = completion.substring(0, AutocompleteConfig.maxSuggestionLength);
            // Try to cut at a good boundary
            const lastSpace = completion.lastIndexOf(' ');
            if (lastSpace > completion.length * 0.8) {
                completion = completion.substring(0, lastSpace);
            }
        }
        
        return completion;
    }
    
    showSuggestion(text, position) {
        this.currentSuggestion = {
            text,
            position,
            timestamp: Date.now()
        };
        
        this.suggestionWidget.show(text, position);
    }
    
    hideSuggestion() {
        this.suggestionWidget.hide();
        this.currentSuggestion = null;
    }
    
    acceptSuggestion() {
        if (!this.currentSuggestion) return;
        
        const { text, position } = this.currentSuggestion;
        
        // Insert suggestion at current position
        const currentPos = this.editor.getPosition();
        this.editor.executeEdits('autocomplete', [{
            range: new monaco.Range(
                currentPos.lineNumber,
                currentPos.column,
                currentPos.lineNumber,
                currentPos.column
            ),
            text: text
        }]);
        
        // Learn from accepted suggestion
        if (AutocompleteConfig.learnFromAccepted) {
            const context = this.getContext(position, this.editor.getModel());
            this.cache.learnPattern(context.slice(-100), text);
        }
        
        this.acceptedSuggestions++;
        this.hideSuggestion();
        
        console.log('[Autocomplete] ✅ Suggestion accepted');
    }
    
    rejectSuggestion() {
        if (!this.currentSuggestion) return;
        
        this.rejectedSuggestions++;
        this.hideSuggestion();
        
        console.log('[Autocomplete] ❌ Suggestion rejected');
    }
    
    toggle() {
        AutocompleteConfig.enabled = !AutocompleteConfig.enabled;
        
        if (!AutocompleteConfig.enabled) {
            this.hideSuggestion();
        }
        
        console.log(`[Autocomplete] ${AutocompleteConfig.enabled ? '✅ Enabled' : '🛑 Disabled'}`);
    }
    
    getStats() {
        const cacheStats = this.cache.getStats();
        const acceptRate = this.acceptedSuggestions + this.rejectedSuggestions > 0
            ? ((this.acceptedSuggestions / (this.acceptedSuggestions + this.rejectedSuggestions)) * 100).toFixed(1)
            : 0;
        
        return {
            enabled: AutocompleteConfig.enabled,
            accepted: this.acceptedSuggestions,
            rejected: this.rejectedSuggestions,
            acceptRate: `${acceptRate}%`,
            cache: cacheStats
        };
    }
    
    destroy() {
        clearTimeout(this.typingTimer);
        if (this.abortController) {
            this.abortController.abort();
        }
        this.hideSuggestion();
        console.log('[Autocomplete] 🗑️ Autocomplete engine destroyed');
    }
}

// ============================================================================
// AUTOCOMPLETE SETTINGS PANEL
// ============================================================================

function createAutocompletePanel() {
    const panel = document.createElement('div');
    panel.id = 'autocomplete-panel';
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
        min-width: 300px;
        max-width: 400px;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid var(--cyan);">
            <div style="color: var(--cyan); font-weight: bold; font-size: 14px;">⚡ Auto-Complete</div>
            <button onclick="toggleAutocompletePanel()" style="background: var(--red); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">✕</button>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="autocomplete-enabled" checked onchange="toggleAutocomplete()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Enable Auto-Complete</span>
            </label>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px;">Trigger Delay (ms):</label>
            <input type="range" id="autocomplete-delay" min="50" max="500" value="150" step="50" onchange="updateAutocompleteDelay(this.value)" style="width: 100%;">
            <div style="text-align: center; color: #666; font-size: 10px; margin-top: 3px;">
                <span id="autocomplete-delay-value">150</span>ms
            </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="color: #888; font-size: 11px; display: block; margin-bottom: 5px;">Ghost Text Opacity:</label>
            <input type="range" id="autocomplete-opacity" min="0.1" max="0.8" step="0.1" value="0.4" onchange="updateAutocompleteOpacity(this.value)" style="width: 100%;">
            <div style="text-align: center; color: #666; font-size: 10px; margin-top: 3px;">
                <span id="autocomplete-opacity-value">0.4</span>
            </div>
        </div>
        
        <div style="margin-bottom: 12px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
                <input type="checkbox" id="autocomplete-learn" checked onchange="toggleAutocompleteLearning()" style="margin-right: 8px;">
                <span style="color: #ccc; font-size: 12px;">Learn from Accepted</span>
            </label>
        </div>
        
        <div style="padding: 10px; background: rgba(0,212,255,0.1); border-radius: 6px; margin-bottom: 12px;">
            <div style="font-size: 11px; color: #888; margin-bottom: 5px; font-weight: bold;">Statistics:</div>
            <div id="autocomplete-stats" style="font-size: 10px; color: #ccc; font-family: monospace;">
                Loading...
            </div>
        </div>
        
        <div style="padding: 10px; background: rgba(0,212,255,0.1); border-radius: 6px; font-size: 10px; color: #888;">
            <div style="font-weight: bold; margin-bottom: 5px;">Shortcuts:</div>
            <div>• <span style="color: var(--cyan);">Tab</span> - Accept suggestion</div>
            <div>• <span style="color: var(--cyan);">Esc</span> - Reject suggestion</div>
            <div>• <span style="color: var(--cyan);">Keep typing</span> - Ignore</div>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // Update stats every 2 seconds
    setInterval(updateAutocompleteStats, 2000);
}

function toggleAutocompletePanel() {
    const panel = document.getElementById('autocomplete-panel');
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

function updateAutocompleteOpacity(value) {
    AutocompleteConfig.ghostOpacity = parseFloat(value);
    document.getElementById('autocomplete-opacity-value').textContent = value;
}

function toggleAutocompleteLearning() {
    const checkbox = document.getElementById('autocomplete-learn');
    AutocompleteConfig.learnFromAccepted = checkbox.checked;
}

function updateAutocompleteStats() {
    if (!window.autocompleteEngine) return;
    
    const stats = window.autocompleteEngine.getStats();
    const statsDiv = document.getElementById('autocomplete-stats');
    
    if (statsDiv) {
        statsDiv.innerHTML = `
            Accepted: ${stats.accepted}<br>
            Rejected: ${stats.rejected}<br>
            Accept Rate: ${stats.acceptRate}<br>
            Cache Hit Rate: ${stats.cache.hitRate}<br>
            Cached Items: ${stats.cache.size}<br>
            Learned Patterns: ${stats.cache.patterns}
        `;
    }
}

// ============================================================================
// AUTOCOMPLETE TOGGLE BUTTON
// ============================================================================

function createAutocompleteToggleButton() {
    const button = document.createElement('button');
    button.id = 'autocomplete-toggle-btn';
    button.innerHTML = '⚡';
    button.title = 'Ultra-Fast Autocomplete (Ctrl+Shift+Space)';
    button.style.cssText = `
        position: fixed;
        bottom: 140px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #ff6b00, #ffaa00);
        border: 2px solid var(--orange);
        border-radius: 50%;
        color: white;
        font-size: 24px;
        cursor: pointer;
        z-index: 99996;
        box-shadow: 0 5px 20px rgba(255,107,0,0.5);
        transition: all 0.3s;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    button.onmouseover = () => {
        button.style.transform = 'scale(1.1) rotate(15deg)';
        button.style.boxShadow = '0 8px 30px rgba(255,107,0,0.8)';
    };
    
    button.onmouseout = () => {
        button.style.transform = 'scale(1) rotate(0deg)';
        button.style.boxShadow = '0 5px 20px rgba(255,107,0,0.5)';
    };
    
    button.onclick = toggleAutocompletePanel;
    
    document.body.appendChild(button);
}

// ============================================================================
// INITIALIZATION
// ============================================================================

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AutocompleteEngine, AutocompleteConfig };
}

console.log('[Autocomplete] ⚡ Ultra-fast autocomplete module loaded');

