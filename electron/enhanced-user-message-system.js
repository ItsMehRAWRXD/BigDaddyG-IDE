/**
 * BigDaddyG IDE - Enhanced User Message System
 * Features:
 * - Expandable user messages
 * - Edit, Delete, Copy controls
 * - Attach files, images, code snippets
 * - Context awareness (@file mentions)
 * - Voice input integration
 * - Deep research toggles
 * - Thinking process display
 * - Quality settings
 */

(function() {
'use strict';

class EnhancedUserMessageSystem {
    constructor() {
        this.messages = new Map();
        this.currentMessageId = 0;
        this.deepResearchEnabled = false;
        this.thinkingEnabled = true;
        this.webSearchEnabled = false;
        this.quality = 'auto'; // auto, fast, balanced, max
        this.attachedFiles = [];
        
        console.log('[EnhancedUserMessage] 🎨 Initializing enhanced user message system...');
        this.init();
    }
    
    init() {
        // Add styles
        this.addStyles();
        
        // Create controls panel
        this.createControlsPanel();
        
        console.log('[EnhancedUserMessage] ✅ Enhanced user message system ready');
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* User Message Container */
            .user-message-enhanced {
                margin: 16px 0;
                border: 2px solid rgba(255, 152, 0, 0.3);
                border-radius: 12px;
                overflow: hidden;
                background: var(--cursor-bg-secondary);
                transition: all 0.3s ease;
            }
            
            .user-message-enhanced:hover {
                border-color: var(--orange);
                box-shadow: 0 4px 16px rgba(255, 152, 0, 0.2);
            }
            
            /* Message Header */
            .user-message-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 16px;
                background: linear-gradient(135deg, rgba(255, 152, 0, 0.1), rgba(255, 107, 53, 0.1));
                border-bottom: 1px solid var(--cursor-border);
            }
            
            .user-message-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .user-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--orange);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
            }
            
            .user-name {
                font-size: 14px;
                font-weight: 600;
                color: var(--orange);
            }
            
            .message-timestamp {
                font-size: 11px;
                color: var(--cursor-text-secondary);
            }
            
            /* Message Controls */
            .user-message-controls {
                display: flex;
                gap: 6px;
            }
            
            .user-msg-btn {
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
            
            .user-msg-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            
            .user-msg-btn-edit {
                background: rgba(255, 152, 0, 0.1);
                border-color: var(--orange);
                color: var(--orange);
            }
            
            .user-msg-btn-copy {
                background: rgba(0, 150, 255, 0.1);
                border-color: #0096ff;
                color: #0096ff;
            }
            
            .user-msg-btn-delete {
                background: rgba(255, 71, 87, 0.1);
                border-color: #ff4757;
                color: #ff4757;
            }
            
            .user-msg-btn-expand {
                background: rgba(119, 221, 190, 0.1);
                border-color: var(--cursor-jade-light);
                color: var(--cursor-jade-dark);
            }
            
            /* Message Content */
            .user-message-content {
                padding: 16px;
                color: var(--cursor-text);
                font-size: 14px;
                line-height: 1.6;
                max-height: 300px;
                overflow: hidden;
                transition: max-height 0.3s ease;
                position: relative;
            }
            
            .user-message-content.expanded {
                max-height: none;
            }
            
            .user-message-content.collapsed::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 60px;
                background: linear-gradient(to bottom, transparent, var(--cursor-bg-secondary));
                pointer-events: none;
            }
            
            /* Attached Files */
            .attached-files {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                padding: 12px 16px;
                background: var(--cursor-bg-tertiary);
                border-top: 1px solid var(--cursor-border);
            }
            
            .attached-file {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: var(--cursor-bg);
                border: 1px solid var(--cursor-border);
                border-radius: 6px;
                font-size: 12px;
            }
            
            /* Context Mentions */
            .context-mention {
                display: inline-block;
                padding: 2px 8px;
                background: rgba(119, 221, 190, 0.2);
                border: 1px solid var(--cursor-jade-light);
                border-radius: 4px;
                color: var(--cursor-jade-dark);
                font-family: 'Consolas', monospace;
                font-size: 13px;
            }
            
            /* AI Settings Panel */
            .ai-settings-panel {
                position: fixed;
                right: 20px;
                top: 120px;
                width: 320px;
                background: var(--cursor-bg);
                border: 2px solid var(--cursor-jade-dark);
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                z-index: 9997;
                display: none;
                max-height: calc(100vh - 140px);
                overflow-y: auto;
            }
            
            .ai-settings-header {
                padding: 16px;
                background: linear-gradient(135deg, rgba(119, 221, 190, 0.1), rgba(77, 192, 181, 0.1));
                border-bottom: 1px solid var(--cursor-border);
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            
            .ai-settings-section {
                padding: 16px;
                border-bottom: 1px solid var(--cursor-border);
            }
            
            .ai-settings-section:last-child {
                border-bottom: none;
            }
            
            .ai-settings-title {
                font-size: 12px;
                font-weight: 600;
                color: var(--cursor-text-secondary);
                text-transform: uppercase;
                margin-bottom: 12px;
                letter-spacing: 0.5px;
            }
            
            /* Toggle Switch */
            .toggle-switch {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 10px 12px;
                background: var(--cursor-bg-secondary);
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .toggle-switch:hover {
                background: var(--cursor-bg-tertiary);
            }
            
            .toggle-switch-label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 13px;
                color: var(--cursor-text);
            }
            
            .toggle-checkbox {
                width: 44px;
                height: 24px;
                background: #555;
                border-radius: 12px;
                position: relative;
                transition: background 0.3s;
            }
            
            .toggle-checkbox.active {
                background: var(--cursor-jade-dark);
            }
            
            .toggle-checkbox::after {
                content: '';
                position: absolute;
                width: 18px;
                height: 18px;
                background: white;
                border-radius: 50%;
                top: 3px;
                left: 3px;
                transition: left 0.3s;
            }
            
            .toggle-checkbox.active::after {
                left: 23px;
            }
            
            /* Quality Selector */
            .quality-selector {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }
            
            .quality-option {
                padding: 10px;
                background: var(--cursor-bg-secondary);
                border: 2px solid transparent;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .quality-option:hover {
                background: var(--cursor-bg-tertiary);
            }
            
            .quality-option.active {
                border-color: var(--cursor-jade-dark);
                background: rgba(119, 221, 190, 0.1);
            }
            
            .quality-icon {
                font-size: 20px;
                margin-bottom: 4px;
            }
            
            .quality-label {
                font-size: 12px;
                font-weight: 600;
                color: var(--cursor-text);
            }
            
            .quality-desc {
                font-size: 10px;
                color: var(--cursor-text-secondary);
                margin-top: 2px;
            }
        `;
        document.head.appendChild(style);
    }
    
    createControlsPanel() {
        const panel = document.createElement('div');
        panel.id = 'ai-controls-panel';
        panel.className = 'ai-settings-panel';
        
        panel.innerHTML = `
            <!-- Header -->
            <div class="ai-settings-header">
                <div>
                    <h3 style="margin: 0; font-size: 16px; color: var(--cursor-jade-dark);">⚙️ AI Settings</h3>
                    <p style="margin: 4px 0 0; font-size: 11px; color: var(--cursor-text-secondary);">Configure AI behavior</p>
                </div>
                <button onclick="enhancedUserMessage.toggleSettingsPanel()" style="
                    background: none;
                    border: 1px solid var(--cursor-border);
                    color: var(--cursor-text);
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 16px;
                ">✕</button>
            </div>
            
            <!-- Quality Settings -->
            <div class="ai-settings-section">
                <div class="ai-settings-title">🎯 Response Quality</div>
                <div class="quality-selector">
                    <div class="quality-option ${this.quality === 'auto' ? 'active' : ''}" onclick="enhancedUserMessage.setQuality('auto')">
                        <div class="quality-icon">🤖</div>
                        <div class="quality-label">Auto</div>
                        <div class="quality-desc">Smart selection</div>
                    </div>
                    <div class="quality-option ${this.quality === 'fast' ? 'active' : ''}" onclick="enhancedUserMessage.setQuality('fast')">
                        <div class="quality-icon">⚡</div>
                        <div class="quality-label">Fast</div>
                        <div class="quality-desc">Quick responses</div>
                    </div>
                    <div class="quality-option ${this.quality === 'balanced' ? 'active' : ''}" onclick="enhancedUserMessage.setQuality('balanced')">
                        <div class="quality-icon">⚖️</div>
                        <div class="quality-label">Balanced</div>
                        <div class="quality-desc">Speed + quality</div>
                    </div>
                    <div class="quality-option ${this.quality === 'max' ? 'active' : ''}" onclick="enhancedUserMessage.setQuality('max')">
                        <div class="quality-icon">💎</div>
                        <div class="quality-label">Max</div>
                        <div class="quality-desc">Best quality</div>
                    </div>
                </div>
            </div>
            
            <!-- Feature Toggles -->
            <div class="ai-settings-section">
                <div class="ai-settings-title">🔬 Research Features</div>
                
                <div class="toggle-switch" onclick="enhancedUserMessage.toggleDeepResearch()">
                    <div class="toggle-switch-label">
                        <span>🔬</span>
                        <span>Deep Research</span>
                    </div>
                    <div class="toggle-checkbox ${this.deepResearchEnabled ? 'active' : ''}" id="toggle-deep-research"></div>
                </div>
                
                <div class="toggle-switch" onclick="enhancedUserMessage.toggleThinking()">
                    <div class="toggle-switch-label">
                        <span>🧠</span>
                        <span>Show Thinking</span>
                    </div>
                    <div class="toggle-checkbox ${this.thinkingEnabled ? 'active' : ''}" id="toggle-thinking"></div>
                </div>
                
                <div class="toggle-switch" onclick="enhancedUserMessage.toggleWebSearch()">
                    <div class="toggle-switch-label">
                        <span>🌐</span>
                        <span>Web Search</span>
                    </div>
                    <div class="toggle-checkbox ${this.webSearchEnabled ? 'active' : ''}" id="toggle-web-search"></div>
                </div>
            </div>
            
            <!-- Advanced Settings -->
            <div class="ai-settings-section">
                <div class="ai-settings-title">🎛️ Advanced</div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 12px; color: var(--cursor-text-secondary); display: block; margin-bottom: 6px;">
                        Temperature: <span id="temp-value">0.7</span>
                    </label>
                    <input type="range" id="temperature-slider" min="0" max="2" step="0.1" value="0.7" style="width: 100%;" oninput="enhancedUserMessage.updateTemperature(this.value)">
                </div>
                
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 12px; color: var(--cursor-text-secondary); display: block; margin-bottom: 6px;">
                        Max Tokens: <span id="tokens-value">4000</span>
                    </label>
                    <input type="range" id="tokens-slider" min="100" max="16000" step="100" value="4000" style="width: 100%;" oninput="enhancedUserMessage.updateTokens(this.value)">
                </div>
                
                <button onclick="enhancedUserMessage.resetSettings()" style="
                    width: 100%;
                    padding: 10px;
                    background: rgba(255, 71, 87, 0.1);
                    border: 1px solid #ff4757;
                    color: #ff4757;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 600;
                ">
                    🔄 Reset to Defaults
                </button>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Add floating settings button
        this.createSettingsButton();
    }
    
    createSettingsButton() {
        const btn = document.createElement('button');
        btn.id = 'ai-settings-toggle-btn';
        btn.style.cssText = `
            position: fixed;
            right: 20px;
            top: 120px;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--cursor-jade-dark), var(--cursor-accent));
            border: none;
            color: white;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(119, 221, 190, 0.3);
            z-index: 9996;
            transition: all 0.3s;
        `;
        btn.innerHTML = '⚙️';
        btn.title = 'AI Settings';
        btn.onclick = () => this.toggleSettingsPanel();
        
        btn.onmouseenter = () => {
            btn.style.transform = 'scale(1.1) rotate(90deg)';
            btn.style.boxShadow = '0 6px 16px rgba(119, 221, 190, 0.4)';
        };
        
        btn.onmouseleave = () => {
            btn.style.transform = 'scale(1) rotate(0deg)';
            btn.style.boxShadow = '0 4px 12px rgba(119, 221, 190, 0.3)';
        };
        
        document.body.appendChild(btn);
    }
    
    /**
     * Create enhanced user message with all controls
     */
    createUserMessage(content, attachedFiles = []) {
        const messageId = `user-msg-${++this.currentMessageId}`;
        const timestamp = new Date().toLocaleTimeString();
        
        const message = document.createElement('div');
        message.id = messageId;
        message.className = 'user-message-enhanced';
        
        // Parse context mentions (@file)
        const processedContent = this.processContextMentions(content);
        
        message.innerHTML = `
            <!-- Header -->
            <div class="user-message-header">
                <div class="user-message-info">
                    <div class="user-avatar">👤</div>
                    <div>
                        <div class="user-name">You</div>
                        <div class="message-timestamp">${timestamp}</div>
                    </div>
                </div>
                <div class="user-message-controls">
                    <button class="user-msg-btn user-msg-btn-expand" onclick="enhancedUserMessage.expandMessage('${messageId}')" title="Expand/collapse">
                        <span id="${messageId}-expand-icon">📖</span>
                    </button>
                    <button class="user-msg-btn user-msg-btn-copy" onclick="enhancedUserMessage.copyMessage('${messageId}')" title="Copy message">
                        📋
                    </button>
                    <button class="user-msg-btn user-msg-btn-edit" onclick="enhancedUserMessage.editMessage('${messageId}')" title="Edit message">
                        ✏️
                    </button>
                    <button class="user-msg-btn user-msg-btn-delete" onclick="enhancedUserMessage.deleteMessage('${messageId}')" title="Delete message">
                        🗑️
                    </button>
                </div>
            </div>
            
            <!-- Content -->
            <div id="${messageId}-content" class="user-message-content collapsed">
                ${processedContent}
            </div>
            
            ${attachedFiles.length > 0 ? `
                <!-- Attached Files -->
                <div class="attached-files">
                    ${attachedFiles.map(file => `
                        <div class="attached-file">
                            <span>📎</span>
                            <span>${file.name}</span>
                            <span style="color: var(--cursor-text-secondary); font-size: 10px;">(${this.formatFileSize(file.size)})</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        // Store message data
        this.messages.set(messageId, {
            content,
            attachedFiles,
            timestamp,
            isExpanded: false
        });
        
        return message;
    }
    
    processContextMentions(content) {
        // Replace @mentions with styled spans
        return content.replace(/@(\S+)/g, '<span class="context-mention">@$1</span>');
    }
    
    expandMessage(messageId) {
        const content = document.getElementById(`${messageId}-content`);
        const icon = document.getElementById(`${messageId}-expand-icon`);
        const messageData = this.messages.get(messageId);
        
        if (!content || !messageData) return;
        
        messageData.isExpanded = !messageData.isExpanded;
        
        if (messageData.isExpanded) {
            content.classList.remove('collapsed');
            content.classList.add('expanded');
            if (icon) icon.textContent = '📕';
        } else {
            content.classList.remove('expanded');
            content.classList.add('collapsed');
            if (icon) icon.textContent = '📖';
        }
    }
    
    async copyMessage(messageId) {
        const messageData = this.messages.get(messageId);
        if (!messageData) return;
        
        try {
            await navigator.clipboard.writeText(messageData.content);
            this.showNotification('📋 Message copied!', 'success');
        } catch (error) {
            console.error('[EnhancedUserMessage] ❌ Copy failed:', error);
        }
    }
    
    editMessage(messageId) {
        const messageData = this.messages.get(messageId);
        if (!messageData) return;
        
        const newContent = prompt('Edit message:', messageData.content);
        if (newContent && newContent !== messageData.content) {
            messageData.content = newContent;
            const content = document.getElementById(`${messageId}-content`);
            if (content) {
                content.innerHTML = this.processContextMentions(newContent);
            }
            this.showNotification('✏️ Message updated!', 'success');
        }
    }
    
    deleteMessage(messageId) {
        if (!confirm('Delete this message?')) return;
        
        const message = document.getElementById(messageId);
        if (message) {
            message.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                message.remove();
                this.messages.delete(messageId);
            }, 300);
        }
    }
    
    toggleSettingsPanel() {
        const panel = document.getElementById('ai-controls-panel');
        if (!panel) return;
        
        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
    
    setQuality(quality) {
        this.quality = quality;
        
        // Update UI
        document.querySelectorAll('.quality-option').forEach(opt => {
            opt.classList.remove('active');
        });
        event.target.closest('.quality-option').classList.add('active');
        
        this.showNotification(`Quality set to: ${quality}`, 'info');
        console.log('[EnhancedUserMessage] 🎯 Quality:', quality);
    }
    
    toggleDeepResearch() {
        this.deepResearchEnabled = !this.deepResearchEnabled;
        const toggle = document.getElementById('toggle-deep-research');
        if (toggle) {
            toggle.classList.toggle('active');
        }
        this.showNotification(`Deep Research: ${this.deepResearchEnabled ? 'ON' : 'OFF'}`, 'info');
    }
    
    toggleThinking() {
        this.thinkingEnabled = !this.thinkingEnabled;
        const toggle = document.getElementById('toggle-thinking');
        if (toggle) {
            toggle.classList.toggle('active');
        }
        this.showNotification(`Thinking Display: ${this.thinkingEnabled ? 'ON' : 'OFF'}`, 'info');
    }
    
    toggleWebSearch() {
        this.webSearchEnabled = !this.webSearchEnabled;
        const toggle = document.getElementById('toggle-web-search');
        if (toggle) {
            toggle.classList.toggle('active');
        }
        this.showNotification(`Web Search: ${this.webSearchEnabled ? 'ON' : 'OFF'}`, 'info');
    }
    
    updateTemperature(value) {
        document.getElementById('temp-value').textContent = value;
    }
    
    updateTokens(value) {
        document.getElementById('tokens-value').textContent = value;
    }
    
    resetSettings() {
        this.quality = 'auto';
        this.deepResearchEnabled = false;
        this.thinkingEnabled = true;
        this.webSearchEnabled = false;
        
        // Reset UI
        document.getElementById('temperature-slider').value = 0.7;
        document.getElementById('tokens-slider').value = 4000;
        this.updateTemperature(0.7);
        this.updateTokens(4000);
        
        this.showNotification('🔄 Settings reset to defaults', 'success');
    }
    
    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
    
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
            z-index: 10002;
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
    
    // Public API
    getSettings() {
        return {
            quality: this.quality,
            deepResearch: this.deepResearchEnabled,
            thinking: this.thinkingEnabled,
            webSearch: this.webSearchEnabled,
            temperature: parseFloat(document.getElementById('temperature-slider')?.value || 0.7),
            maxTokens: parseInt(document.getElementById('tokens-slider')?.value || 4000)
        };
    }
}

// Initialize
window.enhancedUserMessage = new EnhancedUserMessageSystem();

// Export
window.EnhancedUserMessageSystem = EnhancedUserMessageSystem;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedUserMessageSystem;
}

console.log('[EnhancedUserMessage] 📦 Enhanced User Message System loaded');

})(); // End IIFE

