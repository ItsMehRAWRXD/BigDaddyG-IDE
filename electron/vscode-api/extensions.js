/**
 * BigDaddyG IDE - VS Code Extensions API
 * Implements vscode.extensions namespace
 */

const { EventEmitter } = require('events');

class ExtensionRegistry extends EventEmitter {
    constructor(vscodeAPI) {
        super();
        this.vscodeAPI = vscodeAPI;
        this.extensions = new Map();
        
        console.log('[VSCode API] Extension registry initialized');
    }
    
    /**
     * Get all extensions
     */
    get all() {
        return Array.from(this.extensions.values());
    }
    
    /**
     * Get extension by ID
     */
    getExtension(extensionId) {
        return this.extensions.get(extensionId);
    }
    
    /**
     * Register an extension
     */
    registerExtension(extensionId, manifest, module, context) {
        const extension = new Extension(extensionId, manifest, module, context, this);
        this.extensions.set(extensionId, extension);
        
        console.log(`[Extensions] ✅ Registered: ${extensionId}`);
        
        this.emit('extension-registered', extension);
        
        return extension;
    }
    
    /**
     * Unregister an extension
     */
    async unregisterExtension(extensionId) {
        const extension = this.extensions.get(extensionId);
        
        if (extension) {
            // Deactivate if active
            if (extension.isActive) {
                await extension._deactivate();
            }
            
            this.extensions.delete(extensionId);
            console.log(`[Extensions] ❌ Unregistered: ${extensionId}`);
            
            this.emit('extension-unregistered', extension);
        }
    }
    
    /**
     * Get VS Code API
     */
    getAPI() {
        return {
            get all() {
                return Array.from(this.extensions.values());
            },
            
            getExtension: this.getExtension.bind(this),
            
            // Event emitters
            onDidChange: (listener) => {
                this.on('extensions-changed', listener);
                return { dispose: () => this.off('extensions-changed', listener) };
            }
        };
    }
}

/**
 * Extension
 */
class Extension {
    constructor(id, manifest, module, context, registry) {
        this.id = id;
        this.extensionUri = { toString: () => manifest.extensionPath || '' };
        this.extensionPath = manifest.extensionPath || '';
        this.extensionKind = 1; // ExtensionKind.Workspace
        this.packageJSON = manifest;
        this._module = module;
        this._context = context;
        this._registry = registry;
        this._isActive = false;
        this._exports = undefined;
    }
    
    get isActive() {
        return this._isActive;
    }
    
    get exports() {
        return this._exports;
    }
    
    /**
     * Activate extension
     */
    async activate() {
        if (this._isActive) {
            console.log(`[Extension] Already active: ${this.id}`);
            return this._exports;
        }
        
        console.log(`[Extension] Activating: ${this.id}`);
        
        try {
            if (this._module && typeof this._module.activate === 'function') {
                this._exports = await this._module.activate(this._context);
                this._isActive = true;
                
                console.log(`[Extension] ✅ Activated: ${this.id}`);
                this._registry.emit('extension-activated', this);
                
                return this._exports;
            } else {
                console.warn(`[Extension] No activate function: ${this.id}`);
                this._isActive = true;
                return undefined;
            }
        } catch (error) {
            console.error(`[Extension] ❌ Activation failed: ${this.id}`, error);
            throw error;
        }
    }
    
    /**
     * Deactivate extension
     */
    async _deactivate() {
        if (!this._isActive) {
            return;
        }
        
        console.log(`[Extension] Deactivating: ${this.id}`);
        
        try {
            if (this._module && typeof this._module.deactivate === 'function') {
                await this._module.deactivate();
            }
            
            this._isActive = false;
            console.log(`[Extension] Deactivated: ${this.id}`);
            
            this._registry.emit('extension-deactivated', this);
        } catch (error) {
            console.error(`[Extension] Error deactivating: ${this.id}`, error);
        }
    }
}

module.exports = ExtensionRegistry;

