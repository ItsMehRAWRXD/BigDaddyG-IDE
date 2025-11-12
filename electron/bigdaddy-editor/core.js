/**
 * BigDaddy Editor - Custom Code Editor (Replaces Monaco)
 * Lightweight, fast, and fully integrated with BigDaddyG IDE
 */

class BigDaddyEditor {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            value: options.value || '',
            language: options.language || 'javascript',
            theme: options.theme || 'dark',
            fontSize: options.fontSize || 14,
            lineNumbers: options.lineNumbers !== false,
            wordWrap: options.wordWrap !== false,
            tabSize: options.tabSize || 4,
            readOnly: options.readOnly || false,
            ...options
        };
        
        this.content = this.options.value;
        this.history = [this.content];
        this.historyIndex = 0;
        this.cursorPosition = { line: 0, column: 0 };
        
        this.init();
    }
    
    init() {
        // Clear container
        this.container.innerHTML = '';
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            background: #1e1e1e;
            color: #d4d4d4;
            font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
            font-size: ${this.options.fontSize}px;
            overflow: hidden;
        `;
        
        // Create editor wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.style.cssText = `
            display: flex;
            height: 100%;
            overflow: hidden;
        `;
        this.container.appendChild(this.wrapper);
        
        // Create line numbers
        if (this.options.lineNumbers) {
            this.lineNumbersEl = document.createElement('div');
            this.lineNumbersEl.style.cssText = `
                background: #1e1e1e;
                color: #858585;
                padding: 10px 8px;
                text-align: right;
                min-width: 50px;
                user-select: none;
                border-right: 1px solid #3e3e42;
                overflow: hidden;
            `;
            this.wrapper.appendChild(this.lineNumbersEl);
        }
        
        // Create textarea
        this.textarea = document.createElement('textarea');
        this.textarea.value = this.content;
        this.textarea.spellcheck = false;
        this.textarea.readOnly = this.options.readOnly;
        this.textarea.style.cssText = `
            flex: 1;
            width: 100%;
            height: 100%;
            background: transparent;
            color: #d4d4d4;
            font-family: inherit;
            font-size: inherit;
            border: none;
            outline: none;
            padding: 10px;
            resize: none;
            white-space: ${this.options.wordWrap ? 'pre-wrap' : 'pre'};
            word-wrap: ${this.options.wordWrap ? 'break-word' : 'normal'};
            overflow-wrap: ${this.options.wordWrap ? 'break-word' : 'normal'};
            tab-size: ${this.options.tabSize};
            -moz-tab-size: ${this.options.tabSize};
        `;
        this.wrapper.appendChild(this.textarea);
        
        // Create syntax highlighting overlay
        this.highlightLayer = document.createElement('div');
        this.highlightLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: ${this.options.lineNumbers ? '50px' : '0'};
            right: 0;
            bottom: 0;
            padding: 10px;
            pointer-events: none;
            font-family: inherit;
            font-size: inherit;
            white-space: ${this.options.wordWrap ? 'pre-wrap' : 'pre'};
            word-wrap: ${this.options.wordWrap ? 'break-word' : 'normal'};
            overflow: hidden;
            color: transparent;
            tab-size: ${this.options.tabSize};
            -moz-tab-size: ${this.options.tabSize};
        `;
        this.container.appendChild(this.highlightLayer);
        
        // Event listeners
        this.attachEventListeners();
        
        // Initial render
        this.updateLineNumbers();
        this.updateSyntaxHighlighting();
        
        console.log('[BigDaddyEditor] ✅ Editor initialized');
    }
    
    attachEventListeners() {
        // Input handling
        this.textarea.addEventListener('input', () => {
            this.content = this.textarea.value;
            this.addToHistory(this.content);
            this.updateLineNumbers();
            this.updateSyntaxHighlighting();
            this.triggerChange();
        });
        
        // Scroll sync
        this.textarea.addEventListener('scroll', () => {
            if (this.lineNumbersEl) {
                this.lineNumbersEl.scrollTop = this.textarea.scrollTop;
            }
            this.highlightLayer.scrollTop = this.textarea.scrollTop;
            this.highlightLayer.scrollLeft = this.textarea.scrollLeft;
        });
        
        // Tab key handling
        this.textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.textarea.selectionStart;
                const end = this.textarea.selectionEnd;
                const spaces = ' '.repeat(this.options.tabSize);
                
                this.textarea.value = this.textarea.value.substring(0, start) + spaces + this.textarea.value.substring(end);
                this.textarea.selectionStart = this.textarea.selectionEnd = start + spaces.length;
                
                this.textarea.dispatchEvent(new Event('input'));
            }
            
            // Ctrl+Z (Undo)
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.undo();
            }
            
            // Ctrl+Y or Ctrl+Shift+Z (Redo)
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.redo();
            }
        });
    }
    
    updateLineNumbers() {
        if (!this.lineNumbersEl) return;
        
        const lines = this.content.split('\n');
        this.lineNumbersEl.innerHTML = lines.map((_, i) => 
            `<div style="line-height: 1.5;">${i + 1}</div>`
        ).join('');
    }
    
    updateSyntaxHighlighting() {
        // Apply syntax highlighting based on language
        const highlighted = this.highlightSyntax(this.content, this.options.language);
        this.highlightLayer.innerHTML = highlighted;
    }
    
    highlightSyntax(code, language) {
        if (!code) return '';
        
        let html = code;
        
        // JavaScript/TypeScript highlighting
        if (language === 'javascript' || language === 'typescript') {
            // Keywords
            html = html.replace(/\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|async|await|try|catch|finally|throw|new|this|super|static|typeof|instanceof)\b/g, 
                '<span style="color: #569cd6;">$1</span>');
            
            // Strings
            html = html.replace(/(['"`])(.*?)\1/g, '<span style="color: #ce9178;">$1$2$1</span>');
            
            // Numbers
            html = html.replace(/\b(\d+)\b/g, '<span style="color: #b5cea8;">$1</span>');
            
            // Comments
            html = html.replace(/\/\/(.*)/g, '<span style="color: #6a9955;">//$1</span>');
            html = html.replace(/\/\*(.*?)\*\//g, '<span style="color: #6a9955;">/*$1*/</span>');
            
            // Functions
            html = html.replace(/\b([a-zA-Z_]\w*)\s*\(/g, '<span style="color: #dcdcaa;">$1</span>(');
        }
        
        // Python highlighting
        if (language === 'python') {
            html = html.replace(/\b(def|class|import|from|return|if|elif|else|for|while|break|continue|try|except|finally|with|as|pass|lambda|yield|global|nonlocal)\b/g,
                '<span style="color: #569cd6;">$1</span>');
            
            html = html.replace(/(['"`])(.*?)\1/g, '<span style="color: #ce9178;">$1$2$1</span>');
            html = html.replace(/#(.*)/g, '<span style="color: #6a9955;">#$1</span>');
        }
        
        // HTML highlighting
        if (language === 'html') {
            html = html.replace(/&lt;(\/?[a-z][a-z0-9]*)\b/gi, '&lt;<span style="color: #569cd6;">$1</span>');
            html = html.replace(/([a-z\-]+)=/gi, '<span style="color: #9cdcfe;">$1</span>=');
        }
        
        // CSS highlighting
        if (language === 'css') {
            html = html.replace(/([a-z\-]+)\s*:/gi, '<span style="color: #9cdcfe;">$1</span>:');
            html = html.replace(/#([0-9a-f]{3,6})\b/gi, '<span style="color: #ce9178;">#$1</span>');
        }
        
        return html;
    }
    
    addToHistory(content) {
        // Add to history (limit to 100 entries)
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(content);
        if (this.history.length > 100) this.history.shift();
        this.historyIndex = this.history.length - 1;
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.setValue(this.history[this.historyIndex]);
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.setValue(this.history[this.historyIndex]);
        }
    }
    
    triggerChange() {
        if (this.options.onChange) {
            this.options.onChange(this.content);
        }
    }
    
    // Monaco-compatible API
    getValue() {
        return this.textarea.value;
    }
    
    setValue(value) {
        this.content = value;
        this.textarea.value = value;
        this.updateLineNumbers();
        this.updateSyntaxHighlighting();
    }
    
    getModel() {
        return {
            getValue: () => this.getValue(),
            setValue: (v) => this.setValue(v)
        };
    }
    
    updateOptions(options) {
        Object.assign(this.options, options);
        if (options.fontSize) {
            this.container.style.fontSize = options.fontSize + 'px';
        }
        if (options.theme) {
            this.setTheme(options.theme);
        }
        if (options.wordWrap !== undefined) {
            this.textarea.style.whiteSpace = options.wordWrap ? 'pre-wrap' : 'pre';
        }
    }
    
    setTheme(theme) {
        if (theme === 'light') {
            this.container.style.background = '#ffffff';
            this.container.style.color = '#000000';
            this.textarea.style.color = '#000000';
        } else {
            this.container.style.background = '#1e1e1e';
            this.container.style.color = '#d4d4d4';
            this.textarea.style.color = '#d4d4d4';
        }
    }
    
    layout() {
        // Force layout recalculation
        this.updateLineNumbers();
    }
    
    focus() {
        this.textarea.focus();
    }
    
    dispose() {
        this.container.innerHTML = '';
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.BigDaddyEditor = BigDaddyEditor;
    console.log('[BigDaddyEditor] ✅ Class exposed globally');
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BigDaddyEditor;
}
