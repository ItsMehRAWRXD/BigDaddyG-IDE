/**
 * BigDaddyG IDE - Comprehensive Hotkey Manager
 * Centralizes ALL keyboard shortcuts for proper conflict resolution
 */

(function() {
'use strict';

class HotkeyManager {
    constructor() {
        this.shortcuts = new Map();
        this.priority = [];
        this.init();
    }
    
    init() {
        console.log('[HotkeyManager] ⌨️ Initializing hotkey manager...');
        
        // Register all shortcuts
        this.registerAllShortcuts();
        
        // Single event listener for ALL shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyPress(e), true);
        
        console.log('[HotkeyManager] ✅ Hotkey manager ready');
        this.listAllShortcuts();
    }
    
    registerTabShortcuts() {
        // Register center tab shortcuts - these check for tabSystem at runtime
        this.register('Ctrl+Shift+C', () => {
            if (window.tabSystem && typeof window.tabSystem.openChatTab === 'function') {
                window.tabSystem.openChatTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Chat Tab');
        
        this.register('Ctrl+Shift+E', () => {
            if (window.tabSystem && typeof window.tabSystem.openExplorerTab === 'function') {
                window.tabSystem.openExplorerTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Explorer Tab');
        
        this.register('Ctrl+Shift+G', () => {
            if (window.tabSystem && typeof window.tabSystem.openGitHubTab === 'function') {
                window.tabSystem.openGitHubTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open GitHub Tab');
        
        this.register('Ctrl+Shift+A', () => {
            if (window.tabSystem && typeof window.tabSystem.openAgentsTab === 'function') {
                window.tabSystem.openAgentsTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Agents Tab');
        
        this.register('Ctrl+Shift+T', () => {
            if (window.tabSystem && typeof window.tabSystem.openTeamTab === 'function') {
                window.tabSystem.openTeamTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Team Tab');
        
        this.register('Ctrl+,', () => {
            if (window.tabSystem && typeof window.tabSystem.openSettingsTab === 'function') {
                window.tabSystem.openSettingsTab();
            } else {
                console.warn('[HotkeyManager] Tab system not ready yet');
            }
        }, 'Open Settings Tab');
    }
    
    registerAllShortcuts() {
        // ========================================================================
        // FILE OPERATIONS
        // ========================================================================
        this.register('Ctrl+N', () => {
            if (typeof createNewFile === 'function') {
                createNewFile();
            }
        }, 'New File');
        
        this.register('Ctrl+O', () => {
            if (typeof openFileDialog === 'function') {
                openFileDialog();
            }
        }, 'Open File');
        
        this.register('Ctrl+S', () => {
            if (typeof saveCurrentFile === 'function') {
                saveCurrentFile();
            }
        }, 'Save File');
        
        this.register('Ctrl+Shift+S', () => {
            if (typeof saveFileAs === 'function') {
                saveFileAs();
            }
        }, 'Save As');
        
        // ========================================================================
        // TAB OPERATIONS
        // ========================================================================
        this.register('Ctrl+Tab', () => {
            if (typeof nextTab === 'function') nextTab();
        }, 'Next Tab');
        
        this.register('Ctrl+Shift+Tab', () => {
            if (typeof previousTab === 'function') previousTab();
        }, 'Previous Tab');
        
        this.register('Ctrl+W', () => {
            if (typeof closeTab === 'function' && window.activeTab) {
                closeTab({ stopPropagation: () => {} }, window.activeTab);
            }
        }, 'Close Tab');
        
        this.register('Ctrl+Shift+W', () => {
            if (typeof closeAllTabs === 'function') closeAllTabs();
        }, 'Close All Tabs');
        
        // Ctrl+1-9 for tab switching
        for (let i = 1; i <= 9; i++) {
            this.register(`Ctrl+${i}`, () => {
                const tabs = Object.keys(window.openTabs || {});
                if (tabs[i - 1]) {
                    if (typeof switchTab === 'function') switchTab(tabs[i - 1]);
                }
            }, `Switch to Tab ${i}`);
        }
        
        // Alt+Left/Right for tab navigation
        this.register('Alt+ArrowLeft', () => {
            if (typeof previousTab === 'function') previousTab();
        }, 'Previous Tab (Alt)');
        
        this.register('Alt+ArrowRight', () => {
            if (typeof nextTab === 'function') nextTab();
        }, 'Next Tab (Alt)');
        
        // ========================================================================
        // CENTER TABS (Tab System) - These will be registered when tabSystem is ready
        // ========================================================================
        this.registerTabShortcuts();
        
        // ========================================================================
        // FLOATING CHAT
        // ========================================================================
        this.register('Ctrl+L', () => {
            if (window.floatingChat) window.floatingChat.toggle();
        }, 'Toggle Floating Chat');
        
        // ========================================================================
        // AI CHAT
        // ========================================================================
        this.register('Ctrl+Enter', (e) => {
            // Check if we're in any AI input field
            const activeEl = document.activeElement;
            const isAIInput = activeEl && (
                activeEl.id === 'ai-input' ||
                activeEl.id === 'floating-chat-input' ||
                activeEl.id === 'center-chat-input' ||
                activeEl.classList.contains('ai-input') ||
                activeEl.closest('#ai-chat-inputs') ||
                activeEl.closest('.floating-chat-input')
            );
            
            if (isAIInput) {
                e.preventDefault();
                e.stopPropagation();
                if (typeof sendToAI === 'function') {
                    sendToAI();
                } else if (window.floatingChat && activeEl.id === 'floating-chat-input') {
                    // Try floating chat's send method
                    const sendBtn = document.querySelector('#floating-chat-send');
                    if (sendBtn) sendBtn.click();
                }
            }
        }, 'Send AI Message');
        
        // ========================================================================
        // TERMINAL
        // ========================================================================
        this.register('Ctrl+J', () => {
            const panel = document.getElementById('bottom-panel');
            if (panel) {
                panel.classList.toggle('collapsed');
            }
        }, 'Toggle Terminal');
        
        // ========================================================================
        // AI RESPONSE STOP
        // ========================================================================
        this.register('Ctrl+Shift+X', () => {
            if (window.aiResponseHandler) {
                window.aiResponseHandler.stopCurrentExecution();
            }
        }, 'Stop AI Execution');
        
        // ========================================================================
        // VOICE CODING
        // ========================================================================
        this.register('Ctrl+Shift+V', () => {
            if (typeof startVoiceCoding === 'function') {
                startVoiceCoding();
            } else if (window.voiceCodingEngine) {
                window.voiceCodingEngine.start();
            }
        }, 'Start Voice Coding');
        
        this.register('Ctrl+Shift+P', () => {
            // Command palette fallback
            console.log('[HotkeyManager] 💡 Command palette - coming soon');
        }, 'Command Palette');
        
        // ========================================================================
        // ESCAPE KEY (Close modals, etc.)
        // ========================================================================
        this.register('Escape', () => {
            // Close floating chat
            if (window.floatingChat && window.floatingChat.isOpen) {
                window.floatingChat.close();
            }
            
            // Close error log modal
            const errorModal = document.getElementById('error-log-modal');
            if (errorModal) errorModal.remove();
        }, 'Close Modals');
        
        // ========================================================================
        // FIND & REPLACE
        // ========================================================================
        this.register('Ctrl+F', () => {
            if (window.editor) {
                window.editor.getAction('actions.find').run();
            }
        }, 'Find');
        
        this.register('Ctrl+H', () => {
            if (window.editor) {
                window.editor.getAction('editor.action.startFindReplaceAction').run();
            }
        }, 'Find & Replace');
        
        // ========================================================================
        // COMMENT TOGGLE
        // ========================================================================
        this.register('Ctrl+/', () => {
            if (window.editor) {
                window.editor.getAction('editor.action.commentLine').run();
            }
        }, 'Toggle Comment');
    }
    
    register(combo, handler, description) {
        const normalized = this.normalizeCombo(combo);
        this.shortcuts.set(normalized, {
            handler,
            description,
            combo: combo
        });
    }
    
    normalizeCombo(combo) {
        // Normalize combo string to key format
        const parts = combo.split('+').map(p => p.trim());
        const key = parts.pop().toLowerCase();
        const modifiers = parts.map(p => p.toLowerCase()).sort().join('+');
        return `${modifiers ? modifiers + '+' : ''}${key}`;
    }
    
    handleKeyPress(e) {
        // Build key identifier
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.altKey) parts.push('alt');
        if (e.shiftKey) parts.push('shift');
        if (e.metaKey) parts.push('meta');
        
        let key = e.key.toLowerCase();
        
        // Normalize special keys
        if (key === 'arrowleft') key = 'arrowleft';
        else if (key === 'arrowright') key = 'arrowright';
        else if (key === 'arrowup') key = 'arrowup';
        else if (key === 'arrowdown') key = 'arrowdown';
        else if (key === ' ') key = 'space';
        else if (key.length === 1) key = key.toLowerCase();
        
        parts.push(key);
        const identifier = parts.join('+');
        
        // Check if shortcut exists
        const shortcut = this.shortcuts.get(identifier);
        
        if (shortcut) {
            // Check if we're in an input field (some shortcuts should work even in inputs)
            const shouldPreventDefault = !this.isInputField(e.target) || 
                                       ['ctrl+enter', 'escape'].includes(identifier) ||
                                       identifier.startsWith('ctrl+shift+');
            
            if (shouldPreventDefault) {
                e.preventDefault();
                e.stopPropagation();
            }
            
            console.log(`[HotkeyManager] ⌨️ ${shortcut.description} (${shortcut.combo})`);
            shortcut.handler(e);
            return true;
        }
        
        return false;
    }
    
    isInputField(element) {
        if (!element) return false;
        const tag = element.tagName.toLowerCase();
        return tag === 'input' || tag === 'textarea' || element.contentEditable === 'true';
    }
    
    listAllShortcuts() {
        console.log('[HotkeyManager] 📋 Registered shortcuts:');
        const categories = {
            'File': [],
            'Tab': [],
            'Center Tabs': [],
            'AI & Chat': [],
            'Terminal': [],
            'Voice': [],
            'Editor': [],
            'Other': []
        };
        
        for (const [key, shortcut] of this.shortcuts) {
            const combo = shortcut.combo;
            let category = 'Other';
            
            if (combo.startsWith('Ctrl+N') || combo.startsWith('Ctrl+O') || combo.startsWith('Ctrl+S')) {
                category = 'File';
            } else if (combo.includes('Tab') || combo.startsWith('Ctrl+W') || combo.includes('Alt+Arrow')) {
                category = 'Tab';
            } else if (combo.startsWith('Ctrl+Shift+C') || combo.startsWith('Ctrl+Shift+E') || combo.startsWith('Ctrl+Shift+G') || combo.startsWith('Ctrl+Shift+A') || combo.startsWith('Ctrl+Shift+T') || combo === 'Ctrl+,') {
                category = 'Center Tabs';
            } else if (combo.includes('Chat') || combo.includes('Enter') || combo.includes('AI') || combo.includes('Ctrl+L')) {
                category = 'AI & Chat';
            } else if (combo.includes('Terminal') || combo === 'Ctrl+J') {
                category = 'Terminal';
            } else if (combo.includes('Voice') || combo.includes('Shift+V') || combo.includes('Shift+P')) {
                category = 'Voice';
            } else if (combo.includes('Find') || combo.includes('Comment') || combo.includes('Ctrl+F') || combo.includes('Ctrl+H') || combo === 'Ctrl+/') {
                category = 'Editor';
            }
            
            categories[category].push(`  ${combo.padEnd(20)} → ${shortcut.description}`);
        }
        
        for (const [cat, list] of Object.entries(categories)) {
            if (list.length > 0) {
                console.log(`\n${cat}:`);
                list.forEach(item => console.log(item));
            }
        }
    }
}

// Initialize
window.hotkeyManager = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hotkeyManager = new HotkeyManager();
    });
} else {
    window.hotkeyManager = new HotkeyManager();
}

// Export
window.HotkeyManager = HotkeyManager;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = HotkeyManager;
}

console.log('[HotkeyManager] 📦 Hotkey manager module loaded');

})(); // End IIFE

