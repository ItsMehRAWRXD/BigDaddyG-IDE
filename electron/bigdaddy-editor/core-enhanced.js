/**
 * BigDaddy Editor - COMPLETE Enhanced Core
 * 
 * A FULLY FUNCTIONAL, high-performance, AI-native code editor built from scratch.
 * Made by the ENTIRE AI FAMILY: Claude, ChatGPT, Gemini, DeepSeek, Kimi
 * 
 * @author BigDaddyG IDE Team + AI Family 🤖
 * @version 2.0.0 COMPLETE
 * @license MIT
 */

// Import dependencies (loaded via script tags in HTML)
// - PieceTable from core.js
// - Tokenizer from tokenizer.js
// - AIAutocomplete from ai-autocomplete.js
// - ShaderPreview from shader-preview.js
// - Minimap from minimap.js
// - Search from search.js

/**
 * BigDaddyEditor - COMPLETE Enhanced Version
 */
class BigDaddyEditorEnhanced extends BigDaddyEditor {
    constructor(options = {}) {
        super(options);
        
        // Enhanced features
        this.tokenizer = new Tokenizer(options.language || 'javascript');
        this.aiAutocomplete = new AIAutocomplete(this, options.aiProvider);
        this.minimap = new Minimap(this);
        this.search = new Search(this);
        this.shaderPreview = null;
        
        // Syntax highlighting
        this.tokenCache = new Map();
        this.highlightingEnabled = true;
        
        // AI features
        this.aiEnabled = options.ai?.enabled ?? true;
        
        // Enhanced keybindings
        this.setupEnhancedKeybindings();
        
        // Listen to changes for AI autocomplete
        this.on('change', (change) => {
            if (this.aiEnabled) {
                this.aiAutocomplete.onTextChange(change);
            }
            // Invalidate token cache for changed lines
            this.invalidateTokenCache(change);
        });
        
        console.log('[BigDaddyEditorEnhanced] Fully loaded with all features! 🚀');
    }

    /**
     * Enhanced render with syntax highlighting, AI ghost text, minimap, search highlights
     */
    render() {
        const startTime = performance.now();
        
        // Clear canvas
        const rect = this.container.getBoundingClientRect();
        this.ctx.fillStyle = '#1e1e1e';
        this.ctx.fillRect(0, 0, rect.width, rect.height);
        
        // Render line numbers
        this.renderLineNumbers();
        
        // Render text lines WITH SYNTAX HIGHLIGHTING
        this.renderLinesEnhanced();
        
        // Render search highlights (if active)
        if (this.search.matches.length > 0) {
            this.search.renderMatches(
                this.ctx, 
                50, 
                this.charWidth, 
                this.lineHeight, 
                this.topLine, 
                this.leftColumn
            );
        }
        
        // Render AI ghost text
        if (this.aiAutocomplete.ghostText) {
            this.aiAutocomplete.renderGhost(
                this.ctx,
                50,
                this.charWidth,
                this.lineHeight,
                this.topLine,
                this.leftColumn
            );
        }
        
        // Render cursor
        this.renderCursor();
        
        // Render scrollbars
        this.renderScrollbars();
        
        // Render minimap
        this.minimap.render(this.container);
        
        const renderTime = performance.now() - startTime;
        
        // Display stats
        this.renderStats(rect, renderTime);
        
        // Emit render event
        this.emit('render', { renderTime });
    }

    /**
     * Render lines with FULL SYNTAX HIGHLIGHTING
     */
    renderLinesEnhanced() {
        const lineNumberWidth = 50;
        const lines = this.buffer.getLines();
        
        this.ctx.font = `${this.options.fontSize}px ${this.options.fontFamily}`;
        
        for (let i = 0; i < this.visibleLines; i++) {
            const lineNumber = this.topLine + i;
            if (lineNumber >= lines.length) break;
            
            const line = lines[lineNumber];
            const y = i * this.lineHeight + this.lineHeight - 4;
            
            // Get tokens (cached for performance)
            const tokens = this.getTokens(line, lineNumber);
            
            // Render tokens with colors
            let x = lineNumberWidth + 10 - (this.leftColumn * this.charWidth);
            for (const token of tokens) {
                this.ctx.fillStyle = this.tokenizer.getTokenColor(token.type);
                this.ctx.fillText(token.text, x, y);
                x += token.text.length * this.charWidth;
            }
        }
    }

