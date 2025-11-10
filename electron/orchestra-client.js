/**
 * Orchestra Client - Unified AI messaging client
 * Wraps ollamaManager and provides standardized interface for agent panels
 */

(function() {
'use strict';

class OrchestraClient {
    constructor() {
        this.ready = false;
        this.initPromise = this.initialize();
        console.log('[OrchestraClient] Initializing...');
    }
    
    /**
     * Initialize the client by checking backend availability
     */
    async initialize() {
        try {
            // Wait for ollamaManager to be available
            let attempts = 0;
            while (!window.ollamaManager && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!window.ollamaManager) {
                console.warn('[OrchestraClient] ollamaManager not available');
                this.ready = false;
                return false;
            }
            
            // Check if Orchestra/Ollama is available
            const connected = await window.ollamaManager.checkOllama();
            this.ready = connected;
            
            if (this.ready) {
                console.log('[OrchestraClient] ✅ Ready - connected to AI backend');
            } else {
                console.warn('[OrchestraClient] ⚠️ Not connected to AI backend');
            }
            
            return this.ready;
        } catch (error) {
            console.error('[OrchestraClient] Initialization error:', error);
            this.ready = false;
            return false;
        }
    }
    
    /**
     * Check if client is ready
     */
    isReady() {
        return this.ready;
    }
    
    /**
     * Wait for client to be ready
     */
    async waitForReady(timeout = 30000) {
        const startTime = Date.now();
        
        while (!this.ready && (Date.now() - startTime) < timeout) {
            await this.initPromise;
            if (this.ready) return true;
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return this.ready;
    }
    
    /**
     * Send a message to the AI
     * @param {Object} options - Message options
     * @param {string} options.message - The message to send
     * @param {string} options.model - Model to use (optional)
     * @param {string} options.agent - Agent mode (optional)
     * @param {Object} options.features - Feature toggles (optional)
     * @param {Array} options.history - Conversation history (optional)
     * @returns {Promise<Object>} - AI response
     */
    async sendMessage(options = {}) {
        // Ensure we're ready
        if (!this.ready) {
            await this.waitForReady();
        }
        
        if (!this.ready) {
            throw new Error('Orchestra client not connected to AI backend. Please check that Ollama or Orchestra server is running.');
        }
        
        const { 
            message, 
            model = 'auto', 
            agent = 'agent',
            features = {},
            history = [],
            systemPrompt = ''
        } = options;
        
        if (!message) {
            throw new Error('Message is required');
        }
        
        // Build context from history
        let contextMessage = message;
        if (history && history.length > 0) {
            const historyContext = history.slice(-10).map(msg => 
                `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
            ).join('\n');
            contextMessage = `${historyContext}\n\nUser: ${message}`;
        }
        
        // Add system prompt if provided
        if (systemPrompt) {
            contextMessage = `${systemPrompt}\n\n${contextMessage}`;
        }
        
        try {
            // Use ollamaManager to send the message
            const response = await window.ollamaManager.sendMessage(contextMessage, model);
            
            if (!response) {
                throw new Error('No response from AI backend');
            }
            
            // Normalize response format
            return {
                content: response.response || response.text || '',
                thinking: features.thinking ? this.extractThinking(response) : null,
                actions: this.extractActions(response),
                model: model,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('[OrchestraClient] Send message error:', error);
            throw error;
        }
    }
    
    /**
     * Extract thinking process from response (if available)
     */
    extractThinking(response) {
        // Simple extraction - look for thinking markers
        const content = response.response || response.text || '';
        const thinkingMatch = content.match(/\[THINKING\]([\s\S]*?)\[\/THINKING\]/i);
        return thinkingMatch ? thinkingMatch[1].trim() : null;
    }
    
    /**
     * Extract action items from response
     */
    extractActions(response) {
        // Simple extraction - look for action markers or TODO items
        const content = response.response || response.text || '';
        const actions = [];
        
        // Look for TODO or ACTION items
        const todoMatches = content.matchAll(/(?:TODO|ACTION):\s*(.+?)(?:\n|$)/gi);
        for (const match of todoMatches) {
            actions.push({
                type: 'todo',
                description: match[1].trim()
            });
        }
        
        return actions.length > 0 ? actions : null;
    }
    
    /**
     * Get connection status
     */
    async getStatus() {
        return {
            ready: this.ready,
            backend: this.ready ? 'connected' : 'disconnected',
            models: this.ready ? await window.ollamaManager.getModels() : null
        };
    }
}

// Create singleton instance
window.OrchestraClient = OrchestraClient;
window.orchestraClient = new OrchestraClient();

console.log('[OrchestraClient] Module loaded - global instance available');

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OrchestraClient;
}

})();
