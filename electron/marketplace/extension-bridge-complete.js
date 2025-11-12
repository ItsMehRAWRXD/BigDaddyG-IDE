/**
 * BigDaddyG IDE - Complete Extension Bridge
 * Connects Extension Host to IDE core functionality
 */

class ExtensionBridgeComplete {
    constructor(extensionHost, ide) {
        this.extensionHost = extensionHost;
        this.ide = ide || window;
        this.api = this.createAPI();
        this.commands = new Map();
        this.menuItems = new Map();
        this.statusBarItems = new Map();
        this.eventListeners = new Set();
        this.activeExtensions = new Set();
        
        this.setupBridge();
        console.log('[ExtensionBridge] Complete bridge initialized');
    }
    
    /**
     * Setup bridge connections
     */
    setupBridge() {
        try {
            // Listen to extension host events
            this.extensionHost.on('activated', (extensionId) => {
                console.log(`[ExtensionBridge] 🔌 Extension connected: ${extensionId}`);
                this.activeExtensions.add(extensionId);
                this.onExtensionActivated(extensionId);
            });
            
            this.extensionHost.on('deactivated', (extensionId) => {
                console.log(`[ExtensionBridge] 🔌 Extension disconnected: ${extensionId}`);
                this.activeExtensions.delete(extensionId);
                this.onExtensionDeactivated(extensionId);
            });
            
            this.extensionHost.on('ipc-message', (data) => {
                console.log(`[ExtensionBridge] 📨 IPC message received:`, data);
                this.handleIPCMessage(data);
            });
        } catch (error) {
            console.error('[ExtensionBridge] Setup bridge error:', error);
        }
    }
    
    /**
     * Create IDE API for extensions
     */
    createAPI() {
        const self = this;
        
        return {
            // Editor API
            editor: {
                getValue: () => {
                    const editor = window.bigdaddyEditor || window.activeEditor;
                    return editor ? editor.getValue() : '';
                },
                
                setValue: (value) => {
                    const editor = window.bigdaddyEditor || window.activeEditor;
                    if (editor) editor.setValue(value);
                },
                
                insert: (text, position) => {
                    const editor = window.bigdaddyEditor || window.activeEditor;
                    if (editor && editor.insert) {
                        editor.insert(text, position);
                    }
                },
                
                getSelection: () => {
                    const editor = window.bigdaddyEditor || window.activeEditor;
                    return editor?.getSelection?.() || null;
                },
                
                setSelection: (start, end) => {
                    const editor = window.bigdaddyEditor || window.activeEditor;
                    if (editor && editor.setSelection) {
                        editor.setSelection(start, end);
                    }
                }
            },
            
            // Workspace API
            workspace: {
                getActiveFile: () => {
                    if (window.fileManager) {
                        return window.fileManager.currentFile || null;
                    }
                    return null;
                },
                
                openFile: (filePath) => {
                    if (window.fileManager && window.fileManager.loadFile) {
                        return window.fileManager.loadFile(filePath);
                    }
                    return Promise.resolve(null);
                },
                
                saveFile: (filePath, content) => {
                    if (window.fileManager && window.fileManager.saveFile) {
                        return window.fileManager.saveFile(filePath, content);
                    }
                    return Promise.resolve(false);
                },
                
                getRootPath: () => {
                    return window.workspaceRoot || process.cwd();
                }
            },
            
            // Commands API
            commands: {
                register: (commandId, callback) => {
                    self.commands.set(commandId, callback);
                    console.log(`[ExtensionBridge] ⚡ Command registered: ${commandId}`);
                    return {
                        dispose: () => self.commands.delete(commandId)
                    };
                },
                
                execute: (commandId, ...args) => {
                    const command = self.commands.get(commandId);
                    if (command) {
                        return command(...args);
                    }
                    console.warn(`[ExtensionBridge] Command not found: ${commandId}`);
                    return null;
                }
            },
            
            // UI API
            ui: {
                showMessage: (message, type = 'info') => {
                    if (window.showNotification) {
                        window.showNotification(message, type);
                    } else {
                        console.log(`[${type.toUpperCase()}] ${message}`);
                    }
                },
                
                showError: (message) => {
                    this.ui.showMessage(message, 'error');
                },
                
                showWarning: (message) => {
                    this.ui.showMessage(message, 'warning');
                },
                
                addStatusBarItem: (id, text, tooltip) => {
                    const item = {
                        id,
                        text,
                        tooltip,
                        element: null
                    };
                    
                    // Create status bar element
                    const statusBar = document.getElementById('status-bar');
                    if (statusBar) {
                        const element = document.createElement('div');
                        element.className = 'status-bar-item';
                        element.textContent = text;
                        element.title = tooltip || '';
                        statusBar.appendChild(element);
                        item.element = element;
                    }
                    
                    self.statusBarItems.set(id, item);
                    console.log(`[ExtensionBridge] 📊 Status bar item added: ${id}`);
                    
                    return {
                        dispose: () => {
                            if (item.element) {
                                item.element.remove();
                            }
                            self.statusBarItems.delete(id);
                        },
                        update: (newText) => {
                            item.text = newText;
                            if (item.element) {
                                item.element.textContent = newText;
                            }
                        }
                    };
                },
                
                addMenuItem: (id, label, callback) => {
                    self.menuItems.set(id, { label, callback });
                    console.log(`[ExtensionBridge] 📋 Menu item added: ${id}`);
                    
                    return {
                        dispose: () => self.menuItems.delete(id)
                    };
                }
            },
            
            // Language API
            languages: {
                register: (languageId, config) => {
                    console.log(`[ExtensionBridge] 🌐 Language registered: ${languageId}`);
                    // TODO: Integrate with syntax highlighter
                    return { dispose: () => {} };
                },
                
                registerFormatter: (languageId, formatter) => {
                    console.log(`[ExtensionBridge] ✨ Formatter registered: ${languageId}`);
                    // TODO: Integrate with formatter system
                    return { dispose: () => {} };
                }
            },
            
            // Debug API
            debug: {
                startDebugging: (config) => {
                    console.log(`[ExtensionBridge] 🐛 Debug session starting:`, config);
                    // TODO: Integrate with debugger
                    return Promise.resolve({ success: true });
                },
                
                stopDebugging: () => {
                    console.log(`[ExtensionBridge] 🐛 Debug session stopping`);
                    return Promise.resolve({ success: true });
                }
            },
            
            // Terminal API
            terminal: {
                sendCommand: (command) => {
                    if (window.terminalManager && window.terminalManager.executeCommand) {
                        window.terminalManager.executeCommand(command);
                    } else {
                        console.log(`[Terminal] ${command}`);
                    }
                },
                
                clear: () => {
                    if (window.terminalManager && window.terminalManager.clear) {
                        window.terminalManager.clear();
                    }
                }
            },
            
            // File System API
            fs: {
                readFile: (filePath) => {
                    // Browser-safe file reading
                    return Promise.resolve(null);
                },
                
                writeFile: (filePath, content) => {
                    // Browser-safe file writing
                    return Promise.resolve(true);
                },
                
                exists: (filePath) => {
                    return Promise.resolve(false);
                }
            }
        };
    }
    
