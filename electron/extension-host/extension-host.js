/**
 * BigDaddyG IDE - Extension Host
 * Loads and manages VS Code extensions in isolated contexts
 * Provides full VS Code API compatibility
 */

const { EventEmitter } = require('events');
const path = require('path');
const fs = require('fs').promises;
const { createVSCodeAPI } = require('../vscode-api/vscode-api');

class ExtensionHost extends EventEmitter {
    constructor(mainWindow, editor) {
        super();
        
        this.mainWindow = mainWindow;
        this.editor = editor;
        this.extensions = new Map();
        this.extensionContexts = new Map();
        this.vscodeAPI = null;
        this.isReady = false;
        
        console.log('[Extension Host] Initializing...');
    }
    
    /**
     * Initialize the extension host
     */
    async initialize() {
        console.log('[Extension Host] Creating VS Code API...');
        
        // Create VS Code API instance
        this.vscodeAPI = createVSCodeAPI(this.mainWindow, this.editor);
        
        // Make vscode API globally available for extensions
        global.vscode = this.vscodeAPI.export();
        
        this.isReady = true;
        console.log('[Extension Host] ✅ Ready');
        
        this.emit('ready');
    }
    
    /**
     * Load an extension from a directory
     */
    async loadExtension(extensionPath) {
        try {
            console.log(`[Extension Host] Loading extension from: ${extensionPath}`);
            
            // Read package.json manifest
            const manifestPath = path.join(extensionPath, 'package.json');
            const manifestContent = await fs.readFile(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);
            
            const extensionId = `${manifest.publisher}.${manifest.name}`;
            
            // Check if already loaded
            if (this.extensions.has(extensionId)) {
                console.log(`[Extension Host] ⚠️ Already loaded: ${extensionId}`);
                return this.extensions.get(extensionId);
            }
            
            // Validate extension
            if (!this.validateExtension(manifest)) {
                throw new Error(`Invalid extension manifest: ${extensionId}`);
            }
            
            // Create extension context
            const context = this.createExtensionContext(manifest, extensionPath);
            this.extensionContexts.set(extensionId, context);
            
            // Load extension main module
            let extensionModule = null;
            if (manifest.main) {
                const mainPath = path.join(extensionPath, manifest.main);
                
                // Clear require cache to allow reloading
                delete require.cache[require.resolve(mainPath)];
                
                // Load the module
                extensionModule = require(mainPath);
            }
            
            // Register with VS Code API
            const extension = this.vscodeAPI.extensionRegistry.registerExtension(
                extensionId,
                manifest,
                extensionModule,
                context
            );
            
            // Store extension
            this.extensions.set(extensionId, {
                id: extensionId,
                manifest,
                module: extensionModule,
                context,
                extension,
                path: extensionPath
            });
            
            console.log(`[Extension Host] ✅ Loaded: ${manifest.displayName || extensionId}`);
            
            this.emit('extension-loaded', extension);
            
            return extension;
            
        } catch (error) {
            console.error(`[Extension Host] ❌ Failed to load extension:`, error);
            throw error;
        }
    }
    
    /**
     * Activate an extension
     */
    async activateExtension(extensionId) {
        const ext = this.extensions.get(extensionId);
        
        if (!ext) {
            throw new Error(`Extension not found: ${extensionId}`);
        }
        
        if (ext.extension.isActive) {
            console.log(`[Extension Host] Already active: ${extensionId}`);
            return ext.extension.exports;
        }
        
        console.log(`[Extension Host] Activating: ${extensionId}`);
        
        try {
            // Check activation events
            const activationEvents = ext.manifest.activationEvents || [];
            
            // Call activate function
            const exports = await ext.extension.activate();
            
            console.log(`[Extension Host] ✅ Activated: ${extensionId}`);
            
            this.emit('extension-activated', ext.extension);
            
            return exports;
            
        } catch (error) {
            console.error(`[Extension Host] ❌ Activation failed: ${extensionId}`, error);
            throw error;
        }
    }
    
    /**
     * Deactivate an extension
     */
    async deactivateExtension(extensionId) {
        const ext = this.extensions.get(extensionId);
        
        if (!ext) {
            throw new Error(`Extension not found: ${extensionId}`);
        }
        
        if (!ext.extension.isActive) {
            console.log(`[Extension Host] Not active: ${extensionId}`);
            return;
        }
        
        console.log(`[Extension Host] Deactivating: ${extensionId}`);
        
        await ext.extension._deactivate();
        
        console.log(`[Extension Host] Deactivated: ${extensionId}`);
        
        this.emit('extension-deactivated', ext.extension);
    }
    
    /**
     * Unload an extension
     */
    async unloadExtension(extensionId) {
        const ext = this.extensions.get(extensionId);
        
        if (!ext) {
            throw new Error(`Extension not found: ${extensionId}`);
        }
        
        console.log(`[Extension Host] Unloading: ${extensionId}`);
        
        // Deactivate first
        if (ext.extension.isActive) {
            await this.deactivateExtension(extensionId);
        }
        
        // Dispose context
        if (ext.context && ext.context._dispose) {
            ext.context._dispose();
        }
        
        // Unregister from API
        await this.vscodeAPI.extensionRegistry.unregisterExtension(extensionId);
        
        // Remove from cache
        this.extensions.delete(extensionId);
        this.extensionContexts.delete(extensionId);
        
        // Clear require cache
        if (ext.manifest.main) {
            const mainPath = path.join(ext.path, ext.manifest.main);
            delete require.cache[require.resolve(mainPath)];
        }
        
        console.log(`[Extension Host] ✅ Unloaded: ${extensionId}`);
        
        this.emit('extension-unloaded', extensionId);
    }
    
