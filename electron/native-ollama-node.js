const { EventEmitter } = require('events');
const { getBigDaddyGCore } = require('./bigdaddyg-agentic-core');
let electronApp = null;
try {
  ({ app: electronApp } = require('electron'));
} catch (error) {
  electronApp = null;
}
const path = require('path');
const fs = require('fs').promises;

class NativeOllamaClient extends EventEmitter {
  constructor() {
    super();
    this.models = new Map();
    this.activeModels = new Map();
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheTimeout = 30 * 60 * 1000;
    this.requestTimeout = 120 * 1000;
    this.maxRetries = 3;
    this.retryDelay = 1000;
    this.initialized = false;

    this.stats = {
      requests: 0,
      successfulRequests: 0,
      errors: 0,
      streamingSessions: 0,
      cacheHits: 0,
      lastRequestAt: null,
      totalTokens: 0,
      modelUsage: new Map(),
      sessionStart: Date.now(),
    };

    this.initializeClient();
  }

  async initializeClient() {
    try {
      console.log('🤖 Initializing Native Ollama Client...');

      const cacheDir = electronApp
        ? path.join(electronApp.getPath('userData'), 'ollama-cache')
        : path.join(process.cwd(), '.ollama-cache');
      await fs.mkdir(cacheDir, { recursive: true });

      await this.loadCachedModels(cacheDir);

      this.core = await getBigDaddyGCore();

      this.setupEventListeners();

      this.initialized = true;
      console.log('🤖 Native Ollama Client initialized successfully');

      this.emit('ready');
    } catch (error) {
      console.error('❌ Failed to initialize Native Ollama Client:', error);
      this.emit('error', error);
      throw error;
    }
  }

  async setupEventListeners() {
    if (!this.core || typeof this.core.on !== 'function') return;

    this.core.on('model-loaded', (model) => {
      console.log(`📦 Model loaded: ${model.name}`);
      this.activeModels.set(model.name, model);
      this.emit('model-loaded', model);
    });

    this.core.on('model-unloaded', (modelName) => {
      console.log(`📦 Model unloaded: ${modelName}`);
      this.activeModels.delete(modelName);
      this.emit('model-unloaded', modelName);
    });

    this.core.on('error', (error) => {
      console.error('❌ BigDaddyG Core error:', error);
      this.emit('error', error);
    });
  }

  async loadCachedModels(cacheDir) {
    const cacheFile = path.join(cacheDir, 'models.json');
    try {
      const data = await fs.readFile(cacheFile, 'utf8');
      const cached = JSON.parse(data);

      for (const [key, value] of Object.entries(cached)) {
        this.models.set(key, value);
      }

      console.log(`📦 Loaded ${this.models.size} cached models`);
    } catch (error) {
      console.log('📦 No cached models found, starting fresh');
    }
  }

  async saveCachedModels() {
    if (!electronApp) return;
    try {
      const cacheDir = path.join(electronApp.getPath('userData'), 'ollama-cache');
      await fs.mkdir(cacheDir, { recursive: true });
      const cacheFile = path.join(cacheDir, 'models.json');
      const data = Object.fromEntries(this.models);
      await fs.writeFile(cacheFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('❌ Failed to save cached models:', error);
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initializeClient();
    }
    if (!this.initialized) {
      throw new Error('Native Ollama Client not initialized');
    }
  }

  async generate(model, prompt, options = {}) {
    await this.ensureInitialized();

    this.stats.requests++;
    this.stats.lastRequestAt = new Date().toISOString();

    const cacheKey = this.generateCacheKey(model, prompt, options);
    const cached = this.getFromCache(cacheKey);
    if (cached && !options.skipCache) {
      console.log(`💰 Cache hit for model: ${model}`);
      this.stats.cacheHits++;
      this.trackModelUsage(model);
      return cached;
    }

    try {
      console.log(`🎯 Generating response with model: ${model}`);

      if (!this.activeModels.has(model)) {
        await this.loadModel(model);
      }

      const startTime = Date.now();

      const response = await this.core.chat({
        message: prompt,
        model,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 2048,
        topP: options.topP ?? 0.9,
        topK: options.topK ?? 40,
        repeatPenalty: options.repeatPenalty ?? 1.1,
        systemPrompt: options.systemPrompt,
        context: options.context || [],
        tools: options.tools || [],
        responseFormat: options.responseFormat,
      });

      const generationTime = Date.now() - startTime;

      const result = {
        response: response.content,
        model,
        created_at: new Date().toISOString(),
        done: true,
        generation_time: generationTime,
        usage:
          response.usage || {
            prompt_tokens: this.estimateTokens(prompt),
            completion_tokens: this.estimateTokens(response.content),
            total_tokens: this.estimateTokens(`${prompt}${response.content}`),
          },
      };

      this.addToCache(cacheKey, result);

      this.stats.successfulRequests++;
      this.stats.totalTokens += result.usage.total_tokens || 0;
      this.trackModelUsage(model);

      this.emit('generation-complete', {
        model,
        prompt,
        response: result,
        generationTime,
      });

      return result;
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ Generation failed for model ${model}:`, error);

      this.emit('generation-error', {
        model,
        prompt,
        error: error.message,
      });

      throw error;
    }
  }

  async generateStream(model, prompt, options = {}) {
    await this.ensureInitialized();

    this.stats.streamingSessions++;

    try {
      console.log(`🎯 Starting stream generation with model: ${model}`);

      if (!this.activeModels.has(model)) {
        await this.loadModel(model);
      }

      const stream = new EventEmitter();
      const startTime = Date.now();
      let fullResponse = '';

      const responseStream = await this.core.chatStream({
        message: prompt,
        model,
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens ?? 2048,
        topP: options.topP ?? 0.9,
        topK: options.topK ?? 40,
        repeatPenalty: options.repeatPenalty ?? 1.1,
        systemPrompt: options.systemPrompt,
        context: options.context || [],
        tools: options.tools || [],
        responseFormat: options.responseFormat,
      });

      (async () => {
        try {
          for await (const chunk of responseStream) {
            fullResponse += chunk.content;

            stream.emit('data', {
              response: chunk.content,
              model,
              created_at: new Date().toISOString(),
              done: chunk.done,
              context: chunk.context,
            });

            if (chunk.done) {
              const generationTime = Date.now() - startTime;

              stream.emit('end', {
                response: fullResponse,
                model,
                created_at: new Date().toISOString(),
                done: true,
                generation_time: generationTime,
                usage: {
                  prompt_tokens: this.estimateTokens(prompt),
                  completion_tokens: this.estimateTokens(fullResponse),
                  total_tokens: this.estimateTokens(`${prompt}${fullResponse}`),
                },
              });

              this.emit('stream-complete', {
                model,
                prompt,
                response: fullResponse,
                generationTime,
              });

              break;
            }
          }
        } catch (error) {
          stream.emit('error', error);
        }
      })();

      return stream;
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ Stream generation failed for model ${model}:`, error);
      throw error;
    }
  }

