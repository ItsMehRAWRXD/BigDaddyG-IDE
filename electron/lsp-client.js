/**
 * BigDaddyG IDE - LSP Client
 * Language Server Protocol client implementation
 */

const { spawn } = require('child_process');
const EventEmitter = require('events');

class LSPClient extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = config;
        this.serverProcess = null;
        this.messageId = 0;
        this.pendingRequests = new Map();
        this.initialized = false;
        this.capabilities = null;
        
        console.log('[LSPClient] Initialized');
    }
    
    /**
     * Start LSP server
     */
    async start(command, args = [], options = {}) {
        if (this.serverProcess) {
            console.warn('[LSPClient] Server already running');
            return;
        }
        
        try {
            this.serverProcess = spawn(command, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                ...options
            });
            
            this.setupHandlers();
            
            // Initialize
            await this.initialize();
            
            console.log('[LSPClient] Server started');
        } catch (error) {
            console.error('[LSPClient] Failed to start server:', error);
            throw error;
        }
    }
    
    /**
     * Setup process handlers
     */
    setupHandlers() {
        let buffer = '';
        
        this.serverProcess.stdout.on('data', (data) => {
            buffer += data.toString();
            
            // Parse messages
            while (true) {
                const match = buffer.match(/Content-Length: (\d+)\r\n\r\n/);
                if (!match) break;
                
                const length = parseInt(match[1]);
                const headerEnd = match.index + match[0].length;
                
                if (buffer.length < headerEnd + length) break;
                
                const content = buffer.substring(headerEnd, headerEnd + length);
                buffer = buffer.substring(headerEnd + length);
                
                try {
                    const message = JSON.parse(content);
                    this.handleMessage(message);
                } catch (error) {
                    console.error('[LSPClient] Failed to parse message:', error);
                }
            }
        });
        
        this.serverProcess.stderr.on('data', (data) => {
            console.error('[LSPClient] Server error:', data.toString());
        });
        
        this.serverProcess.on('close', (code) => {
            console.log(`[LSPClient] Server closed with code ${code}`);
            this.serverProcess = null;
            this.initialized = false;
            this.emit('close', code);
        });
        
        this.serverProcess.on('error', (error) => {
            console.error('[LSPClient] Server process error:', error);
            this.emit('error', error);
        });
    }
    
    /**
     * Send message to server
     */
    sendMessage(message) {
        if (!this.serverProcess) {
            throw new Error('Server not started');
        }
        
        const content = JSON.stringify(message);
        const header = `Content-Length: ${Buffer.byteLength(content)}\r\n\r\n`;
        
        this.serverProcess.stdin.write(header + content);
    }
    
    /**
     * Send request
     */
    sendRequest(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = ++this.messageId;
            
            this.pendingRequests.set(id, { resolve, reject });
            
            this.sendMessage({
                jsonrpc: '2.0',
                id,
                method,
                params
            });
            
            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
    
    /**
     * Send notification
     */
    sendNotification(method, params = {}) {
        this.sendMessage({
            jsonrpc: '2.0',
            method,
            params
        });
    }
    
    /**
     * Handle incoming message
     */
    handleMessage(message) {
        if (message.id !== undefined) {
            // Response to request
            const pending = this.pendingRequests.get(message.id);
            if (pending) {
                this.pendingRequests.delete(message.id);
                
                if (message.error) {
                    pending.reject(new Error(message.error.message));
                } else {
                    pending.resolve(message.result);
                }
            }
        } else if (message.method) {
            // Notification or request from server
            this.emit('notification', message.method, message.params);
        }
    }
    
    /**
     * Initialize server
     */
    async initialize() {
        const result = await this.sendRequest('initialize', {
            processId: process.pid,
            clientInfo: {
                name: 'BigDaddyG IDE',
                version: '1.0.0'
            },
            capabilities: {
                textDocument: {
                    synchronization: {
                        dynamicRegistration: true,
                        willSave: true,
                        willSaveWaitUntil: true,
                        didSave: true
                    },
                    completion: {
                        dynamicRegistration: true,
                        completionItem: {
                            snippetSupport: true,
                            documentationFormat: ['markdown', 'plaintext']
                        }
                    },
                    hover: {
                        dynamicRegistration: true,
                        contentFormat: ['markdown', 'plaintext']
                    },
                    definition: { dynamicRegistration: true },
                    references: { dynamicRegistration: true },
                    rename: { dynamicRegistration: true },
                    formatting: { dynamicRegistration: true }
                },
                workspace: {
                    applyEdit: true,
                    workspaceEdit: {
                        documentChanges: true
                    }
                }
            },
            rootUri: `file://${process.cwd()}`,
            workspaceFolders: [{
                uri: `file://${process.cwd()}`,
                name: 'workspace'
            }]
        });
        
        this.capabilities = result.capabilities;
        this.initialized = true;
        
        // Send initialized notification
        this.sendNotification('initialized', {});
        
        console.log('[LSPClient] Initialized with capabilities:', this.capabilities);
        
        return result;
    }
    
    /**
     * Open document
     */
    textDocumentDidOpen(uri, languageId, version, text) {
        this.sendNotification('textDocument/didOpen', {
            textDocument: {
                uri,
                languageId,
                version,
                text
            }
        });
    }
    
    /**
     * Change document
     */
    textDocumentDidChange(uri, version, changes) {
        this.sendNotification('textDocument/didChange', {
            textDocument: { uri, version },
            contentChanges: changes
        });
    }
    
    /**
     * Close document
     */
    textDocumentDidClose(uri) {
        this.sendNotification('textDocument/didClose', {
            textDocument: { uri }
        });
    }
    
    /**
     * Request completion
     */
    async textDocumentCompletion(uri, position) {
        return await this.sendRequest('textDocument/completion', {
            textDocument: { uri },
            position
        });
    }
    
    /**
     * Request hover
     */
    async textDocumentHover(uri, position) {
        return await this.sendRequest('textDocument/hover', {
            textDocument: { uri },
            position
        });
    }
    
    /**
     * Request definition
     */
    async textDocumentDefinition(uri, position) {
        return await this.sendRequest('textDocument/definition', {
            textDocument: { uri },
            position
        });
    }
    
    /**
     * Request references
     */
    async textDocumentReferences(uri, position) {
        return await this.sendRequest('textDocument/references', {
            textDocument: { uri },
            position,
            context: { includeDeclaration: true }
        });
    }
    
    /**
     * Request formatting
     */
    async textDocumentFormatting(uri, options) {
        return await this.sendRequest('textDocument/formatting', {
            textDocument: { uri },
            options
        });
    }
    
    /**
     * Shutdown server
     */
    async shutdown() {
        if (!this.initialized) return;
        
        await this.sendRequest('shutdown', {});
        this.sendNotification('exit', {});
        
        if (this.serverProcess) {
            this.serverProcess.kill();
            this.serverProcess = null;
        }
        
        this.initialized = false;
        console.log('[LSPClient] Shutdown complete');
    }
    
    /**
     * Get status
     */
    getStatus() {
        return {
            running: !!this.serverProcess,
            initialized: this.initialized,
            capabilities: this.capabilities,
            pendingRequests: this.pendingRequests.size
        };
    }
}

module.exports = LSPClient;