    /**
     * Get tokens for a line (with caching)
     */
    getTokens(line, lineNumber) {
        if (!this.highlightingEnabled) {
            return [{ type: 'text', text: line }];
        }

        // Check cache
        const cacheKey = `${lineNumber}:${line}`;
        if (this.tokenCache.has(cacheKey)) {
            return this.tokenCache.get(cacheKey);
        }

        // Tokenize
        const tokens = this.tokenizer.tokenizeLine(line);
        
        // Cache (limit cache size)
        if (this.tokenCache.size > 1000) {
            const firstKey = this.tokenCache.keys().next().value;
            this.tokenCache.delete(firstKey);
        }
        this.tokenCache.set(cacheKey, tokens);
        
        return tokens;
    }

    /**
     * Invalidate token cache
     */
    invalidateTokenCache(change) {
        // Clear all cache for now (could be smarter)
        this.tokenCache.clear();
    }

    /**
     * Render stats (FPS, memory, AI status)
     */
    renderStats(rect, renderTime) {
        const fps = (1000 / renderTime).toFixed(1);
        const memoryMB = performance.memory 
            ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(1) 
            : '?';
        
        this.ctx.fillStyle = '#888';
        this.ctx.font = '10px monospace';
        
        const stats = [
            `${fps} FPS`,
            `${renderTime.toFixed(2)}ms`,
            `${memoryMB}MB`,
            this.aiEnabled ? '🤖 AI' : ''
        ].filter(Boolean).join(' | ');
        
        this.ctx.fillText(stats, rect.width - 200, 15);
        
        // AI suggestion indicator
        if (this.aiAutocomplete.ghostText) {
            this.ctx.fillStyle = '#00d4ff';
            this.ctx.fillText('✨ AI Suggestion (Tab to accept)', 10, rect.height - 10);
        }
        
        // Search results indicator
        if (this.search.matches.length > 0) {
            const searchText = `🔍 ${this.search.getCurrentIndex() + 1}/${this.search.getMatchCount()}`;
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fillText(searchText, rect.width / 2 - 50, rect.height - 10);
        }
    }

    /**
     * Enhanced keyboard shortcuts
     */
    setupEnhancedKeybindings() {
        // Override parent handleKeyDown to add new shortcuts
        const originalHandleKeyDown = this.handleKeyDown.bind(this);
        
        this.handleKeyDown = (e) => {
            // Tab - Accept AI suggestion
            if (e.key === 'Tab' && !e.shiftKey && this.aiAutocomplete.ghostText) {
                e.preventDefault();
                this.aiAutocomplete.accept();
                this.render();
                return;
            }
            
            // Escape - Reject AI suggestion or clear search
            if (e.key === 'Escape') {
                e.preventDefault();
                if (this.aiAutocomplete.ghostText) {
                    this.aiAutocomplete.reject();
                }
                if (this.search.matches.length > 0) {
                    this.search.clear();
                }
                this.render();
                return;
            }
            
            // Ctrl+F - Find
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.showSearchDialog();
                return;
            }
            
            // F3 / Ctrl+G - Find next
            if (e.key === 'F3' || ((e.ctrlKey || e.metaKey) && e.key === 'g')) {
                e.preventDefault();
                if (!e.shiftKey) {
                    this.search.next();
                } else {
                    this.search.previous();
                }
                this.render();
                return;
            }
            
            // Ctrl+H - Replace
            if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
                e.preventDefault();
                this.showReplaceDialog();
                return;
            }
            
            // Ctrl+/ - Toggle comment
            if ((e.ctrlKey || e.metaKey) && e.key === '/') {
                e.preventDefault();
                this.toggleComment();
                return;
            }
            
