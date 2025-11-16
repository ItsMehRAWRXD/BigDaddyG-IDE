/**
 * Global Functions
 * 
 * Utility functions used across the IDE
 */

(function() {
'use strict';

// Expose globally for index.html onclick handlers
window.globalFunctions = {
    // Safe function caller - prevents "is not a function" errors
    safeCall: (obj, method, ...args) => {
        try {
            if (obj && typeof obj[method] === 'function') {
                return obj[method](...args);
            } else {
                console.warn(`[GlobalFunctions] ⚠️ ${method} is not a function on`, obj);
                return null;
            }
        } catch (error) {
            console.error(`[GlobalFunctions] ❌ Error calling ${method}:`, error);
            return null;
        }
    },
    
    // Check if function exists
    functionExists: (obj, method) => {
        return obj && typeof obj[method] === 'function';
    }
};

// Expose common missing functions as no-ops until they're properly loaded
window.ensureFunctionExists = (name, fallback = () => {}) => {
    if (typeof window[name] !== 'function') {
        window[name] = fallback;
        console.log(`[GlobalFunctions] 📝 Created placeholder for ${name}`);
    }
};

// CTRL+L Chat Box Handler
window.handleCtrlL = () => {
    if (window.floatingChat) {
        window.floatingChat.toggle();
        return true;
    }
    console.warn('[GlobalFunctions] ⚠️ FloatingChat not available');
    return false;
};

// Context Management (1M tokens)
window.contextManager = {
    maxTokens: 1000000, // 1M context window
    currentTokens: 0,
    
    addToContext: (content, role = 'user') => {
        const tokens = content.length; // Simple token estimation
        window.contextManager.currentTokens += tokens;
        
        // Trim if over limit
        if (window.contextManager.currentTokens > window.contextManager.maxTokens) {
            window.contextManager.trimContext();
        }
        
        console.log(`[Context] Added ${tokens} tokens (${window.contextManager.currentTokens}/${window.contextManager.maxTokens})`);
    },
    
    trimContext: () => {
        const targetTokens = window.contextManager.maxTokens * 0.8; // Keep 80%
        const tokensToRemove = window.contextManager.currentTokens - targetTokens;
        window.contextManager.currentTokens = targetTokens;
        console.log(`[Context] Trimmed ${tokensToRemove} tokens`);
    },
    
    clearContext: () => {
        window.contextManager.currentTokens = 0;
        console.log('[Context] Cleared all context');
    },
    
    getStatus: () => {
        const usage = (window.contextManager.currentTokens / window.contextManager.maxTokens * 100).toFixed(1);
        return {
            current: window.contextManager.currentTokens,
            max: window.contextManager.maxTokens,
            usage: `${usage}%`,
            available: window.contextManager.maxTokens - window.contextManager.currentTokens
        };
    }
};

// Ollama Connection Manager
window.ollamaManager = {
    baseUrl: 'http://localhost:11434',
    orchestraUrl: 'http://localhost:11441',
    bridgeUrl: 'http://127.0.0.1:11435',
    availableModels: [],
    diskModels: [],
    orchestraModels: [],
    isConnected: false,
    
    async checkOllama() {
        // 1) IPC bridge via preload
        if (window.orchestraApi?.getModels) {
            try {
                await window.orchestraApi.getModels();
                this.isConnected = true;
                await this.loadModels();
                return true;
            } catch (error) {
                console.warn('[Ollama] IPC bridge check failed:', error.message);
            }
        }
        
        // 2) Embedded HTTP bridge on 127.0.0.1:11435
        try {
            const response = await fetch(`${this.bridgeUrl}/health`, {
                method: 'GET'
            });
            if (response.ok) {
                this.isConnected = true;
                await this.loadModels();
                console.log('[Ollama] ✅ Connected via embedded model bridge');
                return true;
            }
        } catch (bridgeError) {
            console.log('[Ollama] Bridge unavailable:', bridgeError.message);
        }
        
        // 3) Legacy Ollama daemon on 11434
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`, { 
                method: 'GET',
                timeout: 3000 
            });
            this.isConnected = response.ok;
            if (this.isConnected) {
                console.log('[Ollama] ✅ Connected to local Ollama instance');
                await this.loadModels();
            }
            return response.ok;
        } catch (error) {
            console.log('[Ollama] Not available:', error.message);
            this.isConnected = false;
            return false;
        }
    },
    
    async loadModels() {
        // 1) IPC bridge models
        if (window.orchestraApi?.getModels) {
            try {
                const models = await window.orchestraApi.getModels();
                if (Array.isArray(models)) {
                    this.orchestraModels = models.map(name => ({ name }));
                    this.availableModels = models.map(name => ({ name }));
                    return {
                        ollama: this.availableModels,
                        disk: this.diskModels,
                        orchestra: this.orchestraModels
                    };
                }
            } catch (error) {
                console.warn('[Ollama] IPC model fetch failed:', error.message);
            }
        }
        
        // 2) Embedded HTTP bridge
        try {
            const response = await fetch(`${this.bridgeUrl}/api/models`, {
                method: 'GET'
            });
            if (response.ok) {
                const data = await response.json();
                const models = data.models || [];
                this.availableModels = models.map((model) => ({
                    name: model.name,
                    size: model.size,
                    digest: model.digest,
                    modified: model.modified_at
                }));
                this.orchestraModels = models;
                console.log('[Ollama] 📦 Loaded', this.availableModels.length, 'models via bridge');
                return {
                    ollama: this.availableModels,
                    disk: this.diskModels,
                    orchestra: this.orchestraModels
                };
            }
        } catch (error) {
            console.warn('[Ollama] Bridge model list failed:', error.message);
        }

        // 3) Main-process discovery (fallback)
        try {
            if (window.electron?.models?.discover) {
                const result = await window.electron.models.discover();
                if (result && result.success) {
                    this.diskModels = result.ollama?.disk || [];
                    this.availableModels = (result.ollama?.server || []).map(model => ({
                        name: model.name,
                        size: model.size,
                        digest: model.digest,
                        modified: model.modified
                    }));
                    this.orchestraModels = result.orchestra?.models || [];
                    console.log('[Ollama] 📦 Loaded', this.availableModels.length, 'models (server),', this.diskModels.length, 'on disk');
                    return {
                        ollama: this.availableModels,
                        disk: this.diskModels,
                        orchestra: this.orchestraModels
                    };
                }
            }
        } catch (error) {
            console.warn('[Ollama] Model discovery via main process failed, falling back to HTTP', error);
        }

        // 4) Direct Ollama API
        try {
            const response = await fetch(`${this.baseUrl}/api/tags`);
            if (response.ok) {
                const data = await response.json();
                this.availableModels = data.models || [];
                console.log('[Ollama] 📦 Loaded', this.availableModels.length, 'models');
            }
        } catch (error) {
            console.error('[Ollama] Error loading models:', error);
        }

        return {
            ollama: this.availableModels,
            disk: this.diskModels,
            orchestra: this.orchestraModels
        };
    },
    
    async getModels() {
        if (this.availableModels.length === 0) {
            await this.loadModels();
        }
        return { 
            ollama: this.availableModels,
            disk: this.diskModels,
            orchestra: this.orchestraModels,
            total: this.availableModels.length
        };
    },
    
    async sendMessage(message, model = 'auto') {
        // Store in memory before sending
        if (window.memory) {
            await window.memory.store(message, {
                type: 'user_message',
                source: 'chat',
                context: { model, timestamp: new Date().toISOString() }
            });
        }
        
        try {
            const selectedModel = model === 'auto' && this.availableModels.length > 0 
                ? this.availableModels[0].name 
                : model;
            
            // 1) IPC via preload
            if (window.orchestraApi?.generate) {
                const result = await window.orchestraApi.generate({
                    model: selectedModel,
                    prompt: message
                });
                if (result?.success) {
                    const aiResponse = result.response || '';
                    await this.storeAIResponse(message, aiResponse, selectedModel);
                    return { response: aiResponse };
                }
            }
            
            // 2) Embedded bridge
            const bridgeResponse = await fetch(`${this.bridgeUrl}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ model: selectedModel, prompt: message })
            }).catch(() => null);
            
            if (bridgeResponse?.ok) {
                const data = await bridgeResponse.json();
                const aiResponse = data.response || '';
                await this.storeAIResponse(message, aiResponse, selectedModel);
                return { response: aiResponse };
            }
            
            // 3) Legacy Orchestra HTTP server
            let response = await fetch(`${this.orchestraUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, model: selectedModel })
            }).catch(() => null);
            
            // 4) Direct Ollama fallback
            if (!response || !response.ok) {
                response = await fetch(`${this.baseUrl}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        model: selectedModel,
                        prompt: message,
                        stream: false
                    })
                });
            }
            
            if (response && response.ok) {
                const data = await response.json();
                const aiResponse = data.response || data.text || '';
                await this.storeAIResponse(message, aiResponse, selectedModel);
                return { ...data, response: aiResponse };
            }
        } catch (error) {
            console.error('[Ollama] Error sending message:', error);
        }
        
        return null;
    },
    
    async storeAIResponse(message, aiResponse, model) {
        if (window.memory && aiResponse) {
            await window.memory.store(aiResponse, {
                type: 'ai_response',
                source: 'chat',
                context: { model, timestamp: new Date().toISOString() }
            });
        }
        
        window.contextManager.addToContext(message, 'user');
        window.contextManager.addToContext(aiResponse, 'assistant');
    },
    
    async autoConnect() {
        console.log('[Ollama] 🔌 Auto-connecting to local models...');
        const connected = await this.checkOllama();
        if (connected) {
            console.log('[Ollama] ✅ Auto-connected successfully');
        } else {
            console.log('[Ollama] ⚠️ No local models detected. Install Ollama for offline AI.');
        }
        return connected;
    }
};

