/**
 * BigDaddyG IDE - Cognitive Mode UI
 * 
 * UI components for cognitive mode toggles
 * Creates beautiful toggle switches for each mode
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

class CognitiveModeUI {
    constructor(modeManager) {
        this.modeManager = modeManager;
        this.container = null;
        this.toggles = {};
        
        console.log('[CognitiveModeUI] ✅ UI initialized');
    }

    /**
     * Create UI in container
     */
    createUI(container) {
        this.container = container;
        
        // Create main container
        const modesContainer = document.createElement('div');
        modesContainer.id = 'cognitive-modes-panel';
        modesContainer.className = 'cognitive-modes-panel';
        
        // Add title
        const title = document.createElement('div');
        title.className = 'modes-title';
        title.innerHTML = '🧠 <strong>Cognitive Modes</strong>';
        modesContainer.appendChild(title);

        // Add description
        const description = document.createElement('div');
        description.className = 'modes-description';
        description.textContent = 'Control AI reasoning capabilities';
        modesContainer.appendChild(description);

        // Create toggles for each mode
        const modesGrid = document.createElement('div');
        modesGrid.className = 'modes-grid';

        const modes = this.modeManager.getAllModes();
        for (const [key, mode] of Object.entries(modes)) {
            const toggleElement = this.createToggle(key, mode);
            modesGrid.appendChild(toggleElement);
            this.toggles[key] = toggleElement;
        }

        modesContainer.appendChild(modesGrid);

        // Add preset buttons
        const presetSection = this.createPresetSection();
        modesContainer.appendChild(presetSection);

        // Add statistics
        const statsSection = this.createStatsSection();
        modesContainer.appendChild(statsSection);

        // Add styles
        this.injectStyles();

        container.appendChild(modesContainer);
        
        console.log('[CognitiveModeUI] 🎨 UI created');
    }

    /**
     * Create toggle switch
     */
    createToggle(key, mode) {
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'mode-toggle-container';
        toggleContainer.dataset.mode = key;

        // Icon and name
        const header = document.createElement('div');
        header.className = 'mode-header';
        header.innerHTML = `
            <span class="mode-icon" style="color: ${mode.color}">${mode.icon}</span>
            <span class="mode-name">${mode.name}</span>
        `;

        // Toggle switch
        const toggleWrapper = document.createElement('label');
        toggleWrapper.className = 'mode-toggle';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = mode.enabled;
        checkbox.dataset.mode = key;
        
        checkbox.addEventListener('change', (e) => {
            this.handleToggle(key, e.target.checked);
        });

        const slider = document.createElement('span');
        slider.className = 'mode-slider';
        slider.style.setProperty('--mode-color', mode.color);

        toggleWrapper.appendChild(checkbox);
        toggleWrapper.appendChild(slider);

        // Description
        const desc = document.createElement('div');
        desc.className = 'mode-description';
        desc.textContent = mode.description;

        // Capabilities
        const capabilities = document.createElement('div');
        capabilities.className = 'mode-capabilities';
        capabilities.innerHTML = mode.capabilities
            .slice(0, 2)
            .map(cap => `<span class="capability-tag">${cap.replace(/_/g, ' ')}</span>`)
            .join('');

        // Weight slider
        const weightContainer = document.createElement('div');
        weightContainer.className = 'mode-weight';
        
        const weightLabel = document.createElement('label');
        weightLabel.textContent = 'Priority:';
        weightLabel.className = 'weight-label';

        const weightSlider = document.createElement('input');
        weightSlider.type = 'range';
        weightSlider.min = '0';
        weightSlider.max = '200';
        weightSlider.value = mode.weight * 100;
        weightSlider.className = 'weight-slider';
        weightSlider.dataset.mode = key;

        const weightValue = document.createElement('span');
        weightValue.className = 'weight-value';
        weightValue.textContent = mode.weight.toFixed(1);

        weightSlider.addEventListener('input', (e) => {
            const weight = parseInt(e.target.value) / 100;
            weightValue.textContent = weight.toFixed(1);
            this.modeManager.setWeight(key, weight);
        });

        weightContainer.appendChild(weightLabel);
        weightContainer.appendChild(weightSlider);
        weightContainer.appendChild(weightValue);

        // Assemble
        toggleContainer.appendChild(header);
        toggleContainer.appendChild(toggleWrapper);
        toggleContainer.appendChild(desc);
        toggleContainer.appendChild(capabilities);
        toggleContainer.appendChild(weightContainer);

        return toggleContainer;
    }

    /**
     * Create preset section
     */
    createPresetSection() {
        const section = document.createElement('div');
        section.className = 'preset-section';

        const title = document.createElement('div');
        title.className = 'preset-title';
        title.textContent = '⚡ Quick Presets';
        section.appendChild(title);

        const presets = [
            { name: 'default', label: '🎯 Default', desc: 'All modes enabled' },
            { name: 'coding', label: '💻 Coding', desc: 'Focus on development' },
            { name: 'research', label: '🔬 Research', desc: 'Deep investigation' },
            { name: 'planning', label: '📋 Planning', desc: 'Task organization' },
            { name: 'learning', label: '🎓 Learning', desc: 'Knowledge acquisition' },
            { name: 'fast', label: '⚡ Fast', desc: 'Quick responses' }
        ];

        const presetGrid = document.createElement('div');
        presetGrid.className = 'preset-grid';

        for (const preset of presets) {
            const button = document.createElement('button');
            button.className = 'preset-button';
            button.innerHTML = `
                <div class="preset-label">${preset.label}</div>
                <div class="preset-desc">${preset.desc}</div>
            `;
            button.addEventListener('click', () => {
                this.loadPreset(preset.name);
            });
            presetGrid.appendChild(button);
        }

        section.appendChild(presetGrid);
        return section;
    }

    /**
     * Create statistics section
     */
    createStatsSection() {
        const section = document.createElement('div');
        section.className = 'stats-section';
        section.id = 'cognitive-stats';

        this.updateStats(section);

        return section;
    }

    /**
     * Update statistics display
     */
    updateStats(container = null) {
        const statsContainer = container || document.getElementById('cognitive-stats');
        if (!statsContainer) return;

        const stats = this.modeManager.getStatistics();
        
        statsContainer.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Enabled:</span>
                <span class="stat-value">${stats.enabled}/${stats.totalModes}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Avg Priority:</span>
                <span class="stat-value">${stats.averageWeight.toFixed(1)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Total Toggles:</span>
                <span class="stat-value">${stats.totalToggles}</span>
            </div>
        `;
    }

    /**
     * Handle toggle change
     */
    handleToggle(key, checked) {
        if (checked) {
            this.modeManager.enable(key);
        } else {
            this.modeManager.disable(key);
        }

        this.updateStats();

        // Visual feedback
        const container = this.toggles[key];
        if (container) {
            container.classList.add('toggled');
            setTimeout(() => {
                container.classList.remove('toggled');
            }, 300);
        }
    }

    /**
     * Load preset
     */
    loadPreset(presetName) {
        this.modeManager.loadPreset(presetName);

        // Update all toggles
        const modes = this.modeManager.getAllModes();
        for (const [key, mode] of Object.entries(modes)) {
            const checkbox = document.querySelector(`input[data-mode="${key}"]`);
            if (checkbox) {
                checkbox.checked = mode.enabled;
            }
        }

        this.updateStats();

        // Visual feedback
        document.querySelectorAll('.mode-toggle-container').forEach(el => {
            el.classList.add('preset-loaded');
        });

        setTimeout(() => {
            document.querySelectorAll('.mode-toggle-container').forEach(el => {
                el.classList.remove('preset-loaded');
            });
        }, 500);

        console.log(`[CognitiveModeUI] 📦 Preset loaded: ${presetName}`);
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('cognitive-modes-styles')) {
            return; // Already injected
        }

        const style = document.createElement('style');
        style.id = 'cognitive-modes-styles';
        style.textContent = `
            .cognitive-modes-panel {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 12px;
                padding: 20px;
                color: #e0e0e0;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            }

            .modes-title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 8px;
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
            }

            .modes-description {
                color: #a0a0a0;
                margin-bottom: 20px;
                font-size: 14px;
            }

            .modes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }

            .mode-toggle-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                padding: 16px;
                transition: all 0.3s ease;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .mode-toggle-container:hover {
                background: rgba(255, 255, 255, 0.08);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }

            .mode-toggle-container.toggled {
                animation: pulse 0.3s ease;
            }

            .mode-toggle-container.preset-loaded {
                animation: flash 0.5s ease;
            }

            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.02); }
            }

            @keyframes flash {
                0%, 100% { background: rgba(255, 255, 255, 0.05); }
                50% { background: rgba(102, 126, 234, 0.2); }
            }

            .mode-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 12px;
            }

            .mode-icon {
                font-size: 24px;
            }

            .mode-name {
                font-size: 16px;
                font-weight: 600;
                color: #ffffff;
            }

            .mode-toggle {
                position: relative;
                display: inline-block;
                width: 50px;
                height: 26px;
                margin-bottom: 8px;
            }

            .mode-toggle input {
                opacity: 0;
                width: 0;
                height: 0;
            }

            .mode-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(255, 255, 255, 0.1);
                transition: 0.4s;
                border-radius: 26px;
            }

            .mode-slider:before {
                position: absolute;
                content: "";
                height: 18px;
                width: 18px;
                left: 4px;
                bottom: 4px;
                background-color: white;
                transition: 0.4s;
                border-radius: 50%;
            }

            input:checked + .mode-slider {
                background-color: var(--mode-color, #667eea);
                box-shadow: 0 0 12px var(--mode-color, #667eea);
            }

            input:checked + .mode-slider:before {
                transform: translateX(24px);
            }

            .mode-description {
                color: #b0b0b0;
                font-size: 12px;
                margin-bottom: 8px;
                line-height: 1.4;
            }

            .mode-capabilities {
                display: flex;
                flex-wrap: wrap;
                gap: 4px;
                margin-bottom: 12px;
            }

            .capability-tag {
                background: rgba(102, 126, 234, 0.2);
                color: #a0aeff;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                text-transform: capitalize;
            }

            .mode-weight {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 12px;
            }

            .weight-label {
                font-size: 11px;
                color: #909090;
                min-width: 60px;
            }

            .weight-slider {
                flex: 1;
                height: 4px;
                border-radius: 2px;
                outline: none;
                background: rgba(255, 255, 255, 0.1);
            }

            .weight-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
            }

            .weight-slider::-moz-range-thumb {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                background: #667eea;
                cursor: pointer;
                border: none;
                box-shadow: 0 0 8px rgba(102, 126, 234, 0.5);
            }

            .weight-value {
                font-size: 11px;
                color: #ffffff;
                min-width: 30px;
                text-align: right;
                font-weight: 600;
            }

            .preset-section {
                margin-top: 24px;
                padding-top: 24px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .preset-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 12px;
                color: #ffffff;
            }

            .preset-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 12px;
            }

            .preset-button {
                background: rgba(102, 126, 234, 0.1);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 8px;
                padding: 12px;
                cursor: pointer;
                transition: all 0.3s ease;
                color: #ffffff;
            }

            .preset-button:hover {
                background: rgba(102, 126, 234, 0.2);
                border-color: rgba(102, 126, 234, 0.5);
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
            }

            .preset-label {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 4px;
            }

            .preset-desc {
                font-size: 11px;
                color: #b0b0b0;
            }

            .stats-section {
                display: flex;
                gap: 16px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            .stat-item {
                flex: 1;
                background: rgba(255, 255, 255, 0.05);
                padding: 12px;
                border-radius: 8px;
                text-align: center;
            }

            .stat-label {
                display: block;
                font-size: 11px;
                color: #909090;
                margin-bottom: 4px;
            }

            .stat-value {
                display: block;
                font-size: 18px;
                font-weight: 700;
                color: #667eea;
            }
        `;

        document.head.appendChild(style);
    }
}

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CognitiveModeUI;
}
