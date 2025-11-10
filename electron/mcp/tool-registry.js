/**
 * BigDaddyG IDE - MCP Tool Registry
 * 
 * Model-Controlled Procedures (MCP) - Formal tool specification system
 * Enables LLMs to discover and invoke IDE capabilities via function calling
 * 
 * Features:
 * - Function-calling schema (OpenAI JSON mode compatible)
 * - Tool-level ACL (access control lists)
 * - Idempotency keys for safe retries
 * - Capability advertisement to LLM in system prompt
 * 
 * Part of Phase 1 (P0) - Critical for true agentic operation
 */

// ============================================================================
// TOOL REGISTRY CLASS
// ============================================================================

class MCPToolRegistry {
    constructor() {
        this.tools = new Map();
        this.executionLog = new Map();  // For idempotency
        this.approvalQueue = [];
    }
    
    /**
     * Register a new tool
     */
    register(name, spec) {
        if (this.tools.has(name)) {
            console.warn(`[MCP] ⚠️  Tool "${name}" already registered, overwriting`);
        }
        
        const tool = {
            name,
            description: spec.description || 'No description',
            parameters: spec.parameters || { type: 'object', properties: {} },
            returns: spec.returns || { type: 'object' },
            
            // Security
            requiresApproval: spec.requiresApproval || false,
            allowedContexts: spec.allowedContexts || ['user', 'agent'],
            
            // Reliability
            idempotent: spec.idempotent || false,
            maxRetries: spec.maxRetries || 3,
            timeout: spec.timeout || 30000,
            
            // Implementation
            execute: spec.execute,
            
            // Metadata
            category: spec.category || 'general',
            tags: spec.tags || [],
            examples: spec.examples || []
        };
        
        // Validate function signature
        if (typeof tool.execute !== 'function') {
            throw new Error(`Tool "${name}" must have an execute function`);
        }
        
        this.tools.set(name, tool);
        console.log(`[MCP] ✅ Registered tool: ${name} (${tool.category})`);
        
        return tool;
    }
    
    /**
     * Unregister a tool
     */
    unregister(name) {
        const removed = this.tools.delete(name);
        
        if (removed) {
            console.log(`[MCP] 🗑️  Unregistered tool: ${name}`);
        }
        
        return removed;
    }
    
    /**
     * Get tool specification
     */
    getTool(name) {
        return this.tools.get(name);
    }
    
    /**
     * List all tools (optionally filtered)
     */
    listTools(filter = {}) {
        let tools = Array.from(this.tools.values());
        
        // Filter by category
        if (filter.category) {
            tools = tools.filter(t => t.category === filter.category);
        }
        
        // Filter by tag
        if (filter.tag) {
            tools = tools.filter(t => t.tags.includes(filter.tag));
        }
        
        // Filter by context
        if (filter.context) {
            tools = tools.filter(t => t.allowedContexts.includes(filter.context));
        }
        
        return tools;
    }
    
    /**
     * Get system prompt with tool capabilities
     */
    getSystemPrompt(context = 'agent') {
        const tools = this.listTools({ context });
        
        if (tools.length === 0) {
            return '';
        }
        
        const prompt = `You have access to the following tools:

${tools.map(tool => {
    const params = Object.entries(tool.parameters.properties || {})
        .map(([name, spec]) => `  - ${name} (${spec.type}${spec.required ? ', required' : ''}): ${spec.description || ''}`)
        .join('\n');
    
    return `**${tool.name}** - ${tool.description}
Category: ${tool.category}
${params ? 'Parameters:\n' + params : 'No parameters'}
${tool.requiresApproval ? '⚠️ Requires user approval' : ''}`;
}).join('\n\n')}

To use a tool, respond with a function call in this format:
\`\`\`json
{
  "tool": "tool_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
\`\`\`
`;
        
        return prompt;
    }
    
