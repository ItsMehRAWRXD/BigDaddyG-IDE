/**
 * BigDaddyG IDE - Advanced Tool Calling System
 * Like VS Code Copilot with function calling capabilities
 */

class ToolCallingSystem {
    constructor(aiProviderManager, agenticExecutor) {
        this.aiProvider = aiProviderManager;
        this.agenticExecutor = agenticExecutor;
        this.tools = new Map();
        this.toolHistory = [];
        this.isEnabled = true;
        
        this.registerBuiltinTools();
        console.log('[ToolCalling] 🛠️ Advanced tool calling system initialized');
    }

    registerBuiltinTools() {
        // File operations
        this.registerTool('readFile', {
            description: 'Read contents of a file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'File path to read' }
                },
                required: ['path']
            },
            handler: async (params) => {
                if (window.electron?.fs?.readFile) {
                    return await window.electron.fs.readFile(params.path);
                }
                throw new Error('File system access not available');
            }
        });

        this.registerTool('writeFile', {
            description: 'Write content to a file',
            parameters: {
                type: 'object',
                properties: {
                    path: { type: 'string', description: 'File path to write' },
                    content: { type: 'string', description: 'Content to write' }
                },
                required: ['path', 'content']
            },
            handler: async (params) => {
                if (window.electron?.fs?.writeFile) {
                    return await window.electron.fs.writeFile(params.path, params.content);
                }
                throw new Error('File system access not available');
            }
        });

        // Code operations
        this.registerTool('formatCode', {
            description: 'Format code using language-specific formatter',
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Code to format' },
                    language: { type: 'string', description: 'Programming language' }
                },
                required: ['code', 'language']
            },
            handler: async (params) => {
                return this.formatCode(params.code, params.language);
            }
        });

        this.registerTool('runCode', {
            description: 'Execute code in specified language',
            parameters: {
                type: 'object',
                properties: {
                    code: { type: 'string', description: 'Code to execute' },
                    language: { type: 'string', description: 'Programming language' }
                },
                required: ['code', 'language']
            },
            handler: async (params) => {
                if (this.agenticExecutor) {
                    return await this.agenticExecutor.executeCode(params.code, params.language);
                }
                throw new Error('Code execution not available');
            }
        });

        // Terminal operations
        this.registerTool('runCommand', {
            description: 'Execute terminal command',
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string', description: 'Command to execute' },
                    workingDir: { type: 'string', description: 'Working directory' }
                },
                required: ['command']
            },
            handler: async (params) => {
                if (this.agenticExecutor) {
                    return await this.agenticExecutor.executeCommand(params.command);
                }
                throw new Error('Command execution not available');
            }
        });

        // Search operations
        this.registerTool('searchFiles', {
            description: 'Search for files matching pattern',
            parameters: {
                type: 'object',
                properties: {
                    pattern: { type: 'string', description: 'Search pattern' },
                    directory: { type: 'string', description: 'Directory to search in' }
                },
                required: ['pattern']
            },
            handler: async (params) => {
                if (window.electron?.fs?.searchFiles) {
                    return await window.electron.fs.searchFiles(params.pattern, params.directory);
                }
                throw new Error('File search not available');
            }
        });

        // Git operations
        this.registerTool('gitStatus', {
            description: 'Get git repository status',
            parameters: {
                type: 'object',
                properties: {
                    directory: { type: 'string', description: 'Repository directory' }
                }
            },
            handler: async (params) => {
                const command = `git status --porcelain`;
                if (this.agenticExecutor) {
                    return await this.agenticExecutor.executeCommand(command);
                }
                throw new Error('Git operations not available');
            }
        });

        // Web operations
        this.registerTool('fetchUrl', {
            description: 'Fetch content from URL',
            parameters: {
                type: 'object',
                properties: {
                    url: { type: 'string', description: 'URL to fetch' },
                    method: { type: 'string', description: 'HTTP method', default: 'GET' }
                },
                required: ['url']
            },
            handler: async (params) => {
                const response = await fetch(params.url, { method: params.method || 'GET' });
                return await response.text();
            }
        });

        console.log(`[ToolCalling] ✅ Registered ${this.tools.size} built-in tools`);
    }

    registerTool(name, definition) {
        this.tools.set(name, {
            name,
            description: definition.description,
            parameters: definition.parameters,
            handler: definition.handler,
            registered: Date.now()
        });
    }

    async callTool(name, parameters) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool '${name}' not found`);
        }

        console.log(`[ToolCalling] 🔧 Calling tool: ${name}`, parameters);

        try {
            const result = await tool.handler(parameters);
            
            this.toolHistory.push({
                tool: name,
                parameters,
                result,
                timestamp: Date.now(),
                success: true
            });

            return result;
        } catch (error) {
            this.toolHistory.push({
                tool: name,
                parameters,
                error: error.message,
                timestamp: Date.now(),
                success: false
            });
            throw error;
        }
    }

    async processToolCalls(message, options = {}) {
        if (!this.isEnabled) {
            return await this.aiProvider.chat(message, options);
        }

        // Enhanced prompt with tool definitions
        const toolsPrompt = this.buildToolsPrompt();
        const enhancedMessage = `${toolsPrompt}\n\nUser request: ${message}`;

        try {
            const response = await this.aiProvider.chat(enhancedMessage, {
                ...options,
                temperature: 0.1, // Lower temperature for tool calling
                maxTokens: 2000
            });

            // Parse tool calls from response
            const toolCalls = this.parseToolCalls(response.response);
            
            if (toolCalls.length > 0) {
                const results = [];
                
                for (const toolCall of toolCalls) {
                    try {
                        const result = await this.callTool(toolCall.name, toolCall.parameters);
                        results.push({
                            tool: toolCall.name,
                            result,
                            success: true
                        });
                    } catch (error) {
                        results.push({
                            tool: toolCall.name,
                            error: error.message,
                            success: false
                        });
                    }
                }

                // Generate final response with tool results
                const finalPrompt = `Based on these tool results, provide a helpful response to the user:

