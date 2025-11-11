/**
 * BigDaddyG IDE - Complete Extension Host
 * Full extension activation, deactivation, context, and IPC
 */

const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

class ExtensionHostComplete extends EventEmitter {
    constructor() {
        super();
        this.extensions = new Map();
        this.activeExtensions = new Set();
        this.contexts = new Map();
        this.ipcHandlers = new Map();
        
        console.log('[ExtensionHost] Complete extension host initialized');
    }
    
    /**
     * Activate an extension
     */
    async activate(extensionId, extensionPath) {
        try {
            console.log(`[ExtensionHost] 🚀 Activating extension: ${extensionId}`);
            
            // Check if already active
            if (this.activeExtensions.has(extensionId)) {
                console.log(`[ExtensionHost] ⚠️ Extension already active: ${extensionId}`);
                return { success: true, message: 'Already active' };
            }
            
            // Load extension package.json
            const packagePath = path.join(extensionPath, 'package.json');
            if (!fs.existsSync(packagePath)) {
                throw new Error('package.json not found');
            }
            
            const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            // Create extension context
            const context = this.createExtensionContext(extensionId, extensionPath);
            this.contexts.set(extensionId, context);
            
            // Load main entry point
            const mainPath = path.join(extensionPath, packageJson.main || 'extension.js');
            if (fs.existsSync(mainPath)) {
                const extension = require(mainPath);
                
                // Call activate function
                if (typeof extension.activate === 'function') {
                    await extension.activate(context);
                    console.log(`[ExtensionHost] ✅ Extension activated: ${extensionId}`);
                } else {
                    console.warn(`[ExtensionHost] ⚠️ No activate function found: ${extensionId}`);
                }
                
                // Store extension
                this.extensions.set(extensionId, {
                    id: extensionId,
                    path: extensionPath,
                    packageJson,
                    extension,
                    context
                });
                
                this.activeExtensions.add(extensionId);
                this.emit('activated', extensionId);
                
                return {
                    success: true,
                    message: `Extension ${extensionId} activated`,
                    context
                };
            } else {
                throw new Error(`Main file not found: ${mainPath}`);
            }
            
        } catch (error) {
            console.error(`[ExtensionHost] ❌ Failed to activate ${extensionId}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Deactivate an extension
     */
    async deactivate(extensionId) {
        try {
            console.log(`[ExtensionHost] 🛑 Deactivating extension: ${extensionId}`);
            
            if (!this.activeExtensions.has(extensionId)) {
                console.log(`[ExtensionHost] ⚠️ Extension not active: ${extensionId}`);
                return { success: true, message: 'Not active' };
            }
            
            const extensionData = this.extensions.get(extensionId);
            if (!extensionData) {
                throw new Error('Extension data not found');
            }
            
            // Call deactivate function
            if (extensionData.extension && typeof extensionData.extension.deactivate === 'function') {
                await extensionData.extension.deactivate();
                console.log(`[ExtensionHost] ✅ Extension deactivate() called: ${extensionId}`);
            }
            
            // Dispose context
            const context = this.contexts.get(extensionId);
            if (context && context.subscriptions) {
                context.subscriptions.forEach(disposable => {
                    if (typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                });
            }
            
            // Clean up
            this.activeExtensions.delete(extensionId);
            this.contexts.delete(extensionId);
            this.extensions.delete(extensionId);
            
            this.emit('deactivated', extensionId);
            
            console.log(`[ExtensionHost] ✅ Extension deactivated: ${extensionId}`);
            return {
                success: true,
                message: `Extension ${extensionId} deactivated`
            };
            
        } catch (error) {
            console.error(`[ExtensionHost] ❌ Failed to deactivate ${extensionId}:`, error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Create extension context
     */
    createExtensionContext(extensionId, extensionPath) {
        const context = {
            subscriptions: [],
            extensionPath: extensionPath,
            extensionId: extensionId,
            
            // Global storage
            globalState: {
                get: (key, defaultValue) => {
                    const storage = this.getGlobalStorage();
                    return storage[`${extensionId}.${key}`] || defaultValue;
                },
                update: (key, value) => {
                    const storage = this.getGlobalStorage();
                    storage[`${extensionId}.${key}`] = value;
                    this.saveGlobalStorage(storage);
                }
            },
            
            // Workspace storage
            workspaceState: {
                get: (key, defaultValue) => {
                    const storage = this.getWorkspaceStorage();
                    return storage[`${extensionId}.${key}`] || defaultValue;
                },
                update: (key, value) => {
                    const storage = this.getWorkspaceStorage();
                    storage[`${extensionId}.${key}`] = value;
                    this.saveWorkspaceStorage(storage);
                }
            },
            
            // Secrets
            secrets: {
                get: (key) => {
                    // Implement secure storage
                    return Promise.resolve(null);
                },
                store: (key, value) => {
                    // Implement secure storage
                    return Promise.resolve();
                }
            }
        };
        
        console.log(`[ExtensionHost] 📦 Context created for: ${extensionId}`);
        return context;
    }
    
    /**
     * Get extension context
     */
    getContext(extensionId) {
        return this.contexts.get(extensionId);
    }
    
    /**
     * IPC Communication - Send message to extension
     */
    sendMessage(extensionId, message) {
        const extensionData = this.extensions.get(extensionId);
        if (!extensionData) {
            console.warn(`[ExtensionHost] Extension not found: ${extensionId}`);
            return { success: false, error: 'Extension not found' };
        }
        
        // Emit IPC event
        this.emit('ipc-message', {
            extensionId,
            message,
            timestamp: Date.now()
        });
        
        console.log(`[ExtensionHost] 📨 Message sent to ${extensionId}:`, message);
        return { success: true };
    }
    
    /**
     * IPC Communication - Register message handler
     */
    registerIPCHandler(extensionId, handler) {
        this.ipcHandlers.set(extensionId, handler);
        console.log(`[ExtensionHost] 📡 IPC handler registered for: ${extensionId}`);
    }
    
    /**
     * Get all active extensions
     */
    getActiveExtensions() {
        return Array.from(this.activeExtensions);
    }
    
    /**
     * Check if extension is active
     */
    isActive(extensionId) {
        return this.activeExtensions.has(extensionId);
    }
    
    /**
     * Get global storage
     */
    getGlobalStorage() {
        // Simple in-memory storage (should persist to disk in production)
        if (!this._globalStorage) {
            this._globalStorage = {};
        }
        return this._globalStorage;
    }
    
    /**
     * Save global storage
     */
    saveGlobalStorage(storage) {
        this._globalStorage = storage;
        // TODO: Persist to disk
    }
    
    /**
     * Get workspace storage
     */
    getWorkspaceStorage() {
        if (!this._workspaceStorage) {
            this._workspaceStorage = {};
        }
        return this._workspaceStorage;
    }
    
    /**
     * Save workspace storage
     */
    saveWorkspaceStorage(storage) {
        this._workspaceStorage = storage;
        // TODO: Persist to disk
    }
    
    /**
     * Dispose all extensions
     */
    async disposeAll() {
        console.log('[ExtensionHost] 🗑️ Disposing all extensions...');
        
        const extensionIds = Array.from(this.activeExtensions);
        for (const extensionId of extensionIds) {
            await this.deactivate(extensionId);
        }
        
        console.log('[ExtensionHost] ✅ All extensions disposed');
    }
}

module.exports = ExtensionHostComplete;

// Export for browser
if (typeof window !== 'undefined') {
    window.ExtensionHostComplete = ExtensionHostComplete;
}
