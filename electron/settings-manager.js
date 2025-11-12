/**
 * BigDaddyG IDE - Settings Manager
 * Manages IDE settings and preferences
 */

// Browser-safe requires (use window scope to avoid redeclaration)
if (typeof window !== 'undefined') {
    if (!window._fsModule && typeof require !== 'undefined' && typeof process !== 'undefined' && process.versions?.electron) {
        window._fsModule = require('fs');
        window._pathModule = require('path');
        window._appModule = require('electron').app;
    }
}
const fs = (typeof window !== 'undefined' && window._fsModule) ? window._fsModule : null;
const path = (typeof window !== 'undefined' && window._pathModule) ? window._pathModule : null;
const app = (typeof window !== 'undefined' && window._appModule) ? window._appModule : null;

class SettingsManager {
    constructor() {
        this.settingsPath = path.join(app.getPath('userData'), 'settings.json');
        this.settings = this.loadSettings();
        
        // Default settings
        this.defaults = {
            theme: 'dark',
            fontSize: 14,
            fontFamily: 'Consolas, Monaco, monospace',
            tabSize: 4,
            autoSave: true,
            autoSaveDelay: 1000,
            lineNumbers: true,
            minimap: true,
            wordWrap: false,
            formatOnSave: true,
            formatOnType: false,
            aiEnabled: true,
            aiProvider: 'bigdaddya',
            gameEngine: 'godot',
            recentFiles: [],
            recentProjects: [],
            windowBounds: { width: 1200, height: 800 },
            sidebarWidth: 250,
            panelHeight: 200
        };
        
        console.log('[SettingsManager] Initialized');
    }
    
    /**
     * Load settings from file
     */
    loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                const data = fs.readFileSync(this.settingsPath, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('[SettingsManager] Error loading settings:', error);
        }
        
        return {};
    }
    
    /**
     * Save settings to file
     */
    saveSettings() {
        try {
            const dir = path.dirname(this.settingsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
            console.log('[SettingsManager] Settings saved');
            return true;
        } catch (error) {
            console.error('[SettingsManager] Error saving settings:', error);
            return false;
        }
    }
    
    /**
     * Get a setting value
     */
    get(key, defaultValue = null) {
        if (this.settings.hasOwnProperty(key)) {
            return this.settings[key];
        }
        
        if (this.defaults.hasOwnProperty(key)) {
            return this.defaults[key];
        }
        
        return defaultValue;
    }
    
    /**
     * Set a setting value
     */
    set(key, value) {
        this.settings[key] = value;
        this.saveSettings();
        return true;
    }
    
    /**
     * Update multiple settings
     */
    update(settings) {
        Object.assign(this.settings, settings);
        this.saveSettings();
        return true;
    }
    
    /**
     * Reset settings to defaults
     */
    reset() {
        this.settings = { ...this.defaults };
        this.saveSettings();
        return true;
    }
    
    /**
     * Get all settings
     */
    getAll() {
        return { ...this.defaults, ...this.settings };
    }
    
    /**
     * Add to recent files
     */
    addRecentFile(filePath) {
        let recent = this.get('recentFiles', []);
        recent = recent.filter(f => f !== filePath);
        recent.unshift(filePath);
        recent = recent.slice(0, 10); // Keep only 10 most recent
        this.set('recentFiles', recent);
    }
    
    /**
     * Get recent files
     */
    getRecentFiles() {
        return this.get('recentFiles', []);
    }
    
    /**
     * Clear recent files
     */
    clearRecentFiles() {
        this.set('recentFiles', []);
    }
}

// Browser-compatible export
try {
    if (typeof module !== 'undefined' && module.exports) {
        // Browser-safe module export
try {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsManager;
  }
} catch (e) {
  // Browser environment - module not available
}

// Always expose to window for renderer process
if (typeof window !== 'undefined') {
  window.SettingsManager = SettingsManager;
}
    }
} catch (e) {
    // Browser environment - no module.exports
}
// Always expose to window in browser
if (typeof window !== 'undefined') {
    window.SettingsManager = SettingsManager;
}
