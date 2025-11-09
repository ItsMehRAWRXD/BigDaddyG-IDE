/**
 * Extension Manager - Minimal stub
 */

const { EventEmitter } = require('events');

class ExtensionManager extends EventEmitter {
  constructor(marketplaceClient, extensionHost) {
    super();
    this.marketplaceClient = marketplaceClient;
    this.extensionHost = extensionHost;
    this.autoActivate = new Set();
  }

  async initialize() {
    console.log('[ExtensionManager] ✅ Extension manager initialized (stub)');
  }

  async listExtensionsWithStates() {
    return [];
  }

  getExtensionState(extensionId) {
    return null;
  }

  async installExtension(extensionId) {
    console.log(`[ExtensionManager] Installing extension: ${extensionId} (stub)`);
  }

  async uninstallExtension(extensionId) {
    console.log(`[ExtensionManager] Uninstalling extension: ${extensionId} (stub)`);
  }

  async enableExtension(extensionId) {
    console.log(`[ExtensionManager] Enabling extension: ${extensionId} (stub)`);
  }

  async disableExtension(extensionId) {
    console.log(`[ExtensionManager] Disabling extension: ${extensionId} (stub)`);
  }

  async checkForUpdates() {
    return [];
  }

  async updateExtension(extensionId) {
    console.log(`[ExtensionManager] Updating extension: ${extensionId} (stub)`);
  }

  async updateAllExtensions() {
    return [];
  }
}

module.exports = ExtensionManager;