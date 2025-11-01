/**
 * BigDaddyG IDE - Cursor-Style Agent Panel with Custom Agent Creation
 * Complete replication of Cursor's AI panel with customizable agents
 */

const { EventEmitter } = require('events');

class AgentPanelCursorStyle extends EventEmitter {
    constructor(orchestraClient, voiceCoding = null) {
        super();
        
        this.orchestraClient = orchestraClient;
        this.voiceCoding = voiceCoding;
        
        // Agent modes (like Cursor)
        this.agents = [
            { id: 'agent', icon: '🎯', label: 'Agent', description: 'Autonomous coding assistant' },
            { id: 'composer', icon: '🎼', label: 'Composer', description: 'Multi-file code generation' },
            { id: 'coder', icon: '👨‍💻', label: 'Coder', description: 'Precise code implementation' },
            { id: 'chat', icon: '💬', label: 'Chat', description: 'Conversational help' },
            { id: 'plan', icon: '📋', label: 'Plan', description: 'Project planning' }
        ];
        
        // Custom agents (user-created)
        this.customAgents = [];
        
        // Current state
        this.currentAgent = 'agent';
        this.quality = 'auto'; // auto, fast, max
        this.isPinned = false;
        this.isFloating = false;
        this.showTuning = false;
        
        // Model tuning parameters
        this.tuning = {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxTokens: 2048,
            presencePenalty: 0.0,
            frequencyPenalty: 0.0
        };
        
        // Feature toggles
        this.features = {
            thinking: true,
            webSearch: true,
            deepResearch: false,
            codeExecution: true,
            fileAccess: true,
            autoApply: false,
            emojis: false  // Toggle emojis in agent responses
        };
        
        // TODO system
        this.todos = [];
        this.showTodos = false;
        
        // Conversation
        this.messages = [];
        this.attachments = [];
        
        console.log('[Agent Panel Cursor-Style] Initialized');
    }
    
    /**
     * Render complete panel HTML
     */
    render() {
        return `
            <div class="ai-panel ${this.isFloating ? 'floating' : ''}" id="ai-panel">
                ${this.renderHeader()}
                ${this.renderAgentTabs()}
                ${this.renderQualitySelector()}
                ${this.renderModelTuning()}
                ${this.renderFeatureToggles()}
                ${this.renderConversation()}
                ${this.renderTodoPanel()}
                ${this.renderInputArea()}
            </div>
        `;
    }
    
