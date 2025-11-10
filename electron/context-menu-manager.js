/**
 * BigDaddyG IDE - Context Menu Manager
 * Manages context menus throughout the IDE
 */

const { Menu } = require('electron');

class ContextMenuManager {
    constructor() {
        this.menus = new Map();
        this.initializeMenus();
        
        console.log('[ContextMenuManager] Initialized');
    }
    
    /**
     * Initialize default context menus
     */
    initializeMenus() {
        // Editor context menu
        this.registerMenu('editor', [
            { label: 'Cut', role: 'cut' },
            { label: 'Copy', role: 'copy' },
            { label: 'Paste', role: 'paste' },
            { type: 'separator' },
            { label: 'Select All', role: 'selectAll' },
            { type: 'separator' },
            { 
                label: 'Format Document', 
                click: () => this.emit('format-document')
            },
            { 
                label: 'Go to Definition', 
                click: () => this.emit('go-to-definition')
            },
            { 
                label: 'Find References', 
                click: () => this.emit('find-references')
            },
            { type: 'separator' },
            { 
                label: 'AI Assist', 
                submenu: [
                    { label: 'Explain Code', click: () => this.emit('ai-explain') },
                    { label: 'Fix Bugs', click: () => this.emit('ai-fix') },
                    { label: 'Refactor', click: () => this.emit('ai-refactor') },
                    { label: 'Add Documentation', click: () => this.emit('ai-document') }
                ]
            }
        ]);
        
        // File explorer context menu
        this.registerMenu('file-explorer', [
            { label: 'New File', click: () => this.emit('new-file') },
            { label: 'New Folder', click: () => this.emit('new-folder') },
            { type: 'separator' },
            { label: 'Open', click: () => this.emit('open-file') },
            { label: 'Rename', click: () => this.emit('rename-file') },
            { label: 'Delete', click: () => this.emit('delete-file') },
            { type: 'separator' },
            { label: 'Copy Path', click: () => this.emit('copy-path') },
            { label: 'Reveal in Explorer', click: () => this.emit('reveal-in-explorer') }
        ]);
        
        // Tab context menu
        this.registerMenu('tab', [
            { label: 'Close', click: () => this.emit('close-tab') },
            { label: 'Close Others', click: () => this.emit('close-other-tabs') },
            { label: 'Close All', click: () => this.emit('close-all-tabs') },
            { type: 'separator' },
            { label: 'Copy Path', click: () => this.emit('copy-path') },
            { label: 'Reveal in Explorer', click: () => this.emit('reveal-in-explorer') }
        ]);
        
        // Terminal context menu
        this.registerMenu('terminal', [
            { label: 'Copy', role: 'copy' },
            { label: 'Paste', role: 'paste' },
            { type: 'separator' },
            { label: 'Clear Terminal', click: () => this.emit('clear-terminal') },
            { label: 'Kill Terminal', click: () => this.emit('kill-terminal') }
        ]);
    }
    
    /**
     * Register a context menu
     */
    registerMenu(name, template) {
        this.menus.set(name, template);
    }
    
    /**
     * Show context menu
     */
    showMenu(name, window, x, y) {
        const template = this.menus.get(name);
        if (!template) {
            console.warn(`[ContextMenuManager] Menu not found: ${name}`);
            return;
        }
        
        const menu = Menu.buildFromTemplate(template);
        menu.popup({ window, x, y });
    }
    
    /**
     * Get menu template
     */
    getMenu(name) {
        return this.menus.get(name);
    }
    
    /**
     * Update menu template
     */
    updateMenu(name, template) {
        this.menus.set(name, template);
    }
    
    /**
     * Event emitter (simplified)
     */
    emit(event, ...args) {
        console.log(`[ContextMenuManager] Event: ${event}`, args);
        // In real implementation, this would trigger actual handlers
    }
}

module.exports = ContextMenuManager;
