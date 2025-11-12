/**
 * BigDaddyG IDE - UI Components
 * Statusbar, breadcrumbs, tooltips, and other UI elements
 */

(function() {
'use strict';

class UIComponents {
    constructor() {
        this.components = {};
        this.tooltips = new Map();
        
        console.log('[UIComponents] Initialized');
    }
    
    /**
     * Initialize all UI components
     */
    initialize() {
        this.createStatusBar();
        this.createBreadcrumbs();
        this.initializeTooltips();
        this.initializeContextMenus();
    }
    
    /**
     * Create status bar
     */
    createStatusBar() {
        let statusBar = document.getElementById('statusbar');
        
        if (!statusBar) {
            statusBar = document.createElement('div');
            statusBar.id = 'statusbar';
            statusBar.className = 'statusbar';
            document.body.appendChild(statusBar);
        }
        
        statusBar.innerHTML = `
            <div class="statusbar-left">
                <span id="status-line-col" class="status-item">Ln 1, Col 1</span>
                <span id="status-language" class="status-item">Plain Text</span>
                <span id="status-encoding" class="status-item">UTF-8</span>
            </div>
            <div class="statusbar-center">
                <span id="status-message" class="status-item"></span>
            </div>
            <div class="statusbar-right">
                <span id="status-git" class="status-item">🔀 main</span>
                <span id="status-errors" class="status-item">⚠️ 0</span>
                <span id="status-warnings" class="status-item">⚡ 0</span>
                <span id="status-notifications" class="status-item">🔔</span>
            </div>
        `;
        
        this.components.statusBar = statusBar;
        this.applyStatusBarStyles();
        
        console.log('[UIComponents] Status bar created');
    }
    
    /**
     * Create breadcrumbs
     */
    createBreadcrumbs() {
        let breadcrumbs = document.getElementById('breadcrumbs');
        
        if (!breadcrumbs) {
            breadcrumbs = document.createElement('div');
            breadcrumbs.id = 'breadcrumbs';
            breadcrumbs.className = 'breadcrumbs';
            
            // Insert after toolbar or at top
            const toolbar = document.querySelector('.toolbar');
            if (toolbar) {
                toolbar.after(breadcrumbs);
            } else {
                document.body.insertBefore(breadcrumbs, document.body.firstChild);
            }
        }
        
        breadcrumbs.innerHTML = `
            <div class="breadcrumb-path">
                <span class="breadcrumb-item">🏠 Home</span>
            </div>
        `;
        
        this.components.breadcrumbs = breadcrumbs;
        this.applyBreadcrumbsStyles();
        
        console.log('[UIComponents] Breadcrumbs created');
    }
    
    /**
     * Initialize tooltips
     */
    initializeTooltips() {
        // Auto-attach tooltips to elements with title attribute
        document.addEventListener('mouseover', (e) => {
            const element = e.target.closest('[title]');
            if (element && element.title) {
                this.showTooltip(element, element.title);
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const element = e.target.closest('[title]');
            if (element) {
                this.hideTooltip(element);
            }
        });
        
        console.log('[UIComponents] Tooltips initialized');
    }
    
    /**
     * Show tooltip
     */
    showTooltip(element, text, options = {}) {
        const { delay = 500, position = 'bottom' } = options;
        
        // Delay showing tooltip
        const timeoutId = setTimeout(() => {
            let tooltip = this.tooltips.get(element);
            
            if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                document.body.appendChild(tooltip);
                this.tooltips.set(element, tooltip);
            }
            
            tooltip.textContent = text;
            tooltip.style.display = 'block';
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            
            switch (position) {
                case 'top':
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.top - 5}px`;
                    tooltip.style.transform = 'translate(-50%, -100%)';
                    break;
                case 'bottom':
                default:
                    tooltip.style.left = `${rect.left + rect.width / 2}px`;
                    tooltip.style.top = `${rect.bottom + 5}px`;
                    tooltip.style.transform = 'translateX(-50%)';
                    break;
                case 'left':
                    tooltip.style.left = `${rect.left - 5}px`;
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.transform = 'translate(-100%, -50%)';
                    break;
                case 'right':
                    tooltip.style.left = `${rect.right + 5}px`;
                    tooltip.style.top = `${rect.top + rect.height / 2}px`;
                    tooltip.style.transform = 'translateY(-50%)';
                    break;
            }
        }, delay);
        
        element.dataset.tooltipTimeout = timeoutId;
    }
    
    /**
     * Hide tooltip
     */
    hideTooltip(element) {
        const timeoutId = element.dataset.tooltipTimeout;
        if (timeoutId) {
            clearTimeout(timeoutId);
            delete element.dataset.tooltipTimeout;
        }
        
        const tooltip = this.tooltips.get(element);
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }
    
    /**
     * Initialize context menus (placeholder)
     */
    initializeContextMenus() {
        // Context menus are handled by context-menu-manager.js
        console.log('[UIComponents] Context menus initialized');
    }
    
    /**
     * Update status bar
     */
    updateStatusBar(updates) {
        if (updates.lineCol) {
            const el = document.getElementById('status-line-col');
            if (el) el.textContent = updates.lineCol;
        }
        
        if (updates.language) {
            const el = document.getElementById('status-language');
            if (el) el.textContent = updates.language;
        }
        
        if (updates.encoding) {
            const el = document.getElementById('status-encoding');
            if (el) el.textContent = updates.encoding;
        }
        
        if (updates.message) {
            const el = document.getElementById('status-message');
            if (el) el.textContent = updates.message;
        }
        
        if (updates.git) {
            const el = document.getElementById('status-git');
            if (el) el.textContent = `🔀 ${updates.git}`;
        }
        
        if (updates.errors !== undefined) {
            const el = document.getElementById('status-errors');
            if (el) el.textContent = `⚠️ ${updates.errors}`;
        }
        
        if (updates.warnings !== undefined) {
            const el = document.getElementById('status-warnings');
            if (el) el.textContent = `⚡ ${updates.warnings}`;
        }
    }
    
    /**
     * Update breadcrumbs
     */
    updateBreadcrumbs(path) {
        const breadcrumbs = this.components.breadcrumbs;
        if (!breadcrumbs) return;
        
        const parts = path.split('/').filter(p => p);
        const breadcrumbPath = breadcrumbs.querySelector('.breadcrumb-path');
        
        breadcrumbPath.innerHTML = `
            <span class="breadcrumb-item">🏠 Home</span>
            ${parts.map((part, index) => `
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-item" data-path="${parts.slice(0, index + 1).join('/')}">${part}</span>
            `).join('')}
        `;
        
        // Add click handlers
        breadcrumbPath.querySelectorAll('.breadcrumb-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                if (path) {
                    console.log('[UIComponents] Navigate to:', path);
                    // Trigger navigation
                }
            });
        });
    }
    
    /**
     * Apply status bar styles
     */
    applyStatusBarStyles() {
        if (document.getElementById('statusbar-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'statusbar-styles';
        style.textContent = `
            .statusbar {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                height: 24px;
                background: #007acc;
                color: #fff;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                font-size: 12px;
                z-index: 1000;
            }
            
            .statusbar-left,
            .statusbar-center,
            .statusbar-right {
                display: flex;
                gap: 15px;
            }
            
            .status-item {
                cursor: pointer;
                padding: 0 5px;
            }
            
            .status-item:hover {
                background: rgba(255,255,255,0.1);
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Apply breadcrumbs styles
     */
    applyBreadcrumbsStyles() {
        if (document.getElementById('breadcrumbs-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'breadcrumbs-styles';
        style.textContent = `
            .breadcrumbs {
                background: #2d2d2d;
                color: #ccc;
                padding: 8px 15px;
                font-size: 13px;
                border-bottom: 1px solid #3c3c3c;
            }
            
            .breadcrumb-path {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .breadcrumb-item {
                cursor: pointer;
                padding: 2px 5px;
                border-radius: 3px;
            }
            
            .breadcrumb-item:hover {
                background: #3e3e3e;
                color: #fff;
            }
            
            .breadcrumb-separator {
                color: #666;
            }
            
            .tooltip {
                position: fixed;
                background: #1e1e1e;
                color: #fff;
                padding: 6px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 10000;
                pointer-events: none;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 1px solid #454545;
            }
        `;
        
        document.head.appendChild(style);
    }
}

// Make available globally
window.UIComponents = UIComponents;

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.uiComponents = new UIComponents();
        window.uiComponents.initialize();
    });
} else {
    window.uiComponents = new UIComponents();
    window.uiComponents.initialize();
}

console.log('[UIComponents] Module loaded');

})();