    /**
     * Render header
     */
    renderHeader() {
        return `
            <div class="ai-header">
                <div class="ai-title">
                    <span>🤖 Agent</span>
                    <span class="agent-state">${this.isPinned ? 'Pinned' : 'Ready'}</span>
                    <div class="float-controls">
                        <button class="float-btn" onclick="agentPanel.togglePin()" title="Pin">📌</button>
                        <button class="float-btn" onclick="agentPanel.toggleFloat()" title="Float">⬜</button>
                        <button class="float-btn" onclick="agentPanel.toggleTodos()" title="TODOs">📋${this.todos.length > 0 ? ` (${this.todos.filter(t => !t.completed).length})` : ''}</button>
                        <button class="float-btn" onclick="agentPanel.createCustomAgent()" title="Create Agent">➕</button>
                        <button class="float-btn" onclick="agentPanel.clearConversation()" title="Clear">🗑️</button>
                        <button class="float-btn" onclick="agentPanel.close()" title="Close">✕</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Render agent tabs (including custom agents)
     */
    renderAgentTabs() {
        const allAgents = [...this.agents, ...this.customAgents];
        
        return `
            <div class="agent-modes">
                ${allAgents.map(agent => `
                    <button class="mode-btn ${this.currentAgent === agent.id ? 'active' : ''}"
                            onclick="agentPanel.switchAgent('${agent.id}')"
                            title="${agent.description || ''}">
                        ${agent.icon} ${agent.label}
                        ${agent.custom ? '<span class="custom-badge">★</span>' : ''}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Render quality selector
     */
    renderQuality Selector() {
        return `
            <div class="quality-selector">
                <label style="font-size: 11px; font-weight: bold;">Quality:</label>
                <div style="display: flex; gap: 5px;">
                    ${['Auto', 'Fast', 'Max'].map(q => `
                        <button class="quality-btn ${this.quality === q.toLowerCase() ? 'active' : ''}"
                                onclick="agentPanel.setQuality('${q.toLowerCase()}')">
                            ${q}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render model tuning panel (collapsible)
     */
    renderModelTuning() {
        return `
            <div class="tuning-panel">
                <div class="tuning-collapse-btn" onclick="agentPanel.toggleTuning()">
                    <span>${this.showTuning ? '▼' : '▶'}</span>
                    <span>🎛️ Model Tuning</span>
                </div>
                
                ${this.showTuning ? `
                    <div class="tuning-sliders">
                        ${this.renderSlider('temperature', 'Temperature', 0, 2, 0.01)}
                        ${this.renderSlider('topP', 'Top P', 0, 1, 0.01)}
                        ${this.renderSlider('topK', 'Top K', 1, 100, 1)}
                        ${this.renderSlider('maxTokens', 'Max Tokens', 256, 8192, 256)}
                        ${this.renderSlider('presencePenalty', 'Presence Penalty', -2, 2, 0.1)}
                        ${this.renderSlider('frequencyPenalty', 'Frequency Penalty', -2, 2, 0.1)}
                        
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button class="quality-btn" onclick="agentPanel.resetTuning()">Reset</button>
                            <button class="quality-btn" onclick="agentPanel.savePreset()">Save Preset</button>
                            <button class="quality-btn" onclick="agentPanel.loadPreset()">Load Preset</button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * Render a single tuning slider
     */
    renderSlider(param, label, min, max, step) {
        const value = this.tuning[param];
        
        return `
            <div class="slider-container">
                <div class="slider-label">
                    <span>${label}:</span>
                    <span class="slider-value">${value}</span>
                </div>
                <input type="range" 
                       class="tuning-slider"
                       min="${min}" 
                       max="${max}" 
                       step="${step}" 
                       value="${value}"
                       oninput="agentPanel.updateTuning('${param}', parseFloat(this.value))">
            </div>
        `;
    }
    
    /**
     * Render feature toggles (thinking, web search, deep research, etc.)
     */
    renderFeatureToggles() {
        const features = [
            { id: 'thinking', icon: '🧠', label: 'Thinking', tooltip: 'Show agent reasoning' },
            { id: 'webSearch', icon: '🌐', label: 'Web Search', tooltip: 'Enable real-time web search' },
            { id: 'deepResearch', icon: '🔬', label: 'Deep Research', tooltip: 'Comprehensive research mode' },
            { id: 'codeExecution', icon: '▶️', label: 'Execute', tooltip: 'Run code automatically' },
            { id: 'fileAccess', icon: '📁', label: 'Files', tooltip: 'Access file system' },
            { id: 'autoApply', icon: '✨', label: 'Auto-Apply', tooltip: 'Apply changes automatically' },
            { id: 'emojis', icon: '😊', label: 'Emojis', tooltip: 'Use emojis in responses (disable for clean code)' }
        ];
        
        return `
            <div class="feature-toggles" style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; margin: 10px 0;">
                ${features.map(feature => `
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 11px; padding: 6px; border-radius: 4px; background: ${this.features[feature.id] ? 'rgba(0,152,255,0.2)' : 'transparent'}; border: 1px solid ${this.features[feature.id] ? 'var(--accent)' : 'var(--border)'};">
                        <input type="checkbox" 
                               ${this.features[feature.id] ? 'checked' : ''}
                               onchange="agentPanel.toggleFeature('${feature.id}', this.checked)"
                               style="margin: 0;">
                        <span>${feature.icon}</span>
                        <span>${feature.label}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * Render conversation area
     */
    renderConversation() {
        return `
            <div class="chat-messages" id="chat-messages">
                ${this.messages.map((msg, index) => this.renderMessage(msg, index)).join('')}
                ${this.messages.length === 0 ? this.renderEmptyState() : ''}
            </div>
        `;
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        const currentAgentInfo = [...this.agents, ...this.customAgents].find(a => a.id === this.currentAgent);
        
        return `
            <div style="text-align: center; padding: 40px 20px; opacity: 0.6;">
                <div style="font-size: 48px; margin-bottom: 20px;">${currentAgentInfo?.icon || '🤖'}</div>
                <h3>${currentAgentInfo?.label || 'Agent'}</h3>
                <p style="margin-top: 10px; font-size: 13px;">${currentAgentInfo?.description || 'Start a conversation'}</p>
            </div>
        `;
    }
    
    /**
     * Render a single message
     */
    renderMessage(msg, index) {
        const isUser = msg.role === 'user';
        
        return `
            <div class="chat-message ${isUser ? 'user' : 'assistant'}">
                ${msg.thinking && this.features.thinking ? this.renderThinking(msg.thinking) : ''}
                <div>${this.formatMessage(msg.content)}</div>
                ${msg.codeInserted ? '<div class="code-notification">✅ Code inserted into editor</div>' : ''}
            </div>
        `;
    }
    
    /**
     * Render thinking process
     */
    renderThinking(thinking) {
        return `
            <div class="thought-container">
                <div class="thought-header" onclick="this.parentElement.classList.toggle('expanded')">
                    <span class="thought-arrow">▶</span>
                    <span>💭 Thinking...</span>
                </div>
                <div class="thought-content">
                    ${thinking.split('\n').map(line => `
                        <div class="thought-step">${line}</div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render TODO panel
     */
    renderTodoPanel() {
        if (!this.showTodos) return '';
        
        return `
            <div style="background: rgba(0,0,0,0.3); border-top: 1px solid var(--border); padding: 15px; max-height: 300px; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4>📋 TODO List</h4>
                    <button class="quality-btn" onclick="agentPanel.addTodo()">+ Add</button>
                </div>
                <div>
                    ${this.todos.length === 0 ? 
                        '<div style="opacity: 0.5; text-align: center; padding: 20px;">No tasks yet</div>' :
                        this.todos.map((todo, index) => `
                            <div style="display: flex; align-items: center; gap: 10px; padding: 8px; background: var(--bg-tertiary); border-radius: 4px; margin-bottom: 8px;">
                                <input type="checkbox" 
                                       ${todo.completed ? 'checked' : ''}
                                       onchange="agentPanel.toggleTodo(${index})">
                                <span style="flex: 1; ${todo.completed ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${todo.text}</span>
                                <span style="padding: 2px 8px; background: ${todo.status === 'completed' ? 'var(--accent-green)' : todo.status === 'in_progress' ? 'var(--accent)' : 'var(--text-dim)'}; border-radius: 3px; font-size: 10px;">${todo.status || 'pending'}</span>
                                <button style="background: none; border: none; color: #f44; cursor: pointer; font-size: 16px;" onclick="agentPanel.deleteTodo(${index})">×</button>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        `;
    }
    
    /**
     * Render input area with voice input
     */
    renderInputArea() {
        return `
            <div class="ai-input-area">
                ${this.attachments.length > 0 ? this.renderAttachments() : ''}
                
                <!-- Voice Controls -->
                <div id="voice-controls-container"></div>
                
                <div class="ai-input-wrapper">
                    <button class="voice-btn" 
                            onclick="agentPanel.toggleVoiceInput()"
                            title="Voice input (🎤)"
                            style="background: var(--bg-tertiary); border: 1px solid var(--border); color: var(--text); padding: 10px 12px; border-radius: 4px 0 0 4px; cursor: pointer; font-size: 16px;">
                        🎤
                    </button>
                    
                    <textarea class="ai-input" 
                              id="ai-input"
                              placeholder="Type or speak... (@file for references, Ctrl+Enter to send, say 'send' to voice-send)"
                              onkeydown="if(event.ctrlKey && event.key==='Enter') agentPanel.sendMessage()"
                              oninput="agentPanel.handleInput(event)"
                              style="border-radius: 0;"></textarea>
                    
                    <button class="send-button" 
                            onclick="agentPanel.sendMessage()"
                            style="border-radius: 0 4px 4px 0;">
                        Send
                    </button>
                </div>
                
                <div style="display: flex; gap: 10px; margin-top: 8px; font-size: 11px; opacity: 0.6;">
                    <button class="quality-btn" onclick="agentPanel.attachFiles()">📎 Attach (up to 10GB)</button>
                    <span>💡 @file.js for references</span>
                    <span>🎨 Paste images</span>
                    <span>🎤 Voice: say "send" to submit</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Render attachments
     */
    renderAttachments() {
        return `
            <div style="padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px; margin-bottom: 10px;">
                ${this.attachments.map((att, index) => `
                    <div style="display: flex; align-items: center; gap: 10px; padding: 5px;">
                        <span>${this.getFileIcon(att.type)}</span>
                        <span style="flex: 1; font-size: 12px;">${att.name}</span>
                        <span style="font-size: 11px; opacity: 0.6;">${this.formatSize(att.size)}</span>
                        <button style="background: none; border: none; color: #f44; cursor: pointer;" onclick="agentPanel.removeAttachment(${index})">×</button>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // ============================================================================
    // CUSTOM AGENT CREATION
    // ============================================================================
    
    /**
     * Create custom agent
     */
    createCustomAgent() {
        const name = prompt('Agent Name:');
        if (!name) return;
        
        const icon = prompt('Agent Icon (emoji):', '🤖');
        const description = prompt('Agent Description:');
        const systemPrompt = prompt('System Prompt (how should this agent behave?):');
        
        const customAgent = {
            id: `custom_${Date.now()}`,
            label: name,
            icon: icon || '🤖',
            description: description || '',
            systemPrompt: systemPrompt || '',
            custom: true,
            tuning: { ...this.tuning },
            features: { ...this.features }
        };
        
        this.customAgents.push(customAgent);
        this.updateView();
        
        console.log('[Agent Panel] Created custom agent:', customAgent);
        this.emit('custom-agent-created', customAgent);
    }
    
    // ============================================================================
    // STATE MANAGEMENT
    // ============================================================================
    
    switchAgent(agentId) {
        this.currentAgent = agentId;
        this.updateView();
        this.emit('agent-changed', { agentId });
    }
    
    setQuality(quality) {
        this.quality = quality;
        this.updateView();
        this.emit('quality-changed', { quality });
    }
    
    togglePin() {
        this.isPinned = !this.isPinned;
        this.updateView();
    }
    
    toggleFloat() {
        this.isFloating = !this.isFloating;
        this.updateView();
    }
    
    toggleTuning() {
        this.showTuning = !this.showTuning;
        this.updateView();
    }
    
    toggleTodos() {
        this.showTodos = !this.showTodos;
        this.updateView();
    }
    
    updateTuning(param, value) {
        this.tuning[param] = value;
        this.updateView();
        this.emit('tuning-changed', { param, value });
    }
    
    resetTuning() {
        this.tuning = {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
            maxTokens: 2048,
            presencePenalty: 0.0,
            frequencyPenalty: 0.0
        };
        this.updateView();
    }
    
    toggleFeature(featureId, enabled) {
        this.features[featureId] = enabled;
        this.updateView();
        this.emit('feature-toggled', { featureId, enabled });
    }
    
    // ============================================================================
    // MESSAGING
    // ============================================================================
    
    async sendMessage() {
        const input = document.getElementById('ai-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message
        this.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date()
        });
        
        input.value = '';
        this.updateView();
        
        // Get current agent config
        const agentConfig = [...this.agents, ...this.customAgents].find(a => a.id === this.currentAgent);
        
        // Build system prompt with emoji preference
        let systemPrompt = agentConfig?.systemPrompt || '';
        
        if (this.features.emojis) {
            systemPrompt += '\n\nSTYLE: Use emojis freely to make responses friendly and expressive. Use emojis for emphasis and engagement.';
        } else {
            systemPrompt += '\n\nSTYLE: Do NOT use emojis. Keep responses clean and professional, especially for code. Text only.';
        }
        
        // Send to Orchestra
        try {
            const response = await this.orchestraClient.sendMessage({
                agent: this.currentAgent,
                systemPrompt: systemPrompt,
                quality: this.quality,
                tuning: this.tuning,
                features: this.features,
                message: message,
                history: this.messages,
                attachments: this.attachments
            });
            
            // Post-process: Strip emojis if disabled (backup safety)
            let processedContent = response.content;
            if (!this.features.emojis) {
                processedContent = this.stripEmojis(processedContent);
            }
            
            // Add assistant response
            this.messages.push({
                role: 'assistant',
                content: processedContent,
                thinking: response.thinking,
                codeInserted: response.codeInserted,
                timestamp: new Date()
            });
            
            // Extract TODOs
            if (response.todos) {
                response.todos.forEach(todo => this.addTodo(todo));
            }
            
            this.updateView();
            this.scrollToBottom();
            
        } catch (error) {
            console.error('[Agent Panel] Send error:', error);
        }
    }
    
    clearConversation() {
        if (!confirm('Clear conversation?')) return;
        this.messages = [];
        this.updateView();
    }
    
    // ============================================================================
    // TODO MANAGEMENT
    // ============================================================================
    
    addTodo(text = null) {
        const todoText = text || prompt('TODO:');
        if (!todoText) return;
        
        this.todos.push({
            text: todoText,
            completed: false,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        this.updateView();
    }
    
    toggleTodo(index) {
        this.todos[index].completed = !this.todos[index].completed;
        this.todos[index].status = this.todos[index].completed ? 'completed' : 'in_progress';
        this.updateView();
    }
    
    deleteTodo(index) {
        this.todos.splice(index, 1);
        this.updateView();
    }
    
    // ============================================================================
    // UTILITIES
    // ============================================================================
    
    updateView() {
        const panel = document.getElementById('ai-panel');
        if (panel) {
            panel.outerHTML = this.render();
        }
    }
    
    formatMessage(content) {
        return content
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                return `<pre><code class="language-${lang || 'text'}">${this.escapeHtml(code)}</code></pre>`;
            })
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    formatSize(bytes) {
        if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
        if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
        if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${bytes} B`;
    }
    
    getFileIcon(type) {
        if (type.includes('image')) return '🖼️';
        if (type.includes('video')) return '🎥';
        if (type.includes('audio')) return '🎵';
        if (type.includes('pdf')) return '📄';
        return '📎';
    }
    
    scrollToBottom() {
        const messages = document.getElementById('chat-messages');
        if (messages) {
            messages.scrollTop = messages.scrollHeight;
        }
    }
    
    /**
     * Strip emojis from text (when emoji mode is disabled)
     */
    stripEmojis(text) {
        // Remove all emojis using regex
        // This preserves code blocks and technical content
        return text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
                   .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
                   .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
                   .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
                   .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
                   .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
                   .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
                   .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
                   .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
                   .replace(/[\u{FE00}-\u{FE0F}]/gu, '')   // Variation Selectors
                   .replace(/[\u{1F000}-\u{1F02F}]/gu, '') // Mahjong Tiles
                   .replace(/[\u{1F0A0}-\u{1F0FF}]/gu, '') // Playing Cards
                   .trim();
    }
    
    close() {
        this.emit('close');
    }
    
    // ============================================================================
    // VOICE INPUT INTEGRATION
    // ============================================================================
    
    /**
     * Toggle voice input
     */
    toggleVoiceInput() {
        if (!this.voiceCoding) {
            console.error('[Agent Panel] Voice coding not initialized');
            return;
        }
        
        // Toggle voice recognition
        if (this.voiceCoding.isListening) {
            this.voiceCoding.stopListening();
        } else {
            this.voiceCoding.startListening();
        }
        
        // Update voice controls UI
        this.updateVoiceControls();
    }
    
    /**
     * Update voice controls display
     */
    updateVoiceControls() {
        const container = document.getElementById('voice-controls-container');
        if (container && this.voiceCoding) {
            container.innerHTML = this.voiceCoding.renderVoiceControls();
        }
    }
    
    /**
     * Initialize voice integration
     */
    initializeVoiceIntegration() {
        if (!this.voiceCoding) return;
        
        // Set up event listeners
        this.voiceCoding.on('transcript-final', ({ transcript, confidence }) => {
            const input = document.getElementById('ai-input');
            if (input) {
                input.value = (input.value + ' ' + transcript).trim();
            }
            this.updateVoiceControls();
        });
        
        this.voiceCoding.on('transcript-interim', ({ transcript }) => {
            this.updateVoiceControls();
        });
        
        this.voiceCoding.on('command-send', () => {
            this.sendMessage();
            this.voiceCoding.clearTranscript();
            this.voiceCoding.speak('Message sent');
        });
        
        this.voiceCoding.on('command-clear', () => {
            this.clearConversation();
            this.voiceCoding.speak('Conversation cleared');
        });
        
        this.voiceCoding.on('listening-started', () => {
            this.updateVoiceControls();
        });
        
        this.voiceCoding.on('listening-stopped', () => {
            this.updateVoiceControls();
        });
        
        console.log('[Agent Panel] Voice integration initialized');
    }
}

module.exports = AgentPanelCursorStyle;

