/**
 * BigDaddyG IDE - Complete Marketplace Integration
 * Ties together Host, Loader, Bridge, and UI
 */

(function() {
'use strict';

// Browser-safe require - wait for scripts to load
function getExtensionHostComplete() {
    return window.ExtensionHostComplete || (typeof require !== 'undefined' && require('./extension-host-complete.js'));
}

function getExtensionLoaderComplete() {
    return window.ExtensionLoaderComplete || (typeof require !== 'undefined' && require('./extension-loader-complete.js'));
}

function getExtensionBridgeComplete() {
    return window.ExtensionBridgeComplete || (typeof require !== 'undefined' && require('./extension-bridge-complete.js'));
}

class MarketplaceIntegrationComplete {
    constructor() {
        this.extensionHost = null;
        this.extensionLoader = null;
        this.extensionBridge = null;
        this.ui = null;
        this.initialized = false;
        
        console.log('[MarketplaceIntegration] Initializing complete marketplace system...');
    }
    
    /**
     * Initialize complete marketplace system
     */
    async initialize() {
        try {
            console.log('[MarketplaceIntegration] 🚀 Starting initialization...');
            
            // Step 1: Initialize Extension Host
            console.log('[MarketplaceIntegration] 📦 Creating extension host...');
            const ExtensionHostComplete = getExtensionHostComplete();
            if (ExtensionHostComplete) {
                this.extensionHost = new ExtensionHostComplete();
                console.log('[MarketplaceIntegration] ✅ Extension host ready');
            } else {
                console.error('[MarketplaceIntegration] ❌ ExtensionHostComplete not available');
                return { success: false, error: 'ExtensionHostComplete not available' };
            }
            
            // Step 2: Initialize Extension Loader
            console.log('[MarketplaceIntegration] 📥 Creating extension loader...');
            const ExtensionLoaderComplete = getExtensionLoaderComplete();
            if (ExtensionLoaderComplete) {
                this.extensionLoader = new ExtensionLoaderComplete(this.extensionHost);
                console.log('[MarketplaceIntegration] ✅ Extension loader ready');
            } else {
                console.error('[MarketplaceIntegration] ❌ ExtensionLoaderComplete not available');
                return { success: false, error: 'ExtensionLoaderComplete not available' };
            }
            
            // Step 3: Initialize Extension Bridge
            console.log('[MarketplaceIntegration] 🔌 Creating extension bridge...');
            const ExtensionBridgeComplete = getExtensionBridgeComplete();
            if (ExtensionBridgeComplete) {
                this.extensionBridge = new ExtensionBridgeComplete(this.extensionHost, window);
                console.log('[MarketplaceIntegration] ✅ Extension bridge ready');
            } else {
                console.error('[MarketplaceIntegration] ❌ ExtensionBridgeComplete not available');
                return { success: false, error: 'ExtensionBridgeComplete not available' };
            }
            
            // Step 4: Connect components
            this.connectComponents();
            
            // Step 5: Make available globally
            window.marketplaceSystem = this;
            window.extensionHost = this.extensionHost;
            window.extensionLoader = this.extensionLoader;
            window.extensionBridge = this.extensionBridge;
            
            this.initialized = true;
            
            console.log('[MarketplaceIntegration] ✅ Complete marketplace system ready!');
            
            // Dispatch ready event
            window.dispatchEvent(new CustomEvent('marketplace-ready', {
                detail: {
                    host: this.extensionHost,
                    loader: this.extensionLoader,
                    bridge: this.extensionBridge
                }
            }));
            
            return {
                success: true,
                message: 'Marketplace system initialized',
                components: {
                    host: !!this.extensionHost,
                    loader: !!this.extensionLoader,
                    bridge: !!this.extensionBridge
                }
            };
            
        } catch (error) {
            console.error('[MarketplaceIntegration] ❌ Initialization failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Connect components together
     */
    connectComponents() {
        console.log('[MarketplaceIntegration] 🔗 Connecting components...');
        
        // Connect loader to host
        if (this.extensionLoader && this.extensionHost) {
            this.extensionLoader.extensionHost = this.extensionHost;
        }
        
        // Connect bridge to host
        if (this.extensionBridge && this.extensionHost) {
            this.extensionBridge.extensionHost = this.extensionHost;
        }
        
        // Setup event forwarding
        if (this.extensionHost) {
            this.extensionHost.on('activated', (extensionId) => {
                console.log(`[MarketplaceIntegration] 🎉 Extension activated: ${extensionId}`);
                this.onExtensionActivated(extensionId);
            });
            
            this.extensionHost.on('deactivated', (extensionId) => {
                console.log(`[MarketplaceIntegration] 👋 Extension deactivated: ${extensionId}`);
                this.onExtensionDeactivated(extensionId);
            });
        }
        
        console.log('[MarketplaceIntegration] ✅ Components connected');
    }
    
    /**
     * Install extension
     */
    async installExtension(extensionId, url, options = {}) {
        if (!this.initialized) {
            console.error('[MarketplaceIntegration] System not initialized');
            return { success: false, error: 'System not initialized' };
        }
        
        console.log(`[MarketplaceIntegration] 📦 Installing extension: ${extensionId}`);
        
        const result = await this.extensionLoader.installExtension(extensionId, url, {
            ...options,
            onProgress: (progress) => {
                console.log(`[MarketplaceIntegration] Progress: ${progress.step} - ${progress.progress}%`);
                if (options.onProgress) {
                    options.onProgress(progress);
                }
            }
        });
        
        if (result.success) {
            console.log(`[MarketplaceIntegration] ✅ Extension installed: ${extensionId}`);
        } else {
            console.error(`[MarketplaceIntegration] ❌ Installation failed: ${result.error}`);
        }
        
        return result;
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId) {
        if (!this.initialized) {
            return { success: false, error: 'System not initialized' };
        }
        
        console.log(`[MarketplaceIntegration] 🗑️ Uninstalling extension: ${extensionId}`);
        
        const result = await this.extensionLoader.uninstallExtension(extensionId);
        
        if (result.success) {
            console.log(`[MarketplaceIntegration] ✅ Extension uninstalled: ${extensionId}`);
        }
        
        return result;
    }
    
    /**
     * Get installed extensions
     */
    getInstalledExtensions() {
        if (!this.initialized || !this.extensionLoader) {
            return [];
        }
        
        return this.extensionLoader.getInstalledExtensions();
    }
    
    /**
     * Get active extensions
     */
    getActiveExtensions() {
        if (!this.initialized || !this.extensionHost) {
            return [];
        }
        
        return this.extensionHost.getActiveExtensions();
    }
    
    /**
     * Execute command
     */
    executeCommand(commandId, ...args) {
        if (!this.initialized || !this.extensionBridge) {
            console.warn('[MarketplaceIntegration] System not initialized');
            return null;
        }
        
        return this.extensionBridge.executeCommand(commandId, ...args);
    }
    
    /**
     * Get API
     */
    getAPI() {
        if (!this.initialized || !this.extensionBridge) {
            return null;
        }
        
        return this.extensionBridge.getAPI();
    }
    
    /**
     * Handle extension activation
     */
    onExtensionActivated(extensionId) {
        // Update UI if available
        if (this.ui && this.ui.onExtensionActivated) {
            this.ui.onExtensionActivated(extensionId);
        }
        
        // Notify user
        if (window.showNotification) {
            window.showNotification(`Extension activated: ${extensionId}`, 'success');
        }
    }
    
    /**
     * Handle extension deactivation
     */
    onExtensionDeactivated(extensionId) {
        // Update UI if available
        if (this.ui && this.ui.onExtensionDeactivated) {
            this.ui.onExtensionDeactivated(extensionId);
        }
    }
    
    /**
     * Get system status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            components: {
                host: !!this.extensionHost,
                loader: !!this.extensionLoader,
                bridge: !!this.extensionBridge,
                ui: !!this.ui
            },
            extensions: {
                installed: this.getInstalledExtensions().length,
                active: this.getActiveExtensions().length
            }
        };
    }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.MarketplaceIntegrationComplete = MarketplaceIntegrationComplete;
    
    // Auto-initialize on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('[MarketplaceIntegration] Auto-initializing...');
            const integration = new MarketplaceIntegrationComplete();
            integration.initialize().then(result => {
                if (result.success) {
                    console.log('[MarketplaceIntegration] ✅ Auto-initialization complete');
                } else {
                    console.error('[MarketplaceIntegration] ❌ Auto-initialization failed:', result.error);
                }
            });
        });
    }
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketplaceIntegrationComplete;
}

})();