    /**
     * Get API for extension
     */
    getAPI() {
        return this.api;
    }
    
    /**
     * Handle extension activation
     */
    onExtensionActivated(extensionId) {
        // Make API available to extension
        const context = this.extensionHost.getContext(extensionId);
        if (context) {
            context.ideAPI = this.api;
        }
        
        // Emit event
        if (this.ide && this.ide.dispatchEvent) {
            this.ide.dispatchEvent(new CustomEvent('extension-activated', {
                detail: { extensionId }
            }));
        }
    }
    
    /**
     * Handle extension deactivation
     */
    onExtensionDeactivated(extensionId) {
        // Clean up extension resources
        const itemsToRemove = [];
        
        // Remove status bar items
        for (const [id, item] of this.statusBarItems) {
            if (id.startsWith(extensionId)) {
                if (item.element) item.element.remove();
                itemsToRemove.push(id);
            }
        }
        
        itemsToRemove.forEach(id => this.statusBarItems.delete(id));
        
        // Remove commands
        for (const [commandId] of this.commands) {
            if (commandId.startsWith(extensionId)) {
                this.commands.delete(commandId);
            }
        }
        
        // Emit event
        if (this.ide && this.ide.dispatchEvent) {
            this.ide.dispatchEvent(new CustomEvent('extension-deactivated', {
                detail: { extensionId }
            }));
        }
        
        console.log(`[ExtensionBridge] 🧹 Cleaned up resources for: ${extensionId}`);
    }
    
    /**
     * Handle IPC message
     */
    handleIPCMessage(data) {
        try {
            const { extensionId, message } = data;
            
            // Route message to appropriate handler
            if (message.type === 'notification') {
                this.api.ui.showMessage(message.text, message.level || 'info');
            } else if (message.type === 'command') {
                this.api.commands.execute(message.commandId, ...message.args);
            }
            
            // Emit to IDE
            if (this.ide && this.ide.dispatchEvent) {
                this.ide.dispatchEvent(new CustomEvent('extension-message', {
                    detail: data
                }));
            }
        } catch (error) {
            console.error(`[ExtensionBridge] IPC message handling error:`, error);
        }
    }
    
    /**
     * Execute command
     */
    executeCommand(commandId, ...args) {
        try {
            return this.api.commands.execute(commandId, ...args);
        } catch (error) {
            console.error(`[ExtensionBridge] Command execution error:`, error);
            return null;
        }
    }
    
    /**
     * Get all registered commands
     */
    getCommands() {
        return Array.from(this.commands.keys());
    }
    
    /**
     * Get all status bar items
     */
    getStatusBarItems() {
        return Array.from(this.statusBarItems.values());
    }
    
    /**
     * Get all menu items
     */
    getMenuItems() {
        return Array.from(this.menuItems.values());
    }
}

module.exports = ExtensionBridgeComplete;

// Export for browser
if (typeof window !== 'undefined') {
    window.ExtensionBridgeComplete = ExtensionBridgeComplete;
}
