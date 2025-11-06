/**
 * BigDaddyG Native Ollama Wrapper - JavaScript Interface
 * 
 * Provides a clean JavaScript API over the C native module
 */

let nativeModule = null;
let isAvailable = false;

// Try to load native module
try {
    nativeModule = require('./build/Release/bigdaddyg_ollama.node');
    isAvailable = true;
    console.log('[BigDaddyG Native] ✅ Native Ollama module loaded');
} catch (error) {
    console.warn('[BigDaddyG Native] ⚠️ Native module not available:', error.message);
    console.warn('[BigDaddyG Native] 💡 Run "npm install" in native/ollama-wrapper to build');
    isAvailable = false;
}

class NativeOllamaWrapper {
    constructor() {
        this.initialized = false;
        this.fallbackToHTTP = true;
    }
    
    /**
     * Check if native module is available
     */
    isAvailable() {
        return isAvailable && nativeModule !== null;
    }
    
    /**
     * Initialize Ollama
     */
    async init() {
        if (!this.isAvailable()) {
            console.warn('[BigDaddyG Native] Native module not available, using HTTP fallback');
            return false;
        }
        
        try {
            const result = nativeModule.init();
            this.initialized = result;
            
            if (result) {
                console.log('[BigDaddyG Native] ✅ Ollama initialized');
            } else {
                console.error('[BigDaddyG Native] ❌ Failed to initialize Ollama');
            }
            
            return result;
        } catch (error) {
            console.error('[BigDaddyG Native] ❌ Init error:', error);
            return false;
        }
    }
    
    /**
     * Generate AI response
     * @param {string} model - Model name (e.g. "deepseek-r1:1.5b")
     * @param {string} prompt - User prompt
     * @returns {Promise<Object>} Response object
     */
    async generate(model, prompt) {
        if (!this.isAvailable() || !this.initialized) {
            throw new Error('Native Ollama not initialized. Use HTTP fallback.');
        }
        
        try {
            const response = nativeModule.generate(model, prompt);
            
            console.log(`[BigDaddyG Native] ✅ Generated ${response.tokens} tokens in ${response.time}s`);
            console.log(`[BigDaddyG Native] 📊 Speed: ${response.tokensPerSecond} tokens/sec`);
            
            return response;
        } catch (error) {
            console.error('[BigDaddyG Native] ❌ Generation error:', error);
            throw error;
        }
    }
    
    /**
     * List available models
     * @returns {Promise<Array>} Array of model objects
     */
    async listModels() {
        if (!this.isAvailable() || !this.initialized) {
            return [];
        }
        
        try {
            const models = nativeModule.listModels();
            console.log(`[BigDaddyG Native] 📋 Found ${models.length} models`);
            return models;
        } catch (error) {
            console.error('[BigDaddyG Native] ❌ List models error:', error);
            return [];
        }
    }
    
    /**
     * Check if initialized
     * @returns {boolean}
     */
    isInitialized() {
        if (!this.isAvailable()) return false;
        
        try {
            return nativeModule.isInitialized();
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Cleanup
     */
    cleanup() {
        if (!this.isAvailable()) return;
        
        try {
            nativeModule.cleanup();
            this.initialized = false;
            console.log('[BigDaddyG Native] 🧹 Cleaned up');
        } catch (error) {
            console.error('[BigDaddyG Native] ⚠️ Cleanup error:', error);
        }
    }
    
    /**
     * Get performance stats
     */
    getStats() {
        return {
            available: this.isAvailable(),
            initialized: this.initialized,
            fallbackEnabled: this.fallbackToHTTP
        };
    }
}

// Export singleton instance
module.exports = new NativeOllamaWrapper();

