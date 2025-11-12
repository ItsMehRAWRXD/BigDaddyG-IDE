/**
 * BigDaddyG IDE - Global Keyboard Shortcuts
 * Handles Ctrl+N, Ctrl+S, Ctrl+O, etc.
 */

(function() {
'use strict';

console.log('[Shortcuts] 🎯 Initializing keyboard shortcuts...');

class KeyboardShortcuts {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        // Wait for systems
        if (!window.completeTabSystem || !window.menuSystem) {
            setTimeout(() => this.initialize(), 100);
            return;
        }
        
        this.tabSystem = window.completeTabSystem;
        this.menuSystem = window.menuSystem;
        
        // Register global shortcuts
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
        
        console.log('[Shortcuts] ✅ Keyboard shortcuts ready');
    }
    
    handleKeydown(e) {
        // File shortcuts
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.tabSystem.createEditorTab();
        }
        
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            this.menuSystem.executeAction('open-file');
        }
        
        if (e.ctrlKey && !e.shiftKey && e.key === 's') {
            e.preventDefault();
            this.menuSystem.executeAction('save-file');
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            this.menuSystem.executeAction('save-as');
        }
        
        if (e.ctrlKey && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            this.menuSystem.executeAction('new-window');
        }
        
        // Edit shortcuts (some already handled by browser)
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            this.menuSystem.executeAction('find');
        }
        
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            this.menuSystem.executeAction('replace');
        }
        
        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            this.tabSystem.createEditorSettingsTab();
        }
        
        // View shortcuts
        if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            this.tabSystem.createTerminalTab();
        }
        
        // Help shortcuts
        if (e.key === 'F1') {
            e.preventDefault();
            this.menuSystem.executeAction('documentation');
        }
        
        // Fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            this.menuSystem.executeAction('toggle-fullscreen');
        }
    }
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.keyboardShortcuts = new KeyboardShortcuts();
    });
} else {
    window.keyboardShortcuts = new KeyboardShortcuts();
}

})();
