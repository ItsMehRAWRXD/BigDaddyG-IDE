/**
 * Extension Host - Minimal stub
 */

class ExtensionHost {
  constructor(mainWindow, config) {
    this.mainWindow = mainWindow;
    this.config = config;
    this.initialized = false;
  }

  async initialize() {
    this.initialized = true;
    console.log('[ExtensionHost] ✅ Extension host initialized (stub)');
  }
}

class ExtensionBridge {
  constructor(extensionHost) {
    this.extensionHost = extensionHost;
  }
}

function createExtensionHost(mainWindow, config) {
  return new ExtensionHost(mainWindow, config);
}

module.exports = { createExtensionHost, ExtensionBridge };