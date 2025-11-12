/**
 * Developer Mode Manager - BigDaddyG IDE
 * Advanced settings, debugging tools, and experimental features
 */

// Create immediate stub to prevent crashes before initialization
if (typeof window !== 'undefined' && !window.developerMode) {
    window.developerMode = {
        enabled: false,
        settings: {},
        enable: function() {},
        disable: function() {},
        toggleSetting: function() {},
        getStats: () => ({ enabled: false, settings: {}, tabs: 0, files: 0, memory: null })
    };
}

class DeveloperMode {
    constructor() {
        try {
            this.enabled = this.loadSetting('enabled', false);
            this.settings = this.loadAllSettings();
            
            console.log('[DevMode] 🛠️ Developer Mode Manager initialized');
            
            if (this.enabled) {
                console.log('[DevMode] ⚠️ Developer Mode is ENABLED');
                // Don't apply settings in constructor - too early
                setTimeout(() => {
                    try {
                        this.applyDeveloperSettings();
                    } catch (err) {
                        console.error('[DevMode] Failed to apply settings:', err);
                    }
                }, 1000);
            }
        } catch (err) {
            console.error('[DevMode] ❌ Constructor failed:', err);
            // Set safe defaults
            this.enabled = false;
            this.settings = {
                enabled: false,
                unverifiedExtensions: false,
                experimentalFeatures: false,
                advancedDebugging: false,
                verboseLogging: false,
                memoryProfiling: false,
                showHiddenFeatures: false,
                betaAPIs: false,
                disableSafetyChecks: false,
                allowDangerousOperations: false,
                maxMemoryMB: 2048,
                autoSaveInterval: 30000
            };
        }
    }
    
    /**
     * Load setting from localStorage
     */
    loadSetting(key, defaultValue) {
        try {
            if (typeof localStorage === 'undefined') {
                return defaultValue;
            }
            const stored = localStorage.getItem(`bigdaddyg-dev-${key}`);
            return stored !== null ? JSON.parse(stored) : defaultValue;
        } catch (err) {
            console.warn('[DevMode] Failed to load setting:', key, err);
            return defaultValue;
        }
    }
    
    /**
     * Save setting to localStorage
     */
    saveSetting(key, value) {
        try {
            if (typeof localStorage === 'undefined') {
                console.warn('[DevMode] localStorage not available');
                return;
            }
            localStorage.setItem(`bigdaddyg-dev-${key}`, JSON.stringify(value));
            console.log(`[DevMode] 💾 Saved ${key}:`, value);
        } catch (err) {
            console.error('[DevMode] ❌ Failed to save setting:', err);
        }
    }
    
    /**
     * Load all developer settings
     */
    loadAllSettings() {
        return {
            enabled: this.loadSetting('enabled', false),
            unverifiedExtensions: this.loadSetting('unverifiedExtensions', false),
            experimentalFeatures: this.loadSetting('experimentalFeatures', false),
            advancedDebugging: this.loadSetting('advancedDebugging', false),
            verboseLogging: this.loadSetting('verboseLogging', false),
            memoryProfiling: this.loadSetting('memoryProfiling', false),
            showHiddenFeatures: this.loadSetting('showHiddenFeatures', false),
            betaAPIs: this.loadSetting('betaAPIs', false),
            disableSafetyChecks: this.loadSetting('disableSafetyChecks', false),
            allowDangerousOperations: this.loadSetting('allowDangerousOperations', false),
            maxMemoryMB: this.loadSetting('maxMemoryMB', 2048),
            autoSaveInterval: this.loadSetting('autoSaveInterval', 30000)
        };
    }
    
    /**
     * Enable Developer Mode
     */
    enable() {
        this.enabled = true;
        this.saveSetting('enabled', true);
        this.applyDeveloperSettings();
        console.warn('[DevMode] ⚠️ Developer Mode ENABLED - Use at your own risk!');
        this.showWarning();
    }
    
    /**
     * Disable Developer Mode
     */
    disable() {
        this.enabled = false;
        this.saveSetting('enabled', false);
        this.revertDeveloperSettings();
        console.log('[DevMode] ✅ Developer Mode DISABLED - Safe mode restored');
    }
    
    /**
     * Toggle a specific setting
     */
    toggleSetting(key) {
        this.settings[key] = !this.settings[key];
        this.saveSetting(key, this.settings[key]);
        
        if (this.enabled) {
            this.applyDeveloperSettings();
        }
        
        console.log(`[DevMode] 🔄 ${key} = ${this.settings[key]}`);
        return this.settings[key];
    }
    
    /**
     * Apply developer settings
     */
    applyDeveloperSettings() {
        // Verbose logging
        if (this.settings.verboseLogging) {
            window.DEBUG_MODE = true;
            console.log('[DevMode] 📋 Verbose logging enabled');
        }
        
        // Advanced debugging
        if (this.settings.advancedDebugging) {
            this.enableAdvancedDebugging();
        }
        
        // Memory profiling
        if (this.settings.memoryProfiling) {
            this.enableMemoryProfiling();
        }
        
        // Beta APIs
        if (this.settings.betaAPIs) {
            this.enableBetaAPIs();
        }
        
        // Show hidden features
        if (this.settings.showHiddenFeatures) {
            document.body.classList.add('dev-mode-hidden-features');
        }
    }
    
    /**
     * Revert developer settings
     */
    revertDeveloperSettings() {
        window.DEBUG_MODE = false;
        document.body.classList.remove('dev-mode-hidden-features');
        
        if (this.memoryProfilingInterval) {
            clearInterval(this.memoryProfilingInterval);
        }
    }
    
