/**
 * BigDaddyG IDE - Monaco Editor Configuration
 * Centralized Monaco Editor setup and language configuration
 */

(function() {
'use strict';

class MonacoConfig {
    constructor() {
        this.editor = null;
        this.languages = [
            'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 
            'csharp', 'go', 'rust', 'html', 'css', 'json', 'xml',
            'markdown', 'yaml', 'sql', 'php', 'ruby', 'swift',
            'kotlin', 'dart', 'lua', 'gdscript', 'shader'
        ];
        this.themes = ['vs-dark', 'vs-light', 'hc-black', 'hc-light'];
    }
    
    /**
     * Initialize Monaco Editor
     */
    async initialize(container, options = {}) {
        const defaultOptions = {
            value: options.value || '',
            language: options.language || 'javascript',
            theme: options.theme || 'vs-dark',
            automaticLayout: true,
            fontSize: 14,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 4,
            insertSpaces: true,
            formatOnPaste: true,
            formatOnType: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            parameterHints: { enabled: true }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            this.editor = monaco.editor.create(container, finalOptions);
            console.log('[Monaco] ✅ Editor initialized');
            return this.editor;
        } catch (error) {
            console.error('[Monaco] ❌ Failed to initialize:', error);
            return null;
        }
    }
    
    /**
     * Get supported languages
     */
    getSupportedLanguages() {
        return this.languages;
    }
    
    /**
     * Get available themes
     */
    getAvailableThemes() {
        return this.themes;
    }
    
    /**
     * Set editor theme
     */
    setTheme(themeName) {
        if (this.editor) {
            monaco.editor.setTheme(themeName);
        }
    }
    
    /**
     * Set editor language
     */
    setLanguage(language) {
        if (this.editor) {
            const model = this.editor.getModel();
            if (model) {
                monaco.editor.setModelLanguage(model, language);
            }
        }
    }
    
    /**
     * Get editor instance
     */
    getEditor() {
        return this.editor;
    }
    
    /**
     * Dispose editor
     */
    dispose() {
        if (this.editor) {
            this.editor.dispose();
            this.editor = null;
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MonacoConfig;
} else {
    window.MonacoConfig = MonacoConfig;
}

})();