  async loadModel(modelName, options = {}) {
    try {
      console.log(`📦 Loading model: ${modelName}`);

      const core = await getBigDaddyGCore();
      const result = await core.loadModel(modelName, options);

      this.activeModels.set(modelName, result);
      this.models.set(modelName, result);

      await this.saveCachedModels();

      this.emit('model-loaded', result);

      return result;
    } catch (error) {
      console.error(`❌ Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  async unloadModel(modelName) {
    try {
      console.log(`📦 Unloading model: ${modelName}`);

      const core = await getBigDaddyGCore();
      await core.unloadModel(modelName);

      this.activeModels.delete(modelName);

      this.emit('model-unloaded', modelName);

      return true;
    } catch (error) {
      console.error(`❌ Failed to unload model ${modelName}:`, error);
      throw error;
    }
  }

  async listModels() {
    try {
      const core = await getBigDaddyGCore();
      const models = await core.listModels();

      models.forEach((model) => {
        this.models.set(model.name, model);
      });

      await this.saveCachedModels();

      return Array.from(this.models.values());
    } catch (error) {
      console.error('❌ Failed to list models:', error);
      throw error;
    }
  }

  async getModelInfo(modelName) {
    try {
      const core = await getBigDaddyGCore();
      return await core.getModelInfo(modelName);
    } catch (error) {
      console.error(`❌ Failed to get model info for ${modelName}:`, error);
      throw error;
    }
  }

  async checkModelStatus(modelName) {
    return {
      loaded: this.activeModels.has(modelName),
      cached: this.models.has(modelName),
      info: this.models.get(modelName) || null,
    };
  }

  generateCacheKey(model, prompt, options) {
    const keyData = {
      model,
      prompt,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      topP: options.topP,
      topK: options.topK,
      repeatPenalty: options.repeatPenalty,
      systemPrompt: options.systemPrompt,
      context: options.context,
    };

    return require('crypto')
      .createHash('sha256')
      .update(JSON.stringify(keyData))
      .digest('hex');
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached) {
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
      this.cache.delete(key);
    }
    return null;
  }

  addToCache(key, data) {
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  estimateTokens(text) {
    return Math.ceil((text || '').length / 4);
  }

  trackModelUsage(model) {
    const current = this.stats.modelUsage.get(model) || 0;
    this.stats.modelUsage.set(model, current + 1);
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.keys()),
    };
  }

  getActiveModels() {
    return Array.from(this.activeModels.keys());
  }

  getLoadedModels() {
    return Array.from(this.activeModels.values());
  }

  getStats() {
    const uptime = Date.now() - this.stats.sessionStart;
    return {
      ...this.stats,
      uptime,
      cacheSize: this.cache.size,
      modelUsage: Object.fromEntries(this.stats.modelUsage),
    };
  }

  async shutdown() {
    console.log('🤖 Shutting down Native Ollama Client...');

    for (const modelName of this.activeModels.keys()) {
      try {
        await this.unloadModel(modelName);
      } catch (error) {
        console.error(`❌ Failed to unload model ${modelName} during shutdown:`, error);
      }
    }

    await this.saveCachedModels();

    this.removeAllListeners();
    console.log('🤖 Native Ollama Client shutdown complete');
  }
}

const nativeOllamaClient = new NativeOllamaClient();

if (electronApp && typeof electronApp.on === 'function') {
  electronApp.on('before-quit', async () => {
    await nativeOllamaClient.shutdown();
  });
}

module.exports = nativeOllamaClient;