/**
 * BigDaddyG IDE - Cognitive Mode Manager
 * 
 * Manages AI cognitive modes:
 * - Thinking Mode: Deep reasoning and analysis
 * - Search Mode: Information retrieval and research
 * - Planning Mode: Task breakdown and scheduling
 * - Reflect Mode: Self-assessment and improvement
 * - Learn Mode: Knowledge acquisition and adaptation
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

const EventEmitter = require('events');
const fs = require('fs');
const path = require('path');

class CognitiveModeManager extends EventEmitter {
    constructor() {
        super();
        
        this.modes = {
            thinking: {
                enabled: true,
                name: 'Thinking',
                description: 'Deep reasoning and analysis',
                icon: '🧠',
                color: '#8B5CF6',
                weight: 1.0,
                capabilities: [
                    'complex_reasoning',
                    'problem_solving',
                    'logical_analysis',
                    'context_understanding'
                ]
            },
            search: {
                enabled: true,
                name: 'Search',
                description: 'Information retrieval and research',
                icon: '🔍',
                color: '#3B82F6',
                weight: 1.0,
                capabilities: [
                    'web_search',
                    'documentation_lookup',
                    'code_search',
                    'knowledge_base'
                ]
            },
            planning: {
                enabled: true,
                name: 'Planning',
                description: 'Task breakdown and scheduling',
                icon: '📋',
                color: '#10B981',
                weight: 1.0,
                capabilities: [
                    'task_decomposition',
                    'dependency_mapping',
                    'time_estimation',
                    'priority_setting'
                ]
            },
            reflect: {
                enabled: true,
                name: 'Reflect',
                description: 'Self-assessment and improvement',
                icon: '💭',
                color: '#F59E0B',
                weight: 1.0,
                capabilities: [
                    'quality_assessment',
                    'error_analysis',
                    'improvement_suggestions',
                    'learning_from_mistakes'
                ]
            },
            learn: {
                enabled: true,
                name: 'Learn',
                description: 'Knowledge acquisition and adaptation',
                icon: '📚',
                color: '#EF4444',
                weight: 1.0,
                capabilities: [
                    'pattern_recognition',
                    'knowledge_integration',
                    'skill_development',
                    'adaptive_behavior'
                ]
            }
        };

        this.history = [];
        this.configPath = null;
        
        console.log('[CognitiveModes] ✅ Initialized with 5 modes');
        this.displayModes();
    }

    /**
     * Initialize with config path
     */
    initialize(configPath) {
        this.configPath = configPath;
        this.loadConfig();
        console.log('[CognitiveModes] 📁 Configuration loaded from:', configPath);
    }

    /**
     * Display current modes
     */
    displayModes() {
        console.log('\n🧠 COGNITIVE MODES:\n');
        for (const [key, mode] of Object.entries(this.modes)) {
            const status = mode.enabled ? '🟢 ON' : '🔴 OFF';
            console.log(`  ${mode.icon} ${mode.name}: ${status}`);
            console.log(`     ${mode.description}`);
        }
        console.log('');
    }

    /**
     * Toggle a mode
     */
    toggle(modeName) {
        const mode = this.modes[modeName];
        
        if (!mode) {
            console.error(`[CognitiveModes] ❌ Unknown mode: ${modeName}`);
            return false;
        }

        mode.enabled = !mode.enabled;
        
        const status = mode.enabled ? 'ENABLED' : 'DISABLED';
        console.log(`[CognitiveModes] ${mode.icon} ${mode.name}: ${status}`);

        // Record in history
        this.history.push({
            mode: modeName,
            action: mode.enabled ? 'enable' : 'disable',
            timestamp: Date.now()
        });

        // Emit event
        this.emit('modeToggled', {
            mode: modeName,
            enabled: mode.enabled,
            config: mode
        });

        // Save config
        this.saveConfig();

        return mode.enabled;
    }

    /**
     * Enable a mode
     */
    enable(modeName) {
        const mode = this.modes[modeName];
        
        if (!mode) {
            console.error(`[CognitiveModes] ❌ Unknown mode: ${modeName}`);
            return false;
        }

        if (!mode.enabled) {
            return this.toggle(modeName);
        }

        return true;
    }

    /**
     * Disable a mode
     */
    disable(modeName) {
        const mode = this.modes[modeName];
        
        if (!mode) {
            console.error(`[CognitiveModes] ❌ Unknown mode: ${modeName}`);
            return false;
        }

        if (mode.enabled) {
            return !this.toggle(modeName);
        }

        return true;
    }

    /**
     * Check if mode is enabled
     */
    isEnabled(modeName) {
        return this.modes[modeName]?.enabled || false;
    }

    /**
     * Get mode status
     */
    getMode(modeName) {
        return this.modes[modeName] || null;
    }

    /**
     * Get all modes
     */
    getAllModes() {
        return this.modes;
    }

    /**
     * Get enabled modes
     */
    getEnabledModes() {
        const enabled = {};
        for (const [key, mode] of Object.entries(this.modes)) {
            if (mode.enabled) {
                enabled[key] = mode;
            }
        }
        return enabled;
    }

    /**
     * Get mode configuration for AI
     */
    getAIConfig() {
        const config = {
            modes: {},
            capabilities: [],
            weights: {}
        };

        for (const [key, mode] of Object.entries(this.modes)) {
            if (mode.enabled) {
                config.modes[key] = true;
                config.capabilities.push(...mode.capabilities);
                config.weights[key] = mode.weight;
            }
        }

        return config;
    }

    /**
     * Set mode weight (importance/priority)
     */
    setWeight(modeName, weight) {
        const mode = this.modes[modeName];
        
        if (!mode) {
            console.error(`[CognitiveModes] ❌ Unknown mode: ${modeName}`);
            return false;
        }

        mode.weight = Math.max(0, Math.min(2.0, weight)); // Clamp 0-2
        console.log(`[CognitiveModes] ⚖️ ${mode.name} weight: ${mode.weight}`);

        this.emit('weightChanged', {
            mode: modeName,
            weight: mode.weight
        });

        this.saveConfig();
        return true;
    }

    /**
     * Enable all modes
     */
    enableAll() {
        console.log('[CognitiveModes] 🟢 Enabling all modes...');
        
        for (const key of Object.keys(this.modes)) {
            this.modes[key].enabled = true;
        }

        this.emit('allModesEnabled');
        this.saveConfig();
        this.displayModes();
    }

    /**
     * Disable all modes
     */
    disableAll() {
        console.log('[CognitiveModes] 🔴 Disabling all modes...');
        
        for (const key of Object.keys(this.modes)) {
            this.modes[key].enabled = false;
        }

        this.emit('allModesDisabled');
        this.saveConfig();
        this.displayModes();
    }

    /**
     * Load preset configuration
     */
    loadPreset(presetName) {
        console.log(`[CognitiveModes] 📦 Loading preset: ${presetName}`);

        const presets = {
            default: {
                thinking: true,
                search: true,
                planning: true,
                reflect: true,
                learn: true
            },
            coding: {
                thinking: true,
                search: true,
                planning: false,
                reflect: true,
                learn: true
            },
            research: {
                thinking: true,
                search: true,
                planning: false,
                reflect: false,
                learn: true
            },
            planning: {
                thinking: true,
                search: false,
                planning: true,
                reflect: true,
                learn: false
            },
            learning: {
                thinking: true,
                search: true,
                planning: false,
                reflect: true,
                learn: true
            },
            fast: {
                thinking: false,
                search: false,
                planning: false,
                reflect: false,
                learn: false
            }
        };

        const preset = presets[presetName];
        
        if (!preset) {
            console.error(`[CognitiveModes] ❌ Unknown preset: ${presetName}`);
            return false;
        }

        for (const [key, enabled] of Object.entries(preset)) {
            if (this.modes[key]) {
                this.modes[key].enabled = enabled;
            }
        }

        this.emit('presetLoaded', { preset: presetName });
        this.saveConfig();
        this.displayModes();
        return true;
    }

    /**
     * Get current configuration as preset
     */
    getCurrentPreset() {
        const preset = {};
        for (const [key, mode] of Object.entries(this.modes)) {
            preset[key] = mode.enabled;
        }
        return preset;
    }

    /**
     * Save configuration
     */
    saveConfig() {
        if (!this.configPath) {
            return;
        }

        try {
            const config = {
                modes: {},
                timestamp: Date.now()
            };

            for (const [key, mode] of Object.entries(this.modes)) {
                config.modes[key] = {
                    enabled: mode.enabled,
                    weight: mode.weight
                };
            }

            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
            console.log('[CognitiveModes] 💾 Configuration saved');
        } catch (error) {
            console.error('[CognitiveModes] ❌ Error saving config:', error);
        }
    }

    /**
     * Load configuration
     */
    loadConfig() {
        if (!this.configPath || !fs.existsSync(this.configPath)) {
            return;
        }

        try {
            const data = fs.readFileSync(this.configPath, 'utf8');
            const config = JSON.parse(data);

            if (config.modes) {
                for (const [key, settings] of Object.entries(config.modes)) {
                    if (this.modes[key]) {
                        this.modes[key].enabled = settings.enabled;
                        if (settings.weight !== undefined) {
                            this.modes[key].weight = settings.weight;
                        }
                    }
                }
            }

            console.log('[CognitiveModes] 📂 Configuration loaded');
        } catch (error) {
            console.error('[CognitiveModes] ❌ Error loading config:', error);
        }
    }

    /**
     * Get mode statistics
     */
    getStatistics() {
        const stats = {
            totalModes: Object.keys(this.modes).length,
            enabled: 0,
            disabled: 0,
            totalToggles: this.history.length,
            mostToggled: null,
            averageWeight: 0
        };

        const toggleCounts = {};
        let totalWeight = 0;

        for (const [key, mode] of Object.entries(this.modes)) {
            if (mode.enabled) {
                stats.enabled++;
            } else {
                stats.disabled++;
            }
            totalWeight += mode.weight;
        }

        stats.averageWeight = totalWeight / stats.totalModes;

        // Count toggles per mode
        for (const entry of this.history) {
            toggleCounts[entry.mode] = (toggleCounts[entry.mode] || 0) + 1;
        }

        // Find most toggled
        let maxToggles = 0;
        for (const [mode, count] of Object.entries(toggleCounts)) {
            if (count > maxToggles) {
                maxToggles = count;
                stats.mostToggled = { mode, count };
            }
        }

        return stats;
    }

    /**
     * Get mode history
     */
    getHistory(limit = 10) {
        return this.history.slice(-limit);
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.history = [];
        console.log('[CognitiveModes] 🗑️ History cleared');
    }

    /**
     * Export configuration
     */
    exportConfig() {
        return {
            modes: JSON.parse(JSON.stringify(this.modes)),
            history: this.history,
            statistics: this.getStatistics()
        };
    }

    /**
     * Import configuration
     */
    importConfig(config) {
        if (config.modes) {
            for (const [key, mode] of Object.entries(config.modes)) {
                if (this.modes[key]) {
                    this.modes[key].enabled = mode.enabled;
                    this.modes[key].weight = mode.weight || 1.0;
                }
            }
            this.saveConfig();
            console.log('[CognitiveModes] 📥 Configuration imported');
            return true;
        }
        return false;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CognitiveModeManager;
}

// Auto-start if run directly
if (require.main === module) {
    const manager = new CognitiveModeManager();
    
    console.log('\n🧪 TESTING MODE TOGGLES:\n');
    
    // Test toggles
    manager.toggle('thinking');
    manager.toggle('search');
    manager.toggle('thinking'); // Toggle back on
    
    console.log('\n📊 STATISTICS:', manager.getStatistics());
    console.log('\n🟢 ENABLED MODES:', Object.keys(manager.getEnabledModes()));
    console.log('\n⚙️ AI CONFIG:', manager.getAIConfig());
}
