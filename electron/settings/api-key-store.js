/**
 * API Key Store - Secure storage for AI provider credentials
 * Supports GitHub Copilot, Amazon Q, and other AI services
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ApiKeyStore {
  constructor(app) {
    this.app = app;
    this.keys = {};
    this.encryptionKey = null;
    this.storePath = path.join(os.homedir(), '.bigdaddyg-ide', 'credentials.enc');
    this.initialized = false;
  }

  async initialize() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.storePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Generate or load encryption key
      await this.initializeEncryption();
      
      // Load existing keys
      await this.loadKeys();
      
      this.initialized = true;
      console.log('[ApiKeyStore] ✅ Secure API key store initialized');
    } catch (error) {
      console.error('[ApiKeyStore] ❌ Initialization failed:', error);
      throw error;
    }
  }

  async initializeEncryption() {
    const keyPath = path.join(path.dirname(this.storePath), '.key');
    
    try {
      // Try to load existing key
      const keyData = await fs.readFile(keyPath);
      this.encryptionKey = keyData;
    } catch (error) {
      // Generate new key
      this.encryptionKey = crypto.randomBytes(32);
      await fs.writeFile(keyPath, this.encryptionKey, { mode: 0o600 });
      console.log('[ApiKeyStore] 🔑 Generated new encryption key');
    }
  }

  async loadKeys() {
    try {
      const encryptedData = await fs.readFile(this.storePath);
      const decrypted = this.decrypt(encryptedData);
      this.keys = JSON.parse(decrypted);
      console.log(`[ApiKeyStore] 📥 Loaded ${Object.keys(this.keys).length} stored credentials`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.warn('[ApiKeyStore] ⚠️ Failed to load keys:', error.message);
      }
      this.keys = {};
    }
  }

  async saveKeys() {
    try {
      const data = JSON.stringify(this.keys, null, 2);
      const encrypted = this.encrypt(data);
      await fs.writeFile(this.storePath, encrypted, { mode: 0o600 });
    } catch (error) {
      console.error('[ApiKeyStore] ❌ Failed to save keys:', error);
      throw error;
    }
  }

  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return Buffer.concat([iv, Buffer.from(encrypted, 'hex')]);
  }

  decrypt(buffer) {
    const iv = buffer.slice(0, 16);
    const encrypted = buffer.slice(16).toString('hex');
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async list() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Return keys without sensitive data
    const safeKeys = {};
    for (const [provider, data] of Object.entries(this.keys)) {
      safeKeys[provider] = {
        provider,
        hasKey: !!data.key,
        metadata: data.metadata || {},
        timestamp: data.timestamp,
        lastUsed: data.lastUsed
      };
    }
    return safeKeys;
  }

  async get(provider) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const data = this.keys[provider];
    if (data) {
      // Update last used timestamp
      data.lastUsed = Date.now();
      await this.saveKeys();
      return data.key;
    }
    return null;
  }

  async set(provider, key, metadata = {}) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    // Validate key format for specific providers
    this.validateKey(provider, key);
    
    this.keys[provider] = {
      key,
      metadata: {
        ...metadata,
        provider,
        keyType: this.detectKeyType(provider, key)
      },
      timestamp: Date.now(),
      lastUsed: null
    };
    
    await this.saveKeys();
    
    console.log(`[ApiKeyStore] ✅ Stored credentials for ${provider}`);
    return this.keys[provider];
  }

  async remove(provider) {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const removed = this.keys[provider];
    delete this.keys[provider];
    
    await this.saveKeys();
    
    console.log(`[ApiKeyStore] 🗑️ Removed credentials for ${provider}`);
    return removed;
  }

  validateKey(provider, key) {
    if (!key || typeof key !== 'string') {
      throw new Error('API key must be a non-empty string');
    }
    
    switch (provider.toLowerCase()) {
      case 'openai':
        if (!key.startsWith('sk-')) {
          throw new Error('OpenAI API key must start with "sk-"');
        }
        break;
      case 'anthropic':
        if (!key.startsWith('sk-ant-')) {
          throw new Error('Anthropic API key must start with "sk-ant-"');
        }
        break;
      case 'github':
      case 'copilot':
        if (!key.startsWith('ghp_') && !key.startsWith('gho_') && !key.startsWith('ghu_')) {
          throw new Error('GitHub token must start with "ghp_", "gho_", or "ghu_"');
        }
        break;
      case 'gemini':
        if (key.length < 30) {
          throw new Error('Gemini API key appears to be too short');
        }
        break;
    }
  }

  detectKeyType(provider, key) {
    switch (provider.toLowerCase()) {
      case 'github':
      case 'copilot':
        if (key.startsWith('ghp_')) return 'personal_access_token';
        if (key.startsWith('gho_')) return 'oauth_token';
        if (key.startsWith('ghu_')) return 'user_token';
        return 'unknown';
      case 'amazonq':
        return 'aws_credentials';
      default:
        return 'api_key';
    }
  }

  // GitHub Copilot specific methods
  async setCopilotToken(token, userInfo = {}) {
    return await this.set('copilot', token, {
      type: 'github_copilot',
      user: userInfo.login,
      email: userInfo.email,
      scopes: ['copilot']
    });
  }

  async getCopilotToken() {
    return await this.get('copilot');
  }

  // Amazon Q specific methods
  async setAmazonQCredentials(accessKey, secretKey, region = 'us-east-1') {
    return await this.set('amazonq', JSON.stringify({
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
      region
    }), {
      type: 'aws_credentials',
      region
    });
  }

  async getAmazonQCredentials() {
    const creds = await this.get('amazonq');
    if (creds) {
      try {
        return JSON.parse(creds);
      } catch (error) {
        console.error('[ApiKeyStore] Failed to parse Amazon Q credentials');
        return null;
      }
    }
    return null;
  }

  // Extension authentication helper
  async authenticateExtension(extensionId, authData) {
    const provider = this.mapExtensionToProvider(extensionId);
    if (provider) {
      return await this.set(provider, authData.token || authData.key, {
        extensionId,
        authType: authData.type || 'token',
        user: authData.user
      });
    }
    throw new Error(`Unknown extension: ${extensionId}`);
  }

  mapExtensionToProvider(extensionId) {
    const mapping = {
      'github.copilot': 'copilot',
      'github.copilot-chat': 'copilot',
      'amazonwebservices.amazon-q-vscode': 'amazonq',
      'ms-vscode.vscode-ai': 'openai'
    };
    return mapping[extensionId];
  }

  async getStats() {
    if (!this.initialized) {
      await this.initialize();
    }
    
    const providers = Object.keys(this.keys);
    const stats = {
      totalProviders: providers.length,
      providers: providers,
      lastUpdated: Math.max(...Object.values(this.keys).map(k => k.timestamp || 0)),
      storePath: this.storePath
    };
    
    return stats;
  }
}

module.exports = ApiKeyStore;