    /**
     * Get OpenAI-compatible function calling schema
     */
    getFunctionSchema(toolNames = null) {
        const tools = toolNames
            ? toolNames.map(name => this.tools.get(name)).filter(Boolean)
            : Array.from(this.tools.values());
        
        return tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }));
    }
    
    /**
     * Execute a tool
     */
    async executeTool(name, parameters, context = {}) {
        const tool = this.tools.get(name);
        
        if (!tool) {
            throw new Error(`Tool "${name}" not found`);
        }
        
        // Check context permissions
        if (!tool.allowedContexts.includes(context.type || 'agent')) {
            throw new Error(`Tool "${name}" not allowed in context: ${context.type}`);
        }
        
        // Check approval requirement
        if (tool.requiresApproval && !context.approved) {
            return await this.requestApproval(name, parameters, context);
        }
        
        // Check idempotency
        if (tool.idempotent) {
            const cached = this.checkIdempotency(name, parameters);
            if (cached) {
                console.log(`[MCP] 🔄 Using cached result for ${name}`);
                return cached;
            }
        }
        
        // Execute with timeout and retries
        let lastError = null;
        for (let attempt = 0; attempt <= tool.maxRetries; attempt++) {
            try {
                console.log(`[MCP] 🔧 Executing ${name} (attempt ${attempt + 1}/${tool.maxRetries + 1})`);
                
                const startTime = Date.now();
                
                // Execute with timeout
                const result = await Promise.race([
                    tool.execute(parameters, context),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), tool.timeout)
                    )
                ]);
                
                const elapsed = Date.now() - startTime;
                
                // Log execution
                const execution = {
                    tool: name,
                    parameters,
                    result,
                    elapsed,
                    timestamp: new Date().toISOString(),
                    success: true
                };
                
                this.logExecution(execution);
                
                // Cache for idempotency
                if (tool.idempotent) {
                    this.cacheResult(name, parameters, result);
                }
                
                console.log(`[MCP] ✅ ${name} completed in ${elapsed}ms`);
                
                return {
                    success: true,
                    result,
                    elapsed,
                    tool: name
                };
            } catch (error) {
                lastError = error;
                console.warn(`[MCP] ⚠️  ${name} failed (attempt ${attempt + 1}): ${error.message}`);
                
                // Exponential backoff
                if (attempt < tool.maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
        
        // All retries failed
        const execution = {
            tool: name,
            parameters,
            error: lastError.message,
            timestamp: new Date().toISOString(),
            success: false
        };
        
        this.logExecution(execution);
        
        throw new Error(`Tool "${name}" failed after ${tool.maxRetries + 1} attempts: ${lastError.message}`);
    }
    
    /**
     * Request approval for a tool execution
     */
    async requestApproval(name, parameters, context) {
        console.log(`[MCP] 🔐 Requesting approval for ${name}`);
        
        return new Promise((resolve, reject) => {
            const request = {
                tool: name,
                parameters,
                context,
                timestamp: Date.now(),
                resolve,
                reject
            };
            
            this.approvalQueue.push(request);
            
            // Emit event for UI to show approval dialog
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('mcp-approval-required', {
                    detail: request
                }));
            }
            
            // Auto-reject after 60 minutes
            setTimeout(() => {
                const index = this.approvalQueue.indexOf(request);
                if (index >= 0) {
                    this.approvalQueue.splice(index, 1);
                    reject(new Error('Approval timeout'));
                }
            }, 3600000);
        });
    }
    
    /**
     * Approve a pending tool execution
     */
    approve(requestIndex) {
        const request = this.approvalQueue[requestIndex];
        
        if (!request) {
            throw new Error('Invalid approval request');
        }
        
        this.approvalQueue.splice(requestIndex, 1);
        
        // Execute with approved context
        this.executeTool(request.tool, request.parameters, {
            ...request.context,
            approved: true
        }).then(request.resolve).catch(request.reject);
    }
    
    /**
     * Reject a pending tool execution
     */
    reject(requestIndex, reason = 'User denied') {
        const request = this.approvalQueue[requestIndex];
        
        if (!request) {
            throw new Error('Invalid approval request');
        }
        
        this.approvalQueue.splice(requestIndex, 1);
        request.reject(new Error(reason));
    }
    
    /**
     * Check idempotency cache
     */
    checkIdempotency(name, parameters) {
        const key = this.getIdempotencyKey(name, parameters);
        return this.executionLog.get(key);
    }
    
    /**
     * Cache result for idempotency
     */
    cacheResult(name, parameters, result) {
        const key = this.getIdempotencyKey(name, parameters);
        this.executionLog.set(key, {
            result,
            timestamp: Date.now()
        });
    }
    
    /**
     * Generate idempotency key
     */
    getIdempotencyKey(name, parameters) {
        return `${name}:${JSON.stringify(parameters)}`;
    }
    
    /**
     * Log execution for audit trail
     */
    logExecution(execution) {
        // Could write to database or file for audit
        console.log('[MCP] 📝 Execution logged:', execution);
    }
}