            // Ctrl+D - Duplicate line
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.duplicateLine();
                return;
            }
            
            // Ctrl+Shift+K - Delete line
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
                e.preventDefault();
                this.deleteLine();
                return;
            }
            
            // Ctrl+] - Indent
            if ((e.ctrlKey || e.metaKey) && e.key === ']') {
                e.preventDefault();
                this.indent();
                return;
            }
            
            // Ctrl+[ - Outdent
            if ((e.ctrlKey || e.metaKey) && e.key === '[') {
                e.preventDefault();
                this.outdent();
                return;
            }
            
            // Alt+Up/Down - Move line
            if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
                e.preventDefault();
                this.moveLine(e.key === 'ArrowUp' ? -1 : 1);
                return;
            }
            
            // Ctrl+Space - Trigger AI autocomplete
            if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
                e.preventDefault();
                this.aiAutocomplete.generateSuggestion();
                return;
            }
            
            // Call original handler
            originalHandleKeyDown(e);
        };
    }

    /**
     * Show search dialog
     */
    showSearchDialog() {
        const query = prompt('Search for:', this.search.query || '');
        if (query !== null && query !== '') {
            this.search.findAll(query);
            if (this.search.matches.length > 0) {
                this.search.next();
            }
            this.render();
        }
    }

    /**
     * Show replace dialog
     */
    showReplaceDialog() {
        const query = prompt('Find:', this.search.query || '');
        if (!query) return;
        
        this.search.findAll(query);
        
        if (this.search.matches.length === 0) {
            alert('No matches found');
            return;
        }
        
        const replacement = prompt(`Replace "${query}" with:`);
        if (replacement !== null) {
            const replaceAll = confirm(`Replace all ${this.search.matches.length} occurrences?`);
            if (replaceAll) {
                const count = this.search.replaceAll(replacement);
                alert(`Replaced ${count} occurrences`);
            } else {
                this.search.replaceCurrent(replacement);
                this.search.next();
            }
            this.render();
        }
    }

    /**
     * Toggle comment on current line
     */
    toggleComment() {
        const lines = this.buffer.getLines();
        const currentLine = lines[this.cursor.line];
        
        if (!currentLine) return;
        
        const commentPrefix = this.getCommentPrefix();
        const trimmed = currentLine.trim();
        
        if (trimmed.startsWith(commentPrefix)) {
            // Uncomment
            const newLine = currentLine.replace(commentPrefix, '');
            this.replaceLine(this.cursor.line, newLine);
        } else {
            // Comment
            const indent = currentLine.match(/^\s*/)[0];
            const newLine = indent + commentPrefix + currentLine.substring(indent.length);
            this.replaceLine(this.cursor.line, newLine);
        }
        
        this.emit('change', { type: 'toggle-comment' });
        this.render();
    }

    /**
     * Get comment prefix for current language
     */
    getCommentPrefix() {
        const lang = this.options.language;
        const prefixes = {
            javascript: '// ',
            python: '# ',
            ruby: '# ',
            html: '<!-- ',
            css: '/* ',
            c: '// ',
            cpp: '// ',
            java: '// ',
            csharp: '// ',
            php: '// ',
            go: '// ',
            rust: '// ',
            swift: '// ',
            kotlin: '// '
        };
        return prefixes[lang] || '// ';
    }

    /**
     * Duplicate current line
     */
    duplicateLine() {
        const lines = this.buffer.getLines();
        const currentLine = lines[this.cursor.line];
        
        if (!currentLine) return;
        
        const offset = this.getOffsetFromPosition({ 
            line: this.cursor.line + 1, 
            column: 0 
        });
        
        this.buffer.insert(offset, currentLine + '\n');
        this.cursor.line++;
        
        this.emit('change', { type: 'duplicate-line' });
        this.render();
    }

    /**
     * Delete current line
     */
    deleteLine() {
        const lines = this.buffer.getLines();
        if (lines.length === 1) {
            // Last line - just clear it
            this.buffer = new PieceTable('');
            this.cursor = { line: 0, column: 0 };
        } else {
            const offset = this.getOffsetFromPosition({ 
                line: this.cursor.line, 
                column: 0 
            });
            const lineLength = lines[this.cursor.line].length + 1; // +1 for newline
            this.buffer.delete(offset, lineLength);
            
            if (this.cursor.line >= lines.length - 1) {
                this.cursor.line = Math.max(0, lines.length - 2);
            }
        }
        
        this.cursor.column = 0;
        this.emit('change', { type: 'delete-line' });
        this.render();
    }

    /**
     * Indent current line
     */
    indent() {
        const offset = this.getOffsetFromPosition({ 
            line: this.cursor.line, 
            column: 0 
        });
        const spaces = ' '.repeat(this.options.tabSize);
        this.buffer.insert(offset, spaces);
        this.cursor.column += this.options.tabSize;
        
        this.emit('change', { type: 'indent' });
        this.render();
    }

    /**
     * Outdent current line
     */
    outdent() {
        const lines = this.buffer.getLines();
        const currentLine = lines[this.cursor.line];
        
        if (!currentLine) return;
        
        const leadingSpaces = currentLine.match(/^\s*/)[0];
        if (leadingSpaces.length === 0) return;
        
        const removeCount = Math.min(this.options.tabSize, leadingSpaces.length);
        const offset = this.getOffsetFromPosition({ 
            line: this.cursor.line, 
            column: 0 
        });
        
        this.buffer.delete(offset, removeCount);
        this.cursor.column = Math.max(0, this.cursor.column - removeCount);
        
        this.emit('change', { type: 'outdent' });
        this.render();
    }

    /**
     * Move current line up or down
     */
    moveLine(direction) {
        const lines = this.buffer.getLines();
        const targetLine = this.cursor.line + direction;
        
        if (targetLine < 0 || targetLine >= lines.length) return;
        
        const currentLine = lines[this.cursor.line];
        const swapLine = lines[targetLine];
        
        this.replaceLine(this.cursor.line, swapLine);
        this.replaceLine(targetLine, currentLine);
        
        this.cursor.line = targetLine;
        
        this.emit('change', { type: 'move-line' });
        this.render();
    }

    /**
     * Replace entire line
     */
    replaceLine(lineNumber, newContent) {
        const lines = this.buffer.getLines();
        const oldLine = lines[lineNumber];
        
        const offset = this.getOffsetFromPosition({ 
            line: lineNumber, 
            column: 0 
        });
        
        this.buffer.delete(offset, oldLine.length);
        this.buffer.insert(offset, newContent);
    }

    /**
     * Set language (updates syntax highlighting)
     */
    setLanguage(language) {
        this.options.language = language;
        this.tokenizer = new Tokenizer(language);
        this.tokenCache.clear();
        this.render();
    }

    /**
     * Toggle syntax highlighting
     */
    toggleSyntaxHighlighting() {
        this.highlightingEnabled = !this.highlightingEnabled;
        this.render();
    }

    /**
     * Toggle AI autocomplete
     */
    toggleAI() {
        this.aiEnabled = !this.aiEnabled;
        this.aiAutocomplete.setEnabled(this.aiEnabled);
        if (!this.aiEnabled) {
            this.aiAutocomplete.clearSuggestion();
        }
        this.render();
    }

    /**
     * Toggle minimap
     */
    toggleMinimap() {
        this.minimap.toggle();
        this.render();
    }

    /**
     * Show shader preview (for GLSL files)
     */
    showShaderPreview() {
        if (!this.shaderPreview) {
            const previewContainer = document.createElement('div');
            previewContainer.style.position = 'absolute';
            previewContainer.style.top = '20px';
            previewContainer.style.right = '140px';
            previewContainer.style.zIndex = '1000';
            this.container.appendChild(previewContainer);
            
            this.shaderPreview = new ShaderPreview(previewContainer);
        }
        
        const code = this.getValue();
        
        // Simple vertex shader
        const vertexShader = `
            attribute vec4 position;
            void main() {
                gl_Position = position;
            }
        `;
        
        this.shaderPreview.updateShader(vertexShader, code);
        this.shaderPreview.show();
    }

    /**
     * Hide shader preview
     */
    hideShaderPreview() {
        if (this.shaderPreview) {
            this.shaderPreview.hide();
        }
    }

    /**
     * Format document (basic)
     */
    formatDocument() {
        try {
            const code = this.getValue();
            const lang = this.options.language;
            
            // Simple JSON formatting
            if (lang === 'json') {
                const parsed = JSON.parse(code);
                const formatted = JSON.stringify(parsed, null, 2);
                this.setValue(formatted);
                return;
            }
            
            // For other languages, just fix indentation
            const lines = code.split('\n');
            let indentLevel = 0;
            const formatted = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                if (trimmed.endsWith('}') || trimmed.endsWith(']')) {
                    indentLevel = Math.max(0, indentLevel - 1);
                }
                
                const indent = ' '.repeat(indentLevel * this.options.tabSize);
                formatted.push(indent + trimmed);
                
                if (trimmed.endsWith('{') || trimmed.endsWith('[')) {
                    indentLevel++;
                }
            }
            
            this.setValue(formatted.join('\n'));
        } catch (e) {
            console.error('[Format] Error formatting document:', e);
        }
    }

    /**
     * Get editor statistics
     */
    getStats() {
        const text = this.getValue();
        const lines = this.buffer.getLines();
        
        return {
            lines: lines.length,
            characters: text.length,
            charactersNoSpaces: text.replace(/\s/g, '').length,
            words: text.split(/\s+/).filter(w => w.length > 0).length,
            language: this.options.language,
            memoryMB: performance.memory 
                ? (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
                : 'N/A'
        };
    }

    /**
     * Destroy editor
     */
    destroy() {
        super.destroy();
        
        if (this.minimap) {
            this.minimap.destroy();
        }
        
        if (this.shaderPreview) {
            this.shaderPreview.destroy();
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigDaddyEditorEnhanced;
}
