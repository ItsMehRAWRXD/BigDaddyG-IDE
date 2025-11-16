const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { EventEmitter } = require('events');
let fetchFn;
async function getFetch() {
  if (!fetchFn) {
    const mod = await import('node-fetch');
    fetchFn = mod.default || mod;
  }
  return fetchFn;
}

class BigDaddyGCoreBridge extends EventEmitter {
    constructor() {
    super();
        this.initialized = false;
    this.orchestraUrl = process.env.ORCHESTRA_URL || 'http://localhost:11441';
    this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.modelPaths = this.discoverModelPaths();
        this.availableModels = new Map();
        this.customModels = new Map();
    this.loadedModels = new Map();
    this.modelConfigs = new Map();
        this.agentInstances = new Map();
        this.maxAgents = 200;
        this.activeAgents = 0;
    this.toolRegistry = new Map();
    this.memoryManager = null;
    this.nativeClient = null;
  }

  attachNativeClient(client) {
    this.nativeClient = client;
    }

    discoverModelPaths() {
    const windowsCandidates = [
            'D:\\ollama\\models',
            'D:\\OllamaModels',
            'D:\\01-AI-Models\\Ollama\\Models',
            'D:\\MyCopilot-Ollama-Portable\\models',
            'D:\\MyCoPilot-Complete-Portable\\ollama',
            'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\models',
            'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\ProjectIDEAI\\models',
      path.join(process.env.APPDATA || '', 'ollama', 'models'),
      path.join(process.env.LOCALAPPDATA || '', 'ollama', 'models'),
            'D:\\Security Research aka GitHub Repos\\ProjectIDEAI\\training',
            'D:\\MyCopilot-IDE\\models\\ollama',
            'D:\\cursor-multi-ai-extension',
            'D:\\BIGDADDYG-RECOVERY\\D-Drive-Recovery\\ollama',
      'D:\\Backup\\Garre\\.ollama',
        ];

    const unixCandidates = [
      path.join(process.env.HOME || '', '.ollama'),
      path.join(process.env.HOME || '', '.ollama', 'models'),
      '/usr/local/share/ollama',
      '/usr/share/ollama',
      '/var/lib/ollama',
      '/opt/ollama',
      '/Applications/Ollama.app/Contents/Resources',
    ];
    
    const candidates = [...windowsCandidates, ...unixCandidates];
        
    return Array.from(new Set(candidates.filter(Boolean))).filter((candidate) => {
            try {
        return fs.existsSync(candidate);
            } catch {
                return false;
            }
        });
    }

