/**
 * Extension Bridge - Minimal Amazon Q & Copilot integration
 */

class ExtensionBridge {
  constructor(extensionHost) {
    this.host = extensionHost;
    this.amazonQ = null;
    this.copilot = null;
  }

  async loadAmazonQ(extensionPath) {
    try {
      const ext = await this.host.loadExtension(extensionPath);
      await this.host.activateExtension(ext.id);
      this.amazonQ = ext;
      console.log('[Bridge] Amazon Q loaded');
      return ext;
    } catch (err) {
      console.error('[Bridge] Amazon Q failed:', err.message);
    }
  }

  async loadCopilot(extensionPath) {
    try {
      const ext = await this.host.loadExtension(extensionPath);
      await this.host.activateExtension(ext.id);
      this.copilot = ext;
      console.log('[Bridge] Copilot loaded');
      return ext;
    } catch (err) {
      console.error('[Bridge] Copilot failed:', err.message);
    }
  }

  async queryAmazonQ(prompt) {
    if (!this.amazonQ?.isActive) throw new Error('Amazon Q not active');
    return this.amazonQ.exports?.chat?.(prompt);
  }

  async queryCopilot(prompt) {
    if (!this.copilot?.isActive) throw new Error('Copilot not active');
    return this.copilot.exports?.getCompletion?.(prompt);
  }

  getStatus() {
    return {
      amazonQ: this.amazonQ?.isActive || false,
      copilot: this.copilot?.isActive || false
    };
  }
}

module.exports = ExtensionBridge;
