const EventEmitter = require('events');

class BigDaddyGAgenticCore extends EventEmitter {
  constructor() {
    super();
    this.initialized = false;
    this.nativeClient = null;
    this.cache = new Map();
    this.stats = { requests: 0, cached: 0, errors: 0 };
  }

  async initialize() {
    if (this.initialized) return true;
    
    try {
      this.emit('status', 'Initializing BigDaddyG Core...');
      this.initialized = true;
      this.emit('ready');
      return true;
    } catch (error) {
      this.emit('error', error);
      return false;
    }
  }

  attachNativeClient(client) {
    this.nativeClient = client;
    this.emit('client-attached');
  }

  async processRequest(model, prompt, options = {}) {
    this.stats.requests++;
    
    const cacheKey = `${model}:${this.hashPrompt(prompt)}`;
    if (this.cache.has(cacheKey) && !options.skipCache) {
      this.stats.cached++;
      return this.cache.get(cacheKey);
    }

    try {
      let response;
      if (this.nativeClient && model.startsWith('bigdaddyg')) {
        response = await this.nativeClient.generate(model, prompt);
      } else {
        response = await this.fallbackGenerate(model, prompt);
      }
      
      this.cache.set(cacheKey, response);
      return response;
    } catch (error) {
      this.stats.errors++;
      throw error;
    }
  }

  async fallbackGenerate(model, prompt) {
    return {
      response: `BigDaddyG fallback response for: ${prompt.substring(0, 50)}...`,
      model,
      done: true
    };
  }

  hashPrompt(prompt) {
    return prompt.length.toString(36) + prompt.slice(-8);
  }

  getStats() {
    return { ...this.stats, cacheSize: this.cache.size };
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = { BigDaddyGAgenticCore };