/**
 * Marketplace Client - Minimal stub
 */

class MarketplaceClient {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    console.log('[MarketplaceClient] ✅ Marketplace client initialized (stub)');
  }

  async listInstalledExtensions() {
    return [];
  }

  async searchExtensions(query, pageNumber, pageSize) {
    return [];
  }

  async getExtension(publisher, name) {
    return null;
  }
}

module.exports = MarketplaceClient;