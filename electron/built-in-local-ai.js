/**
 * BigDaddyG IDE - Built-In Local AI Engine
 * NOW USES YOUR CUSTOM OLLAMA MODELS AGENTICALLY OFFLINE!
 * Falls back to rule-based AI if Ollama not available
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class BuiltInLocalAI {
    constructor() {
        this.modelCache = new Map();
        this.isInitialized = false;
        this.currentModel = null;
        this.modelDir = path.join(__dirname, '..', 'ai-models');
        
        // Ollama configuration
        this.ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.ollamaAvailable = false;
        this.ollamaModels = [];
        this.customOllamaModels = [];
        
        // Ensure model directory exists
        if (!fs.existsSync(this.modelDir)) {
            fs.mkdirSync(this.modelDir, { recursive: true });
        }
        
        console.log('[Built-In AI] Initialized - will check for custom Ollama models');
    }
    
    /**
     * Initialize the local AI engine
     * NOW DETECTS AND USES YOUR CUSTOM OLLAMA MODELS!
     */
    async initialize() {
        if (this.isInitialized) {
            return { success: true, message: 'Already initialized' };
        }
        
        try {
            console.log('[Built-In AI] 🔍 Checking for custom Ollama models...');
            
            // Try to connect to Ollama server
            const ollamaCheck = await this.checkOllamaAvailability();
            
            if (ollamaCheck.available) {
                console.log(`[Built-In AI] ✅ Ollama available with ${ollamaCheck.models.length} models!`);
                this.ollamaAvailable = true;
                this.ollamaModels = ollamaCheck.models;
                this.customOllamaModels = ollamaCheck.models.filter(m => 
                    !['llama2', 'llama3', 'codellama', 'mistral'].includes(m.name.split(':')[0])
                );
                
                // Use first available model (prefer custom models)
                if (this.customOllamaModels.length > 0) {
                    this.currentModel = {
                        name: this.customOllamaModels[0].name,
                        type: 'ollama-custom',
                        size: this.customOllamaModels[0].size
                    };
                    console.log(`[Built-In AI] 🎯 Using custom Ollama model: ${this.currentModel.name}`);
                } else if (this.ollamaModels.length > 0) {
                    this.currentModel = {
                        name: this.ollamaModels[0].name,
                        type: 'ollama',
                        size: this.ollamaModels[0].size
                    };
                    console.log(`[Built-In AI] 🦙 Using Ollama model: ${this.currentModel.name}`);
                }
            } else {
                console.log('[Built-In AI] ⚠️ Ollama not available, using rule-based fallback');
                await this.initializeFallbackModel();
            }
            
            this.isInitialized = true;
            return { 
                success: true, 
                message: 'Initialized successfully',
                ollamaAvailable: this.ollamaAvailable,
                ollamaModels: this.ollamaModels.length,
                customModels: this.customOllamaModels.length,
                currentModel: this.currentModel
            };
        } catch (error) {
            console.error('[Built-In AI] Initialization error:', error);
            await this.initializeFallbackModel();
            this.isInitialized = true;
            return { success: false, error: error.message, fallback: true };
        }
    }
    
    /**
     * Check if Ollama is available and get models
     */
    async checkOllamaAvailability() {
        return new Promise((resolve) => {
            const options = {
                hostname: 'localhost',
                port: 11434,
                path: '/api/tags',
                method: 'GET',
                timeout: 2000
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            available: true,
                            models: parsed.models || []
                        });
                    } catch {
                        resolve({ available: false, models: [] });
                    }
                });
            });
            
            req.on('error', () => {
                resolve({ available: false, models: [] });
            });
            
            req.on('timeout', () => {
                req.destroy();
                resolve({ available: false, models: [] });
            });
            
            req.end();
        });
    }
    
    /**
     * Initialize fallback model (rule-based AI)
     */
    async initializeFallbackModel() {
        this.currentModel = {
            name: 'Built-In Lightweight AI',
            type: 'rule-based',
            capabilities: ['code-completion', 'simple-chat', 'code-explanation']
        };
        
        console.log('[Built-In AI] Lightweight fallback model ready');
    }
    
    /**
     * Generate response to prompt
     * USES YOUR CUSTOM OLLAMA MODELS AGENTICALLY!
     */
    async generate(prompt, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }
        
        const {
            maxTokens = 1000,
            temperature = 0.7,
            stream = false,
            context = [],
            model = null
        } = options;
        
        try {
            // Priority: Custom Ollama Models > Regular Ollama > Rule-Based
            if (this.ollamaAvailable && (this.currentModel.type === 'ollama-custom' || this.currentModel.type === 'ollama')) {
                console.log(`[Built-In AI] 🎯 Using ${this.currentModel.type}: ${this.currentModel.name}`);
                return await this.generateWithOllama(prompt, options);
            } else if (this.currentModel && this.currentModel.type === 'transformer') {
                return await this.generateWithTransformer(prompt, options);
            } else {
                console.log('[Built-In AI] 📋 Using rule-based fallback');
                return await this.generateWithRuleBased(prompt, options);
            }
        } catch (error) {
            console.error('[Built-In AI] Generation error:', error);
            // Try fallback
            console.log('[Built-In AI] Falling back to rule-based AI');
            return await this.generateWithRuleBased(prompt, options);
        }
    }
    
    /**
     * Generate with your custom Ollama models (OFFLINE!)
     */
    async generateWithOllama(prompt, options = {}) {
        const modelName = options.model || this.currentModel.name;
        
        return new Promise((resolve) => {
            const postData = JSON.stringify({
                model: modelName,
                prompt: prompt,
                stream: false,
                options: {
                    temperature: options.temperature || 0.7,
                    num_predict: options.maxTokens || 1000
                }
            });
            
            const reqOptions = {
                hostname: 'localhost',
                port: 11434,
                path: '/api/generate',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                },
                timeout: 30000
            };
            
            const req = http.request(reqOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        resolve({
                            success: true,
                            response: parsed.response,
                            model: modelName,
                            type: this.currentModel.type,
                            tokens: parsed.eval_count,
                            duration: parsed.total_duration,
                            custom: this.currentModel.type === 'ollama-custom'
                        });
                    } catch (error) {
                        console.error('[Built-In AI] Ollama parse error:', error);
                        resolve(this.generateWithRuleBased(prompt, options));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('[Built-In AI] Ollama request error:', error);
                resolve(this.generateWithRuleBased(prompt, options));
            });
            
            req.on('timeout', () => {
                console.error('[Built-In AI] Ollama timeout');
                req.destroy();
                resolve(this.generateWithRuleBased(prompt, options));
            });
            
            req.write(postData);
            req.end();
        });
    }
    
    /**
     * Generate with transformer model (if available)
     */
    async generateWithTransformer(prompt, options) {
        // This would use a local transformer model
        // For now, return structured response
        return {
            success: true,
            response: 'Transformer model not yet loaded. Using lightweight AI.',
            model: this.currentModel.name
        };
    }
    
    /**
     * Generate with rule-based AI (always available)
     */
    async generateWithRuleBased(prompt, options) {
        const lowerPrompt = prompt.toLowerCase();
        let response = '';
        
        // Code completion
        if (lowerPrompt.includes('complete') || lowerPrompt.includes('finish')) {
            response = this.handleCodeCompletion(prompt);
        }
        // Code explanation
        else if (lowerPrompt.includes('explain') || lowerPrompt.includes('what does')) {
            response = this.handleCodeExplanation(prompt);
        }
        // Bug fixing
        else if (lowerPrompt.includes('fix') || lowerPrompt.includes('error') || lowerPrompt.includes('bug')) {
            response = this.handleBugFixing(prompt);
        }
        // Refactoring
        else if (lowerPrompt.includes('refactor') || lowerPrompt.includes('improve')) {
            response = this.handleRefactoring(prompt);
        }
        // General coding help
        else if (lowerPrompt.includes('how to') || lowerPrompt.includes('how do i')) {
            response = this.handleHowTo(prompt);
        }
        // Documentation
        else if (lowerPrompt.includes('document') || lowerPrompt.includes('comment')) {
            response = this.handleDocumentation(prompt);
        }
        // Default response
        else {
            response = this.handleGeneralQuery(prompt);
        }
        
        return {
            success: true,
            response,
            model: 'Built-In Lightweight AI',
            type: 'rule-based'
        };
    }
    
    /**
     * Handle code completion
     */
    handleCodeCompletion(prompt) {
        return `I can help complete your code. Based on the context, here are some suggestions:

1. Check for common patterns in your existing code
2. Follow the same naming conventions
3. Ensure proper error handling
4. Add appropriate type annotations

For more advanced completions, consider:
- Installing the Copilot extension from marketplace
- Using cloud-based AI (OpenAI, Claude) if available
- Training a custom model for your codebase`;
    }
    
    /**
     * Handle code explanation
     */
    handleCodeExplanation(prompt) {
        return `To explain code, I look for:

1. **Function Purpose**: What does this code do?
2. **Input/Output**: What goes in, what comes out?
3. **Algorithm**: What's the logic flow?
4. **Edge Cases**: What special cases are handled?

For detailed analysis:
- Break down each section
- Identify patterns and idioms
- Note any optimizations or clever tricks
- Flag potential issues

Would you like me to explain a specific code snippet?`;
    }
    
    /**
     * Handle bug fixing
     */
    handleBugFixing(prompt) {
        return `Bug fixing strategy:

1. **Identify the Issue**:
   - What's the expected behavior?
   - What's actually happening?
   - Can you reproduce it?

2. **Common Fixes**:
   - Check for null/undefined values
   - Verify array bounds
   - Ensure async operations complete
   - Fix off-by-one errors
   - Handle edge cases

3. **Debug Steps**:
   - Add console.log statements
   - Use breakpoints
   - Check error messages
   - Review recent changes

Share the error message or code, and I'll provide specific guidance!`;
    }
    
    /**
     * Handle refactoring
     */
    handleRefactoring(prompt) {
        return `Refactoring recommendations:

1. **Code Quality**:
   - Extract repeated code into functions
   - Rename variables for clarity
   - Remove dead code
   - Split large functions

2. **Performance**:
   - Cache computed values
   - Use appropriate data structures
   - Avoid unnecessary loops
   - Optimize hot paths

3. **Maintainability**:
   - Add comments for complex logic
   - Follow consistent style
   - Improve error messages
   - Add validation

Show me the code you'd like to refactor!`;
    }
    
    /**
     * Handle how-to queries
     */
    handleHowTo(prompt) {
        return `I can guide you through common coding tasks:

**JavaScript/TypeScript**:
- Working with arrays, objects, promises
- Async/await patterns
- Error handling
- Module imports/exports

**Python**:
- List comprehensions
- Decorators
- Context managers
- Virtual environments

**General**:
- Git workflows
- Testing strategies
- API design
- Performance optimization

What specific task do you need help with?`;
    }
    
    /**
     * Handle documentation
     */
    handleDocumentation(prompt) {
        return `Documentation best practices:

\`\`\`javascript
/**
 * Brief description of function
 * 
 * @param {Type} paramName - Description
 * @returns {Type} Description of return value
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * functionName(arg1, arg2);
 */
\`\`\`

**Good Documentation**:
- Clear, concise descriptions
- Parameter explanations
- Return value details
- Usage examples
- Error conditions

Share your code, and I'll help write documentation!`;
    }
    
    /**
     * Handle general queries
     */
    handleGeneralQuery(prompt) {
        return `I'm BigDaddyG's Built-In AI Assistant!

**I can help with**:
- ✅ Code completion and suggestions
- ✅ Explaining code functionality
- ✅ Finding and fixing bugs
- ✅ Refactoring for better quality
- ✅ Writing documentation
- ✅ General coding questions

**For advanced AI**:
- Install extensions from the Marketplace
- Use cloud AI (OpenAI, Claude) if configured
- Download local models for offline use

**Current Mode**: Lightweight Rule-Based AI
**Status**: ✅ Always Available (No external dependencies)

How can I assist with your code today?`;
    }
    
    /**
     * Generate fallback response
     */
    generateFallbackResponse(prompt) {
        return `I'm here to help! As a lightweight built-in AI, I provide:

- Basic code assistance
- Coding best practices
- Common pattern suggestions
- Debugging guidance

For more advanced AI features, you can:
1. Install AI extensions from Marketplace
2. Configure cloud AI providers (OpenAI, Claude)
3. Download local AI models

What would you like help with?`;
    }
    
    /**
     * List installed models
     */
    listInstalledModels() {
        if (!fs.existsSync(this.modelDir)) {
            return [];
        }
        
        const files = fs.readdirSync(this.modelDir);
        return files.filter(f => f.endsWith('.bin') || f.endsWith('.gguf') || f.endsWith('.onnx'));
    }
    
    /**
     * Chat interface
     */
    async chat(message, conversationHistory = []) {
        const response = await this.generate(message, {
            context: conversationHistory
        });
        
        return {
            role: 'assistant',
            content: response.response || response.fallback,
            model: response.model,
            timestamp: Date.now()
        };
    }
    
    /**
     * Get model info
     */
    getModelInfo() {
        return {
            current: this.currentModel,
            ollamaAvailable: this.ollamaAvailable,
            ollamaModels: this.ollamaModels,
            customOllamaModels: this.customOllamaModels,
            installed: this.listInstalledModels(),
            capabilities: [
                'code-completion',
                'code-explanation',
                'bug-fixing',
                'refactoring',
                'documentation',
                'general-help'
            ],
            mode: this.ollamaAvailable ? 
                (this.currentModel?.type === 'ollama-custom' ? 'Custom Ollama (Offline)' : 'Ollama (Offline)') : 
                'Rule-Based (Always Available)',
            requiresInternet: false,
            requiresOllama: false, // Not required, but used if available!
            alwaysAvailable: true,
            offline: true
        };
    }
    
    /**
     * List all available Ollama models
     */
    listOllamaModels() {
        return {
            all: this.ollamaModels,
            custom: this.customOllamaModels,
            available: this.ollamaAvailable
        };
    }
    
    /**
     * Switch to specific Ollama model
     */
    async switchModel(modelName) {
        if (!this.ollamaAvailable) {
            return { success: false, error: 'Ollama not available' };
        }
        
        const model = this.ollamaModels.find(m => m.name === modelName);
        if (!model) {
            return { success: false, error: 'Model not found' };
        }
        
        this.currentModel = {
            name: model.name,
            type: this.customOllamaModels.some(m => m.name === modelName) ? 'ollama-custom' : 'ollama',
            size: model.size
        };
        
        console.log(`[Built-In AI] Switched to ${this.currentModel.type}: ${modelName}`);
        return { success: true, model: this.currentModel };
    }
    
    /**
     * Download a model (for future use)
     */
    async downloadModel(modelName, url) {
        const modelPath = path.join(this.modelDir, `${modelName}.gguf`);
        
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(modelPath);
            
            https.get(url, (response) => {
                const totalSize = parseInt(response.headers['content-length'], 10);
                let downloaded = 0;
                
                response.on('data', (chunk) => {
                    downloaded += chunk.length;
                    const progress = ((downloaded / totalSize) * 100).toFixed(2);
                    console.log(`[Built-In AI] Downloading ${modelName}: ${progress}%`);
                });
                
                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    console.log(`[Built-In AI] Model ${modelName} downloaded successfully`);
                    resolve({ success: true, path: modelPath });
                });
            }).on('error', (error) => {
                fs.unlink(modelPath, () => {});
                reject(error);
            });
        });
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentModel: this.currentModel,
            ollamaAvailable: this.ollamaAvailable,
            ollamaModels: this.ollamaModels.length,
            customOllamaModels: this.customOllamaModels.length,
            installedModels: this.listInstalledModels().length,
            ready: true,
            offline: true,
            noDependencies: true,
            mode: this.ollamaAvailable ? 
                `Using ${this.currentModel?.type === 'ollama-custom' ? 'Custom' : 'Standard'} Ollama Models` : 
                'Rule-Based Fallback'
        };
    }
}

// Singleton instance
let instance = null;

function getBuiltInAI() {
    if (!instance) {
        instance = new BuiltInLocalAI();
    }
    return instance;
}

module.exports = {
    BuiltInLocalAI,
    getBuiltInAI
};

// Auto-initialize if running as main
if (require.main === module) {
    const ai = getBuiltInAI();
    ai.initialize().then(() => {
        console.log('[Built-In AI] Ready!');
        console.log('Model Info:', ai.getModelInfo());
    });
}