    /**
     * Enable advanced debugging
     */
    enableAdvancedDebugging() {
        // Expose internal APIs to window
        window.__devMode = {
            tabSystem: window.completeTabSystem,
            fileSystem: window.fileSystem,
            settings: this.settings,
            logs: []
        };
        
        // Intercept console methods
        const originalLog = console.log;
        const originalError = console.error;
        
        console.log = (...args) => {
            window.__devMode.logs.push({ type: 'log', args, time: Date.now() });
            originalLog.apply(console, args);
        };
        
        console.error = (...args) => {
            window.__devMode.logs.push({ type: 'error', args, time: Date.now() });
            originalError.apply(console, args);
        };
        
        console.log('[DevMode] 🐛 Advanced debugging enabled - Access via window.__devMode');
    }
    
    /**
     * Enable memory profiling
     */
    enableMemoryProfiling() {
        if (!performance.memory) {
            console.warn('[DevMode] ⚠️ Memory API not available in this browser');
            return;
        }
        
        this.memoryProfilingInterval = setInterval(() => {
            const memory = performance.memory;
            const used = (memory.usedJSHeapSize / 1048576).toFixed(2);
            const total = (memory.totalJSHeapSize / 1048576).toFixed(2);
            const limit = (memory.jsHeapSizeLimit / 1048576).toFixed(2);
            
            console.log(`[DevMode] 💾 Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);
            
            // Update UI if memory widget exists
            const memoryWidget = document.getElementById('dev-memory-widget');
            if (memoryWidget) {
                memoryWidget.textContent = `💾 ${used}MB / ${limit}MB`;
            }
            
            // Warning if near limit
            if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
                console.warn('[DevMode] ⚠️ Memory usage above 90%!');
            }
        }, 5000);
        
        console.log('[DevMode] 💾 Memory profiling enabled (5s interval)');
    }
    
    /**
     * Enable Beta APIs
     */
    enableBetaAPIs() {
        window.BETA_FEATURES = {
            aiVoiceMode: true,
            collaborativeEditing: true,
            cloudSync: true,
            quantumDebugger: true,
            aiPairProgramming: true
        };
        
        console.log('[DevMode] 🧪 Beta APIs enabled:', window.BETA_FEATURES);
    }
    
    /**
     * Show warning modal
     */
    showWarning() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
        `;
        
        modal.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1a0000 0%, #3a0000 100%);
                border: 3px solid #ff4757;
                border-radius: 15px;
                padding: 40px;
                max-width: 600px;
                box-shadow: 0 10px 50px rgba(255, 71, 87, 0.5);
            ">
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 64px; margin-bottom: 15px;">⚠️</div>
                    <h2 style="color: #ff4757; margin: 0; font-size: 28px;">Developer Mode Enabled</h2>
                </div>
                
                <div style="color: #fff; line-height: 1.8; margin-bottom: 25px;">
                    <p style="margin-bottom: 15px; font-weight: bold;">
                        You are now in Developer Mode. This allows:
                    </p>
                    <ul style="list-style: none; padding: 0;">
                        <li>⚠️ Unverified extensions that could modify or erase data</li>
                        <li>🧪 Experimental features that may be unstable</li>
                        <li>🔓 Disabled safety checks and security restrictions</li>
                        <li>⚡ Direct access to internal APIs</li>
                        <li>💾 Memory is disabled for safety</li>
                    </ul>
                    
                    <p style="margin-top: 20px; padding: 15px; background: rgba(255, 71, 87, 0.2); border-left: 3px solid #ff4757; border-radius: 5px;">
                        <strong>⚠️ WARNING:</strong> Developer Mode can cause data loss, system instability, or security vulnerabilities. 
                        Use at your own risk. Only enable features you understand and trust.
                    </p>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="dev-mode-understood" style="
                        padding: 15px 30px;
                        background: #ff4757;
                        color: #fff;
                        border: none;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">I Understand the Risks</button>
                    <button id="dev-mode-cancel" style="
                        padding: 15px 30px;
                        background: transparent;
                        color: #fff;
                        border: 2px solid #666;
                        border-radius: 8px;
                        font-weight: bold;
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">Cancel</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('dev-mode-understood').onclick = () => {
            modal.remove();
        };
        
        document.getElementById('dev-mode-cancel').onclick = () => {
            this.disable();
            modal.remove();
        };
    }
    
    /**
     * Get current stats
     */
    getStats() {
        const stats = {
            enabled: this.enabled,
            settings: { ...this.settings },
            memory: null,
            tabs: window.completeTabSystem?.tabs.size || 0,
            files: window.fileSystem?.currentProject?.files.length || 0
        };
        
        if (performance.memory) {
            stats.memory = {
                used: (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
                total: (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
                limit: (performance.memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB'
            };
        }
        
        return stats;
    }
}

// Initialize when DOM is ready to prevent crashes
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            try {
                window.developerMode = new DeveloperMode();
                console.log('[DevMode] ✅ Developer Mode Manager ready');
            } catch (err) {
                console.error('[DevMode] ❌ Failed to initialize:', err);
                // Create stub to prevent errors
                window.developerMode = { enabled: false, settings: {}, getStats: () => ({}) };
            }
        });
    } else {
        // DOM already loaded
        try {
            window.developerMode = new DeveloperMode();
            console.log('[DevMode] ✅ Developer Mode Manager ready');
        } catch (err) {
            console.error('[DevMode] ❌ Failed to initialize:', err);
            // Create stub to prevent errors
            window.developerMode = { enabled: false, settings: {}, getStats: () => ({}) };
        }
    }
} else {
    // Node.js environment, create stub
    if (typeof global !== 'undefined') {
        global.developerMode = { enabled: false, settings: {}, getStats: () => ({}) };
    }
}
