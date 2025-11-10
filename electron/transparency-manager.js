/**
 * BigDaddyG IDE - Transparency Manager
 * Applies RGBA transparency settings for extreme multitasking
 */

(function() {
'use strict';

class TransparencyManager {
    constructor() {
        this.settings = null;
        this.settingsApi = window.electron?.settings || null;
        this.styleElement = null;
        
        this.init();
    }
    
    init() {
        this.createStyleElement();
        this.loadSettings();
        this.bindSettingsEvents();
        console.log('[TransparencyManager] 🪟 Transparency system ready');
    }
    
    createStyleElement() {
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'transparency-styles';
        document.head.appendChild(this.styleElement);
    }
    
    async loadSettings() {
        if (this.settingsApi) {
            try {
                const res = await this.settingsApi.getAll();
                if (res?.success) {
                    this.settings = res.settings;
                    this.applyTransparency();
                }
            } catch (error) {
                console.warn('[TransparencyManager] Failed to load settings:', error);
            }
        }
        
        // Apply defaults if no settings
        if (!this.settings) {
            this.settings = {
                appearance: {
                    transparency: {
                        enabled: false,
                        window: 0.95,
                        sidePanels: 0.92,
                        chatPanels: 0.9
                    }
                }
            };
            this.applyTransparency();
        }
    }
    
    bindSettingsEvents() {
        if (this.settingsApi) {
            this.settingsApi.onDidChange((event) => {
                if (event.type === 'update' && event.changes?.appearance?.transparency) {
                    this.settings.appearance.transparency = {
                        ...this.settings.appearance.transparency,
                        ...event.changes.appearance.transparency
                    };
                    this.applyTransparency();
                }
            });
        }
    }
    
    applyTransparency() {
        const t = this.settings?.appearance?.transparency || {};
        
        if (!t.enabled) {
            this.styleElement.textContent = '';
            return;
        }
        
        const windowOpacity = t.window ?? 0.95;
        const sidePanelOpacity = t.sidePanels ?? 0.92;
        const chatPanelOpacity = t.chatPanels ?? 0.9;
        
        this.styleElement.textContent = `
            /* Window Background Transparency */
            body {
                background: rgba(5, 5, 15, ${windowOpacity}) !important;
            }
            
            #app {
                background: rgba(5, 5, 15, ${windowOpacity}) !important;
            }
            
            /* Side Panels */
            #sidebar,
            #conversation-history-sidebar,
            .left-sidebar,
            .right-sidebar {
                background: rgba(5, 5, 15, ${sidePanelOpacity}) !important;
                backdrop-filter: blur(10px);
            }
            
            /* Editor Container */
            #editor-container {
                background: rgba(10, 10, 30, ${windowOpacity}) !important;
                backdrop-filter: blur(8px);
            }
            
            /* Tab Bar */
            #tab-bar {
                background: rgba(5, 5, 15, ${sidePanelOpacity}) !important;
                backdrop-filter: blur(12px);
            }
            
            .editor-tab {
                background: rgba(0, 0, 0, ${sidePanelOpacity * 0.5}) !important;
            }
            
            .editor-tab.active {
                background: rgba(10, 10, 30, ${windowOpacity}) !important;
            }
            
            /* Chat Panels */
            #floating-chat,
            .floating-chat,
            #ai-chat-inputs,
            .chat-panel,
            .ai-response-container {
                background: rgba(10, 10, 30, ${chatPanelOpacity}) !important;
                backdrop-filter: blur(15px);
            }
            
            /* Console & Terminal */
            #console-panel,
            .terminal-panel,
            #enhanced-terminal {
                background: rgba(5, 5, 15, ${sidePanelOpacity}) !important;
                backdrop-filter: blur(10px);
            }
            
            /* Menu & Title Bar */
            #title-bar,
            #menu-bar {
                background: rgba(5, 5, 15, ${sidePanelOpacity}) !important;
                backdrop-filter: blur(20px);
            }
            
            /* Modal Overlays */
            .modal-overlay,
            #command-palette {
                background: rgba(0, 0, 0, ${windowOpacity * 0.8}) !important;
                backdrop-filter: blur(20px);
            }
            
            /* Settings Panel */
            .settings-section {
                background: rgba(10, 10, 30, ${sidePanelOpacity}) !important;
                backdrop-filter: blur(8px);
            }
            
            /* File Tree */
            .file-item:hover {
                background: rgba(0, 212, 255, ${0.1 * sidePanelOpacity}) !important;
            }
            
            .file-item.active {
                background: rgba(0, 212, 255, ${0.2 * sidePanelOpacity}) !important;
            }
            
            /* Enhance glass effect */
            .glass-effect {
                backdrop-filter: blur(20px) saturate(180%);
                -webkit-backdrop-filter: blur(20px) saturate(180%);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        `;
        
        console.log('[TransparencyManager] ✨ Transparency applied:', {
            enabled: t.enabled,
            window: windowOpacity,
            sidePanels: sidePanelOpacity,
            chatPanels: chatPanelOpacity
        });
    }
    
    // API methods
    setWindowOpacity(opacity) {
        if (!this.settings.appearance) this.settings.appearance = {};
        if (!this.settings.appearance.transparency) this.settings.appearance.transparency = {};
        
        this.settings.appearance.transparency.window = Math.max(0.1, Math.min(1, opacity));
        this.applyTransparency();
        
        if (this.settingsApi) {
            this.settingsApi.update({
                appearance: {
                    transparency: {
                        window: this.settings.appearance.transparency.window
                    }
                }
            });
        }
    }
    
    setSidePanelOpacity(opacity) {
        if (!this.settings.appearance) this.settings.appearance = {};
        if (!this.settings.appearance.transparency) this.settings.appearance.transparency = {};
        
        this.settings.appearance.transparency.sidePanels = Math.max(0.1, Math.min(1, opacity));
        this.applyTransparency();
        
        if (this.settingsApi) {
            this.settingsApi.update({
                appearance: {
                    transparency: {
                        sidePanels: this.settings.appearance.transparency.sidePanels
                    }
                }
            });
        }
    }
    
    setChatPanelOpacity(opacity) {
        if (!this.settings.appearance) this.settings.appearance = {};
        if (!this.settings.appearance.transparency) this.settings.appearance.transparency = {};
        
        this.settings.appearance.transparency.chatPanels = Math.max(0.1, Math.min(1, opacity));
        this.applyTransparency();
        
        if (this.settingsApi) {
            this.settingsApi.update({
                appearance: {
                    transparency: {
                        chatPanels: this.settings.appearance.transparency.chatPanels
                    }
                }
            });
        }
    }
    
    toggleTransparency() {
        if (!this.settings.appearance) this.settings.appearance = {};
        if (!this.settings.appearance.transparency) this.settings.appearance.transparency = {};
        
        this.settings.appearance.transparency.enabled = !this.settings.appearance.transparency.enabled;
        this.applyTransparency();
        
        if (this.settingsApi) {
            this.settingsApi.update({
                appearance: {
                    transparency: {
                        enabled: this.settings.appearance.transparency.enabled
                    }
                }
            });
        }
        
        return this.settings.appearance.transparency.enabled;
    }
    
    getTransparencySettings() {
        return this.settings?.appearance?.transparency || {};
    }
}

// Initialize
window.transparencyManager = new TransparencyManager();

// Export
window.TransparencyManager = TransparencyManager;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransparencyManager;
}

console.log('[TransparencyManager] 📦 Transparency manager loaded');

})();