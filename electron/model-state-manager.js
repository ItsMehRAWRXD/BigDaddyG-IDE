/**
 * BigDaddyG IDE - Unified Model State Manager
 * Single source of truth for model selection across all UI components
 */

(function() {
'use strict';

class ModelStateManager {
    constructor() {
        this.activeModel = null;
        this.availableModels = [];
        this.listeners = new Map();
        this.loading = false;
        
        console.log('[ModelState] 🎯 Initializing model state manager...');
        this.init();
    }
    
    async init() {
        // Load models from Orchestra
        await this.loadModels();
        
        // Listen for model swap events
        document.addEventListener('model-swapped', (e) => {
            this.handleModelSwap(e.detail);
        });
        
        // Expose to window
        window.modelState = this;
        
        console.log('[ModelState] ✅ Model state manager ready');
    }
    
    async loadModels() {
        if (this.loading) return;
        
        this.loading = true;
        
        try {
            // Primary: Use electron models discovery (Ollama + BigDaddyG)
            if (window.electron?.models?.discover) {
                try {
                    const discovery = await window.electron.models.discover();
                    
                    // Combine all model sources
                    const ollamaModels = discovery.catalog?.ollama?.models || [];
                    const bigdaddygModels = discovery.catalog?.bigdaddyg?.models || [];
                    const customModels = discovery.catalog?.custom?.models || [];
                    
                    this.availableModels = [
                        ...ollamaModels.map(m => ({
                            id: typeof m === 'string' ? m : (m.name || m.id),
                            name: typeof m === 'string' ? m : (m.name || m.id),
                            type: 'ollama',
                            source: 'ollama-api',
                            ...(typeof m === 'object' ? m : {})
                        })),
                        ...bigdaddygModels.map(m => ({
                            id: typeof m === 'string' ? m : (m.name || m.id),
                            name: typeof m === 'string' ? m : (m.name || m.id),
                            type: 'bigdaddyg',
                            source: 'orchestra',
                            ...(typeof m === 'object' ? m : {})
                        })),
                        ...customModels.map(m => ({
                            id: typeof m === 'string' ? m : (m.name || m.id),
                            name: typeof m === 'string' ? m : (m.name || m.id),
                            type: 'custom',
                            source: 'custom',
                            ...(typeof m === 'object' ? m : {})
                        }))
                    ];
                    
                    // Set active model if none selected
                    if (this.availableModels.length > 0 && !this.activeModel) {
                        const first = this.availableModels[0];
                        this.setActiveModel(first.id, first);
                    }
                    
                    console.log(`[ModelState] Loaded ${this.availableModels.length} models from discovery`);
                    this.notifyListeners('models-loaded', this.availableModels);
                    this.loading = false;
                    return;
                } catch (error) {
                    console.warn('[ModelState] Discovery failed, trying fallbacks:', error);
                }
            }
            
            // Fallback 1: Try Orchestra health endpoint
            if (this.availableModels.length === 0) {
                try {
                    const response = await fetch('http://localhost:11441/health', { 
                        signal: AbortSignal.timeout(2000) 
                    });
                    if (response.ok) {
                        const data = await response.json();
                        if (data.models && Array.isArray(data.models)) {
                            this.availableModels = data.models.map(m => ({
                                id: m.id || m.name,
                                name: m.name || m.id,
                                type: 'bigdaddyg',
                                source: 'orchestra',
                                ...m
                            }));
                        }
                    }
                } catch (error) {
                    console.warn('[ModelState] Orchestra health check failed:', error);
                }
            }
            
            // Fallback 2: Direct Ollama API
            if (this.availableModels.length === 0 && window.electron?.models?.list) {
                try {
                    const models = await window.electron.models.list();
                    if (Array.isArray(models) && models.length > 0) {
                        this.availableModels = models.map(m => ({
                            id: typeof m === 'string' ? m : (m.name || m.id),
                            name: typeof m === 'string' ? m : (m.name || m.id),
                            type: 'ollama',
                            source: 'ollama-api',
                            ...(typeof m === 'object' ? m : {})
                        }));
                    }
                } catch (error) {
                    console.warn('[ModelState] Ollama list failed:', error);
                }
            }
            
            // Fallback 3: Model hot-swap registry
            if (this.availableModels.length === 0 && window.ModelRegistry) {
                this.availableModels = Object.entries(window.ModelRegistry)
                    .filter(([key, value]) => value !== null)
                    .map(([key, value]) => ({
                        id: key,
                        name: value.name || key,
                        type: 'registry',
                        source: 'registry',
                        ...value
                    }));
            }
            
            // Set active model if we have models
            if (this.availableModels.length > 0 && !this.activeModel) {
                const first = this.availableModels[0];
                this.setActiveModel(first.id, first);
            }
            
            console.log(`[ModelState] Loaded ${this.availableModels.length} models`);
            this.notifyListeners('models-loaded', this.availableModels);
            
        } catch (error) {
            console.warn('[ModelState] Failed to load models:', error);
        } finally {
            this.loading = false;
        }
    }
    
    setActiveModel(modelId, modelData = null) {
        const oldModel = this.activeModel;
        
        this.activeModel = {
            id: modelId,
            ...modelData
        };
        
        console.log(`[ModelState] Active model: ${modelId}`);
        
        // Notify all listeners
        this.notifyListeners('model-changed', {
            old: oldModel,
            new: this.activeModel
        });
        
        // Update all dropdowns/selectors
        this.syncAllSelectors(modelId);
    }
    
    getActiveModel() {
        return this.activeModel;
    }
    
    getAvailableModels() {
        return this.availableModels;
    }
    
    handleModelSwap(detail) {
        if (detail.to !== this.activeModel?.id) {
            this.setActiveModel(detail.to, detail.model);
        }
    }
    
    subscribe(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        
        this.listeners.get(event).push(callback);
        
        // Immediate callback with current state
        if (event === 'model-changed' && this.activeModel) {
            callback({ old: null, new: this.activeModel });
        } else if (event === 'models-loaded' && this.availableModels.length > 0) {
            callback(this.availableModels);
        }
        
        // Return unsubscribe function
        return () => {
            const listeners = this.listeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) {
                    listeners.splice(index, 1);
                }
            }
        };
    }
    
    notifyListeners(event, data) {
        const listeners = this.listeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[ModelState] Error in listener for ${event}:`, error);
                }
            });
        }
    }
    
    syncAllSelectors(modelId) {
        // Find all model selector dropdowns
        const selectors = document.querySelectorAll(
            '#agent-model-select, #model-select, .model-selector, [data-model-selector]'
        );
        
        selectors.forEach(selector => {
            if (selector.value !== modelId) {
                selector.value = modelId;
                
                // Trigger change event if needed
                const event = new Event('change', { bubbles: true });
                selector.dispatchEvent(event);
            }
        });
    }
    
    async refreshModels() {
        console.log('[ModelState] Refreshing models...');
        this.availableModels = [];
        await this.loadModels();
    }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ModelStateManager();
    });
} else {
    new ModelStateManager();
}

})();
