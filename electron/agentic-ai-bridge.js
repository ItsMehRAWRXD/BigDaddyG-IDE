/**
 * Agentic AI Bridge - Connects AI providers to agentic features
 */

(function() {
'use strict';

class AgenticAIBridge {
  constructor() {
    this.ready = false;
    this.providers = null;
  }

  async initialize() {
    if (this.ready) return true;

    try {
      if (!window.aiProviderManager) {
        console.warn('[AgenticAI] Provider manager not found, creating...');
        if (window.AIProviderManager) {
          window.aiProviderManager = new window.AIProviderManager();
          await window.aiProviderManager.initialize();
        } else {
          throw new Error('AIProviderManager class not loaded');
        }
      }

      this.providers = window.aiProviderManager;
      this.ready = true;
      console.log('[AgenticAI] Bridge ready');
      return true;
    } catch (error) {
      console.error('[AgenticAI] Bridge init failed:', error);
      return false;
    }
  }

  async chat(message, options = {}) {
    if (!this.ready) await this.initialize();
    if (!this.providers) throw new Error('AI providers not available');
    
    return this.providers.chatWithFallback(message, options);
  }

  async getProviderStatus() {
    if (!this.ready) await this.initialize();
    
    const status = {
      ollama: false,
      openai: false,
      anthropic: false,
      gemini: false,
      groq: false,
      deepseek: false,
      amazonq: false,
      copilot: false
    };

    try {
      const response = await fetch('http://localhost:11434/api/tags', { 
        signal: AbortSignal.timeout(1000) 
      });
      status.ollama = response.ok;
    } catch {}

    if (this.providers) {
      status.openai = !!this.providers.getApiKey('openai');
      status.anthropic = !!this.providers.getApiKey('anthropic');
      status.gemini = !!this.providers.getApiKey('gemini');
      status.groq = !!this.providers.getApiKey('groq');
      status.deepseek = !!this.providers.getApiKey('deepseek');
    }

    if (window.electron?.marketplace) {
      try {
        const mktStatus = await window.electron.marketplace.status();
        const installed = mktStatus.installed || [];
        status.amazonq = installed.some(e => e.id?.includes('amazon-q'));
        status.copilot = installed.some(e => e.id?.includes('copilot'));
      } catch {}
    }

    return status;
  }

  async ensureProvider() {
    const status = await this.getProviderStatus();
    const available = Object.entries(status).find(([k, v]) => v);
    
    if (!available) {
      throw new Error('No AI providers available. Configure API keys or install Ollama.');
    }

    console.log(`[AgenticAI] Using provider: ${available[0]}`);
    return available[0];
  }
}

window.agenticAI = new AgenticAIBridge();
window.agenticAI.initialize();

console.log('[AgenticAI] Bridge loaded');

})();
