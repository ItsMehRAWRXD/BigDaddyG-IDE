/**
 * BigDaddyG IDE - Extension Manager
 * Manages extension lifecycle: enable/disable, updates, dependencies
 */

const { EventEmitter } = require('events');
const fs = require('fs').promises;
const path = require('path');

class ExtensionManager extends EventEmitter {
    constructor(marketplaceClient, extensionHost) {
        super();
        
        this.marketplace = marketplaceClient;
        this.extensionHost = extensionHost;
        
        // Configuration storage
        this.configPath = path.join(
            process.env.APPDATA || process.env.HOME || process.cwd(),
            'BigDaddyG',
            'extensions.json'
        );
        
        // Extension states
        this.extensionStates = new Map();
        this.autoActivate = new Set();
        
        console.log('[Extension Manager] Initialized');
    }
    
    /**
     * Initialize extension manager
     */
    async initialize() {
        // Load configuration
        await this.loadConfiguration();
        
        // Discover installed extensions
        await this.discoverExtensions();
        
        // Auto-activate extensions
        await this.autoActivateExtensions();
        
        console.log('[Extension Manager] ✅ Ready');
    }
    
    /**
     * Install extension by ID
     */
    async installExtension(extensionId) {
        console.log(`[Extension Manager] Installing: ${extensionId}`);
        
        try {
            // Parse extension ID
            const [publisher, name] = extensionId.split('.');
            
            if (!publisher || !name) {
                throw new Error(`Invalid extension ID: ${extensionId}`);
            }
            
            // Download extension
            const vsixPath = await this.marketplace.downloadExtension(publisher, name);
            
            // Install extension
            const extension = await this.marketplace.installExtension(vsixPath, this.extensionHost);
            
            // Enable by default
            await this.enableExtension(extensionId);
            
            // Save configuration
            await this.saveConfiguration();
            
            console.log(`[Extension Manager] ✅ Installed: ${extensionId}`);
            
            this.emit('extension-installed', { extensionId, extension });
            
            return extension;
            
        } catch (error) {
            console.error(`[Extension Manager] Installation failed:`, error);
            throw error;
        }
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId) {
        console.log(`[Extension Manager] Uninstalling: ${extensionId}`);
        
        try {
            // Disable first
            await this.disableExtension(extensionId);
            
            // Uninstall
            await this.marketplace.uninstallExtension(extensionId, this.extensionHost);
            
            // Remove from state
            this.extensionStates.delete(extensionId);
            this.autoActivate.delete(extensionId);
            
            // Save configuration
            await this.saveConfiguration();
            
            console.log(`[Extension Manager] ✅ Uninstalled: ${extensionId}`);
            
            this.emit('extension-uninstalled', { extensionId });
            
        } catch (error) {
            console.error(`[Extension Manager] Uninstall failed:`, error);
            throw error;
        }
    }
    
    /**
     * Enable extension
     */
    async enableExtension(extensionId) {
        console.log(`[Extension Manager] Enabling: ${extensionId}`);
        
        try {
            // Activate in extension host
            await this.extensionHost.activateExtension(extensionId);
            
            // Update state
            this.extensionStates.set(extensionId, {
                enabled: true,
                active: true,
                lastActivated: new Date().toISOString()
            });
            
            this.autoActivate.add(extensionId);
            
            // Save configuration
            await this.saveConfiguration();
            
            console.log(`[Extension Manager] ✅ Enabled: ${extensionId}`);
            
            this.emit('extension-enabled', { extensionId });
            
        } catch (error) {
            console.error(`[Extension Manager] Enable failed:`, error);
            throw error;
        }
    }
    
    /**
     * Disable extension
     */
    async disableExtension(extensionId) {
        console.log(`[Extension Manager] Disabling: ${extensionId}`);
        
        try {
            // Deactivate in extension host
            await this.extensionHost.deactivateExtension(extensionId);
            
            // Update state
            this.extensionStates.set(extensionId, {
                enabled: false,
                active: false,
                lastDeactivated: new Date().toISOString()
            });
            
            this.autoActivate.delete(extensionId);
            
            // Save configuration
            await this.saveConfiguration();
            
            console.log(`[Extension Manager] ✅ Disabled: ${extensionId}`);
            
            this.emit('extension-disabled', { extensionId });
            
        } catch (error) {
            console.error(`[Extension Manager] Disable failed:`, error);
            throw error;
        }
    }
    
