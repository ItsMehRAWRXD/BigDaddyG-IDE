/**
 * Panel Manager for BigDaddyG IDE
 * 
 * Universal panel control system - toggle ANY panel on/off
 * Makes IDE fully modular and customizable
 */

(function() {
'use strict';

class PanelManager {
    constructor() {
        this.panels = {
            explorer: { element: 'sidebar', visible: true, hotkey: 'Ctrl+B' },
            chat: { element: 'right-sidebar', visible: true, hotkey: 'Ctrl+Shift+/' },
            terminal: { element: null, visible: false, hotkey: 'Ctrl+J' }
        };
        
        console.log('[PanelManager] 🎯 Initializing panel manager...');
        this.init();
    }
    
    init() {
        // Create toggle buttons in title bar
        this.createQuickToggles();
        
        // Register keyboard shortcuts
        this.registerShortcuts();
        
        // Add View menu
        this.createViewMenu();
        
        console.log('[PanelManager] ✅ Panel manager ready!');
        console.log('[PanelManager] 💡 Press F11 for FULL SCREEN mode (hide all panels)');
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
        
        // Terminal toggle
        const terminalBtn = this.createToggleButton('💻', 'Toggle Terminal (Ctrl+J)', () => this.togglePanel('terminal'));
        
        // Full screen toggle
        const fullScreenBtn = this.createToggleButton('🖥️', 'Full Screen Editor (F11)', () => this.toggleFullScreen());
        
        toggleContainer.appendChild(explorerBtn);
        toggleContainer.appendChild(chatBtn);
        toggleContainer.appendChild(terminalBtn);
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

        if (panelName === 'terminal') {
            window.toggleTerminalPanel?.();
            panel.visible = Boolean(window.terminalPanelInstance?.isVisible);
            return true;
        }

        const element = document.getElementById(panel.element);
        if (!element) {
            console.warn(`[PanelManager] ⚠️ Element "${panel.element}" not found for panel "${panelName}"`);
            return false;
        }
        
        try {
        
        panel.visible = !panel.visible;
        
        if (panel.visible) {
            element.classList.remove('collapsed');
            // Force visibility with inline styles (overrides resizable-panes)
            element.style.display = 'flex';
            element.style.width = ''; // Reset to CSS default
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
            // Force hiding with inline styles (overrides everything)
            element.style.width = '0px';
            element.style.minWidth = '0px';
            element.style.opacity = '0';
            element.style.pointerEvents = 'none';
            element.style.overflow = 'hidden';
            console.log(`[PanelManager] ✅ ${panelName} hidden - More space for editor!`);
            window.showNotification?.(`✅ ${panelName}`, 'Hidden - More space!', 'info', 1500);
        }
        
        // Special handling for terminal (needs to update main-container)
        return true;
        } catch (error) {
            console.error(`[PanelManager] Error toggling ${panelName}:`, error);
            return false;
        }
    }
    
    toggleFullScreen() {
        // Hide all panels except editor
        const allHidden = !this.panels.explorer.visible && !this.panels.chat.visible && !this.panels.terminal.visible;
        
        if (allHidden) {
            // Show all panels
            this.togglePanel('explorer');
            this.togglePanel('chat');
            console.log('[PanelManager] 🖥️ Normal view restored');
        } else {
            // Hide all panels
            if (this.panels.explorer.visible) this.togglePanel('explorer');
            if (this.panels.chat.visible) this.togglePanel('chat');
            if (this.panels.terminal.visible) this.togglePanel('terminal');
            console.log('[PanelManager] 🖥️ FULL SCREEN editor mode!');
        }
    }
    
    registerShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+B - Toggle Explorer
            if (e.ctrlKey && e.key === 'b') {
                e.preventDefault();
                this.togglePanel('explorer');
            }
            
            // Ctrl+Shift+/ - Toggle Chat
            if (e.ctrlKey && e.shiftKey && e.key === '/') {
                e.preventDefault();
                this.togglePanel('chat');
            }
            
            // F11 - Full Screen
            if (e.key === 'F11') {
                e.preventDefault();
                this.toggleFullScreen();
            }
        });
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
                name: 'Toggle Terminal',
                action: () => this.togglePanel('terminal'),
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

console.log('[PanelManager] 🎨 Panel manager module loaded');
console.log('[PanelManager] 💡 Usage:');
console.log('  • Ctrl+B → Toggle Explorer');
console.log('  • Ctrl+Shift+/ → Toggle Chat');
console.log('  • Ctrl+J → Toggle Terminal');
console.log('  • F11 → Full Screen Editor');
console.log('  • Click panel buttons in title bar!');

})();

