/**
 * BigDaddyG IDE - Safe Mode Detector
 * Detects white screens and automatically switches to safe mode
 */

const fs = require('fs');
const path = require('path');

function parseIni(content) {
    const config = {};
    let currentSection = null;

    const lines = content.split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith(';') || line.startsWith('#')) {
            continue;
        }

        if (line.startsWith('[') && line.endsWith(']')) {
            currentSection = line.slice(1, -1).trim();
            if (!config[currentSection]) {
                config[currentSection] = {};
            }
            continue;
        }

        const equalsIndex = line.indexOf('=');
        if (equalsIndex === -1) {
            continue;
        }

        const key = line.slice(0, equalsIndex).trim();
        const valueRaw = line.slice(equalsIndex + 1).trim();

        let value;
        if (/^(true|false)$/i.test(valueRaw)) {
            value = valueRaw.toLowerCase() === 'true';
        } else if (/^-?\d+(\.\d+)?$/.test(valueRaw)) {
            value = Number(valueRaw);
        } else {
            value = valueRaw;
        }

        if (!currentSection) {
            currentSection = 'DEFAULT';
            if (!config[currentSection]) {
                config[currentSection] = {};
            }
        }

        config[currentSection][key] = value;
    }

    return config;
}

function stringifyIni(config) {
    const sections = [];

    for (const [section, values] of Object.entries(config)) {
        sections.push(`[${section}]`);
        for (const [key, value] of Object.entries(values)) {
            let serialized = value;
            if (typeof value === 'boolean') {
                serialized = value ? 'true' : 'false';
            }
            sections.push(`${key}=${serialized}`);
        }
        sections.push('');
    }

    return sections.join('\n').trim() + '\n';
}

class SafeModeDetector {
    constructor() {
        this.iniPath = path.join(__dirname, 'bigdaddyg.ini');
        this.config = this.loadConfig();
        this.whiteScreenTimer = null;
    }
    
    loadConfig() {
        try {
            if (fs.existsSync(this.iniPath)) {
                const content = fs.readFileSync(this.iniPath, 'utf-8');
                const parsed = parseIni(content);
                return Object.keys(parsed).length ? parsed : this.getDefaultConfig();
            }
        } catch (error) {
            console.error('[SafeMode] Error loading config:', error);
        }
        
        // Return defaults if file doesn't exist
        return this.getDefaultConfig();
    }
    
    saveConfig() {
        try {
            const content = stringifyIni(this.config);
            fs.writeFileSync(this.iniPath, content, 'utf-8');
            console.log('[SafeMode] ✅ Configuration saved');
        } catch (error) {
            console.error('[SafeMode] ❌ Error saving config:', error);
        }
    }
    
    getDefaultConfig() {
        return {
            Display: {
                mode: 'auto',
                resolution_width: 1920,
                resolution_height: 1080,
                refresh_rate: 60
            },
            Rendering: {
                gpu_enabled: false,
                force_software_rendering: true,
                target_fps: 60
            },
            SafeMode: {
                enabled: false,
                failure_threshold: 3,
                failure_count: 0,
                last_working_html: 'index.html'
            },
            IDE: {
                html_file: 'index.html',
                monaco_enabled: true,
                load_all_features: true
            },
            Features: {
                unlimited_tabs: true,
                voice_coding: true,
                autocomplete: true,
                ai_chat: true,
                file_browser: true
            },
            Performance: {
                max_memory: 8192,
                dev_tools: true,
                log_level: 'info'
            }
        };
    }
    
    getHTMLFile() {
        // Check if safe mode is enabled
        if (this.config.SafeMode.enabled === 'true' || this.config.SafeMode.enabled === true) {
            console.log('[SafeMode] 🛡️ SAFE MODE ENABLED - Using fallback HTML');
            return this.config.SafeMode.last_working_html;
        }
        
        return this.config.IDE.html_file;
    }
    
    reportSuccess(htmlFile) {
        console.log(`[SafeMode] ✅ Success: ${htmlFile}`);
        
        // Reset failure count
        this.config.SafeMode.failure_count = 0;
        this.config.SafeMode.last_working_html = htmlFile;
        this.config.SafeMode.enabled = false;
        
        this.saveConfig();
    }
    
    reportFailure(htmlFile) {
        console.log(`[SafeMode] ❌ Failure detected: ${htmlFile}`);
        
        // Increment failure count
        let count = parseInt(this.config.SafeMode.failure_count) || 0;
        count++;
        this.config.SafeMode.failure_count = count;
        
        const threshold = parseInt(this.config.SafeMode.failure_threshold) || 3;
        
        console.log(`[SafeMode] Failure count: ${count}/${threshold}`);
        
        // Enable safe mode if threshold reached
        if (count >= threshold) {
            console.log('[SafeMode] 🛡️ THRESHOLD REACHED - Enabling Safe Mode');
            this.config.SafeMode.enabled = true;
            this.config.IDE.html_file = this.config.SafeMode.last_working_html;
        }
        
        this.saveConfig();
    }
    
    enableSafeMode() {
        console.log('[SafeMode] 🛡️ Manually enabling Safe Mode');
        this.config.SafeMode.enabled = true;
        this.config.IDE.html_file = this.config.SafeMode.last_working_html;
        this.saveConfig();
    }
    
    disableSafeMode() {
        console.log('[SafeMode] ✅ Disabling Safe Mode');
        this.config.SafeMode.enabled = false;
        this.config.SafeMode.failure_count = 0;
        this.saveConfig();
    }
    
    getConfig() {
        return this.config;
    }
    
    updateConfig(section, key, value) {
        if (!this.config[section]) {
            this.config[section] = {};
        }
        this.config[section][key] = value;
        this.saveConfig();
    }
}

module.exports = SafeModeDetector;