    async initialize() {
        if (this.initialized) return true;
        
    console.log('[BigDaddyG] 🚀 Starting Agentic Core initialization...');
        
            await this.scanAllModels();
    await this.loadModelConfigs();
    await Promise.allSettled([this.connectToOrchestra(), this.connectToOllama()]);
            await this.loadCustomModels();
            await this.initializeAgentPool();
    await this.initializeMemoryManagement();
    await this.registerDefaultTools();
            
            this.initialized = true;
    console.log('[BigDaddyG] ✅ Agentic Core initialized');
    console.log(`[BigDaddyG] 📈 ${this.availableModels.size} models catalogued`);
    console.log(`[BigDaddyG] 🤖 ${this.maxAgents} agents provisioned`);

    this.emit('initialized');
            return true;
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
        }
    }

    async scanAllModels() {
        for (const modelPath of this.modelPaths) {
                await this.scanModelDirectory(modelPath);
    }
  }

  async scanModelDirectory(dirPath, depth = 0) {
    if (depth > 5) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch (error) {
      return;
    }
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    await this.scanModelDirectory(fullPath, depth + 1);
                } else if (this.isModelFile(entry.name)) {
                    await this.registerModel(fullPath, entry.name);
                }
        }
    }

    isModelFile(filename) {
    const extensions = ['.bin', '.gguf', '.ggml', '.safetensors', '.pt', '.pth'];
    const keywords = ['model', 'weights', 'checkpoint', 'ckpt', 'bigdaddyg', 'twinsie', 'mini'];
        const ext = path.extname(filename).toLowerCase();
    const nameLower = filename.toLowerCase();
    return (
      extensions.includes(ext) || keywords.some((keyword) => nameLower.includes(keyword)) || filename.includes('sha256-')
    );
    }

    async registerModel(filePath, filename) {
        try {
            const stats = fs.statSync(filePath);
      const info = {
                name: this.extractModelName(filename),
                path: filePath,
        filename,
                sizeBytes: stats.size,
        size: Number((stats.size / (1024 * 1024 * 1024)).toFixed(2)),
                type: this.detectModelType(filePath),
                modified: stats.mtime,
        available: true,
            };
            
      this.availableModels.set(info.name, info);
            if (this.isCustomModel(filename)) {
        this.customModels.set(info.name, {
          ...info,
                    isCustom: true,
          variant: this.detectVariant(filename),
                });
            }
        } catch (error) {
      console.warn(`[BigDaddyG] ⚠️ Failed to register model ${filename}: ${error.message}`);
        }
    }

    extractModelName(filename) {
        if (filename.includes('sha256-')) {
            return `ollama-blob-${filename.substring(0, 16)}`;
        }
    return filename
            .replace(/\.(bin|gguf|ggml|safetensors|pt|pth)$/i, '')
      .replace(/[-_]q[0-9]+_[0-9]+/i, '')
      .replace(/[-_](fp16|fp32|int8|int4)/i, '');
    }

    detectModelType(filePath) {
    const nameLower = filePath.toLowerCase();
    if (nameLower.includes('code')) return 'code';
    if (nameLower.includes('chat')) return 'chat';
    if (nameLower.includes('instruct')) return 'instruction';
    if (nameLower.includes('embed')) return 'embedding';
    if (nameLower.includes('vision')) return 'multimodal';
    if (nameLower.includes('bigdaddyg')) return 'custom-trained';
        return 'general';
    }

    isCustomModel(filename) {
        const nameLower = filename.toLowerCase();
    return ['twinsie', 'mini', 'bigdaddyg', 'custom', 'stealth', 'cheetah'].some((keyword) => nameLower.includes(keyword));
    }

    detectVariant(filename) {
        const nameLower = filename.toLowerCase();
        if (nameLower.includes('twinsie')) return 'twinsie';
        if (nameLower.includes('mini')) return 'mini';
        if (nameLower.includes('stealth')) return 'stealth';
        if (nameLower.includes('cheetah')) return 'cheetah';
        return 'custom';
    }

    async loadModelConfigs() {
        const configPaths = [
            'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\configs\\ALL-AVAILABLE-MODELS.json',
            'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\configs\\real-models.json',
      'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\configs\\cloned-models.json',
        ];
        
        for (const configPath of configPaths) {
            try {
        if (!fs.existsSync(configPath)) continue;
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        if (Array.isArray(config)) {
          config.forEach((model) => this.registerConfigModel(model, configPath));
        } else if (Array.isArray(config.models)) {
          config.models.forEach((model) => this.registerConfigModel(model, configPath));
                }
            } catch (error) {
        console.warn(`[BigDaddyG] ⚠️ Failed to load config ${configPath}: ${error.message}`);
      }
    }
  }

    registerConfigModel(model, source) {
    if (!model) return;
    const info = {
      name: model.name || model.id || `model-${Date.now()}`,
            type: model.type || 'configured',
      size: model.size || 0,
      source,
            configured: true,
      ...model,
        };
    this.availableModels.set(info.name, info);
    }

    async connectToOrchestra() {
        try {
      const response = await (await getFetch()).fetch(`${this.orchestraUrl}/health`, { timeout: 2000 });
            if (response.ok) {
        console.log('[BigDaddyG] ✅ Orchestra server reachable');
                return true;
            }
        } catch (error) {
      console.warn('[BigDaddyG] ⚠️ Orchestra server unavailable');
        }
        return false;
    }

    async connectToOllama() {
        try {
      const fetch = await getFetch();
      const response = await fetch(`${this.ollamaUrl}/api/tags`, { timeout: 2000 });
            if (response.ok) {
                const data = await response.json();
        console.log(`[BigDaddyG] ✅ Ollama server reachable (${data.models?.length || 0} models)`);
        if (Array.isArray(data.models)) {
          data.models.forEach((model) => {
                        this.availableModels.set(model.name, {
                            ...model,
              type: 'ollama',
                            available: true,
              source: 'ollama-api',
                        });
                    });
                }
                return true;
            }
        } catch (error) {
      console.warn('[BigDaddyG] ⚠️ Ollama server unavailable');
        }
        return false;
    }

    async loadCustomModels() {
    const modelfileDir = 'C:\\Users\\HiH8e\\OneDrive\\Desktop\\ProjectIDEAI\\models';
    if (!fs.existsSync(modelfileDir)) return;
        
            const files = fs.readdirSync(modelfileDir);
            for (const file of files) {
      if (!file.endsWith('.modelfile')) continue;
      try {
        const content = fs.readFileSync(path.join(modelfileDir, file), 'utf8');
        const name = path.basename(file, '.modelfile');
        const info = {
          name,
          type: 'custom-modelfile',
          path: path.join(modelfileDir, file),
          content,
          isCustom: true,
          variant: this.detectVariant(name),
        };
        this.customModels.set(name, info);
        this.availableModels.set(name, info);
      } catch (error) {
        console.warn(`[BigDaddyG] ⚠️ Failed to load modelfile ${file}: ${error.message}`);
      }
    }
  }

  async initializeAgentPool() {
    for (let i = 0; i < this.maxAgents; i++) {
      this.agentInstances.set(i, new BigDaddyGAgent(i, this));
    }
  }

  async initializeMemoryManagement() {
    this.memoryManager = {
      contexts: new Map(),
      async saveContext(sessionId, context) {
        this.contexts.set(sessionId, { ...context, timestamp: new Date(), id: sessionId });
      },
      async loadContext(sessionId) {
        return this.contexts.get(sessionId);
      },
      async deleteContext(sessionId) {
        return this.contexts.delete(sessionId);
      },
      async listContexts() {
        return Array.from(this.contexts.keys());
      },
    };
  }

  async registerDefaultTools() {
    const defaults = ['web-search', 'file-system', 'code-execution', 'calculator', 'time', 'memory'];
    defaults.forEach((toolName) => {
      this.registerTool(toolName, {
        name: toolName,
        description: `Default ${toolName} tool`,
        async execute(params) {
          return { success: true, tool: toolName, params };
        },
      });
    });
  }

  registerTool(name, tool) {
    this.toolRegistry.set(name, tool);
  }

  getTool(name) {
    return this.toolRegistry.get(name);
  }

  async chat(messageOrParams, modelName, options = {}) {
    await this.ensureInitialized();

    let params;
    if (typeof messageOrParams === 'object' && messageOrParams !== null) {
      params = { ...messageOrParams };
    } else {
      params = { message: messageOrParams, model: modelName, ...options };
    }

    const targetModel = (params.model || this.selectBestModel(params.message, params)).trim();

    const payload = {
      message: params.message,
      model: targetModel,
      temperature: params.temperature ?? 0.7,
      maxTokens: params.maxTokens ?? 2048,
      topP: params.topP ?? 0.9,
      topK: params.topK ?? 40,
      repeatPenalty: params.repeatPenalty ?? 1.1,
      systemPrompt: params.systemPrompt,
      context: params.context || [],
      tools: params.tools || [],
      responseFormat: params.responseFormat,
    };

    if (targetModel.toLowerCase().startsWith('bigdaddyg')) {
      const orchestraResult = await this.invokeOrchestraChat(payload);
      if (orchestraResult) {
        return orchestraResult;
      }
      throw new Error(`BigDaddyG model "${targetModel}" unavailable. No fallback providers configured.`);
    }

    const ollamaResult = await this.invokeOllamaChat(payload);
    if (ollamaResult) {
      return ollamaResult;
    }

    throw new Error(`Model "${targetModel}" unavailable. No fallback providers configured.`);
  }

  async *chatStream(messageOrParams, modelName, options = {}) {
    await this.ensureInitialized();

    let params;
    if (typeof messageOrParams === 'object' && messageOrParams !== null) {
      params = { ...messageOrParams, stream: true };
    } else {
      params = { message: messageOrParams, model: modelName, stream: true, ...options };
    }

    const targetModel = (params.model || this.selectBestModel(params.message, params)).trim();

    const payload = {
      message: params.message,
      model: targetModel,
      temperature: params.temperature ?? 0.7,
      maxTokens: params.maxTokens ?? 2048,
      topP: params.topP ?? 0.9,
      topK: params.topK ?? 40,
      repeatPenalty: params.repeatPenalty ?? 1.1,
      systemPrompt: params.systemPrompt,
      context: params.context || [],
      tools: params.tools || [],
      responseFormat: params.responseFormat,
    };

    if (targetModel.toLowerCase().startsWith('bigdaddyg')) {
      const orchestraStream = await this.invokeOrchestraStream(payload);
      if (!orchestraStream) {
        throw new Error(`BigDaddyG model "${targetModel}" unavailable for streaming.`);
      }
      for await (const chunk of orchestraStream) {
        yield chunk;
      }
      return;
    }

    const ollamaStream = await this.invokeOllamaStream(payload);
    if (!ollamaStream) {
      throw new Error(`Model "${targetModel}" unavailable for streaming.`);
    }
    for await (const chunk of ollamaStream) {
      yield chunk;
    }
    return;
  }

  selectBestModel(message, options = {}) {
    if (options.model) {
      return options.model;
    }

    const preferred = Array.from(this.availableModels.values()).find((model) =>
      model.name.toLowerCase().startsWith('bigdaddyg'),
    );
    if (preferred) {
      return preferred.name;
    }

    const firstAvailable = Array.from(this.availableModels.keys())[0];
    return firstAvailable || 'bigdaddyg:latest';
  }

  async invokeOrchestraChat(payload) {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.orchestraUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: false }),
        timeout: 60000,
      });
      if (!response.ok) return null;
      const data = await response.json();
      const content =
        data?.response?.choices?.[0]?.message?.content ||
        data?.response?.choices?.[0]?.delta?.content ||
        data?.response?.content ||
        data?.content;
      return {
        content: content || '',
        usage: data?.response?.usage,
        model: payload.model,
        provider: 'orchestra',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.warn('[BigDaddyG] Orchestra chat failed:', error.message);
      return null;
    }
  }

  async invokeOrchestraStream(payload) {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.orchestraUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, stream: true }),
        timeout: 60000,
      });
      if (!response.ok || !response.body) return null;

      const reader = response.body.getReader();
      let buffer = '';

      async function* generator() {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += Buffer.from(value).toString();

          const chunks = buffer.split('\n\n');
          buffer = chunks.pop() || '';

          for (const chunk of chunks) {
            if (!chunk.startsWith('data:')) continue;
            const payload = chunk.replace(/^data:\s*/, '').trim();
            if (payload === '[DONE]') {
              yield { content: '', done: true };
              return;
            }
            try {
              const parsed = JSON.parse(payload);
              const content =
                parsed?.choices?.[0]?.delta?.content ||
                parsed?.choices?.[0]?.message?.content ||
                parsed?.content ||
                '';
              yield { content: content || '', done: Boolean(parsed?.choices?.[0]?.finish_reason) };
            } catch {
              continue;
            }
          }
        }
      }

      return generator();
    } catch (error) {
      console.warn('[BigDaddyG] Orchestra streaming failed:', error.message);
      return null;
    }
  }

  async invokeOllamaChat(payload) {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: payload.model,
          prompt: payload.message,
          stream: false,
          options: {
            temperature: payload.temperature,
            top_p: payload.topP,
            top_k: payload.topK,
            repeat_penalty: payload.repeatPenalty,
          },
        }),
        timeout: 60000,
      });
      if (!response.ok) return null;
      const data = await response.json();
      return {
        content: data?.response || '',
        usage: {
          prompt_tokens: data?.prompt_eval_count || 0,
          completion_tokens: data?.eval_count || 0,
          total_tokens: (data?.prompt_eval_count || 0) + (data?.eval_count || 0),
        },
        model: payload.model,
        provider: 'ollama',
        timestamp: new Date().toISOString(),
      };
        } catch (error) {
      console.warn('[BigDaddyG] Ollama chat failed:', error.message);
      return null;
    }
  }

  async invokeOllamaStream(payload) {
    try {
      const fetch = await getFetch();
      const response = await fetch(`${this.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: payload.model,
          prompt: payload.message,
          stream: true,
          options: {
            temperature: payload.temperature,
            top_p: payload.topP,
            top_k: payload.topK,
            repeat_penalty: payload.repeatPenalty,
          },
        }),
        timeout: 60000,
      });
      if (!response.ok || !response.body) return null;

      const reader = response.body.getReader();
      let buffer = '';

      async function* generator() {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += Buffer.from(value).toString();

          const parts = buffer.split('\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;
            try {
              const parsed = JSON.parse(part);
              yield {
                content: parsed?.response || '',
                done: Boolean(parsed?.done),
                context: parsed?.context,
              };
              if (parsed?.done) return;
            } catch {
              continue;
            }
          }
        }
      }

      return generator();
    } catch (error) {
      console.warn('[BigDaddyG] Ollama streaming failed:', error.message);
      return null;
    }
  }

  async loadModel(modelName, options = {}) {
    await this.ensureInitialized();
    if (!modelName) throw new Error('Model name is required');

    try {
      const result = await this.runOllamaCommand(['pull', modelName]);
      if (!result.success) throw new Error(result.error || 'Failed to pull model');

      this.loadedModels.set(modelName, {
        name: modelName,
        options,
        loadedAt: new Date(),
      });

      this.emit('model-loaded', { name: modelName, options });
      return { name: modelName, options, loaded: true };
    } catch (error) {
      console.error(`[BigDaddyG] ❌ Failed to load model ${modelName}:`, error);
      throw error;
    }
  }

  async unloadModel(modelName) {
    await this.ensureInitialized();
    if (!modelName) throw new Error('Model name is required');

    try {
      await this.runOllamaCommand(['rm', modelName]);
    } catch (error) {
      console.warn(`[BigDaddyG] ⚠️ Failed to remove model from Ollama ${modelName}: ${error.message}`);
    }

    this.loadedModels.delete(modelName);
    this.emit('model-unloaded', modelName);
    return true;
  }

  async listModels() {
    await this.ensureInitialized();
    return Array.from(this.availableModels.values()).map((model) => ({
      ...model,
      loaded: this.loadedModels.has(model.name),
      capabilities: this.getAgenticCapabilities(model),
      parameters: model.parameters || {},
      family: model.family || this.detectVariant(model.name),
    }));
  }

  async getModelInfo(modelName) {
    await this.ensureInitialized();
    const model = this.availableModels.get(modelName);
    if (!model) throw new Error('Model not found');

    return {
      ...model,
      loaded: this.loadedModels.has(modelName),
      agenticCapabilities: this.getAgenticCapabilities(model),
      supportedTools: this.getSupportedTools(model),
      memoryRequirements: this.estimateMemoryRequirements(model),
      performanceProfile: this.getPerformanceProfile(model),
      integrationDetails: {
        isBigDaddyG: true,
        supportsStreaming: true,
        supportsTools: true,
        supportsMemory: true,
        supportsAgents: true,
      },
    };
  }

  getAgenticCapabilities(model) {
    const capabilities = [];
    const type = model.type || model.family || '';
    if (type.includes('bigdaddyg') || model.isCustom) {
      capabilities.push('agent-creation', 'tool-use', 'memory-management');
      if (model.parameters?.supportsReasoning) capabilities.push('advanced-reasoning');
      if (model.parameters?.supportsPlanning) capabilities.push('task-planning');
      if (model.parameters?.supportsCode || model.type === 'code') capabilities.push('code-generation', 'code-analysis');
    }
    return capabilities;
  }

  getSupportedTools(model) {
    const tools = [];
    if (model.type === 'code' || model.parameters?.supportsCode) {
      tools.push('code-execution', 'file-system');
    }
    tools.push('web-search', 'calculator', 'memory');
    if (model.parameters?.supportsAPIs) {
      tools.push('api-calls', 'database-queries');
    }
    return Array.from(new Set(tools));
  }

  estimateMemoryRequirements(model) {
    const baseSize = model.sizeBytes || model.size || 0;
    const overhead = baseSize * 0.2;
    const contextMemory = ((model.parameters?.contextLength || 4096) / 1024) * 512 * 1024;
    return {
      model: baseSize,
      overhead,
      context: contextMemory,
      total: baseSize + overhead + contextMemory,
    };
  }

  getPerformanceProfile(model) {
    const sizeBytes = model.sizeBytes || model.size || 0;
    if (sizeBytes < 1024 * 1024 * 1024) return 'fast';
    if (sizeBytes < 5 * 1024 * 1024 * 1024) return 'balanced';
    return 'powerful';
  }

  async pullModel(modelName) {
    await this.ensureInitialized();
    return this.runOllamaCommand(['pull', modelName]);
  }

  runOllamaCommand(args) {
        return new Promise((resolve) => {
            const proc = spawn('ollama', args, { shell: process.platform === 'win32' });
            let stdout = '';
            let stderr = '';
            
            proc.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            proc.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            proc.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: stdout.trim() });
                } else {
          resolve({ success: false, error: (stderr || stdout || `Exit code ${code}`).trim() });
                }
            });
            proc.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }

  async createAgent(config) {
    await this.ensureInitialized();
    if (this.activeAgents >= this.maxAgents) throw new Error('Maximum agents reached');

        const agentId = this.findAvailableAgent();
    if (agentId === -1) throw new Error('No available agents');
        
        const agent = this.agentInstances.get(agentId);
    await agent.assignTask({ type: 'initialize', ...config });

    const agentConfig = {
      id: `agent_${agentId}`,
      name: config.name || `Agent ${agentId}`,
      model: config.model,
      tools: config.tools || [],
      memory: config.memory ?? true,
      systemPrompt: config.systemPrompt,
      created: new Date(),
      status: 'active',
    };

    this.modelConfigs.set(agentConfig.id, agentConfig);
        this.activeAgents++;
    console.log(`🤖 Created agent: ${agentConfig.name} (${agentConfig.id})`);
    return agentConfig;
  }

  async deleteAgent(agentId) {
    const deleted = this.modelConfigs.delete(agentId);
    if (deleted) {
      console.log(`🤖 Deleted agent: ${agentId}`);
    }
    return deleted;
  }

  async listAgents() {
    return Array.from(this.modelConfigs.values()).filter((config) => config.id?.startsWith('agent_'));
    }

    findAvailableAgent() {
        for (const [id, agent] of this.agentInstances) {
      if (!agent.isBusy()) return id;
        }
        return -1;
    }

  async generateEmbeddings(input, model = 'nomic-embed-text') {
    await this.ensureInitialized();
    if (!input) throw new Error('Input text is required');

    const targetModel = (model || 'bigdaddyg:embed').trim();

    if (targetModel.toLowerCase().startsWith('bigdaddyg')) {
      const fetch = await getFetch();
      const response = await fetch(`${this.orchestraUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, model: targetModel }),
        timeout: 60000,
      });
      if (!response.ok) {
        throw new Error(`Failed to generate embeddings via BigDaddyG model "${targetModel}"`);
      }
      return await response.json();
    }

    const fetch = await getFetch();
    const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, model: targetModel }),
      timeout: 60000,
    });
    if (!response.ok) {
      throw new Error(`Failed to generate embeddings via model "${targetModel}"`);
    }
    return await response.json();
  }

    getStats() {
        return {
            initialized: this.initialized,
            totalModels: this.availableModels.size,
            customModels: this.customModels.size,
            modelPaths: this.modelPaths.length,
            maxAgents: this.maxAgents,
            activeAgents: this.activeAgents,
      availableAgents: this.maxAgents - this.activeAgents,
      loadedModels: this.loadedModels.size,
        };
    }
}