// ============================================================================
// STANDARD TOOLS
// ============================================================================

function registerStandardTools(registry) {
    // File Operations
    registry.register('file_read', {
        description: 'Read contents of a file',
        category: 'filesystem',
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'File path to read' }
            },
            required: ['path']
        },
        idempotent: true,
        async execute({ path }, context) {
            if (typeof window !== 'undefined' && window.agenticFileOps) {
                // Browser environment
                return await window.agenticFileOps.safeCall('readFile', path);
            } else {
                // Node environment
                const fs = require('fs').promises;
                return await fs.readFile(path, 'utf-8');
            }
        }
    });
    
    registry.register('file_write', {
        description: 'Write content to a file',
        category: 'filesystem',
        requiresApproval: false,  // Set to true in production
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'File path to write' },
                content: { type: 'string', description: 'Content to write' }
            },
            required: ['path', 'content']
        },
        async execute({ path, content }, context) {
            if (typeof window !== 'undefined' && window.agenticFileOps) {
                return await window.agenticFileOps.safeCall('saveFile', path, content);
            } else {
                const fs = require('fs').promises;
                await fs.writeFile(path, content, 'utf-8');
                return { success: true, path };
            }
        }
    });
    
    registry.register('file_delete', {
        description: 'Delete a file',
        category: 'filesystem',
        requiresApproval: true,
        parameters: {
            type: 'object',
            properties: {
                path: { type: 'string', description: 'File path to delete' }
            },
            required: ['path']
        },
        async execute({ path }, context) {
            const fs = require('fs').promises;
            await fs.unlink(path);
            return { success: true, path };
        }
    });
    
    // Execution
    registry.register('exec_code', {
        description: 'Execute code in a sandboxed container',
        category: 'execution',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                code: { type: 'string', description: 'Code to execute' },
                language: { type: 'string', description: 'Programming language' }
            },
            required: ['code', 'language']
        },
        async execute({ code, language }, context) {
            const { getContainerRuntime } = require('../container-runtime');
            const runtime = await getContainerRuntime();
            return await runtime.executeInSandbox(code, { language });
        }
    });
    
    // Git Operations
    registry.register('git_commit', {
        description: 'Create a git commit',
        category: 'git',
        requiresApproval: false,
        parameters: {
            type: 'object',
            properties: {
                message: { type: 'string', description: 'Commit message' },
                files: { type: 'array', items: { type: 'string' }, description: 'Files to commit' }
            },
            required: ['message']
        },
        async execute({ message, files = ['.'] }, context) {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            
            // Stage files
            await execAsync(`git add ${files.join(' ')}`);
            
            // Commit
            await execAsync(`git commit -m "${message}"`);
            
            return { success: true, message };
        }
    });
    
    // Search
    registry.register('grep', {
        description: 'Search for text in files',
        category: 'search',
        parameters: {
            type: 'object',
            properties: {
                pattern: { type: 'string', description: 'Search pattern (regex)' },
                path: { type: 'string', description: 'Path to search in' },
                caseSensitive: { type: 'boolean', description: 'Case sensitive search' }
            },
            required: ['pattern', 'path']
        },
        idempotent: true,
        async execute({ pattern, path, caseSensitive = false }, context) {
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);
            
            const flags = caseSensitive ? '' : '-i';
            const { stdout } = await execAsync(`grep -r ${flags} "${pattern}" "${path}"`);
            
            return {
                matches: stdout.split('\n').filter(Boolean),
                count: stdout.split('\n').filter(Boolean).length
            };
        }
    });
    
    console.log('[MCP] ✅ Standard tools registered');
}

// ============================================================================
// GLOBAL INSTANCE
// ============================================================================

let globalRegistry = null;

function getMCPRegistry() {
    if (!globalRegistry) {
        globalRegistry = new MCPToolRegistry();
        registerStandardTools(globalRegistry);
    }
    
    return globalRegistry;
}

// ============================================================================
// EXPORTS
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MCPToolRegistry,
        getMCPRegistry,
        registerStandardTools
    };
}

if (typeof window !== 'undefined') {
    window.MCPToolRegistry = MCPToolRegistry;
    window.getMCPRegistry = getMCPRegistry;
}

console.log('[MCP] 📦 Tool Registry module loaded');
