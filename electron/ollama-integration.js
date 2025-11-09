/**
 * Ollama Integration for BigDaddyG IDE
 * Unified client for Ollama API with fallback support
 */

class OllamaIntegration {
    constructor() {
        this.baseUrl = 'http://localhost:11434';
        this.isConnected = false;
        this.models = [];
        this.currentModel = null;
    }

    async init() {
        try {
            await this.checkConnection();
            await this.loadModels();
            console.log('[Ollama] ✅ Integration initialized');
            return true;
        } catch (error) {
            console.warn('[Ollama] ⚠️ Failed to initialize:', error.message);
            return false;
        }
    }

    async checkConnection() {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        this.isConnected = true;
        return true;
    }

    async loadModels() {
        const response = await fetch(`${this.baseUrl}/api/tags`);
        const data = await response.json();
        this.models = data.models || [];
        return this.models;
    }

    async generate(model, prompt, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || this.currentModel,
                prompt,
                stream: false,
                ...options
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async chat(model, messages, options = {}) {
        const response = await fetch(`${this.baseUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || this.currentModel,
                messages,
                stream: false,
                ...options
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    setModel(model) {
        this.currentModel = model;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            models: this.models.length,
            currentModel: this.currentModel
        };
    }
}

// Global instance
window.ollamaIntegration = new OllamaIntegration();

// Auto-initialize
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        window.ollamaIntegration.init();
    });
}

console.log('[Ollama] 📦 Integration module loaded');