    /**
     * Get all loaded extensions
     */
    getAllExtensions() {
        return Array.from(this.extensions.values()).map(ext => ext.extension);
    }
    
    /**
     * Get extension by ID
     */
    getExtension(extensionId) {
        const ext = this.extensions.get(extensionId);
        return ext ? ext.extension : undefined;
    }
    
    /**
     * Validate extension manifest
     */
    validateExtension(manifest) {
        if (!manifest.name) {
            console.error('[Extension Host] Missing name in manifest');
            return false;
        }
        
        if (!manifest.publisher) {
            console.error('[Extension Host] Missing publisher in manifest');
            return false;
        }
        
        if (!manifest.version) {
            console.error('[Extension Host] Missing version in manifest');
            return false;
        }
        
        if (!manifest.engines || !manifest.engines.vscode) {
            console.error('[Extension Host] Missing vscode engine in manifest');
            return false;
        }
        
        return true;
    }
    
    /**
     * Create extension context
     */
    createExtensionContext(manifest, extensionPath) {
        const extensionId = `${manifest.publisher}.${manifest.name}`;
        const subscriptions = [];
        
        const context = {
            // Extension info
            extension: {
                id: extensionId,
                extensionUri: { toString: () => extensionPath },
                extensionPath: extensionPath
            },
            
            // Subscriptions for cleanup
            subscriptions: subscriptions,
            
            // Storage paths
            globalStoragePath: path.join(process.env.APPDATA || process.env.HOME, 'BigDaddyG', 'extensions', extensionId, 'global'),
            workspaceStoragePath: path.join(process.env.APPDATA || process.env.HOME, 'BigDaddyG', 'extensions', extensionId, 'workspace'),
            storagePath: path.join(process.env.APPDATA || process.env.HOME, 'BigDaddyG', 'extensions', extensionId),
            logPath: path.join(process.env.APPDATA || process.env.HOME, 'BigDaddyG', 'logs', extensionId),
            
            // Extension URI
            extensionUri: { toString: () => extensionPath },
            extensionPath: extensionPath,
            
            // Environment
            environmentVariableCollection: new EnvironmentVariableCollection(),
            
            // Global state (persistent)
            globalState: new StateStore(`${extensionId}.global`),
            
            // Workspace state (per-workspace)
            workspaceState: new StateStore(`${extensionId}.workspace`),
            
            // Secrets
            secrets: new SecretStore(extensionId),
            
            // Asset path helper
            asAbsolutePath: (relativePath) => {
                return path.join(extensionPath, relativePath);
            },
            
            // Internal cleanup
            _dispose: () => {
                subscriptions.forEach(sub => {
                    if (sub && typeof sub.dispose === 'function') {
                        sub.dispose();
                    }
                });
                subscriptions.length = 0;
            }
        };
        
        return context;
    }
    
    /**
     * Shutdown extension host
     */
    async shutdown() {
        console.log('[Extension Host] Shutting down...');
        
        // Deactivate all extensions
        for (const [extensionId, ext] of this.extensions) {
            try {
                if (ext.extension.isActive) {
                    await this.deactivateExtension(extensionId);
                }
            } catch (error) {
                console.error(`[Extension Host] Error deactivating ${extensionId}:`, error);
            }
        }
        
        this.extensions.clear();
        this.extensionContexts.clear();
        
        console.log('[Extension Host] Shutdown complete');
    }
}

/**
 * Environment Variable Collection
 */
class EnvironmentVariableCollection {
    constructor() {
        this.variables = new Map();
    }
    
    replace(variable, value) {
        this.variables.set(variable, { type: 'replace', value });
    }
    
    append(variable, value) {
        this.variables.set(variable, { type: 'append', value });
    }
    
    prepend(variable, value) {
        this.variables.set(variable, { type: 'prepend', value });
    }
    
    get(variable) {
        return this.variables.get(variable);
    }
    
    delete(variable) {
        this.variables.delete(variable);
    }
    
    clear() {
        this.variables.clear();
    }
    
    forEach(callback) {
        this.variables.forEach((value, key) => callback(key, value));
    }
}

/**
 * State Store (for globalState and workspaceState)
 */
class StateStore {
    constructor(namespace) {
        this.namespace = namespace;
        this.data = new Map();
    }
    
    get(key, defaultValue) {
        return this.data.get(key) ?? defaultValue;
    }
    
    async update(key, value) {
        this.data.set(key, value);
        // TODO: Persist to disk
        return Promise.resolve();
    }
    
    keys() {
        return Array.from(this.data.keys());
    }
}

/**
 * Secret Store
 */
class SecretStore {
    constructor(extensionId) {
        this.extensionId = extensionId;
        this.secrets = new Map();
    }
    
    async get(key) {
        return this.secrets.get(key);
    }
    
    async store(key, value) {
        this.secrets.set(key, value);
        // TODO: Encrypt and persist
    }
    
    async delete(key) {
        this.secrets.delete(key);
        // TODO: Delete from persistent storage
    }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let extensionHostInstance = null;

function createExtensionHost(mainWindow, editor) {
    if (!extensionHostInstance) {
        extensionHostInstance = new ExtensionHost(mainWindow, editor);
    }
    return extensionHostInstance;
}

function getExtensionHost() {
    if (!extensionHostInstance) {
        throw new Error('Extension Host not initialized. Call createExtensionHost first.');
    }
    return extensionHostInstance;
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
    ExtensionHost,
    createExtensionHost,
    getExtensionHost
};

