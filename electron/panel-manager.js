/**
 * Panel Manager for BigDaddyG IDE
 * 
 * Central layout management system for all panels
 * - Coordinates console, terminal, browser, explorer, and chat panels
 * - Manages z-index ordering to prevent overlaps
 * - Centralizes hotkey handling to prevent conflicts
 * - Provides state persistence
 */

(function() {
'use strict';

class PanelManager {
    constructor() {
        // Z-index coordination (from lowest to highest)
        this.zIndexLevels = {
            base: 1000,           // Base editor/content
            explorer: 1001,       // Left sidebar
            chat: 1002,           // Right sidebar
            console: 10000,       // Bottom console panel
            terminal: 10001,      // Bottom terminal panel (above console)
            browser: 10002        // Full overlay browser (highest)
        };
        
        this.panels = {
            explorer: { element: 'sidebar', visible: true, hotkey: 'Ctrl+B', instance: null },
            chat: { element: 'right-sidebar', visible: true, hotkey: 'Ctrl+Shift+/', instance: null },
            console: { element: null, visible: false, hotkey: 'Ctrl+`', instance: null },
            terminal: { element: null, visible: false, hotkey: 'Ctrl+J', instance: null },
            browser: { element: null, visible: false, hotkey: 'Ctrl+Shift+B', instance: null }
        };
        
        // Track which panel instances have registered
        this.registeredInstances = new Set();
        
        console.log('[PanelManager] 🎯 Initializing centralized panel manager...');
        this.init();
    }
    
    init() {
        // Create toggle buttons in title bar
        this.createQuickToggles();
        
        // Register keyboard shortcuts (centralized)
        this.registerShortcuts();
        
        // Add View menu
        this.createViewMenu();
        
        // Apply z-index coordination
        this.applyZIndexes();
        
        // Load saved panel states
        this.loadPanelStates();
        
        console.log('[PanelManager] ✅ Centralized panel manager ready!');
        console.log('[PanelManager] 💡 Keyboard shortcuts:');
        console.log('  • Ctrl+B → Explorer');
        console.log('  • Ctrl+Shift+/ → Chat');
        console.log('  • Ctrl+` → Console');
        console.log('  • Ctrl+J → Terminal');
        console.log('  • Ctrl+Shift+B → Browser');
        console.log('  • F11 → Full Screen');
    }
    
    /**
     * Register panel instance for centralized management
     */
    registerPanelInstance(panelName, instance) {
        if (!this.panels[panelName]) {
            console.warn(`[PanelManager] ⚠️ Unknown panel: ${panelName}`);
            return;
        }
        
        this.panels[panelName].instance = instance;
        this.registeredInstances.add(panelName);
        
        // Apply z-index to the panel
        if (instance.panel) {
            instance.panel.style.zIndex = this.zIndexLevels[panelName];
        }
        
        console.log(`[PanelManager] ✅ Registered ${panelName} panel (z-index: ${this.zIndexLevels[panelName]})`);
    }
    
    /**
     * Apply z-index coordination to all panels
     */
    applyZIndexes() {
        // Apply to static panels
        const explorer = document.getElementById('sidebar');
        if (explorer) explorer.style.zIndex = this.zIndexLevels.explorer;
        
        const chat = document.getElementById('right-sidebar');
        if (chat) chat.style.zIndex = this.zIndexLevels.chat;
        
        // Dynamic panels will get their z-index when they register
        console.log('[PanelManager] 🎨 Applied z-index coordination');
    }
    
    /**
     * Load panel states from localStorage
     */
    loadPanelStates() {
        try {
            const saved = localStorage.getItem('bigdaddyg-panel-states');
            if (saved) {
                const states = JSON.parse(saved);
                Object.keys(states).forEach(panelName => {
                    if (this.panels[panelName]) {
                        this.panels[panelName].visible = states[panelName];
                    }
                });
                console.log('[PanelManager] 💾 Loaded panel states');
            }
        } catch (error) {
            console.warn('[PanelManager] ⚠️ Failed to load panel states:', error);
        }
    }
    
    /**
     * Save panel states to localStorage
     */
    savePanelStates() {
        try {
            const states = {};
            Object.keys(this.panels).forEach(panelName => {
                states[panelName] = this.panels[panelName].visible;
            });
            localStorage.setItem('bigdaddyg-panel-states', JSON.stringify(states));
        } catch (error) {
            console.warn('[PanelManager] ⚠️ Failed to save panel states:', error);
        }
    }
    
    createQuickToggles() {
        const titleBar = document.getElementById('title-bar');
        if (!titleBar) return;
        
        // Create toggle container
        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText = `
            display: flex;
            gap: 4px;
            align-items: center;
            margin-left: 20px;
        `;
        
        // Explorer toggle
        const explorerBtn = this.createToggleButton('📁', 'Toggle Explorer (Ctrl+B)', () => this.togglePanel('explorer'));
        
        // Chat toggle
        const chatBtn = this.createToggleButton('💬', 'Toggle Chat (Ctrl+Shift+/)', () => this.togglePanel('chat'));
        
        // Console toggle
        const consoleBtn = this.createToggleButton('🖥️', 'Toggle Console (Ctrl+`)', () => this.togglePanel('console'));
        
        // Terminal toggle
        const terminalBtn = this.createToggleButton('💻', 'Toggle Terminal (Ctrl+J)', () => this.togglePanel('terminal'));
        
        // Browser toggle
        const browserBtn = this.createToggleButton('🌐', 'Toggle Browser (Ctrl+Shift+B)', () => this.togglePanel('browser'));
        
        // Full screen toggle
        const fullScreenBtn = this.createToggleButton('⛶', 'Full Screen Editor (F11)', () => this.toggleFullScreen());
        
        toggleContainer.appendChild(explorerBtn);
        toggleContainer.appendChild(chatBtn);
        toggleContainer.appendChild(consoleBtn);
        toggleContainer.appendChild(terminalBtn);
        toggleContainer.appendChild(browserBtn);
        toggleContainer.appendChild(fullScreenBtn);
        
        // Insert after title
        const title = titleBar.querySelector('.title');
        if (title) {
            titleBar.insertBefore(toggleContainer, title.nextSibling);
        }
    }
    
    createToggleButton(icon, title, onclick) {
        const btn = document.createElement('button');
        btn.textContent = icon;
        btn.title = title;
        btn.onclick = onclick;
        btn.style.cssText = `
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            color: var(--cyan);
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: all 0.2s;
            -webkit-app-region: no-drag;
        `;
        
        btn.onmouseenter = () => {
            btn.style.background = 'rgba(0, 212, 255, 0.2)';
            btn.style.borderColor = 'var(--cyan)';
        };
        
        btn.onmouseleave = () => {
            btn.style.background = 'rgba(0, 212, 255, 0.1)';
            btn.style.borderColor = 'rgba(0, 212, 255, 0.3)';
        };
        
        return btn;
    }
    
    togglePanel(panelName) {
        const panel = this.panels[panelName];
        if (!panel) {
            console.warn(`[PanelManager] ⚠️ Panel "${panelName}" not found`);
            return false;
        }

        // Use instance methods if available (console, terminal, browser)
        if (panel.instance) {
            if (typeof panel.instance.toggle === 'function') {
                panel.instance.toggle();
                panel.visible = panel.instance.isVisible;
                this.savePanelStates();
                return true;
            }
        }

        // Fallback for DOM-based panels (explorer, chat)
        const element = document.getElementById(panel.element);
        if (!element) {
            console.warn(`[PanelManager] ⚠️ Element "${panel.element}" not found for panel "${panelName}"`);
            return false;
        }
        
        try {
            panel.visible = !panel.visible;
            
            if (panel.visible) {
                element.classList.remove('collapsed');
                element.style.display = 'flex';
                element.style.width = '';
                element.style.opacity = '1';
                element.style.pointerEvents = 'auto';
                console.log(`[PanelManager] ✅ ${panelName} shown`);
                window.showNotification?.(`✅ ${panelName}`, 'Shown', 'info', 1500);

                if (panelName === 'chat') {
                    const chatInput = document.getElementById('ai-input');
                    if (chatInput) {
                        setTimeout(() => {
                            chatInput.focus();
                            chatInput.selectionStart = chatInput.selectionEnd = chatInput.value.length;
                        }, 0);
                    }
                }
            } else {
                element.classList.add('collapsed');
                element.style.width = '0px';
                element.style.minWidth = '0px';
                element.style.opacity = '0';
                element.style.pointerEvents = 'none';
                element.style.overflow = 'hidden';
                console.log(`[PanelManager] ✅ ${panelName} hidden`);
                window.showNotification?.(`✅ ${panelName}`, 'Hidden', 'info', 1500);
            }
            
            this.savePanelStates();
            return true;
        } catch (error) {
            console.error(`[PanelManager] ❌ Error toggling ${panelName}:`, error);
            return false;
        }
    }
    
    toggleFullScreen() {
        // Hide/show all panels except editor
        const allHidden = !this.panels.explorer.visible && 
                         !this.panels.chat.visible && 
                         !this.panels.console.visible &&
                         !this.panels.terminal.visible &&
                         !this.panels.browser.visible;
        
        if (allHidden) {
            // Restore all panels to previous state
            this.panels.explorer.visible = true;
            this.panels.chat.visible = true;
            this.togglePanel('explorer');
            this.togglePanel('chat');
            console.log('[PanelManager] 🖥️ Normal view restored');
            window.showNotification?.('🖥️ Normal View', 'All panels restored', 'info', 2000);
        } else {
            // Hide all panels for full screen editing
            if (this.panels.explorer.visible) this.togglePanel('explorer');
            if (this.panels.chat.visible) this.togglePanel('chat');
            if (this.panels.console.visible) this.togglePanel('console');
            if (this.panels.terminal.visible) this.togglePanel('terminal');
            if (this.panels.browser.visible) this.togglePanel('browser');
            console.log('[PanelManager] 🖥️ FULL SCREEN editor mode!');
            window.showNotification?.('🖥️ Full Screen', 'All panels hidden', 'info', 2000);
        }
    }
    
    registerShortcuts() {
        // Centralized keyboard shortcut handler
        document.addEventListener('keydown', (e) => {
            // Prevent default handling if we're going to handle it
            let handled = false;
            
            // Ctrl+B - Toggle Explorer
            if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'b') {
                e.preventDefault();
                this.togglePanel('explorer');
                handled = true;
            }
            
            // Ctrl+Shift+/ - Toggle Chat
            else if (e.ctrlKey && e.shiftKey && !e.altKey && e.key === '/') {
                e.preventDefault();
                this.togglePanel('chat');
                handled = true;
            }
            
            // Ctrl+` - Toggle Console
            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === '`') {
                e.preventDefault();
                this.togglePanel('console');
                handled = true;
            }
            
            // Ctrl+J - Toggle Terminal
            else if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'j') {
                e.preventDefault();
                this.togglePanel('terminal');
                handled = true;
            }
            
            // Ctrl+Shift+B - Toggle Browser
            else if (e.ctrlKey && e.shiftKey && !e.altKey && e.key === 'B') {
                e.preventDefault();
                this.togglePanel('browser');
                handled = true;
            }
            
            // F11 - Full Screen
            else if (!e.ctrlKey && !e.shiftKey && !e.altKey && e.key === 'F11') {
                e.preventDefault();
                this.toggleFullScreen();
                handled = true;
            }
            
            if (handled) {
                // Stop propagation to prevent panel-specific handlers from interfering
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
        }, true); // Use capture phase to intercept before panel handlers
        
        console.log('[PanelManager] ⌨️ Centralized keyboard shortcuts registered');
    }
    
    createViewMenu() {
        // Add to command palette if available
        if (window.commandPalette) {
            window.commandPalette.addCommand({
                name: 'Toggle Explorer',
                action: () => this.togglePanel('explorer'),
                category: 'View'
            });
            
            window.commandPalette.addCommand({
                name: 'Toggle Chat Panel',
                action: () => this.togglePanel('chat'),
                category: 'View'
            });
            
            window.commandPalette.addCommand({
                name: 'Toggle Console',
                action: () => this.togglePanel('console'),
                category: 'View'
            });
            
            window.commandPalette.addCommand({
                name: 'Toggle Terminal',
                action: () => this.togglePanel('terminal'),
                category: 'View'
            });
            
            window.commandPalette.addCommand({
                name: 'Toggle Browser',
                action: () => this.togglePanel('browser'),
                category: 'View'
            });
            
            window.commandPalette.addCommand({
                name: 'Full Screen Editor',
                action: () => this.toggleFullScreen(),
                category: 'View'
            });
        }
    }
    
    // Public API
    isVisible(panelName) {
        return this.panels[panelName]?.visible || false;
    }
    
    showPanel(panelName) {
        if (!this.panels[panelName].visible) {
            this.togglePanel(panelName);
        }
    }
    
    hidePanel(panelName) {
        if (this.panels[panelName].visible) {
            this.togglePanel(panelName);
        }
    }
}

// Initialize and expose globally
window.panelManager = new PanelManager();

// Expose registration API
window.registerPanelInstance = (name, instance) => {
    window.panelManager.registerPanelInstance(name, instance);
};

console.log('[PanelManager] 🎨 Panel manager module loaded');
console.log('[PanelManager] 💡 Keyboard shortcuts:');
console.log('  • Ctrl+B → Toggle Explorer');
console.log('  • Ctrl+Shift+/ → Toggle Chat');
console.log('  • Ctrl+` → Toggle Console');
console.log('  • Ctrl+J → Toggle Terminal');
console.log('  • Ctrl+Shift+B → Toggle Browser');
console.log('  • F11 → Full Screen Editor');
console.log('  • Click panel buttons in title bar!');

})();

