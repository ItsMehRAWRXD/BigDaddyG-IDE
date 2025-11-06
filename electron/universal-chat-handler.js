/**
 * Universal Chat Handler - Make ALL chat inputs work!
 * Handles: #ai-input, #center-chat-input, terminal chat, and any future chat areas
 */

console.log('[UniversalChat] 🎯 Initializing universal chat handler...');

(function() {
'use strict';

class UniversalChatHandler {
    constructor() {
        this.chatHistory = [];
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }
    
    setup() {
        console.log('[UniversalChat] 🔧 Setting up chat handlers...');
        
        // Setup right sidebar chat (#ai-input)
        this.setupRightSidebarChat();
        
        // Setup center chat (created dynamically by tab-system)
        this.setupCenterChat();
        
        // Monitor for dynamically created chat inputs
        this.monitorForNewChats();
        
        console.log('[UniversalChat] ✅ Universal chat handler ready!');
    }
    
    setupRightSidebarChat() {
        const input = document.getElementById('ai-input');
        if (!input) {
            console.log('[UniversalChat] ⏳ Right sidebar chat not found yet, will retry...');
            return;
        }
        
        console.log('[UniversalChat] ✅ Right sidebar chat (#ai-input) enabled');
        
        // Ensure it's editable
        input.disabled = false;
        input.readOnly = false;
        
        // Add Ctrl+Enter handler
        input.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage(input, 'right-sidebar');
            }
        });
        
        // Also hook up the send button
        const sendBtn = document.getElementById('ai-send-btn');
        if (sendBtn) {
            sendBtn.onclick = () => this.sendMessage(input, 'right-sidebar');
        }
    }
    
    setupCenterChat() {
        // This gets created by tab-system.js when user opens Chat Tab
        // We'll monitor for it and setup when it appears
        setTimeout(() => {
            const input = document.getElementById('center-chat-input');
            if (input) {
                console.log('[UniversalChat] ✅ Center chat (#center-chat-input) enabled');
                input.disabled = false;
                input.readOnly = false;
            }
        }, 1000);
    }
    
    monitorForNewChats() {
        // Watch for dynamically added chat inputs
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Check for center chat
                        const centerChat = node.querySelector?.('#center-chat-input') || 
                                         (node.id === 'center-chat-input' ? node : null);
                        if (centerChat) {
                            console.log('[UniversalChat] 🆕 Found new center chat input!');
                            centerChat.disabled = false;
                            centerChat.readOnly = false;
                        }
                        
                        // Check for any textarea with chat-related IDs
                        const anyChat = node.querySelector?.('textarea[id*="chat"], textarea[id*="input"]');
                        if (anyChat && anyChat.id) {
                            console.log(`[UniversalChat] 🆕 Found new chat input: ${anyChat.id}`);
                            anyChat.disabled = false;
                            anyChat.readOnly = false;
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    async sendMessage(inputElement, source = 'unknown') {
        const message = inputElement.value.trim();
        if (!message) {
            console.log('[UniversalChat] ⚠️ Empty message, not sending');
            return;
        }
        
        console.log(`[UniversalChat] 📤 Sending message from ${source}:`, message.substring(0, 50) + '...');
        
        // Add to history
        this.chatHistory.push({
            timestamp: new Date(),
            source,
            message
        });
        
        // Display user message
        this.displayMessage('user', message, source);
        
        // Clear input
        inputElement.value = '';
        
        // Send to AI (use existing sendToAI if available, otherwise use Ollama directly)
        if (typeof sendToAI === 'function') {
            await sendToAI(message);
        } else {
            await this.sendToOllama(message, source);
        }
    }
    
    async sendToOllama(message, source) {
        try {
            // Show typing indicator
            const typingId = this.displayMessage('assistant', '💭 Thinking...', source);
            
            // Call Ollama
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'deepseek-coder:33b-instruct-q4_K_M',
                    prompt: message,
                    stream: false
                })
            });
            
            const data = await response.json();
            const answer = data.response || 'No response from AI';
            
            // Remove typing indicator and show real response
            this.removeMessage(typingId);
            this.displayMessage('assistant', answer, source);
            
        } catch (error) {
            console.error('[UniversalChat] ❌ Error sending to Ollama:', error);
            this.displayMessage('error', `Error: ${error.message}`, source);
        }
    }
    
    displayMessage(role, content, source) {
        const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Find appropriate message container
        let container;
        if (source === 'center') {
            container = document.getElementById('center-chat-messages');
        } else {
            container = document.getElementById('ai-chat-messages');
        }
        
        if (!container) {
            console.log('[UniversalChat] ⚠️ Message container not found for source:', source);
            return messageId;
        }
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.id = messageId;
        messageDiv.style.cssText = `
            padding: 12px 16px;
            margin: 8px 0;
            border-radius: 8px;
            background: ${role === 'user' ? 'rgba(119, 221, 190, 0.1)' : 'rgba(100, 100, 255, 0.1)'};
            border-left: 3px solid ${role === 'user' ? '#77ddbe' : '#6464ff'};
        `;
        
        const icon = role === 'user' ? '👤' : (role === 'error' ? '⚠️' : '🤖');
        messageDiv.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px; color: ${role === 'error' ? '#ff4757' : '#77ddbe'};">
                ${icon} ${role.charAt(0).toUpperCase() + role.slice(1)}
            </div>
            <div style="color: #e0e0e0;">${content}</div>
        `;
        
        container.appendChild(messageDiv);
        container.scrollTop = container.scrollHeight;
        
        return messageId;
    }
    
    removeMessage(messageId) {
        const msg = document.getElementById(messageId);
        if (msg) msg.remove();
    }
}

// Initialize
window.universalChatHandler = new UniversalChatHandler();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalChatHandler;
}

})();

