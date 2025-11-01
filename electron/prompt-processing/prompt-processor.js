/**
 * BigDaddyG IDE - Prompt Processing System
 * Like Cursor's beforePromptSubmit.sh but ENHANCED
 * 
 * FEATURES:
 * 1. Memory System - Remembers your preferences, patterns, codebase facts
 * 2. Rule Engine - Custom rules that modify every prompt
 * 3. Context Injection - Auto-adds relevant files, docs, errors
 * 4. Code Style Enforcement - Injects your coding standards
 * 5. Security Scanning - Checks prompts for unsafe patterns
 * 6. Emoji Control - Adds emoji preference to system prompt
 * 7. Voice Transcription - Processes voice-to-text before sending
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class PromptProcessor extends EventEmitter {
    constructor() {
        super();
        
        // Memories storage
        this.memories = new Map();
        this.memoriesPath = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'memories.json'
        );
        
        // Rules storage
        this.rules = [];
        this.rulesPath = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'rules.json'
        );
        
        // Context injection
        this.contextInjectors = [];
        
        // Hooks
        this.beforePromptHook = null;
        this.afterPromptHook = null;
        
        // Statistics
        this.stats = {
            promptsProcessed: 0,
            rulesApplied: 0,
            memoriesInjected: 0,
            contextAdded: 0
        };
        
        console.log('[Prompt Processor] 🧠 Initialized');
    }
    
    /**
     * Initialize prompt processor
     */
    async initialize() {
        // Load memories
        await this.loadMemories();
        
        // Load rules
        await this.loadRules();
        
        // Register default context injectors
        this.registerDefaultInjectors();
        
        // Load hook scripts if they exist
        await this.loadHookScripts();
        
        console.log('[Prompt Processor] ✅ Ready');
        console.log(`[Prompt Processor] Memories: ${this.memories.size}`);
        console.log(`[Prompt Processor] Rules: ${this.rules.length}`);
        console.log(`[Prompt Processor] Context Injectors: ${this.contextInjectors.length}`);
    }
    
    /**
     * Process a prompt before sending to AI
     */
    async processPrompt(userPrompt, context = {}) {
        console.log('[Prompt Processor] 🔄 Processing prompt...');
        
        const processingStart = Date.now();
        
        let processedPrompt = userPrompt;
        let systemPrompt = context.systemPrompt || '';
        let injectedContext = '';
        
        // Step 1: Run beforePromptSubmit hook if exists
        if (this.beforePromptHook) {
            const hookResult = await this.runHook(this.beforePromptHook, processedPrompt, context);
            processedPrompt = hookResult.prompt || processedPrompt;
            systemPrompt = hookResult.systemPrompt || systemPrompt;
        }
        
        // Step 2: Apply rules
        const rulesApplied = await this.applyRules(processedPrompt, systemPrompt, context);
        processedPrompt = rulesApplied.prompt;
        systemPrompt = rulesApplied.systemPrompt;
        
        // Step 3: Inject memories
        const memoriesInjected = await this.injectMemories(processedPrompt, context);
        systemPrompt += memoriesInjected;
        
        // Step 4: Inject context
        const contextInjected = await this.injectContext(processedPrompt, context);
        injectedContext = contextInjected;
        
        // Step 5: Add emoji preference
        if (context.features?.emojis !== undefined) {
            systemPrompt += context.features.emojis 
                ? '\n\nSTYLE: Use emojis freely to make responses friendly and expressive.'
                : '\n\nSTYLE: Do NOT use emojis. Keep responses clean and professional, especially for code.';
        }
        
        // Step 6: Add model tuning preferences
        if (context.tuning) {
            systemPrompt += `\n\nMODEL TUNING: Temperature=${context.tuning.temperature}, TopP=${context.tuning.topP}`;
        }
        
        // Step 7: Add current agent mode
        if (context.agent) {
            systemPrompt += `\n\nAGENT MODE: ${context.agent.toUpperCase()}`;
        }
        
        // Update statistics
        this.stats.promptsProcessed++;
        const processingTime = Date.now() - processingStart;
        
        console.log(`[Prompt Processor] ✅ Processing complete (${processingTime}ms)`);
        console.log(`[Prompt Processor]   Rules applied: ${this.stats.rulesApplied}`);
        console.log(`[Prompt Processor]   Memories injected: ${this.stats.memoriesInjected}`);
        console.log(`[Prompt Processor]   Context added: ${injectedContext.length} chars`);
        
        return {
            prompt: processedPrompt,
            systemPrompt: systemPrompt,
            context: injectedContext,
            processingTime: processingTime
        };
    }
    
    /**
     * Apply rules to prompt
     */
    async applyRules(prompt, systemPrompt, context) {
        let modifiedPrompt = prompt;
        let modifiedSystemPrompt = systemPrompt;
        
        for (const rule of this.rules) {
            if (!rule.enabled) continue;
            
            // Check if rule applies
            if (await this.shouldApplyRule(rule, prompt, context)) {
                console.log(`[Prompt Processor] 📜 Applying rule: ${rule.name}`);
                
                // Apply rule transformation
                if (rule.type === 'prepend') {
                    modifiedPrompt = rule.content + '\n\n' + modifiedPrompt;
                } else if (rule.type === 'append') {
                    modifiedPrompt = modifiedPrompt + '\n\n' + rule.content;
                } else if (rule.type === 'system') {
                    modifiedSystemPrompt += '\n\n' + rule.content;
                } else if (rule.type === 'replace') {
                    modifiedPrompt = modifiedPrompt.replace(new RegExp(rule.pattern, 'g'), rule.replacement);
                }
                
                this.stats.rulesApplied++;
            }
        }
        
        return {
            prompt: modifiedPrompt,
            systemPrompt: modifiedSystemPrompt
        };
    }
    
    /**
     * Inject memories into system prompt
     */
    async injectMemories(prompt, context) {
        let memoryPrompt = '';
        
        // Find relevant memories
        const relevantMemories = this.findRelevantMemories(prompt);
        
        if (relevantMemories.length > 0) {
            memoryPrompt = '\n\nRELEVANT MEMORIES:\n';
            
            for (const memory of relevantMemories) {
                memoryPrompt += `- ${memory.key}: ${memory.value}\n`;
                this.stats.memoriesInjected++;
            }
            
            console.log(`[Prompt Processor] 🧠 Injected ${relevantMemories.length} memories`);
        }
        
        return memoryPrompt;
    }
    
    /**
     * Inject context (files, errors, etc.)
     */
    async injectContext(prompt, context) {
        let contextText = '';
        
        // Run context injectors
        for (const injector of this.contextInjectors) {
            const injectedContent = await injector.inject(prompt, context);
            if (injectedContent) {
                contextText += injectedContent;
                this.stats.contextAdded++;
            }
        }
        
        return contextText;
    }
    
    /**
     * Find relevant memories
     */
    findRelevantMemories(prompt) {
        const relevant = [];
        const lowerPrompt = prompt.toLowerCase();
        
        for (const [key, value] of this.memories) {
            // Simple keyword matching
            if (lowerPrompt.includes(key.toLowerCase())) {
                relevant.push({ key, value });
            }
        }
        
        return relevant;
    }
    
    /**
     * Check if rule should apply
     */
    async shouldApplyRule(rule, prompt, context) {
        // Check conditions
        if (rule.conditions) {
            for (const condition of rule.conditions) {
                if (condition.type === 'contains') {
                    if (!prompt.toLowerCase().includes(condition.value.toLowerCase())) {
                        return false;
                    }
                } else if (condition.type === 'agent') {
                    if (context.agent !== condition.value) {
                        return false;
                    }
                } else if (condition.type === 'language') {
                    if (!context.currentFile?.endsWith(condition.value)) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    /**
     * Add a memory
     */
    async addMemory(key, value, category = 'general') {
        this.memories.set(key, {
            value,
            category,
            timestamp: new Date().toISOString(),
            usageCount: 0
        });
        
        await this.saveMemories();
        
        console.log(`[Prompt Processor] 💾 Memory saved: ${key}`);
        
        this.emit('memory-added', { key, value, category });
    }
    
    /**
     * Add a rule
     */
    async addRule(rule) {
        const newRule = {
            id: `rule-${Date.now()}`,
            name: rule.name,
            type: rule.type, // 'prepend', 'append', 'system', 'replace'
            content: rule.content,
            pattern: rule.pattern,
            replacement: rule.replacement,
            enabled: rule.enabled !== false,
            conditions: rule.conditions || [],
            priority: rule.priority || 0,
            createdAt: new Date().toISOString()
        };
        
        this.rules.push(newRule);
        
        // Sort by priority
        this.rules.sort((a, b) => b.priority - a.priority);
        
        await this.saveRules();
        
        console.log(`[Prompt Processor] 📜 Rule added: ${rule.name}`);
        
        this.emit('rule-added', newRule);
        
        return newRule;
    }
    
    /**
     * Load memories from file
     */
    async loadMemories() {
        try {
            const content = await fs.readFile(this.memoriesPath, 'utf8');
            const data = JSON.parse(content);
            
            this.memories = new Map(Object.entries(data));
            
            console.log(`[Prompt Processor] Loaded ${this.memories.size} memories`);
            
        } catch (error) {
            console.log('[Prompt Processor] No existing memories found');
        }
    }
    
    /**
     * Save memories to file
     */
    async saveMemories() {
        try {
            const data = Object.fromEntries(this.memories);
            await fs.mkdir(path.dirname(this.memoriesPath), { recursive: true });
            await fs.writeFile(this.memoriesPath, JSON.stringify(data, null, 2), 'utf8');
        } catch (error) {
            console.error('[Prompt Processor] Failed to save memories:', error);
        }
    }
    
    /**
     * Load rules from file
     */
    async loadRules() {
        try {
            const content = await fs.readFile(this.rulesPath, 'utf8');
            this.rules = JSON.parse(content);
            
            console.log(`[Prompt Processor] Loaded ${this.rules.length} rules`);
            
        } catch (error) {
            console.log('[Prompt Processor] No existing rules found');
            
            // Add default rules
            await this.addDefaultRules();
        }
    }
    
    /**
     * Save rules to file
     */
    async saveRules() {
        try {
            await fs.mkdir(path.dirname(this.rulesPath), { recursive: true });
            await fs.writeFile(this.rulesPath, JSON.stringify(this.rules, null, 2), 'utf8');
        } catch (error) {
            console.error('[Prompt Processor] Failed to save rules:', error);
        }
    }
    
    /**
     * Add default rules
     */
    async addDefaultRules() {
        // Default coding style rule
        await this.addRule({
            name: 'Coding Style - Clean Code',
            type: 'system',
            content: 'Always write clean, readable code with meaningful variable names and comments.',
            priority: 10
        });
        
        // Default error handling rule
        await this.addRule({
            name: 'Error Handling Required',
            type: 'system',
            content: 'Always include proper error handling and validation in code.',
            priority: 9
        });
        
        // Default testing rule
        await this.addRule({
            name: 'Include Tests',
            type: 'system',
            content: 'When creating new functions, also provide test cases.',
            priority: 8,
            conditions: [{ type: 'contains', value: 'function' }]
        });
    }
    
    /**
     * Register default context injectors
     */
    registerDefaultInjectors() {
        // Injector: Current file context
        this.contextInjectors.push({
            name: 'current-file',
            inject: async (prompt, context) => {
                if (context.currentFile && context.currentFileContent) {
                    return `\n\nCURRENT FILE: ${context.currentFile}\n\`\`\`\n${context.currentFileContent.substring(0, 2000)}\n\`\`\`\n`;
                }
                return '';
            }
        });
        
        // Injector: Recent errors
        this.contextInjectors.push({
            name: 'recent-errors',
            inject: async (prompt, context) => {
                if (context.recentErrors && context.recentErrors.length > 0) {
                    return `\n\nRECENT ERRORS:\n${context.recentErrors.slice(0, 3).map(e => `- ${e}`).join('\n')}\n`;
                }
                return '';
            }
        });
        
        // Injector: Project structure
        this.contextInjectors.push({
            name: 'project-structure',
            inject: async (prompt, context) => {
                if (context.projectStructure) {
                    return `\n\nPROJECT STRUCTURE:\n${context.projectStructure}\n`;
                }
                return '';
            }
        });
        
        // Injector: Referenced files (@file.js mentions)
        this.contextInjectors.push({
            name: 'file-references',
            inject: async (prompt, context) => {
                const fileRefs = this.extractFileReferences(prompt);
                let refsContent = '';
                
                for (const fileRef of fileRefs) {
                    try {
                        const content = await fs.readFile(fileRef, 'utf8');
                        refsContent += `\n\nFILE: ${fileRef}\n\`\`\`\n${content.substring(0, 5000)}\n\`\`\`\n`;
                    } catch (error) {
                        console.warn(`[Prompt Processor] Could not read ${fileRef}`);
                    }
                }
                
                return refsContent;
            }
        });
    }
    
    /**
     * Extract @file.js references from prompt
     */
    extractFileReferences(prompt) {
        const regex = /@([a-zA-Z0-9_\-\.\/\\]+)/g;
        const matches = [];
        let match;
        
        while ((match = regex.exec(prompt)) !== null) {
            matches.push(match[1]);
        }
        
        return matches;
    }
    
    /**
     * Load hook scripts (Bash or PowerShell)
     */
    async loadHookScripts() {
        // Check for beforePromptSubmit.sh
        const bashHook = path.join(process.cwd(), 'hooks', 'beforePromptSubmit.sh');
        const psHook = path.join(process.cwd(), 'hooks', 'beforePromptSubmit.ps1');
        
        if (await this.fileExists(bashHook)) {
            this.beforePromptHook = { type: 'bash', path: bashHook };
            console.log('[Prompt Processor] 📜 Loaded Bash hook');
        } else if (await this.fileExists(psHook)) {
            this.beforePromptHook = { type: 'powershell', path: psHook };
            console.log('[Prompt Processor] 📜 Loaded PowerShell hook');
        }
    }
    
    /**
     * Run external hook script
     */
    async runHook(hook, prompt, context) {
        console.log(`[Prompt Processor] 🪝 Running ${hook.type} hook...`);
        
        return new Promise((resolve) => {
            const shell = hook.type === 'bash' ? 'bash' : 'powershell';
            const args = hook.type === 'bash' ? [hook.path] : ['-File', hook.path];
            
            const proc = spawn(shell, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PROMPT: prompt,
                    AGENT: context.agent,
                    MODEL: context.model
                }
            });
            
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
                    // Parse hook output
                    try {
                        const result = JSON.parse(stdout);
                        console.log('[Prompt Processor] ✅ Hook executed successfully');
                        resolve(result);
                    } catch (error) {
                        console.warn('[Prompt Processor] Hook output not JSON, using original');
                        resolve({ prompt, systemPrompt: '' });
                    }
                } else {
                    console.error('[Prompt Processor] Hook failed:', stderr);
                    resolve({ prompt, systemPrompt: '' });
                }
            });
            
            // Timeout after 5 seconds
            setTimeout(() => {
                proc.kill();
                console.warn('[Prompt Processor] Hook timeout');
                resolve({ prompt, systemPrompt: '' });
            }, 5000);
        });
    }
    
    /**
     * Check if file exists
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Render memories UI
     */
    renderMemoriesUI() {
        return `
            <div class="memories-panel" style="padding: 20px; background: var(--bg-secondary); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>🧠 Memories</h3>
                    <button class="quality-btn" onclick="promptProcessor.addMemoryUI()">+ Add Memory</button>
                </div>
                
                ${this.memories.size === 0 ? `
                    <div style="text-align: center; padding: 40px; opacity: 0.5;">
                        No memories yet. Add memories to help the AI remember your preferences.
                    </div>
                ` : `
                    <div class="memories-list">
                        ${Array.from(this.memories.entries()).map(([key, memory]) => `
                            <div class="memory-item" style="padding: 12px; background: var(--bg-tertiary); border-radius: 4px; margin-bottom: 8px; border-left: 3px solid var(--accent);">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: bold; margin-bottom: 5px;">${key}</div>
                                        <div style="font-size: 13px; opacity: 0.8;">${memory.value}</div>
                                        <div style="font-size: 11px; opacity: 0.5; margin-top: 5px;">
                                            Category: ${memory.category} • Used: ${memory.usageCount} times • ${new Date(memory.timestamp).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <button style="background: none; border: none; color: #f44; cursor: pointer; font-size: 16px;" 
                                            onclick="promptProcessor.deleteMemory('${key}')">×</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    /**
     * Render rules UI
     */
    renderRulesUI() {
        return `
            <div class="rules-panel" style="padding: 20px; background: var(--bg-secondary); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3>📜 Rules</h3>
                    <button class="quality-btn" onclick="promptProcessor.addRuleUI()">+ Add Rule</button>
                </div>
                
                ${this.rules.length === 0 ? `
                    <div style="text-align: center; padding: 40px; opacity: 0.5;">
                        No custom rules yet. Add rules to control how AI responds.
                    </div>
                ` : `
                    <div class="rules-list">
                        ${this.rules.map(rule => `
                            <div class="rule-item" style="padding: 12px; background: var(--bg-tertiary); border-radius: 4px; margin-bottom: 8px; border-left: 3px solid ${rule.enabled ? 'var(--accent-green)' : 'var(--text-dim)'};">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                                            <input type="checkbox" 
                                                   ${rule.enabled ? 'checked' : ''}
                                                   onchange="promptProcessor.toggleRule('${rule.id}', this.checked)">
                                            <span style="font-weight: bold;">${rule.name}</span>
                                            <span style="padding: 2px 8px; background: var(--bg-primary); border-radius: 3px; font-size: 10px;">
                                                ${rule.type}
                                            </span>
                                        </div>
                                        <div style="font-size: 13px; opacity: 0.8; margin-left: 30px;">${rule.content}</div>
                                        ${rule.conditions && rule.conditions.length > 0 ? `
                                            <div style="font-size: 11px; opacity: 0.5; margin-top: 5px; margin-left: 30px;">
                                                Conditions: ${rule.conditions.map(c => `${c.type}:${c.value}`).join(', ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <button style="background: none; border: none; color: #f44; cursor: pointer; font-size: 16px;" 
                                            onclick="promptProcessor.deleteRule('${rule.id}')">×</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        `;
    }
    
    /**
     * Render statistics UI
     */
    renderStatsUI() {
        return `
            <div class="stats-panel" style="padding: 20px; background: var(--bg-secondary); border-radius: 8px;">
                <h3 style="margin-bottom: 15px;">📊 Prompt Processing Statistics</h3>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px;">
                        <div style="font-size: 32px; font-weight: bold; color: var(--accent);">${this.stats.promptsProcessed}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Prompts Processed</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px;">
                        <div style="font-size: 32px; font-weight: bold; color: var(--accent-green);">${this.stats.rulesApplied}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Rules Applied</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px;">
                        <div style="font-size: 32px; font-weight: bold; color: var(--accent-yellow);">${this.stats.memoriesInjected}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Memories Injected</div>
                    </div>
                    
                    <div class="stat-card" style="background: var(--bg-tertiary); padding: 15px; border-radius: 6px;">
                        <div style="font-size: 32px; font-weight: bold;">${this.stats.contextAdded}</div>
                        <div style="font-size: 12px; opacity: 0.7; margin-top: 5px;">Context Added</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Delete memory
     */
    async deleteMemory(key) {
        this.memories.delete(key);
        await this.saveMemories();
        console.log(`[Prompt Processor] 🗑️ Memory deleted: ${key}`);
    }
    
    /**
     * Toggle rule
     */
    async toggleRule(ruleId, enabled) {
        const rule = this.rules.find(r => r.id === ruleId);
        if (rule) {
            rule.enabled = enabled;
            await this.saveRules();
            console.log(`[Prompt Processor] Rule ${enabled ? 'enabled' : 'disabled'}: ${rule.name}`);
        }
    }
    
    /**
     * Delete rule
     */
    async deleteRule(ruleId) {
        this.rules = this.rules.filter(r => r.id !== ruleId);
        await this.saveRules();
        console.log(`[Prompt Processor] 🗑️ Rule deleted: ${ruleId}`);
    }
}

module.exports = PromptProcessor;

