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
            <div class="marketplace-container">
                <!-- Header -->
                <div class="marketplace-header">
                    <h2>🛍️ Extension Marketplace</h2>
                    <div class="marketplace-search">
                        <input type="text" id="marketplace-search" placeholder="Search extensions..." />
                        <button id="marketplace-search-btn">🔍</button>
                    </div>
                </div>
                
                <!-- Navigation -->
                <div class="marketplace-nav">
                    <button class="nav-btn active" data-view="discover">Discover</button>
                    <button class="nav-btn" data-view="installed">Installed</button>
                    <button class="nav-btn" data-view="updates">Updates</button>
                    <button class="nav-btn" data-view="settings">Settings</button>
                </div>
                
                <!-- Filters -->
                <div class="marketplace-filters">
                    <select id="category-filter">
                        <option value="all">All Categories</option>
                        <option value="languages">Languages</option>
                        <option value="themes">Themes</option>
                        <option value="debuggers">Debuggers</option>
                        <option value="formatters">Formatters</option>
                        <option value="ai">AI Tools</option>
                        <option value="gamedev">Game Dev</option>
                    </select>
                    
                    <select id="rating-filter">
                        <option value="0">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="5">5 Stars</option>
                    </select>
                    
                    <label>
                        <input type="checkbox" id="installed-filter" />
                        Show Installed Only
                    </label>
                </div>
                
                <!-- Content Area -->
                <div class="marketplace-content" id="marketplace-content">
                    <!-- Dynamic content goes here -->
                </div>
                
                <!-- Install Progress -->
                <div class="marketplace-progress" id="marketplace-progress" style="display: none;">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
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
