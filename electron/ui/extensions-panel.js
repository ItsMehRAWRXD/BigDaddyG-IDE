/**
 * BigDaddyG IDE - Extensions Panel
 * Full VS Code marketplace integration with search, install, manage
 */

const { EventEmitter } = require('events');

class ExtensionsPanel extends EventEmitter {
    constructor(marketplace, extensionManager, extensionHost) {
        super();
        
        this.marketplace = marketplace;
        this.extensionManager = extensionManager;
        this.extensionHost = extensionHost;
        
        this.currentView = 'installed'; // installed, search, updates
        this.searchResults = [];
        this.installedExtensions = [];
        this.availableUpdates = [];
        
        console.log('[Extensions Panel] Initialized');
    }
    
    /**
     * Render the extensions panel HTML
     */
    render() {
        return `
            <div id="extensions-panel" class="panel">
                <div class="panel-header">
                    <h3>🧩 Extensions</h3>
                    <div class="search-box">
                        <input type="text" 
                               id="extension-search-input" 
                               placeholder="Search extensions..."
                               onkeyup="extensionsPanel.handleSearch(this.value)">
                        <button onclick="extensionsPanel.handleSearch(document.getElementById('extension-search-input').value)">
                            🔍
                        </button>
                    </div>
                </div>
                
                <div class="panel-tabs">
                    <button class="tab ${this.currentView === 'installed' ? 'active' : ''}" 
                            onclick="extensionsPanel.switchView('installed')">
                        INSTALLED
                    </button>
                    <button class="tab ${this.currentView === 'search' ? 'active' : ''}" 
                            onclick="extensionsPanel.switchView('search')">
                        MARKETPLACE
                    </button>
                    <button class="tab ${this.currentView === 'updates' ? 'active' : ''}" 
                            onclick="extensionsPanel.switchView('updates')">
                        UPDATES ${this.availableUpdates.length > 0 ? `(${this.availableUpdates.length})` : ''}
                    </button>
                </div>
                
                <div id="extensions-content" class="panel-content">
                    ${this.renderCurrentView()}
                </div>
            </div>
        `;
    }
    
    /**
     * Render current view content
     */
    renderCurrentView() {
        switch (this.currentView) {
            case 'installed':
                return this.renderInstalledExtensions();
            case 'search':
                return this.renderSearchResults();
            case 'updates':
                return this.renderAvailableUpdates();
            default:
                return '<div class="empty-state">Unknown view</div>';
        }
    }
    
