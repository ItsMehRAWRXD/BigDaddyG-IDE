/**
 * BigDaddyG IDE - Update Settings Manager
 * Manages auto-update preferences
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class UpdateSettingsManager {
    constructor() {
        this.settingsPath = path.join(app.getPath('userData'), 'update-settings.json');
        this.settings = this.loadSettings();
    }
    
    /**
     * Load update settings
     */
    loadSettings() {
        try {
            if (fs.existsSync(this.settingsPath)) {
                return JSON.parse(fs.readFileSync(this.settingsPath, 'utf8'));
            }
        } catch (error) {
            console.error('[UpdateSettings] Error loading settings:', error);
        }
        
        // Default settings
        return {
            autoUpdate: true,
            checkOnStartup: true,
            checkInterval: 'daily', // 'startup', 'daily', 'weekly', 'manual'
            autoDownload: true,
            notifyBeforeUpdate: false,
            branch: 'main',
            includePrerelease: false,
            lastCheck: null
        };
    }
    
    /**
     * Save update settings
     */
    saveSettings() {
        try {
            fs.writeFileSync(this.settingsPath, JSON.stringify(this.settings, null, 2));
            return true;
        } catch (error) {
            console.error('[UpdateSettings] Error saving settings:', error);
            return false;
        }
    }
    
    /**
     * Get setting value
     */
    get(key) {
        return this.settings[key];
    }
    
    /**
     * Set setting value
     */
    set(key, value) {
        this.settings[key] = value;
        return this.saveSettings();
    }
    
    /**
     * Check if should update on this launch
     */
    shouldCheckForUpdates() {
        if (!this.settings.autoUpdate || !this.settings.checkOnStartup) {
            return false;
        }
        
        const now = Date.now();
        const lastCheck = this.settings.lastCheck ? new Date(this.settings.lastCheck).getTime() : 0;
        
        switch (this.settings.checkInterval) {
            case 'startup':
                return true;
            case 'daily':
                return now - lastCheck > 24 * 60 * 60 * 1000;
            case 'weekly':
                return now - lastCheck > 7 * 24 * 60 * 60 * 1000;
            case 'manual':
                return false;
            default:
                return true;
        }
    }
    
    /**
     * Update last check timestamp
     */
    updateLastCheck() {
        this.settings.lastCheck = new Date().toISOString();
        return this.saveSettings();
    }
}

module.exports = UpdateSettingsManager;