    /**
     * Update extension
     */
    async updateExtension(extensionId) {
        console.log(`[Extension Manager] Updating: ${extensionId}`);
        
        try {
            // Parse extension ID
            const [publisher, name] = extensionId.split('.');
            
            // Get current version
            const installed = await this.marketplace.listInstalledExtensions();
            const current = installed.find(ext => ext.id === extensionId);
            
            if (!current) {
                throw new Error(`Extension not installed: ${extensionId}`);
            }
            
            // Check for updates
            const latest = await this.marketplace.getExtension(publisher, name);
            
            if (latest.version === current.version) {
                console.log(`[Extension Manager] Already up to date: ${extensionId}`);
                return null;
            }
            
            console.log(`[Extension Manager] Updating ${extensionId}: ${current.version} → ${latest.version}`);
            
            // Download new version
            const vsixPath = await this.marketplace.downloadExtension(publisher, name, latest.version);
            
            // Disable current version
            await this.disableExtension(extensionId);
            
            // Install new version
            const extension = await this.marketplace.installExtension(vsixPath, this.extensionHost);
            
            // Re-enable
            await this.enableExtension(extensionId);
            
            console.log(`[Extension Manager] ✅ Updated: ${extensionId}`);
            
            this.emit('extension-updated', { extensionId, oldVersion: current.version, newVersion: latest.version });
            
            return extension;
            
        } catch (error) {
            console.error(`[Extension Manager] Update failed:`, error);
            throw error;
        }
    }
    
    /**
     * Check for updates
     */
    async checkForUpdates() {
        console.log('[Extension Manager] Checking for updates...');
        
        try {
            const installed = await this.marketplace.listInstalledExtensions();
            const updates = [];
            
            for (const ext of installed) {
                try {
                    const latest = await this.marketplace.getExtension(ext.publisher, ext.name);
                    
                    if (latest.version !== ext.version) {
                        updates.push({
                            extensionId: ext.id,
                            currentVersion: ext.version,
                            latestVersion: latest.version
                        });
                    }
                } catch (error) {
                    console.warn(`[Extension Manager] Could not check updates for ${ext.id}:`, error.message);
                }
            }
            
            console.log(`[Extension Manager] Found ${updates.length} update(s)`);
            
            return updates;
            
        } catch (error) {
            console.error('[Extension Manager] Check updates failed:', error);
            return [];
        }
    }
    
    /**
     * Update all extensions
     */
    async updateAllExtensions() {
        console.log('[Extension Manager] Updating all extensions...');
        
        const updates = await this.checkForUpdates();
        const results = [];
        
        for (const update of updates) {
            try {
                await this.updateExtension(update.extensionId);
                results.push({ extensionId: update.extensionId, success: true });
            } catch (error) {
                results.push({ extensionId: update.extensionId, success: false, error: error.message });
            }
        }
        
        console.log(`[Extension Manager] Updated ${results.filter(r => r.success).length}/${results.length} extension(s)`);
        
        return results;
    }
    
    /**
     * Get extension state
     */
    getExtensionState(extensionId) {
        return this.extensionStates.get(extensionId) || {
            enabled: false,
            active: false
        };
    }
    
    /**
     * List all extensions with states
     */
    async listExtensionsWithStates() {
        const installed = await this.marketplace.listInstalledExtensions();
        
        return installed.map(ext => ({
            ...ext,
            state: this.getExtensionState(ext.id)
        }));
    }
    
    /**
     * Discover installed extensions
     */
    async discoverExtensions() {
        console.log('[Extension Manager] Discovering extensions...');
        
        const installed = await this.marketplace.listInstalledExtensions();
        
        for (const ext of installed) {
            // Load into extension host if enabled
            const state = this.getExtensionState(ext.id);
            
            if (state.enabled || this.autoActivate.has(ext.id)) {
                try {
                    await this.extensionHost.loadExtension(ext.path);
                    console.log(`[Extension Manager] Discovered: ${ext.id}`);
                } catch (error) {
                    console.error(`[Extension Manager] Failed to load ${ext.id}:`, error.message);
                }
            }
        }
    }
    
    /**
     * Auto-activate extensions
     */
    async autoActivateExtensions() {
        console.log('[Extension Manager] Auto-activating extensions...');
        
        for (const extensionId of this.autoActivate) {
            try {
                await this.extensionHost.activateExtension(extensionId);
                console.log(`[Extension Manager] Auto-activated: ${extensionId}`);
            } catch (error) {
                console.error(`[Extension Manager] Failed to auto-activate ${extensionId}:`, error.message);
            }
        }
    }
    
    /**
     * Load configuration
     */
    async loadConfiguration() {
        try {
            const config = JSON.parse(await fs.readFile(this.configPath, 'utf8'));
            
            // Restore extension states
            if (config.extensionStates) {
                this.extensionStates = new Map(Object.entries(config.extensionStates));
            }
            
            // Restore auto-activate list
            if (config.autoActivate) {
                this.autoActivate = new Set(config.autoActivate);
            }
            
            console.log('[Extension Manager] Configuration loaded');
            
        } catch (error) {
            console.log('[Extension Manager] No existing configuration found');
        }
    }
    
    /**
     * Save configuration
     */
    async saveConfiguration() {
        try {
            const config = {
                version: 1,
                extensionStates: Object.fromEntries(this.extensionStates),
                autoActivate: Array.from(this.autoActivate),
                lastSaved: new Date().toISOString()
            };
            
            await fs.mkdir(path.dirname(this.configPath), { recursive: true });
            await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf8');
            
            console.log('[Extension Manager] Configuration saved');
            
        } catch (error) {
            console.error('[Extension Manager] Failed to save configuration:', error);
        }
    }
}

module.exports = ExtensionManager;