Original request: ${message}

Tool results:
${results.map(r => `- ${r.tool}: ${r.success ? 'SUCCESS' : 'ERROR'} - ${r.result || r.error}`).join('\n')}

Provide a natural response incorporating the results:`;

                const finalResponse = await this.aiProvider.chat(finalPrompt, options);
                
                return {
                    ...finalResponse,
                    toolCalls: results,
                    usedTools: true
                };
            }

            return response;
        } catch (error) {
            console.error('[ToolCalling] Error:', error);
            // Fallback to regular chat
            return await this.aiProvider.chat(message, options);
        }
    }

    buildToolsPrompt() {
        const toolDefinitions = Array.from(this.tools.values()).map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters
        }));

        return `You have access to the following tools. When you need to use a tool, respond with a JSON object in this format:

TOOL_CALL: {"name": "toolName", "parameters": {"param1": "value1"}}

Available tools:
${JSON.stringify(toolDefinitions, null, 2)}

You can use multiple tools by providing multiple TOOL_CALL lines. Always explain what you're doing and why.`;
    }

    parseToolCalls(response) {
        const toolCalls = [];
        const lines = response.split('\n');

        for (const line of lines) {
            const match = line.match(/TOOL_CALL:\s*({.*})/);
            if (match) {
                try {
                    const toolCall = JSON.parse(match[1]);
                    if (toolCall.name && this.tools.has(toolCall.name)) {
                        toolCalls.push(toolCall);
                    }
                } catch (error) {
                    console.warn('[ToolCalling] Failed to parse tool call:', line);
                }
            }
        }

        return toolCalls;
    }

    async formatCode(code, language) {
        // Basic code formatting
        switch (language.toLowerCase()) {
            case 'javascript':
            case 'typescript':
                return this.formatJavaScript(code);
            case 'python':
                return this.formatPython(code);
            case 'json':
                try {
                    return JSON.stringify(JSON.parse(code), null, 2);
                } catch {
                    return code;
                }
            default:
                return code; // Return as-is for unsupported languages
        }
    }

    formatJavaScript(code) {
        // Basic JS formatting (simplified)
        return code
            .replace(/;/g, ';\n')
            .replace(/{/g, ' {\n')
            .replace(/}/g, '\n}')
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    formatPython(code) {
        // Basic Python formatting
        return code
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join('\n');
    }

    getAvailableTools() {
        return Array.from(this.tools.keys());
    }

    getToolDefinition(name) {
        return this.tools.get(name);
    }

    getToolHistory() {
        return this.toolHistory.slice(-50); // Last 50 calls
    }

    clearHistory() {
        this.toolHistory = [];
    }

    enable() {
        this.isEnabled = true;
        console.log('[ToolCalling] ✅ Tool calling enabled');
    }

    disable() {
        this.isEnabled = false;
        console.log('[ToolCalling] ❌ Tool calling disabled');
    }

    toggle() {
        this.isEnabled = !this.isEnabled;
        console.log(`[ToolCalling] ${this.isEnabled ? '✅ Enabled' : '❌ Disabled'}`);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolCallingSystem;
} else {
    window.ToolCallingSystem = ToolCallingSystem;
}