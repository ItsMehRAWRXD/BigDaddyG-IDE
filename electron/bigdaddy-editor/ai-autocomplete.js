/**
 * BigDaddy Editor - AI Autocomplete
 * 
 * Real-time AI-powered code completion with ghost text.
 * Integrates with BigDaddyA and other AI providers.
 * 
 * @author BigDaddyG IDE Team
 * @version 1.0.0
 */

class AIAutocomplete {
    constructor(editor, aiProvider = null) {
        this.editor = editor;
        this.aiProvider = aiProvider;
        this.currentSuggestion = null;
        this.debounceTimer = null;
        this.enabled = true;
        this.debounceDelay = 500; // ms
        
        // Ghost text properties
        this.ghostText = '';
        this.ghostPosition = null;
        
        console.log('[AIAutocomplete] Initialized');
    }

    /**
     * Enable/disable autocomplete
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.clearSuggestion();
        }
    }

    /**
     * Set AI provider
     */
    setProvider(provider) {
        this.aiProvider = provider;
    }

    /**
     * Handle text change event
     */
    async onTextChange(change) {
        if (!this.enabled || !this.aiProvider) return;

        // Clear existing suggestion
        this.clearSuggestion();

        // Debounce to avoid too many requests
        clearTimeout(this.debounceTimer);
        
        this.debounceTimer = setTimeout(async () => {
            await this.generateSuggestion();
        }, this.debounceDelay);
    }

    /**
     * Generate AI suggestion
     */
    async generateSuggestion() {
        try {
            const cursor = this.editor.getCursor();
            const context = this.getContext(cursor, 50); // 50 lines of context
            
            // Don't suggest if in middle of word or line has content after cursor
            const currentLine = this.editor.buffer.getLine(cursor.line);
            const afterCursor = currentLine.substring(cursor.column).trim();
            if (afterCursor.length > 0) {
                return;
            }

            const prompt = this.buildPrompt(context, cursor);
            
            console.log('[AIAutocomplete] Requesting suggestion...');
            
            // Call AI provider
            const suggestion = await this.callAI(prompt);
            
            if (suggestion && suggestion.trim().length > 0) {
                this.currentSuggestion = suggestion;
                this.ghostPosition = { ...cursor };
                this.ghostText = suggestion;
                
                // Trigger render to show ghost text
                this.editor.emit('suggestion', { suggestion, position: cursor });
                this.editor.render();
                
                console.log('[AIAutocomplete] Suggestion:', suggestion.substring(0, 50) + '...');
            }
        } catch (error) {
            console.error('[AIAutocomplete] Error generating suggestion:', error);
        }
    }

    /**
     * Get context around cursor
     */
    getContext(cursor, maxLines = 50) {
        const lines = this.editor.buffer.getLines();
        const startLine = Math.max(0, cursor.line - maxLines);
        const endLine = cursor.line + 1;
        
        const contextLines = lines.slice(startLine, endLine);
        return contextLines.join('\n');
    }

    /**
     * Build prompt for AI
     */
    buildPrompt(context, cursor) {
        const language = this.editor.options.language || 'javascript';
        
        return `You are an expert ${language} programmer. Given the following code context, complete the next line of code.

Context:
${context}

Complete the next line. Respond with ONLY the code, no explanations or markdown:`;
    }

    /**
     * Call AI provider
     */
    async callAI(prompt) {
        // Mock implementation for now
        // In real implementation, this would call BigDaddyA or other providers
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Simple pattern-based suggestions for demo
        const context = prompt.toLowerCase();
        
        if (context.includes('function') && context.includes('{')) {
            return '    return result;';
        }
        
        if (context.includes('for') || context.includes('while')) {
            return '    // Loop body';
        }
        
        if (context.includes('if') && context.includes('{')) {
            return '    // Condition body';
        }
        
        if (context.includes('class') && context.includes('{')) {
            return '    constructor() {\n        // Initialize\n    }';
        }
        
        // In production, call actual AI:
        // return await this.aiProvider.complete(prompt);
        
        return null;
    }

    /**
     * Accept current suggestion
     */
    accept() {
        if (this.currentSuggestion && this.ghostPosition) {
            // Insert suggestion at ghost position
            const cursor = this.editor.getCursor();
            
            // Insert the suggestion
            this.editor.insertText(this.currentSuggestion);
            
            // Clear suggestion
            this.clearSuggestion();
            
            console.log('[AIAutocomplete] Suggestion accepted');
            
            return true;
        }
        return false;
    }

    /**
     * Reject current suggestion
     */
    reject() {
        this.clearSuggestion();
        console.log('[AIAutocomplete] Suggestion rejected');
    }

    /**
     * Clear current suggestion
     */
    clearSuggestion() {
        this.currentSuggestion = null;
        this.ghostText = '';
        this.ghostPosition = null;
        this.editor.emit('suggestion-cleared');
    }

    /**
     * Render ghost text
     */
    renderGhost(ctx, lineNumberWidth, charWidth, lineHeight, topLine, leftColumn) {
        if (!this.ghostText || !this.ghostPosition) return;

        const cursor = this.editor.getCursor();
        
        // Only show ghost if cursor is at ghost position
        if (cursor.line !== this.ghostPosition.line || 
            cursor.column !== this.ghostPosition.column) {
            this.clearSuggestion();
            return;
        }

        // Render ghost text
        const x = lineNumberWidth + 10 + (cursor.column - leftColumn) * charWidth;
        const y = (cursor.line - topLine) * lineHeight + lineHeight - 4;

        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = '#888888';
        ctx.font = this.editor.ctx.font;

        // Handle multi-line suggestions
        const lines = this.ghostText.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const lineY = y + (i * lineHeight);
            const lineX = i === 0 ? x : lineNumberWidth + 10;
            ctx.fillText(lines[i], lineX, lineY);
        }

        ctx.restore();
    }

    /**
     * Get inline completion (for status display)
     */
    getInlineCompletion() {
        if (!this.currentSuggestion) return null;
        
        return {
            text: this.currentSuggestion,
            position: this.ghostPosition
        };
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIAutocomplete;
}
