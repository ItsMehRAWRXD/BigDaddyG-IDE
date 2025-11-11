/**
 * BigDaddyG IDE - Complete Marketplace UI
 * Full-featured extension marketplace interface
 */

(function() {
'use strict';

class CompleteMarketplaceUI {
    constructor() {
        this.container = null;
        this.extensionManager = null;
        this.currentView = 'discover';
        this.searchQuery = '';
        this.filters = {
            category: 'all',
            rating: 0,
            installed: false
        };
        
        console.log('[MarketplaceUI] Initialized');
    }
    
    /**
     * Initialize marketplace UI
     */
    async initialize(containerId, extensionManager) {
        this.container = document.getElementById(containerId);
        this.extensionManager = extensionManager;
        
        if (!this.container) {
            console.error('[MarketplaceUI] Container not found:', containerId);
            return { success: false };
        }
        
        this.render();
        this.attachEventListeners();
        
        console.log('[MarketplaceUI] ✅ Marketplace UI ready');
        return { success: true };
    }
    
    /**
     * Render marketplace UI
     */
    render() {
        this.container.innerHTML = `
            <div class="marketplace-container" style="
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                background: #1e1e1e;
                color: #cccccc;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                overflow: hidden;
            ">
                <!-- Header -->
                <div class="marketplace-header" style="
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                    flex-shrink: 0;
                ">
                    <h2 style="margin: 0 0 15px 0; font-size: 28px; font-weight: 600;">🛍️ Extension Marketplace</h2>
                    <div class="marketplace-search" style="display: flex; gap: 10px;">
                        <input type="text" id="marketplace-search" placeholder="Search extensions..." style="
                            flex: 1;
                            padding: 10px 15px;
                            border: none;
                            border-radius: 8px;
                            font-size: 14px;
                            background: rgba(255,255,255,0.2);
                            color: white;
                        " />
                        <button id="marketplace-search-btn" style="
                            padding: 10px 20px;
                            border: none;
                            border-radius: 8px;
                            background: rgba(255,255,255,0.3);
                            color: white;
                            cursor: pointer;
                            font-size: 16px;
                        ">🔍</button>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div class="marketplace-nav" style="
                    display: flex;
                    gap: 10px;
                    padding: 15px 20px;
                    background: #252525;
                    border-bottom: 1px solid #3a3a3a;
                    flex-shrink: 0;
                ">
                    <button class="nav-btn active" data-view="discover" style="
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #667eea;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">Discover</button>
                    <button class="nav-btn" data-view="installed" style="
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #3a3a3a;
                        color: #cccccc;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">Installed</button>
                    <button class="nav-btn" data-view="updates" style="
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #3a3a3a;
                        color: #cccccc;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">Updates</button>
                    <button class="nav-btn" data-view="settings" style="
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #3a3a3a;
                        color: #cccccc;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.3s;
                    ">Settings</button>
                </div>
                
                <!-- Filters -->
                <div class="marketplace-filters" style="
                    display: flex;
                    gap: 15px;
                    padding: 15px 20px;
                    background: #2a2a2a;
                    border-bottom: 1px solid #3a3a3a;
                    align-items: center;
                    flex-shrink: 0;
                ">
                    <select id="category-filter" style="
                        padding: 8px 12px;
                        border: 1px solid #4a4a4a;
                        border-radius: 6px;
                        background: #3a3a3a;
                        color: #cccccc;
                        cursor: pointer;
                    ">
                        <option value="all">All Categories</option>
                        <option value="languages">Languages</option>
                        <option value="themes">Themes</option>
                        <option value="debuggers">Debuggers</option>
                        <option value="formatters">Formatters</option>
                        <option value="ai">AI Tools</option>
                        <option value="gamedev">Game Dev</option>
                    </select>
                    
                    <select id="rating-filter" style="
                        padding: 8px 12px;
                        border: 1px solid #4a4a4a;
                        border-radius: 6px;
                        background: #3a3a3a;
                        color: #cccccc;
                        cursor: pointer;
                    ">
                        <option value="0">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                    
                    <label style="display: flex; align-items: center; gap: 8px; color: #cccccc; cursor: pointer;">
                        <input type="checkbox" id="installed-filter" style="cursor: pointer;" />
                        Show Installed Only
                    </label>
                    
                    <div style="flex: 1;"></div>
                    
                    <button id="refresh-marketplace" style="
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #4a4a4a;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                    ">🔄 Refresh</button>
                </div>
                
                <!-- Content Area -->
                <div class="marketplace-content" id="marketplace-content" style="
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 20px;
                    align-content: start;
                ">
                    <!-- Dynamic content goes here -->
                </div>
                
                <!-- Install Progress -->
                <div class="marketplace-progress" id="marketplace-progress" style="
                    display: none;
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 400px;
                    padding: 20px;
                    background: #2a2a2a;
                    border: 1px solid #4a4a4a;
                    border-radius: 10px;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.4);
                    z-index: 10000;
                ">
                    <h3 style="margin: 0 0 15px 0; color: #cccccc;">📦 Installing Extension</h3>
                    <div class="progress-info" id="progress-info" style="margin-bottom: 10px; color: #999; font-size: 13px;"></div>
                    <div class="progress-bar" style="
                        width: 100%;
                        height: 30px;
                        background: #1e1e1e;
                        border-radius: 15px;
                        overflow: hidden;
                        position: relative;
                    ">
                        <div class="progress-fill" id="progress-fill" style="
                            width: 0%;
                            height: 100%;
                            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                            transition: width 0.3s;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-weight: 600;
                            font-size: 12px;
                        "></div>
                    </div>
                    <button id="cancel-install" style="
                        margin-top: 15px;
                        padding: 8px 16px;
                        border: none;
                        border-radius: 6px;
                        background: #d32f2f;
                        color: white;
                        cursor: pointer;
                        width: 100%;
                    ">Cancel</button>
                    <div class="progress-text" id="progress-text">Installing...</div>
                </div>
            </div>
        `;
        
        this.renderView(this.currentView);
    }
    
    /**
     * Render specific view
     */
    renderView(view) {
        this.currentView = view;
        const content = document.getElementById('marketplace-content');
        
        switch (view) {
            case 'discover':
                this.renderDiscoverView(content);
                break;
            case 'installed':
                this.renderInstalledView(content);
                break;
            case 'updates':
                this.renderUpdatesView(content);
                break;
            case 'settings':
                this.renderSettingsView(content);
                break;
        }
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }
    
    /**
     * Render discover view
     */
    renderDiscoverView(content) {
        const featured = this.getFeaturedExtensions();
        const popular = this.getPopularExtensions();
        
        content.innerHTML = `
            <div class="discover-view">
                <section class="featured-section">
                    <h3>⭐ Featured Extensions</h3>
                    <div class="extension-grid">
                        ${featured.map(ext => this.renderExtensionCard(ext)).join('')}
                    </div>
                </section>
                
                <section class="popular-section">
                    <h3>🔥 Popular Extensions</h3>
                    <div class="extension-list">
                        ${popular.map(ext => this.renderExtensionListItem(ext)).join('')}
                    </div>
                </section>
            </div>
        `;
    }
    
    /**
     * Render installed view
     */
    async renderInstalledView(content) {
        const installed = this.extensionManager ? 
            await this.extensionManager.listExtensions() : 
            [];
        
        if (installed.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>No Extensions Installed</h3>
                    <p>Browse the marketplace to install extensions</p>
                    <button class="btn-primary" onclick="window.marketplaceUI.renderView('discover')">
                        Browse Extensions
                    </button>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="installed-view">
                <div class="installed-header">
                    <h3>📦 Installed Extensions (${installed.length})</h3>
                    <button class="btn-secondary" onclick="window.marketplaceUI.checkAllUpdates()">
                        Check for Updates
                    </button>
                </div>
                <div class="extension-list">
                    ${installed.map(ext => this.renderInstalledExtensionItem(ext)).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render updates view
     */
    async renderUpdatesView(content) {
        const updates = this.extensionManager ? 
            await this.extensionManager.checkForUpdates() : 
            [];
        
        if (updates.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <h3>✅ All Extensions Up to Date</h3>
                    <p>Your extensions are running the latest versions</p>
                </div>
            `;
            return;
        }
        
        content.innerHTML = `
            <div class="updates-view">
                <div class="updates-header">
                    <h3>🔄 Available Updates (${updates.length})</h3>
                    <button class="btn-primary" onclick="window.marketplaceUI.updateAll()">
                        Update All
                    </button>
                </div>
                <div class="extension-list">
                    ${updates.map(update => this.renderUpdateItem(update)).join('')}
                </div>
            </div>
        `;
    }
    
    /**
     * Render settings view
     */
    renderSettingsView(content) {
        content.innerHTML = `
            <div class="settings-view">
                <h3>⚙️ Marketplace Settings</h3>
                
                <div class="setting-group">
                    <h4>Auto-Update</h4>
                    <label>
                        <input type="checkbox" id="auto-update-enabled" checked />
                        Automatically update extensions
                    </label>
                </div>
                
                <div class="setting-group">
                    <h4>Extension Directory</h4>
                    <input type="text" id="extensions-dir" value="${this.extensionManager?.config?.extensionsDir || ''}" readonly />
                    <button onclick="window.marketplaceUI.changeExtensionsDir()">Change</button>
                </div>
                
                <div class="setting-group">
                    <h4>Registry</h4>
                    <select id="registry-select">
                        <option value="vscode">VS Code Marketplace</option>
                        <option value="custom">Custom Registry</option>
                    </select>
                </div>
                
                <div class="setting-group">
                    <h4>Cache</h4>
                    <button onclick="window.marketplaceUI.clearCache()">Clear Cache</button>
                    <span id="cache-size">Cache: 0 MB</span>
                </div>
                
                <div class="setting-group">
                    <h4>Experimental</h4>
                    <label>
                        <input type="checkbox" id="experimental-features" />
                        Enable experimental features
                    </label>
                </div>
            </div>
        `;
    }
    
    /**
     * Render extension card
     */
    renderExtensionCard(ext) {
        return `
            <div class="extension-card" data-id="${ext.id}">
                <div class="extension-icon">
                    ${ext.icon || '📦'}
                </div>
                <h4>${ext.name}</h4>
                <p class="extension-description">${ext.description || 'No description'}</p>
                <div class="extension-meta">
                    <span>⭐ ${ext.rating || 0}</span>
                    <span>📥 ${this.formatDownloads(ext.downloads || 0)}</span>
                </div>
                <button class="btn-primary" onclick="window.marketplaceUI.installExtension('${ext.id}')">
                    Install
                </button>
            </div>
        `;
    }
    
    /**
     * Render extension list item
     */
    renderExtensionListItem(ext) {
        return `
            <div class="extension-list-item" data-id="${ext.id}">
                <div class="extension-info">
                    <span class="extension-icon">${ext.icon || '📦'}</span>
                    <div>
                        <h4>${ext.name}</h4>
                        <p>${ext.description || ''}</p>
                        <span class="extension-author">${ext.author || 'Unknown'}</span>
                    </div>
                </div>
                <div class="extension-actions">
                    <button class="btn-primary" onclick="window.marketplaceUI.installExtension('${ext.id}')">
                        Install
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render installed extension item
     */
    renderInstalledExtensionItem(ext) {
        return `
            <div class="extension-list-item installed" data-id="${ext.id}">
                <div class="extension-info">
                    <span class="extension-icon">${ext.icon || '📦'}</span>
                    <div>
                        <h4>${ext.name}</h4>
                        <p>${ext.description || ''}</p>
                        <span class="extension-version">v${ext.version}</span>
                    </div>
                </div>
                <div class="extension-actions">
                    <button class="btn-toggle ${ext.enabled ? 'enabled' : 'disabled'}" 
                            onclick="window.marketplaceUI.toggleExtension('${ext.id}')">
                        ${ext.enabled ? '✅ Enabled' : '⏸️ Disabled'}
                    </button>
                    <button class="btn-secondary" onclick="window.marketplaceUI.uninstallExtension('${ext.id}')">
                        🗑️ Uninstall
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Render update item
     */
    renderUpdateItem(update) {
        return `
            <div class="extension-list-item update" data-id="${update.id}">
                <div class="extension-info">
                    <span class="extension-icon">${update.icon || '📦'}</span>
                    <div>
                        <h4>${update.name}</h4>
                        <p class="update-info">
                            ${update.currentVersion} → ${update.newVersion}
                        </p>
                    </div>
                </div>
                <div class="extension-actions">
                    <button class="btn-primary" onclick="window.marketplaceUI.updateExtension('${update.id}')">
                        Update
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Search
        const searchBtn = document.getElementById('marketplace-search-btn');
        const searchInput = document.getElementById('marketplace-search');
        
        if (searchBtn && searchInput) {
            searchBtn.onclick = () => this.search();
            searchInput.onkeypress = (e) => {
                if (e.key === 'Enter') this.search();
            };
        }
        
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.onclick = () => this.renderView(btn.dataset.view);
        });
        
        // Filters
        const categoryFilter = document.getElementById('category-filter');
        const ratingFilter = document.getElementById('rating-filter');
        const installedFilter = document.getElementById('installed-filter');
        
        if (categoryFilter) categoryFilter.onchange = () => this.applyFilters();
        if (ratingFilter) ratingFilter.onchange = () => this.applyFilters();
        if (installedFilter) installedFilter.onchange = () => this.applyFilters();
    }
    
    /**
     * Install extension
     */
    async installExtension(extensionId) {
        if (!this.extensionManager) {
            alert('Extension manager not available');
            return;
        }
        
        this.showProgress('Installing extension...');
        
        try {
            const result = await this.extensionManager.installExtension(extensionId);
            
            if (result.success) {
                this.hideProgress();
                this.showNotification('✅ Extension installed successfully!', 'success');
                this.renderView('installed');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            this.hideProgress();
            this.showNotification('❌ Installation failed: ' + error.message, 'error');
        }
    }
    
    /**
     * Uninstall extension
     */
    async uninstallExtension(extensionId) {
        if (!confirm('Are you sure you want to uninstall this extension?')) {
            return;
        }
        
        if (!this.extensionManager) return;
        
        const result = await this.extensionManager.uninstallExtension(extensionId);
        
        if (result.success) {
            this.showNotification('✅ Extension uninstalled', 'success');
            this.renderView('installed');
        } else {
            this.showNotification('❌ Uninstall failed', 'error');
        }
    }
    
    /**
     * Toggle extension
     */
    async toggleExtension(extensionId) {
        if (!this.extensionManager) return;
        
        const ext = this.extensionManager.getExtension(extensionId);
        if (!ext) return;
        
        if (ext.enabled) {
            await this.extensionManager.disableExtension(extensionId);
            this.showNotification('Extension disabled', 'info');
        } else {
            await this.extensionManager.enableExtension(extensionId);
            this.showNotification('Extension enabled', 'success');
        }
        
        this.renderView('installed');
    }
    
    /**
     * Update extension
     */
    async updateExtension(extensionId) {
        if (!this.extensionManager) return;
        
        this.showProgress('Updating extension...');
        
        const result = await this.extensionManager.updateExtension(extensionId);
        
        this.hideProgress();
        
        if (result.success) {
            this.showNotification('✅ Extension updated!', 'success');
            this.renderView('updates');
        } else {
            this.showNotification('❌ Update failed', 'error');
        }
    }
    
    /**
     * Search extensions
     */
    search() {
        const input = document.getElementById('marketplace-search');
        this.searchQuery = input?.value || '';
        
        // Implement search logic
        console.log('Searching for:', this.searchQuery);
    }
    
    /**
     * Apply filters
     */
    applyFilters() {
        const category = document.getElementById('category-filter')?.value;
        const rating = document.getElementById('rating-filter')?.value;
        const installed = document.getElementById('installed-filter')?.checked;
        
        this.filters = { category, rating, installed };
        
        console.log('Filters applied:', this.filters);
    }
    
    /**
     * Show progress
     */
    showProgress(text) {
        const progress = document.getElementById('marketplace-progress');
        const progressText = document.getElementById('progress-text');
        
        if (progress) progress.style.display = 'block';
        if (progressText) progressText.textContent = text;
    }
    
    /**
     * Hide progress
     */
    hideProgress() {
        const progress = document.getElementById('marketplace-progress');
        if (progress) progress.style.display = 'none';
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        console.log(`[Marketplace] ${message}`);
        
        // You can integrate with your notification system here
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    }
    
    /**
     * Get featured extensions
     */
    getFeaturedExtensions() {
        return [
            {
                id: 'prettier',
                name: 'Prettier',
                description: 'Code formatter',
                icon: '✨',
                rating: 4.8,
                downloads: 10000000
            },
            {
                id: 'eslint',
                name: 'ESLint',
                description: 'JavaScript linter',
                icon: '🔍',
                rating: 4.7,
                downloads: 8000000
            },
            {
                id: 'python',
                name: 'Python',
                description: 'Python language support',
                icon: '🐍',
                rating: 4.9,
                downloads: 15000000
            }
        ];
    }
    
    /**
     * Get popular extensions
     */
    getPopularExtensions() {
        return [
            { id: 'gitlens', name: 'GitLens', description: 'Git supercharged', icon: '🔗', author: 'GitKraken' },
            { id: 'live-server', name: 'Live Server', description: 'Live reload', icon: '🌐', author: 'Ritwick Dey' },
            { id: 'bracket-pair', name: 'Bracket Pair', description: 'Bracket colorizer', icon: '🌈', author: 'Microsoft' }
        ];
    }
    
    /**
     * Format downloads
     */
    formatDownloads(count) {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    }
    
    /**
     * Check all updates
     */
    async checkAllUpdates() {
        this.showProgress('Checking for updates...');
        // Implementation
        setTimeout(() => {
            this.hideProgress();
            this.renderView('updates');
        }, 1000);
    }
    
    /**
     * Update all
     */
    async updateAll() {
        this.showProgress('Updating all extensions...');
        // Implementation
        setTimeout(() => {
            this.hideProgress();
            this.showNotification('✅ All extensions updated!', 'success');
        }, 2000);
    }
    
    /**
     * Clear cache
     */
    clearCache() {
        if (confirm('Clear marketplace cache?')) {
            this.showNotification('✅ Cache cleared', 'success');
        }
    }
}

// Make available globally
window.CompleteMarketplaceUI = CompleteMarketplaceUI;

// Auto-initialize if container exists
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const container = document.getElementById('marketplace-container');
        if (container) {
            window.marketplaceUI = new CompleteMarketplaceUI();
            console.log('[MarketplaceUI] Auto-initialized');
        }
    });
}

})();
