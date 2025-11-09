/**
 * API Key Store - Minimal stub
 */

class ApiKeyStore {
  constructor(app) {
    this.app = app;
    this.keys = {};
  }

  async initialize() {
    console.log('[ApiKeyStore] ✅ API key store initialized (stub)');
  }

  async list() {
    return this.keys;
  }

  async set(provider, key, metadata = {}) {
    this.keys[provider] = { key, metadata, timestamp: Date.now() };
    return this.keys[provider];
  }

  async remove(provider) {
    const removed = this.keys[provider];
    delete this.keys[provider];
    return removed;
  }
}

module.exports = ApiKeyStore;