// Auto-connect on startup
setTimeout(() => {
    window.ollamaManager.autoConnect();
}, 1000);

// ============================================================================
// LOADING INDICATOR SYSTEM
// ============================================================================

window.showLoading = (message = 'Loading...', options = {}) => {
    // Remove existing loader
    const existing = document.getElementById('global-loader');
    if (existing) existing.remove();
    
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 30, 0.98);
        border: 1px solid var(--cyan);
        border-radius: 12px;
        padding: 30px 40px;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 15px;
        min-width: 300px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    `;
    
    loader.innerHTML = `
        <div class="loader-spinner" style="
            width: 40px;
            height: 40px;
            border: 3px solid rgba(0, 212, 255, 0.2);
            border-top-color: var(--cyan);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
        <div style="color: #fff; font-size: 14px; font-weight: 500;">${message}</div>
        ${options.subtitle ? `<div style="color: #666; font-size: 12px;">${options.subtitle}</div>` : ''}
    `;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    if (!document.querySelector('style[data-loading-spin]')) {
        style.setAttribute('data-loading-spin', '');
        document.head.appendChild(style);
    }
    
    document.body.appendChild(loader);
    return loader;
};

window.hideLoading = () => {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 0.3s';
        setTimeout(() => loader.remove(), 300);
    }
};

window.updateLoading = (message, subtitle) => {
    const loader = document.getElementById('global-loader');
    if (loader) {
        const messageEl = loader.querySelector('div:nth-child(2)');
        if (messageEl) messageEl.textContent = message;
        
        if (subtitle) {
            const subtitleEl = loader.querySelector('div:nth-child(3)');
            if (subtitleEl) {
                subtitleEl.textContent = subtitle;
            } else {
                const newSubtitle = document.createElement('div');
                newSubtitle.style.cssText = 'color: #666; font-size: 12px;';
                newSubtitle.textContent = subtitle;
                loader.appendChild(newSubtitle);
            }
        }
    }
};

// ============================================================================
// NETWORK UTILITIES WITH TIMEOUT & RETRY
// ============================================================================

window.fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
    }
};

window.fetchWithRetry = async (url, options = {}, retries = 3, timeout = 10000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await window.fetchWithTimeout(url, options, timeout);
            return response;
        } catch (error) {
            console.warn(`[NetworkUtil] Attempt ${i + 1}/${retries} failed:`, error.message);
            if (i === retries - 1) throw error;
            
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        }
    }
};

console.log('[GlobalFunctions] 📦 Global functions loaded');

})();
