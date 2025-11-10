/**
 * BigDaddyG IDE - API Key Manager UI
 * User-friendly interface for managing AI provider API keys
 */

class APIKeyManagerUI {
    constructor(aiProviderManager) {
        this.aiProviderManager = aiProviderManager;
        this.modal = null;
        
        console.log('[APIKeyManagerUI] Initialized');
    }
    
    /**
     * Show API key management modal
     */
    show() {
        // Create modal if not exists
        if (!this.modal) {
            this.createModal();
        }
        
        // Update current keys
        this.refreshKeys();
        
        // Show modal
        this.modal.style.display = 'flex';
    }
    
    /**
     * Hide modal
     */
    hide() {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }
    
    /**
     * Create the API key management modal
     */
    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'api-key-manager-modal';
        this.modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;
        
        this.modal.innerHTML = `
            <div class="api-key-modal-content" style="
                background: var(--background-color, #1e1e1e);
                color: var(--text-color, #ffffff);
                border-radius: 8px;
                padding: 30px;
                max-width: 800px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="margin: 0;">🔑 AI Provider API Keys</h2>
                    <button class="close-btn" style="
                        background: none;
                        border: none;
                        color: var(--text-color, #fff);
                        font-size: 24px;
                        cursor: pointer;
                        padding: 0 10px;
                    ">✕</button>
                </div>
                
                <p style="color: var(--text-muted, #888); margin-bottom: 20px;">
                    Configure API keys for external AI providers. Keys are stored securely and never leave your machine.
                </p>
                
                <div id="api-key-providers" style="display: flex; flex-direction: column; gap: 20px;">
                    <!-- Providers will be inserted here -->
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: rgba(0, 212, 255, 0.1); border-radius: 6px; border-left: 3px solid var(--cyan, #00d4ff);">
                    <h4 style="margin: 0 0 10px 0;">🎯 Model Selection</h4>
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: var(--text-muted, #aaa);">
                        Select your preferred model for each provider:
                    </p>
                    <select id="model-selection-dropdown" style="
                        width: 100%;
                        padding: 8px;
                        background: var(--background-secondary, #2a2a2a);
                        color: var(--text-color, #fff);
                        border: 1px solid var(--border-color, #444);
                        border-radius: 4px;
                        font-size: 14px;
                        cursor: pointer;
                    ">
                        <option value="">-- Select a model --</option>
                        <option value="gpt-4">GPT-4 (OpenAI)</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
                        <option value="claude-3-opus">Claude 3 Opus (Anthropic)</option>
                        <option value="claude-3-sonnet">Claude 3 Sonnet (Anthropic)</option>
                        <option value="gemini-pro">Gemini Pro (Google)</option>
                        <option value="mixtral-8x7b">Mixtral 8x7B (Groq)</option>
                        <option value="deepseek-chat">DeepSeek Chat</option>
                        <option value="kimi-chat">Kimi Chat (Moonshot)</option>
                        <option value="command">Command (Cohere)</option>
                        <option value="cursor-fast">Cursor Fast</option>
                    </select>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border-color, #444);">
                    <h3 style="margin-top: 0;">📚 Where to Get API Keys:</h3>
                    <ul style="line-height: 1.8; color: var(--text-muted, #aaa);">
                        <li><strong>OpenAI:</strong> <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a></li>
                        <li><strong>Anthropic:</strong> <a href="https://console.anthropic.com/settings/keys" target="_blank">console.anthropic.com/settings/keys</a></li>
                        <li><strong>Google Gemini:</strong> <a href="https://makersuite.google.com/app/apikey" target="_blank">makersuite.google.com/app/apikey</a></li>
                        <li><strong>Groq:</strong> <a href="https://console.groq.com/keys" target="_blank">console.groq.com/keys</a></li>
                        <li><strong>DeepSeek:</strong> <a href="https://platform.deepseek.com/api_keys" target="_blank">platform.deepseek.com/api_keys</a></li>
                        <li><strong>Azure OpenAI:</strong> <a href="https://portal.azure.com/" target="_blank">portal.azure.com</a></li>
                        <li><strong>Cohere:</strong> <a href="https://dashboard.cohere.com/api-keys" target="_blank">dashboard.cohere.com/api-keys</a></li>
                        <li><strong>Kimi (Moonshot):</strong> <a href="https://platform.moonshot.cn/console/api-keys" target="_blank">platform.moonshot.cn/console/api-keys</a></li>
                        <li><strong>Cursor AI:</strong> Settings > API Keys in Cursor IDE (copy your key from there)</li>
                    </ul>
                </div>
                
                <div style="margin-top: 20px; text-align: right;">
                    <button class="save-all-btn" style="
                        background: #007acc;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: bold;
                    ">Save All & Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        // Event listeners
        this.modal.querySelector('.close-btn').addEventListener('click', () => this.hide());
        this.modal.querySelector('.save-all-btn').addEventListener('click', () => this.saveAll());
        
        // Close on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });
        
        // Populate providers
        this.populateProviders();
    }
    
    /**
     * Populate provider list
     */
    populateProviders() {
        const container = this.modal.querySelector('#api-key-providers');
        
        const providers = [
            {
                id: 'openai',
                name: 'OpenAI (GPT-4, GPT-4o)',
                description: 'Most powerful models for general tasks',
                models: 'gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo',
                pricing: '$0.005-$0.03 per 1K tokens',
                icon: '🤖'
            },
            {
                id: 'anthropic',
                name: 'Anthropic (Claude)',
                description: 'Excellent for code and reasoning',
                models: 'claude-3-opus, claude-3-sonnet, claude-3-haiku',
                pricing: '$0.003-$0.015 per 1K tokens',
                icon: '🧠'
            },
            {
                id: 'gemini',
                name: 'Google Gemini',
                description: 'Fast and cost-effective',
                models: 'gemini-1.5-pro, gemini-1.5-flash',
                pricing: '$0.0005-$0.007 per 1K tokens',
                icon: '✨'
            },
            {
                id: 'groq',
                name: 'Groq (Ultra-Fast)',
                description: 'Blazing fast inference (500+ tok/s)',
                models: 'mixtral-8x7b, llama3-70b, gemma-7b',
                pricing: '$0.0001-$0.0008 per 1K tokens',
                icon: '⚡'
            },
            {
                id: 'deepseek',
                name: 'DeepSeek',
                description: 'Great for code generation',
                models: 'deepseek-chat, deepseek-coder',
                pricing: '$0.0002-$0.001 per 1K tokens',
                icon: '🔍'
            },
            {
                id: 'azure',
                name: 'Azure OpenAI',
                description: 'Enterprise OpenAI with Azure',
                models: 'Same as OpenAI (gpt-4, etc.)',
                pricing: 'Custom enterprise pricing',
                icon: '☁️'
            },
            {
                id: 'cohere',
                name: 'Cohere',
                description: 'Specialized in embeddings & search',
                models: 'command, command-light',
                pricing: '$0.0001-$0.002 per 1K tokens',
                icon: '🔗'
            },
            {
                id: 'kimi',
                name: 'Kimi (Moonshot AI)',
                description: 'Long context (200K tokens!)',
                models: 'moonshot-v1-8k, moonshot-v1-32k, moonshot-v1-128k',
                pricing: '$0.0002-$0.001 per 1K tokens',
                icon: '🌙'
            },
            {
                id: 'cursor',
                name: 'Cursor AI',
                description: 'Use your Cursor IDE AI agentically!',
                models: 'gpt-4, gpt-3.5-turbo, claude-3-opus',
                pricing: 'Use your existing Cursor subscription',
                icon: '🎯'
            }
        ];
        
        for (const provider of providers) {
            container.appendChild(this.createProviderCard(provider));
        }
    }
    
    /**
     * Create provider card
     */
    createProviderCard(provider) {
        const card = document.createElement('div');
        card.className = 'api-key-provider-card';
        card.style.cssText = `
            background: var(--hover-background, #252525);
            border: 1px solid var(--border-color, #444);
            border-radius: 6px;
            padding: 20px;
        `;
        
        const currentKey = this.aiProviderManager.getApiKey(provider.id);
        const hasKey = currentKey && currentKey.length > 0;
        
        card.innerHTML = `
            <div style="display: flex; align-items: start; gap: 15px;">
                <div style="font-size: 32px;">${provider.icon}</div>
                <div style="flex: 1;">
                    <h3 style="margin: 0 0 5px 0;">${provider.name}</h3>
                    <p style="margin: 0 0 10px 0; color: var(--text-muted, #aaa); font-size: 13px;">
                        ${provider.description}
                    </p>
                    <div style="display: flex; gap: 10px; margin-bottom: 10px; font-size: 12px; color: var(--text-muted, #888);">
                        <span><strong>Models:</strong> ${provider.models}</span>
                        <span style="border-left: 1px solid var(--border-color, #444); padding-left: 10px;">
                            <strong>Pricing:</strong> ${provider.pricing}
                        </span>
                    </div>
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <input 
                            type="password" 
                            class="api-key-input" 
                            data-provider="${provider.id}"
                            placeholder="sk-... or enter API key"
                            value="${currentKey || ''}"
                            style="
                                flex: 1;
                                padding: 8px 12px;
                                background: var(--background-color, #1e1e1e);
                                border: 1px solid var(--border-color, #444);
                                border-radius: 4px;
                                color: var(--text-color, #fff);
                                font-family: monospace;
                            "
                        />
                        <button 
                            class="toggle-visibility-btn"
                            data-provider="${provider.id}"
                            style="
                                background: var(--button-background, #333);
                                border: 1px solid var(--border-color, #444);
                                color: var(--text-color, #fff);
                                padding: 8px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                            "
                            title="Show/Hide key"
                        >👁️</button>
                        <button 
                            class="test-key-btn"
                            data-provider="${provider.id}"
                            style="
                                background: var(--button-background, #333);
                                border: 1px solid var(--border-color, #444);
                                color: var(--text-color, #fff);
                                padding: 8px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                            "
                            title="Test key"
                        >🧪 Test</button>
                        ${hasKey ? `
                        <button 
                            class="delete-key-btn"
                            data-provider="${provider.id}"
                            style="
                                background: #d32f2f;
                                border: none;
                                color: white;
                                padding: 8px 12px;
                                border-radius: 4px;
                                cursor: pointer;
                            "
                            title="Delete key"
                        >🗑️</button>
                        ` : ''}
                    </div>
                    <div class="key-status" data-provider="${provider.id}" style="margin-top: 8px; font-size: 12px; color: var(--text-muted, #888);">
                        ${hasKey ? '✅ Key configured' : '⚠️ No key configured'}
                    </div>
                </div>
            </div>
        `;
        
        // Event listeners
        const toggleBtn = card.querySelector('.toggle-visibility-btn');
        const input = card.querySelector('.api-key-input');
        const testBtn = card.querySelector('.test-key-btn');
        const deleteBtn = card.querySelector('.delete-key-btn');
        
        toggleBtn.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
        });
        
        testBtn.addEventListener('click', () => this.testKey(provider.id));
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteKey(provider.id));
        }
        
        return card;
    }
    
    /**
     * Test API key
     */
    async testKey(providerId) {
        const input = this.modal.querySelector(`input[data-provider="${providerId}"]`);
        const statusDiv = this.modal.querySelector(`.key-status[data-provider="${providerId}"]`);
        const key = input.value.trim();
        
        if (!key) {
            statusDiv.textContent = '⚠️ Please enter a key first';
            statusDiv.style.color = '#ff9800';
            return;
        }
        
        statusDiv.textContent = '🔄 Testing...';
        statusDiv.style.color = '#2196f3';
        
        try {
            // Save key temporarily
            await this.aiProviderManager.saveApiKey(providerId, key);
            
            // Test with a simple query
            const result = await this.aiProviderManager.chat('Say "Hello!"', {
                provider: providerId,
                maxTokens: 10
            });
            
            if (result.response) {
                statusDiv.textContent = '✅ Key is valid! Test successful';
                statusDiv.style.color = '#4caf50';
            } else {
                throw new Error('Empty response');
            }
        } catch (error) {
            statusDiv.textContent = `❌ Test failed: ${error.message}`;
            statusDiv.style.color = '#f44336';
        }
    }
    
    /**
     * Delete API key
     */
    async deleteKey(providerId) {
        if (!confirm(`Delete API key for ${providerId}?`)) {
            return;
        }
        
        try {
            await this.aiProviderManager.deleteApiKey(providerId);
            
            // Clear input
            const input = this.modal.querySelector(`input[data-provider="${providerId}"]`);
            input.value = '';
            
            // Update status
            const statusDiv = this.modal.querySelector(`.key-status[data-provider="${providerId}"]`);
            statusDiv.textContent = '✅ Key deleted';
            statusDiv.style.color = '#4caf50';
            
            // Refresh UI
            setTimeout(() => this.refreshKeys(), 1000);
        } catch (error) {
            alert(`Failed to delete key: ${error.message}`);
        }
    }
    
    /**
     * Save all keys
     */
    async saveAll() {
        const inputs = this.modal.querySelectorAll('.api-key-input');
        let savedCount = 0;
        
        for (const input of inputs) {
            const providerId = input.dataset.provider;
            const key = input.value.trim();
            
            if (key && key !== this.aiProviderManager.getApiKey(providerId)) {
                try {
                    await this.aiProviderManager.saveApiKey(providerId, key);
                    savedCount++;
                } catch (error) {
                    console.error(`Failed to save ${providerId} key:`, error);
                }
            }
        }
        
        if (savedCount > 0) {
            alert(`✅ Saved ${savedCount} API key(s) successfully!`);
        }
        
        this.hide();
    }
    
    /**
     * Refresh keys from storage
     */
    refreshKeys() {
        const inputs = this.modal?.querySelectorAll('.api-key-input');
        if (!inputs) return;
        
        for (const input of inputs) {
            const providerId = input.dataset.provider;
            const currentKey = this.aiProviderManager.getApiKey(providerId);
            input.value = currentKey || '';
            
            // Update status
            const statusDiv = this.modal.querySelector(`.key-status[data-provider="${providerId}"]`);
            if (statusDiv) {
                const hasKey = currentKey && currentKey.length > 0;
                statusDiv.textContent = hasKey ? '✅ Key configured' : '⚠️ No key configured';
                statusDiv.style.color = hasKey ? '#4caf50' : '#888';
            }
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIKeyManagerUI;
} else {
    window.APIKeyManagerUI = APIKeyManagerUI;
}
