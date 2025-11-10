/**
 * BigDaddyG IDE - Auto Formatter
 * Automatic code formatting with multiple language support
 */

class AutoFormatter {
    constructor() {
        this.formatters = new Map();
        this.initializeFormatters();
        
        console.log('[AutoFormatter] Initialized');
    }
    
    /**
     * Initialize formatters for different languages
     */
    initializeFormatters() {
        this.formatters.set('javascript', this.formatJavaScript.bind(this));
        this.formatters.set('typescript', this.formatJavaScript.bind(this));
        this.formatters.set('json', this.formatJSON.bind(this));
        this.formatters.set('html', this.formatHTML.bind(this));
        this.formatters.set('css', this.formatCSS.bind(this));
        this.formatters.set('python', this.formatPython.bind(this));
    }
    
    /**
     * Format code
     */
    format(code, language, options = {}) {
        const formatter = this.formatters.get(language);
        if (!formatter) {
            console.warn(`[AutoFormatter] No formatter for language: ${language}`);
            return code;
        }
        
        try {
            return formatter(code, options);
        } catch (error) {
            console.error('[AutoFormatter] Formatting error:', error);
            return code;
        }
    }
    
    /**
     * Format JavaScript/TypeScript
     */
    formatJavaScript(code, options = {}) {
        const {
            indentSize = 2,
            semicolons = true,
            singleQuote = true
        } = options;
        
        let formatted = code;
        const indent = ' '.repeat(indentSize);
        
        // Add newlines after braces
        formatted = formatted.replace(/\{/g, ' {\n');
        formatted = formatted.replace(/\}/g, '\n}\n');
        
        // Add newlines after semicolons
        if (semicolons) {
            formatted = formatted.replace(/;/g, ';\n');
        }
        
        // Fix indentation
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const indentedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // Decrease indent for closing braces
            if (trimmed.startsWith('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indented = indent.repeat(indentLevel) + trimmed;
            
            // Increase indent for opening braces
            if (trimmed.endsWith('{')) {
                indentLevel++;
            }
            
            return indented;
        });
        
        formatted = indentedLines.join('\n');
        
        // Clean up extra newlines
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        
        return formatted.trim();
    }
    
    /**
     * Format JSON
     */
    formatJSON(code, options = {}) {
        const { indentSize = 2 } = options;
        
        try {
            const obj = JSON.parse(code);
            return JSON.stringify(obj, null, indentSize);
        } catch (error) {
            console.error('[AutoFormatter] Invalid JSON:', error);
            return code;
        }
    }
    
    /**
     * Format HTML
     */
    formatHTML(code, options = {}) {
        const { indentSize = 2 } = options;
        const indent = ' '.repeat(indentSize);
        
        let formatted = code;
        let indentLevel = 0;
        
        // Add newlines after tags
        formatted = formatted.replace(/>\s*</g, '>\n<');
        
        const lines = formatted.split('\n');
        const indentedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // Decrease indent for closing tags
            if (trimmed.startsWith('</')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indented = indent.repeat(indentLevel) + trimmed;
            
            // Increase indent for opening tags (but not self-closing)
            if (trimmed.startsWith('<') && 
                !trimmed.startsWith('</') && 
                !trimmed.endsWith('/>') &&
                !trimmed.match(/<(br|hr|img|input|meta|link)/i)) {
                indentLevel++;
            }
            
            return indented;
        });
        
        return indentedLines.join('\n').trim();
    }
    
    /**
     * Format CSS
     */
    formatCSS(code, options = {}) {
        const { indentSize = 2 } = options;
        const indent = ' '.repeat(indentSize);
        
        let formatted = code;
        
        // Add newlines
        formatted = formatted.replace(/\{/g, ' {\n');
        formatted = formatted.replace(/\}/g, '\n}\n');
        formatted = formatted.replace(/;/g, ';\n');
        
        const lines = formatted.split('\n');
        let indentLevel = 0;
        const indentedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            if (trimmed === '}') {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            const indented = indent.repeat(indentLevel) + trimmed;
            
            if (trimmed.endsWith('{')) {
                indentLevel++;
            }
            
            return indented;
        });
        
        formatted = indentedLines.join('\n');
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        
        return formatted.trim();
    }
    
    /**
     * Format Python
     */
    formatPython(code, options = {}) {
        const { indentSize = 4 } = options;
        const indent = ' '.repeat(indentSize);
        
        const lines = code.split('\n');
        let indentLevel = 0;
        const formattedLines = lines.map(line => {
            const trimmed = line.trim();
            if (!trimmed) return '';
            
            // Decrease indent for dedented lines
            if (trimmed.startsWith('return') || 
                trimmed.startsWith('break') || 
                trimmed.startsWith('continue') ||
                trimmed.startsWith('except') ||
                trimmed.startsWith('finally') ||
                trimmed.startsWith('elif') ||
                trimmed.startsWith('else')) {
                const tempLevel = Math.max(0, indentLevel - 1);
                const indented = indent.repeat(tempLevel) + trimmed;
                return indented;
            }
            
            const indented = indent.repeat(indentLevel) + trimmed;
            
            // Increase indent after colons
            if (trimmed.endsWith(':')) {
                indentLevel++;
            }
            
            return indented;
        });
        
        return formattedLines.join('\n').trim();
    }
    
    /**
     * Format on save
     */
    formatOnSave(code, language, options) {
        console.log(`[AutoFormatter] Formatting ${language} on save...`);
        return this.format(code, language, options);
    }
    
    /**
     * Format on type
     */
    formatOnType(code, language, position, char, options) {
        // Format specific constructs as user types
        if (char === ';' || char === '}') {
            return this.format(code, language, options);
        }
        return code;
    }
}

module.exports = AutoFormatter;
