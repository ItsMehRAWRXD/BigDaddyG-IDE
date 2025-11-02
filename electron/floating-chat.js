/**
 * BigDaddyG IDE - Floating Centered Chat Panel
 * Like Cursor's Composer - opens in center, doesn't block sidebar
 */

(function() {
'use strict';

class FloatingChat {
    constructor() {
        this.isOpen = false;
        this.panel = null;
        this.init();
    }
    
    init() {
        console.log('[FloatingChat] 🎯 Initializing floating chat...');
        
        // Create floating panel
        this.createPanel();
        
        // Register keyboard shortcuts
        this.registerHotkeys();
        
        console.log('[FloatingChat] ✅ Floating chat ready (Ctrl+L to open)');
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'floating-chat-panel';
        this.panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.9);
            width: 800px;
            max-width: 90vw;
            height: 600px;
            max-height: 85vh;
            background: var(--cursor-bg);
            border: 2px solid var(--cursor-jade-dark);
            border-radius: 16px;
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(119, 221, 190, 0.2);
            z-index: 10000;
            display: none;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            backdrop-filter: blur(10px);
            overflow: hidden;
        `;
        
        this.panel.innerHTML = `
            <!-- Header -->
            <div style="padding: 16px 20px; background: linear-gradient(135deg, var(--cursor-bg-secondary), var(--cursor-bg-tertiary)); border-bottom: 1px solid var(--cursor-border); display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 20px;">🤖</span>
                    <span style="font-weight: 600; font-size: 15px; color: var(--cursor-jade-dark);">BigDaddyG AI</span>
                    <span style="font-size: 11px; color: var(--cursor-text-secondary); background: rgba(119, 221, 190, 0.1); padding: 3px 8px; border-radius: 12px;">Ctrl+L</span>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="floatingChat.minimize()" style="background: none; border: 1px solid var(--cursor-border); color: var(--cursor-text-secondary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.background='var(--cursor-bg-tertiary)'" onmouseout="this.style.background='none'">
                        ➖ Minimize
                    </button>
                    <button onclick="floatingChat.close()" style="background: none; border: 1px solid var(--cursor-border); color: var(--cursor-text-secondary); padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,71,87,0.1)'; this.style.borderColor='#ff4757'" onmouseout="this.style.background='none'; this.style.borderColor='var(--cursor-border)'">
                        ✕ Close
                    </button>
                </div>
            </div>
            
            <!-- Chat Messages -->
            <div id="floating-chat-messages" style="height: calc(100% - 180px); overflow-y: auto; padding: 20px; scroll-behavior: smooth;">
                <div style="text-align: center; color: var(--cursor-text-secondary); padding: 40px 20px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">💬</div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Start a conversation</div>
                    <div style="font-size: 13px;">Ask me anything about your code or project!</div>
                </div>
            </div>
            
            <!-- Input Area -->
            <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 16px 20px; background: var(--cursor-bg-secondary); border-top: 1px solid var(--cursor-border);">
                <div style="position: relative;">
                    <textarea 
                        id="floating-chat-input" 
                        placeholder="@ for context, / for commands, or drag files here 📎"
                        style="
                            width: 100%;
                            min-height: 80px;
                            max-height: 200px;
                            padding: 12px 80px 12px 12px;
                            background: var(--cursor-bg);
                            border: 1px solid var(--cursor-jade-light);
                            border-radius: 8px;
                            color: var(--cursor-text);
                            font-size: 13px;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            resize: vertical;
                            outline: none;
                            transition: all 0.2s;
                        "
                        onkeydown="if (event.ctrlKey && event.key === 'Enter') { event.preventDefault(); floatingChat.send(); }"
                        onfocus="this.style.borderColor='var(--cursor-jade-dark)'; this.style.boxShadow='0 0 0 3px rgba(119, 221, 190, 0.1)'"
                        onblur="this.style.borderColor='var(--cursor-jade-light)'; this.style.boxShadow='none'"
                    ></textarea>
                    <button 
                        onclick="floatingChat.send()" 
                        style="
                            position: absolute;
                            right: 12px;
                            bottom: 12px;
                            background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent));
                            border: none;
                            color: white;
                            padding: 10px 16px;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 13px;
                            font-weight: 600;
                            transition: all 0.2s;
                            box-shadow: 0 2px 8px rgba(119, 221, 190, 0.3);
                        "
                        onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(119, 221, 190, 0.4)'"
                        onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(119, 221, 190, 0.3)'"
                    >
                        ↑ Send
                    </button>
                </div>
                <div style="margin-top: 8px; font-size: 11px; color: var(--cursor-text-secondary); display: flex; justify-content: space-between;">
                    <span>💡 Press Ctrl+Enter to send</span>
                    <span id="floating-chat-counter">0 / 10,000</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        
        // Add character counter
        const input = document.getElementById('floating-chat-input');
        if (input) {
            input.addEventListener('input', () => {
                const counter = document.getElementById('floating-chat-counter');
                if (counter) {
                    counter.textContent = `${input.value.length} / 10,000`;
                }
            });
        }
    }
    
    registerHotkeys() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+L to toggle
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                this.toggle();
            }
            
            // Escape to close
            if (e.key === 'Escape' && this.isOpen) {
                e.preventDefault();
                this.close();
            }
        });
    }
    
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.panel.style.display = 'block';
        
        // Animate in
        setTimeout(() => {
            this.panel.style.opacity = '1';
            this.panel.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // Focus input
        setTimeout(() => {
            const input = document.getElementById('floating-chat-input');
            if (input) input.focus();
        }, 300);
        
        console.log('[FloatingChat] ✨ Opened');
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.panel.style.opacity = '0';
        this.panel.style.transform = 'translate(-50%, -50%) scale(0.9)';
        
        setTimeout(() => {
            this.panel.style.display = 'none';
        }, 300);
        
        console.log('[FloatingChat] 🔽 Closed');
    }
    
    minimize() {
        this.close();
        // Show notification badge on sidebar chat tab
        const chatTab = document.querySelector('[onclick*="chat"]');
        if (chatTab && !chatTab.querySelector('.notification-badge')) {
            const badge = document.createElement('span');
            badge.className = 'notification-badge';
            badge.textContent = '1';
            badge.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                background: var(--cursor-jade-dark);
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                font-weight: 600;
            `;
            chatTab.style.position = 'relative';
            chatTab.appendChild(badge);
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    async send() {
        const input = document.getElementById('floating-chat-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        input.value = '';
        
        // Add to chat
        this.addMessage('user', message);
        
        // Send to AI handler
        if (window.aiResponseHandler) {
            // Redirect to floating panel
            const originalAddMessage = window.aiResponseHandler.addAIMessage;
            window.aiResponseHandler.addAIMessage = (text, isError) => {
                this.addMessage('assistant', text, isError);
            };
            
            await window.aiResponseHandler.processMessage(message, []);
            
            // Restore original
            window.aiResponseHandler.addAIMessage = originalAddMessage;
        }
    }
    
    addMessage(role, content, isError = false) {
        const container = document.getElementById('floating-chat-messages');
        if (!container) return;
        
        // Clear welcome message on first message
        if (container.children.length === 1 && container.children[0].textContent.includes('Start a conversation')) {
            container.innerHTML = '';
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            margin-bottom: 16px;
            padding: 14px 16px;
            background: ${role === 'user' ? 'var(--cursor-bg-tertiary)' : 'rgba(119, 221, 190, 0.05)'};
            border-left: 4px solid ${role === 'user' ? 'var(--cursor-accent)' : 'var(--cursor-jade-dark)'};
            border-radius: 8px;
            font-size: 13px;
            line-height: 1.6;
            color: ${isError ? 'var(--red)' : 'var(--cursor-text)'};
            animation: slideInUp 0.3s ease-out;
        `;
        
        messageDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <span style="font-size: 16px;">${role === 'user' ? '👤' : '🤖'}</span>
                <span style="font-weight: 600; color: ${role === 'user' ? 'var(--cursor-accent)' : 'var(--cursor-jade-dark)'};">
                    ${role === 'user' ? 'You' : 'BigDaddyG'}
                </span>
                <span style="font-size: 10px; color: var(--cursor-text-secondary);">
                    ${new Date().toLocaleTimeString()}
                </span>
            </div>
            <div style="white-space: pre-wrap; word-wrap: break-word;">
                ${this.escapeHtml(content)}
            </div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Initialize
window.floatingChat = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.floatingChat = new FloatingChat();
    });
} else {
    window.floatingChat = new FloatingChat();
}

// Export
window.FloatingChat = FloatingChat;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingChat;
}

console.log('[FloatingChat] 📦 Floating chat module loaded');

})(); // End IIFE

