/**
 * Quick Actions Executor - Wire chat quick actions to agentic executor
 * Fixes audit issue: "Chat quick actions only write text"
 */

(function() {
'use strict';

class QuickActionsExecutor {
    constructor() {
        this.executor = null;
        this.init();
    }
    
    async init() {
        // Wait for agentic executor to be available
        this.waitForExecutor();
        
        // Wire up all quick action buttons
        this.wireQuickActions();
        
        console.log('[QuickActions] ✅ Quick actions wired to agentic executor');
    }
    
    waitForExecutor() {
        const checkExecutor = () => {
            if (window.getAgenticExecutor) {
                this.executor = window.getAgenticExecutor();
                console.log('[QuickActions] 🤖 Agentic executor connected');
                return true;
            }
            return false;
        };
        
        if (!checkExecutor()) {
            // Poll until executor is available
            const interval = setInterval(() => {
                if (checkExecutor()) {
                    clearInterval(interval);
                }
            }, 100);
        }
    }
    
    wireQuickActions() {
        // Find all quick action buttons in the UI
        const quickActionButtons = [
            { selector: '[onclick*="Generate Code"]', action: 'generateCode' },
            { selector: '[onclick*="Fix Bug"]', action: 'fixBug' },
            { selector: '[onclick*="Summarize"]', action: 'summarize' },
            { selector: '[onclick*="Explain Code"]', action: 'explainCode' },
            { selector: '[onclick*="Optimize"]', action: 'optimize' },
            { selector: '[onclick*="Add Tests"]', action: 'addTests' },
            { selector: '[onclick*="Refactor"]', action: 'refactor' },
            { selector: '[onclick*="Document"]', action: 'document' }
        ];
        
        quickActionButtons.forEach(({ selector, action }) => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                // Remove old onclick handler
                button.removeAttribute('onclick');
                
                // Add new handler that uses executor
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.executeQuickAction(action, button);
                });
            });
        });
        
        // Also wire up any buttons with specific IDs
        this.wireSpecificButtons();
    }
    
    wireSpecificButtons() {
        const buttonMappings = {
            'generate-code-btn': 'generateCode',
            'fix-bug-btn': 'fixBug',
            'summarize-btn': 'summarize',
            'explain-code-btn': 'explainCode',
            'optimize-btn': 'optimize',
            'add-tests-btn': 'addTests',
            'refactor-btn': 'refactor',
            'document-btn': 'document'
        };
        
        Object.entries(buttonMappings).forEach(([id, action]) => {
            const button = document.getElementById(id);
            if (button) {
                button.onclick = (e) => {
                    e.preventDefault();
                    this.executeQuickAction(action, button);
                };
            }
        });
    }
    
    async executeQuickAction(action, button) {
        if (!this.executor) {
            this.showError('Agentic executor not available');
            return;
        }
        
        // Get current code context
        const currentCode = this.getCurrentCode();
        const selectedText = this.getSelectedText();
        
        // Show loading state
        const originalText = button.textContent;
        button.textContent = '⏳ Processing...';
        button.disabled = true;
        
        try {
            let task = '';
            
            switch (action) {
                case 'generateCode':
                    task = this.buildGenerateCodeTask(selectedText);
                    break;
                case 'fixBug':
                    task = this.buildFixBugTask(currentCode, selectedText);
                    break;
                case 'summarize':
                    task = this.buildSummarizeTask(currentCode, selectedText);
                    break;
                case 'explainCode':
                    task = this.buildExplainCodeTask(currentCode, selectedText);
                    break;
                case 'optimize':
                    task = this.buildOptimizeTask(currentCode, selectedText);
                    break;
                case 'addTests':
                    task = this.buildAddTestsTask(currentCode, selectedText);
                    break;
                case 'refactor':
                    task = this.buildRefactorTask(currentCode, selectedText);
                    break;
                case 'document':
                    task = this.buildDocumentTask(currentCode, selectedText);
                    break;
                default:
                    throw new Error(`Unknown action: ${action}`);
            }
            
            // Execute the task
            const result = await this.executor.executeTask(task, (progress) => {
                this.handleProgress(progress, button);
            });
            
            if (result.success) {
                this.showSuccess(`${action} completed successfully!`);
                this.displayResult(result, action);
            } else {
                this.showError(`${action} failed: ${result.error}`);
            }
            
        } catch (error) {
            console.error(`[QuickActions] ${action} failed:`, error);
            this.showError(`${action} failed: ${error.message}`);
        } finally {
            // Restore button state
            button.textContent = originalText;
            button.disabled = false;
        }
    }
    
    buildGenerateCodeTask(context) {
        if (context) {
            return `Generate code based on this description: "${context}"`;
        } else {
            return 'Generate code for the current context. Ask me what kind of code to generate if unclear.';
        }
    }
    
    buildFixBugTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Analyze and fix any bugs in ${target}. Provide the corrected code with explanations of what was fixed.`;
    }
    
    buildSummarizeTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Provide a clear, concise summary of what ${target} does, including its main purpose, key functions, and any important details.`;
    }
    
    buildExplainCodeTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Explain ${target} in detail. Break down how it works, what each part does, and provide insights about the implementation.`;
    }
    
    buildOptimizeTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Optimize ${target} for better performance, readability, and maintainability. Provide the optimized version with explanations of improvements made.`;
    }
    
    buildAddTestsTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Generate comprehensive unit tests for ${target}. Include edge cases, error conditions, and ensure good test coverage.`;
    }
    
    buildRefactorTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Refactor ${target} to improve code quality, structure, and maintainability while preserving functionality.`;
    }
    
    buildDocumentTask(code, selectedText) {
        const target = selectedText || code || 'the current code';
        return `Generate comprehensive documentation for ${target}. Include function descriptions, parameters, return values, and usage examples.`;
    }
    
    getCurrentCode() {
        // Try to get code from Monaco editor
        if (window.editor && window.editor.getValue) {
            return window.editor.getValue();
        }
        
        // Fallback to any textarea or code elements
        const codeElements = document.querySelectorAll('textarea, .monaco-editor, pre, code');
        for (const element of codeElements) {
            if (element.value) return element.value;
            if (element.textContent) return element.textContent;
        }
        
        return '';
    }
    
    getSelectedText() {
        // Try Monaco editor selection first
        if (window.editor && window.editor.getSelection) {
            const selection = window.editor.getSelection();
            if (selection && !selection.isEmpty()) {
                return window.editor.getModel().getValueInRange(selection);
            }
        }
        
        // Fallback to browser selection
        const selection = window.getSelection();
        if (selection && selection.toString().trim()) {
            return selection.toString().trim();
        }
        
        return '';
    }
    
    handleProgress(progress, button) {
        switch (progress.type) {
            case 'plan':
                button.textContent = '📋 Planning...';
                break;
            case 'step_start':
                button.textContent = `🔧 ${progress.step.description}`;
                break;
            case 'command':
                button.textContent = '💻 Executing...';
                break;
            case 'step_complete':
                button.textContent = '✅ Step complete';
                break;
            case 'verifying':
                button.textContent = '🔍 Verifying...';
                break;
        }
    }
    
    displayResult(result, action) {
        // Find the chat messages container
        const messagesContainer = document.getElementById('ai-chat-messages') || 
                                 document.getElementById('floating-chat-messages');
        
        if (!messagesContainer) {
            console.warn('[QuickActions] No messages container found');
            return;
        }
        
        // Create result message
        const resultDiv = document.createElement('div');
        resultDiv.className = 'ai-message';
        resultDiv.style.cssText = `
            margin-bottom: 16px;
            padding: 14px;
            background: rgba(119, 221, 190, 0.1);
            border-left: 4px solid var(--cursor-jade-dark);
            border-radius: 8px;
        `;
        
        const actionIcons = {
            generateCode: '💻',
            fixBug: '🐛',
            summarize: '📝',
            explainCode: '📚',
            optimize: '⚡',
            addTests: '🧪',
            refactor: '🔄',
            document: '📖'
        };
        
        const icon = actionIcons[action] || '🤖';
        const title = action.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        
        resultDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 16px;">${icon}</span>
                <span style="font-weight: 600; color: var(--cursor-jade-dark);">${title} Result</span>
                <span style="font-size: 10px; color: var(--cursor-text-secondary);">${new Date().toLocaleTimeString()}</span>
            </div>
            <div style="color: var(--cursor-text); font-size: 13px; line-height: 1.6;">
                Task completed successfully! Check the verification results for details.
            </div>
        `;
        
        messagesContainer.appendChild(resultDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#77ddbe' : '#4a90e2'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 20000;
            font-size: 13px;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.quickActionsExecutor = new QuickActionsExecutor();
    });
} else {
    window.quickActionsExecutor = new QuickActionsExecutor();
}

// Export
window.QuickActionsExecutor = QuickActionsExecutor;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickActionsExecutor;
}

console.log('[QuickActions] 📦 Quick actions executor module loaded');

})();