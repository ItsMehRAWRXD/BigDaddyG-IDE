/**
 * BigDaddyG IDE - AI Code Response System
 * Features:
 * - Beautiful code preview boxes
 * - Expandable/collapsible code sections
 * - File name display at top
 * - Copy, Accept, Reject buttons
 * - Spinning icon while generating
 * - One-click copy entire code block
 * - Auto-insert into editor on Accept
 */

(function() {
'use strict';

class AICodeResponseSystem {
    constructor() {
        this.codeBlocks = new Map();
        this.currentBlockId = 0;
        
        console.log('[AICodeResponse] 🎨 Initializing AI code response system...');
        this.init();
    }
    
    init() {
        // Add global styles
        this.addStyles();
        
        console.log('[AICodeResponse] ✅ AI code response system ready');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* AI Code Block Container */
            .ai-code-block {
                margin: 16px 0;
                border: 2px solid var(--cursor-jade-light);
                border-radius: 12px;
                overflow: hidden;
                background: var(--cursor-bg-secondary);
                transition: all 0.3s ease;
            }
            
            .ai-code-block:hover {
                border-color: var(--cursor-jade-dark);
                box-shadow: 0 4px 16px rgba(119, 221, 190, 0.2);
            }
            
            /* Code Block Header */
            .ai-code-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(119, 221, 190, 0.1), rgba(77, 192, 181, 0.1));
                border-bottom: 1px solid var(--cursor-border);
            }
            
            .ai-code-filename {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
                color: var(--cursor-jade-dark);
                font-family: 'Consolas', monospace;
            }
            
            .ai-code-status {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            /* Spinning Icon */
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .ai-code-spinner {
                font-size: 16px;
                animation: spin 1s linear infinite;
            }
            
            /* Action Buttons */
            .ai-code-actions {
                display: flex;
                gap: 6px;
            }
            
            .ai-code-btn {
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 11px;
                font-weight: 600;
                transition: all 0.2s;
                border: 1px solid transparent;
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .ai-code-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .ai-code-btn-show {
                background: rgba(119, 221, 190, 0.1);
                border-color: var(--cursor-jade-light);
                color: var(--cursor-jade-dark);
            }
            
            .ai-code-btn-copy {
                background: rgba(0, 150, 255, 0.1);
                border-color: #0096ff;
                color: #0096ff;
            }
            
            .ai-code-btn-accept {
                background: rgba(119, 221, 190, 0.2);
                border-color: var(--cursor-jade-dark);
                color: var(--cursor-jade-dark);
            }
            
            .ai-code-btn-reject {
                background: rgba(255, 71, 87, 0.1);
                border-color: #ff4757;
                color: #ff4757;
            }
            
            .ai-code-btn-expand {
                background: rgba(255, 152, 0, 0.1);
                border-color: var(--orange);
                color: var(--orange);
            }
            
            /* Code Content */
            .ai-code-content {
                max-height: 200px;
                overflow: hidden;
                transition: max-height 0.3s ease;
                position: relative;
            }
            
            .ai-code-content.expanded {
                max-height: none;
            }
            
            .ai-code-content.collapsed {
                max-height: 200px;
            }
            
            .ai-code-pre {
                margin: 0;
                padding: 16px;
                background: #1e1e1e;
                color: #d4d4d4;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.6;
                overflow-x: auto;
                user-select: text;
                cursor: text;
            }
            
            /* Fade overlay when collapsed */
            .ai-code-content.collapsed::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: linear-gradient(to bottom, transparent, #1e1e1e);
                pointer-events: none;
            }
            
            /* Code Syntax Highlighting */
            .code-keyword { color: #569cd6; }
            .code-string { color: #ce9178; }
            .code-comment { color: #6a9955; }
            .code-function { color: #dcdcaa; }
            .code-number { color: #b5cea8; }
            
            /* Copy Success Feedback */
            @keyframes copySuccess {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }
            
            .copy-success {
                animation: copySuccess 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Create a code block with file name and actions
     * @param {string} filename - Name of the file being worked on
     * @param {string} code - The code content
     * @param {boolean} isGenerating - Whether code is still being generated
     * @param {string} language - Programming language for syntax highlighting
     */
    createCodeBlock(filename, code, isGenerating = false, language = 'javascript') {
        const blockId = `ai-code-block-${++this.currentBlockId}`;
        
        const block = document.createElement('div');
        block.id = blockId;
        block.className = 'ai-code-block';
        
        const statusHTML = isGenerating 
            ? `<span class="ai-code-spinner">⚙️</span><span style="font-size: 11px; color: var(--cursor-text-secondary);">Coding...</span>`
            : `<span style="font-size: 11px; color: var(--cursor-jade-dark);">✓ Ready</span>`;
        
        block.innerHTML = `
            <!-- Header -->
            <div class="ai-code-header">
                <div class="ai-code-filename">
                    <span>📄</span>
                    <span>${this.escapeHtml(filename)}</span>
                </div>
                <div class="ai-code-status">
                    ${statusHTML}
                    <div class="ai-code-actions">
                        <button class="ai-code-btn ai-code-btn-show" onclick="aiCodeResponse.toggleOptions('${blockId}')" title="Show options">
                            ⋮
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Options Bar (Initially hidden) -->
            <div id="${blockId}-options" style="display: none; padding: 8px 16px; background: var(--cursor-bg-tertiary); border-bottom: 1px solid var(--cursor-border); display: none;">
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button class="ai-code-btn ai-code-btn-show" onclick="aiCodeResponse.showCode('${blockId}')" title="Toggle code visibility">
                        👁️ Show Code
                    </button>
                    <button class="ai-code-btn ai-code-btn-copy" onclick="aiCodeResponse.copyCode('${blockId}')" title="Copy entire code">
                        📋 Copy
                    </button>
                    <button class="ai-code-btn ai-code-btn-accept" onclick="aiCodeResponse.acceptCode('${blockId}')" title="Insert into editor">
                        ✅ Accept
                    </button>
                    <button class="ai-code-btn ai-code-btn-reject" onclick="aiCodeResponse.rejectCode('${blockId}')" title="Remove this code">
                        ❌ Reject
                    </button>
                    <button class="ai-code-btn ai-code-btn-expand" onclick="aiCodeResponse.expandCode('${blockId}')" title="Expand/collapse">
                        <span id="${blockId}-expand-icon">📖</span> <span id="${blockId}-expand-text">Expand</span>
                    </button>
                </div>
            </div>
            
            <!-- Code Content -->
            <div id="${blockId}-content" class="ai-code-content collapsed" style="display: none;">
                <pre class="ai-code-pre"><code id="${blockId}-code">${this.highlightCode(code, language)}</code></pre>
            </div>
            
            <!-- Divider -->
            <div style="height: 2px; background: linear-gradient(90deg, transparent, var(--cursor-jade-dark), transparent); opacity: 0.3;"></div>
        `;
        
        // Store code data
        this.codeBlocks.set(blockId, {
            filename,
            code,
            language,
            isExpanded: false,
            isVisible: false
        });
        
        return block;
    }
    
    /**
     * Add a code block to a message container
     */
    addCodeBlockToMessage(messageContainer, filename, code, isGenerating = false, language = 'javascript') {
        const block = this.createCodeBlock(filename, code, isGenerating, language);
        messageContainer.appendChild(block);
        return block.id;
    }
    
    /**
     * Update code block when generation is complete
     */
    finalizeCodeBlock(blockId, finalCode) {
        const block = document.getElementById(blockId);
        if (!block) return;
        
        // Update status to Ready
        const statusEl = block.querySelector('.ai-code-status');
        if (statusEl) {
            statusEl.innerHTML = `
                <span style="font-size: 11px; color: var(--cursor-jade-dark);">✓ Ready</span>
                <div class="ai-code-actions">
                    <button class="ai-code-btn ai-code-btn-show" onclick="aiCodeResponse.toggleOptions('${blockId}')" title="Show options">
                        ⋮
                    </button>
                </div>
            `;
        }
        
        // Update code content
        const blockData = this.codeBlocks.get(blockId);
        if (blockData) {
            blockData.code = finalCode;
            const codeEl = document.getElementById(`${blockId}-code`);
            if (codeEl) {
                codeEl.innerHTML = this.highlightCode(finalCode, blockData.language);
            }
        }
    }
    
    /**
     * Toggle options bar visibility
     */
    toggleOptions(blockId) {
        const optionsBar = document.getElementById(`${blockId}-options`);
        if (!optionsBar) return;
        
        if (optionsBar.style.display === 'none' || !optionsBar.style.display) {
            optionsBar.style.display = 'flex';
        } else {
            optionsBar.style.display = 'none';
        }
    }
    
    /**
     * Show/hide code content
     */
    showCode(blockId) {
        const content = document.getElementById(`${blockId}-content`);
        const blockData = this.codeBlocks.get(blockId);
        
        if (!content || !blockData) return;
        
        blockData.isVisible = !blockData.isVisible;
        
        if (blockData.isVisible) {
            content.style.display = 'block';
        } else {
            content.style.display = 'none';
        }
    }
    
    /**
     * Expand/collapse code content
     */
    expandCode(blockId) {
        const content = document.getElementById(`${blockId}-content`);
        const expandIcon = document.getElementById(`${blockId}-expand-icon`);
        const expandText = document.getElementById(`${blockId}-expand-text`);
        const blockData = this.codeBlocks.get(blockId);
        
        if (!content || !blockData) return;
        
        blockData.isExpanded = !blockData.isExpanded;
        
        if (blockData.isExpanded) {
            content.classList.remove('collapsed');
            content.classList.add('expanded');
            if (expandIcon) expandIcon.textContent = '📕';
            if (expandText) expandText.textContent = 'Collapse';
        } else {
            content.classList.remove('expanded');
            content.classList.add('collapsed');
            if (expandIcon) expandIcon.textContent = '📖';
            if (expandText) expandText.textContent = 'Expand';
        }
        
        // Make sure it's visible
        if (!blockData.isVisible) {
            this.showCode(blockId);
        }
    }
    
    /**
     * Copy code to clipboard
     */
    async copyCode(blockId) {
        const blockData = this.codeBlocks.get(blockId);
        if (!blockData) return;
        
        try {
            await navigator.clipboard.writeText(blockData.code);
            
            // Visual feedback
            const btn = document.querySelector(`#${blockId} .ai-code-btn-copy`);
            if (btn) {
                const originalText = btn.innerHTML;
                btn.innerHTML = '✓ Copied!';
                btn.classList.add('copy-success');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('copy-success');
                }, 2000);
            }
            
            console.log('[AICodeResponse] 📋 Code copied to clipboard');
            this.showNotification('📋 Code copied to clipboard!', 'success');
            
        } catch (error) {
            console.error('[AICodeResponse] ❌ Copy failed:', error);
            this.showNotification('❌ Failed to copy code', 'error');
        }
    }
    
    /**
     * Accept code and insert into editor
     */
    acceptCode(blockId) {
        const blockData = this.codeBlocks.get(blockId);
        if (!blockData) return;
        
        console.log('[AICodeResponse] ✅ Accepting code:', blockData.filename);
        
        // Try to insert into Monaco editor
        if (window.editor) {
            try {
                const position = window.editor.getPosition();
                window.editor.executeEdits('ai-code-insert', [{
                    range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                    text: blockData.code
                }]);
                
                this.showNotification(`✅ Code inserted into editor!`, 'success');
                
                // Optionally remove the block
                const block = document.getElementById(blockId);
                if (block) {
                    block.style.animation = 'slideOutRight 0.3s ease-out';
                    setTimeout(() => block.remove(), 300);
                }
                
            } catch (error) {
                console.error('[AICodeResponse] ❌ Error inserting code:', error);
                this.showNotification('❌ Error inserting code into editor', 'error');
            }
        } else {
            // Fallback: copy to clipboard
            this.copyCode(blockId);
            this.showNotification('📋 Code copied to clipboard (editor not available)', 'info');
        }
    }
    
    /**
     * Reject code and remove block
     */
    rejectCode(blockId) {
        if (!confirm('Remove this code block?')) return;
        
        const block = document.getElementById(blockId);
        if (block) {
            block.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                block.remove();
                this.codeBlocks.delete(blockId);
            }, 300);
        }
        
        console.log('[AICodeResponse] ❌ Code rejected:', blockId);
    }
    
    /**
     * Highlight code with basic syntax highlighting
     */
    highlightCode(code, language) {
        // Basic syntax highlighting (can be enhanced with Prism.js or highlight.js)
        let highlighted = this.escapeHtml(code);
        
        // Keywords
        const keywords = ['function', 'const', 'let', 'var', 'if', 'else', 'for', 'while', 'return', 'class', 'import', 'export', 'async', 'await'];
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="code-keyword">${keyword}</span>`);
        });
        
        // Strings
        highlighted = highlighted.replace(/(['"`])(.*?)\1/g, '<span class="code-string">$&</span>');
        
        // Comments
        highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
        highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');
        
        // Numbers
        highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');
        
        return highlighted;
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent))' : type === 'error' ? '#ff4757' : '#569cd6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10001;
            font-size: 13px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
window.aiCodeResponse = new AICodeResponseSystem();

// Export
window.AICodeResponseSystem = AICodeResponseSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AICodeResponseSystem;
}

console.log('[AICodeResponse] 📦 AI Code Response System loaded');

})(); // End IIFE