class BigDaddyGAgent {
    constructor(id, core) {
        this.id = id;
        this.core = core;
        this.busy = false;
        this.currentTask = null;
        this.capabilities = ['chat', 'code', 'analysis', 'debug', 'fix'];
    }

    isBusy() {
        return this.busy;
    }

    async assignTask(task, options = {}) {
    if (this.busy) throw new Error(`Agent ${this.id} is busy`);
        this.busy = true;
        this.currentTask = task;
        try {
            const result = await this.executeTask(task, options);
            return result;
        } finally {
            this.busy = false;
            this.currentTask = null;
      this.core.activeAgents = Math.max(this.core.activeAgents - 1, 0);
        }
    }

    async executeTask(task, options) {
        switch (task.type) {
      case 'initialize':
        return { success: true };
            case 'chat':
        return this.core.chat(task.message, task.model, options);
            case 'code':
        return this.core.chat(
          {
            message: `Analyze and improve this ${task.language} code:\n\n${task.code}`,
            model: 'qwen2.5-coder:7b',
          },
          null,
          options,
        );
            case 'debug':
        return this.core.chat(
          {
            message: `Debug this code error:\n\nCode:\n${task.code}\n\nError:\n${task.error}`,
            model: 'qwen2.5-coder:7b',
          },
          null,
          options,
        );
            case 'fix':
        return this.core.chat(
          {
            message: `Fix this code issue:\n\nCode:\n${task.code}\n\nIssue:\n${task.issue}`,
            model: 'qwen2.5-coder:7b',
          },
          null,
          options,
        );
            default:
        return this.core.chat(JSON.stringify(task), task.model, options);
    }
  }
}

let bigDaddyGCore = null;

async function getBigDaddyGCore() {
    if (!bigDaddyGCore) {
    bigDaddyGCore = new BigDaddyGCoreBridge();
        await bigDaddyGCore.initialize();
    }
    return bigDaddyGCore;
}

module.exports = {
  BigDaddyGCoreBridge,
  getBigDaddyGCore,
};