    /**
     * Render installed extensions
     */
    renderInstalledExtensions() {
        if (this.installedExtensions.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>No extensions installed</p>
                    <button onclick="extensionsPanel.switchView('search')">
                        Browse Marketplace
                    </button>
                </div>
            `;
        }
        
        return this.installedExtensions.map(ext => `
            <div class="extension-item" data-extension-id="${ext.id}">
                <div class="extension-icon">${ext.icon ? `<img src="${ext.icon}">` : '🧩'}</div>
                <div class="extension-details">
                    <div class="extension-name">${ext.displayName || ext.name}</div>
                    <div class="extension-publisher">by ${ext.publisher}</div>
                    <div class="extension-description">${ext.description || ''}</div>
                    <div class="extension-version">v${ext.version}</div>
                </div>
                <div class="extension-actions">
                    ${ext.state?.enabled ? 
                        `<button class="btn-disable" onclick="extensionsPanel.disableExtension('${ext.id}')">⏸️ Disable</button>` :
                        `<button class="btn-enable" onclick="extensionsPanel.enableExtension('${ext.id}')">▶️ Enable</button>`
                    }
                    <button class="btn-settings" onclick="extensionsPanel.openExtensionSettings('${ext.id}')">⚙️</button>
                    <button class="btn-uninstall" onclick="extensionsPanel.uninstallExtension('${ext.id}')">🗑️</button>
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Render search results
     */
    renderSearchResults() {
        if (this.searchResults.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p>Search for extensions in the VS Code Marketplace</p>
                    <p class="hint">Try: "prettier", "eslint", "python", "amazon q"</p>
                </div>
            `;
        }
        
        return this.searchResults.map(ext => `
            <div class="extension-item marketplace-item" data-extension-id="${ext.id}">
                <div class="extension-icon">${ext.icon ? `<img src="${ext.icon}">` : '🧩'}</div>
                <div class="extension-details">
                    <div class="extension-name">${ext.displayName || ext.name}</div>
                    <div class="extension-publisher">by ${ext.publisher}</div>
                    <div class="extension-description">${ext.shortDescription || ''}</div>
                    <div class="extension-stats">
                        <span class="stat-downloads">⬇️ ${this.formatNumber(ext.installCount)}</span>
                        <span class="stat-rating">⭐ ${ext.averageRating?.toFixed(1) || 'N/A'}</span>
                        <span class="stat-version">v${ext.version}</span>
                    </div>
                </div>
                <div class="extension-actions">
                    ${this.isInstalled(ext.id) ?
                        `<button class="btn-installed" disabled>✅ Installed</button>` :
                        `<button class="btn-install" onclick="extensionsPanel.installExtension('${ext.id}')">📥 Install</button>`
                    }
                </div>
            </div>
        `).join('');
    }
    
    /**
     * Render available updates
     */
    renderAvailableUpdates() {
        if (this.availableUpdates.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">✅</div>
                    <p>All extensions are up to date</p>
                </div>
            `;
        }
        
        return `
            <div class="updates-header">
                <button class="btn-update-all" onclick="extensionsPanel.updateAllExtensions()">
                    ⬆️ Update All (${this.availableUpdates.length})
                </button>
            </div>
            ${this.availableUpdates.map(update => `
                <div class="extension-item update-item" data-extension-id="${update.extensionId}">
                    <div class="extension-icon">🧩</div>
                    <div class="extension-details">
                        <div class="extension-name">${update.extensionId}</div>
                        <div class="extension-version-change">
                            ${update.currentVersion} → ${update.latestVersion}
                        </div>
                    </div>
                    <div class="extension-actions">
                        <button class="btn-update" onclick="extensionsPanel.updateExtension('${update.extensionId}')">
                            ⬆️ Update
                        </button>
                    </div>
                </div>
            `).join('')}
        `;
    }
    
    /**
     * Handle search
     */
    async handleSearch(query) {
        if (!query || query.trim().length === 0) {
            this.searchResults = [];
            this.updateView();
            return;
        }
        
        console.log(`[Extensions Panel] Searching for: ${query}`);
        this.switchView('search');
        
        try {
            this.searchResults = await this.marketplace.searchExtensions(query);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Search failed:', error);
            this.showError('Search failed: ' + error.message);
        }
    }
    
    /**
     * Install extension
     */
    async installExtension(extensionId) {
        console.log(`[Extensions Panel] Installing: ${extensionId}`);
        
        try {
            this.showProgress(`Installing ${extensionId}...`);
            await this.extensionManager.installExtension(extensionId);
            await this.refreshInstalledExtensions();
            this.showSuccess(`${extensionId} installed successfully`);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Install failed:', error);
            this.showError(`Installation failed: ${error.message}`);
        }
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId) {
        if (!confirm(`Uninstall ${extensionId}?`)) {
            return;
        }
        
        console.log(`[Extensions Panel] Uninstalling: ${extensionId}`);
        
        try {
            this.showProgress(`Uninstalling ${extensionId}...`);
            await this.extensionManager.uninstallExtension(extensionId);
            await this.refreshInstalledExtensions();
            this.showSuccess(`${extensionId} uninstalled successfully`);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Uninstall failed:', error);
            this.showError(`Uninstall failed: ${error.message}`);
        }
    }
    
    /**
     * Enable extension
     */
    async enableExtension(extensionId) {
        console.log(`[Extensions Panel] Enabling: ${extensionId}`);
        
        try {
            await this.extensionManager.enableExtension(extensionId);
            await this.refreshInstalledExtensions();
            this.showSuccess(`${extensionId} enabled`);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Enable failed:', error);
            this.showError(`Enable failed: ${error.message}`);
        }
    }
    
    /**
     * Disable extension
     */
    async disableExtension(extensionId) {
        console.log(`[Extensions Panel] Disabling: ${extensionId}`);
        
        try {
            await this.extensionManager.disableExtension(extensionId);
            await this.refreshInstalledExtensions();
            this.showSuccess(`${extensionId} disabled`);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Disable failed:', error);
            this.showError(`Disable failed: ${error.message}`);
        }
    }
    
    /**
     * Update extension
     */
    async updateExtension(extensionId) {
        console.log(`[Extensions Panel] Updating: ${extensionId}`);
        
        try {
            this.showProgress(`Updating ${extensionId}...`);
            await this.extensionManager.updateExtension(extensionId);
            await this.refreshInstalledExtensions();
            await this.checkForUpdates();
            this.showSuccess(`${extensionId} updated successfully`);
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Update failed:', error);
            this.showError(`Update failed: ${error.message}`);
        }
    }
    
    /**
     * Update all extensions
     */
    async updateAllExtensions() {
        console.log('[Extensions Panel] Updating all extensions...');
        
        try {
            this.showProgress('Updating all extensions...');
            const results = await this.extensionManager.updateAllExtensions();
            
            const succeeded = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;
            
            await this.refreshInstalledExtensions();
            await this.checkForUpdates();
            
            if (failed === 0) {
                this.showSuccess(`All ${succeeded} extension(s) updated successfully`);
            } else {
                this.showWarning(`${succeeded} updated, ${failed} failed`);
            }
            
            this.updateView();
        } catch (error) {
            console.error('[Extensions Panel] Update all failed:', error);
            this.showError(`Update all failed: ${error.message}`);
        }
    }
    
    /**
     * Switch view
     */
    switchView(view) {
        this.currentView = view;
        this.updateView();
    }
    
    /**
     * Update view
     */
    updateView() {
        const contentElement = document.getElementById('extensions-content');
        if (contentElement) {
            contentElement.innerHTML = this.renderCurrentView();
        }
        
        // Update tab active states
        document.querySelectorAll('.panel-tabs .tab').forEach((tab, index) => {
            const views = ['installed', 'search', 'updates'];
            tab.classList.toggle('active', views[index] === this.currentView);
        });
    }
    
    /**
     * Refresh installed extensions
     */
    async refreshInstalledExtensions() {
        this.installedExtensions = await this.extensionManager.listExtensionsWithStates();
    }
    
    /**
     * Check for updates
     */
    async checkForUpdates() {
        this.availableUpdates = await this.extensionManager.checkForUpdates();
    }
    
    /**
     * Check if extension is installed
     */
    isInstalled(extensionId) {
        return this.installedExtensions.some(ext => ext.id === extensionId);
    }
    
    /**
     * Format number
     */
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
    
    /**
     * Show progress message
     */
    showProgress(message) {
        this.emit('show-message', { type: 'info', message });
    }
    
    /**
     * Show success message
     */
    showSuccess(message) {
        this.emit('show-message', { type: 'success', message });
    }
    
    /**
     * Show warning message
     */
    showWarning(message) {
        this.emit('show-message', { type: 'warning', message });
    }
    
    /**
     * Show error message
     */
    showError(message) {
        this.emit('show-message', { type: 'error', message });
    }
    
    /**
     * Open extension settings
     */
    openExtensionSettings(extensionId) {
        console.log(`[Extensions Panel] Opening settings for: ${extensionId}`);
        this.emit('open-settings', { extensionId });
    }
}

module.exports = ExtensionsPanel;

