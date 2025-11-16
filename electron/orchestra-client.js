/**
 * Orchestra Client - Unified AI messaging client for the renderer
 * Wraps window.ollamaManager and exposes a consistent interface to agent panels.
 */

(function () {
'use strict';

class OrchestraClient {
  constructor() {
    this.ready = false;
    this.initPromise = this.initialize();
    console.log('[OrchestraClient] Initializing...');
  }

  async initialize() {
    try {
      let attempts = 0;
      while (!window.ollamaManager && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts += 1;
      }

      if (!window.ollamaManager) {
        console.warn('[OrchestraClient] ollamaManager not available');
        this.ready = false;
        return false;
      }

      const connected = await window.ollamaManager.checkOllama();
      this.ready = connected;

      if (this.ready) {
        console.log('[OrchestraClient] ✅ Connected to Ollama/Orchestra backend');
      } else {
        console.warn('[OrchestraClient] ⚠️ Backend not available');
      }

      return this.ready;
    } catch (error) {
      console.error('[OrchestraClient] Initialization error:', error);
      this.ready = false;
      return false;
    }
  }

  isReady() {
    return this.ready;
  }

  async waitForReady(timeout = 30000) {
    const start = Date.now();
    while (!this.ready && Date.now() - start < timeout) {
      await this.initPromise;
      if (this.ready) {
        return true;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return this.ready;
  }

  async sendMessage(options = {}) {
    if (!this.ready) {
      await this.waitForReady();
    }

    if (!this.ready) {
      throw new Error('Orchestra client not connected to AI backend. Start Ollama or the Orchestra server.');
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

    let contextMessage = message;
    if (Array.isArray(history) && history.length > 0) {
      const historyContext = history.slice(-10).map((entry) => {
        const role = entry.role === 'user' ? 'User' : 'Assistant';
        return `${role}: ${entry.content}`;
      }).join('\n');
      contextMessage = `${historyContext}\n\nUser: ${message}`;
    }

    if (systemPrompt) {
      contextMessage = `${systemPrompt}\n\n${contextMessage}`;
    }

    try {
      const response = await window.ollamaManager.sendMessage(contextMessage, model);
      if (!response) {
        throw new Error('No response from AI backend');
      }

      return {
        content: response.response || response.text || '',
        thinking: features.thinking ? this.extractThinking(response) : null,
        actions: this.extractActions(response),
        model,
        agent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('[OrchestraClient] Send message error:', error);
      throw error;
    }
  }

  extractThinking(response) {
    const content = response.response || response.text || '';
    const match = content.match(/\[THINKING\]([\s\S]*?)\[\/THINKING\]/i);
    return match ? match[1].trim() : null;
  }

  extractActions(response) {
    const content = response.response || response.text || '';
    const actions = [];
    const matches = content.matchAll(/(?:TODO|ACTION):\s*(.+?)(?:\n|$)/gi);
    for (const match of matches) {
      actions.push({ type: 'todo', description: match[1].trim() });
    }
    return actions.length > 0 ? actions : null;
  }

  async getStatus() {
    return {
      ready: this.ready,
      backend: this.ready ? 'connected' : 'disconnected',
      models: this.ready ? await window.ollamaManager.getModels() : null
    };
  }
}

window.OrchestraClient = OrchestraClient;
window.orchestraClient = new OrchestraClient();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = OrchestraClient;
}

})();
