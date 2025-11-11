/**
 * BigDaddyG IDE - Cognitive Modes IDE Integration
 * 
 * Integrates cognitive modes into the main IDE
 * Adds to settings panel and creates standalone tab
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeCognitiveModes);
    } else {
        initializeCognitiveModes();
    }

    function initializeCognitiveModes() {
        console.log('[CognitiveModes] 🚀 Initializing IDE integration...');

        // Initialize mode manager
        const configPath = './cognitive-modes-config.json';
        window.cognitiveModeManager = new CognitiveModeManager();
        window.cognitiveModeManager.initialize(configPath);

        // Initialize UI
        window.cognitiveModeUI = new CognitiveModeUI(window.cognitiveModeManager);

        // Integrate with AI system if available
        if (window.aiSystem) {
            window.cognitiveAIIntegration = new CognitiveAIIntegration(
                window.cognitiveModeManager,
                window.aiSystem
            );
            console.log('[CognitiveModes] ✅ AI integration enabled');
        } else {
            // Create mock AI system for now
            window.aiSystem = {
                parameters: {},
                setParameter(key, value) {
                    this.parameters[key] = value;
                }
            };
            
            window.cognitiveAIIntegration = new CognitiveAIIntegration(
                window.cognitiveModeManager,
                window.aiSystem
            );
            console.log('[CognitiveModes] ⚠️ Using mock AI system');
        }

        // Add to settings panel
        addToSettingsPanel();

        // Create standalone tab
        createCognitiveModeTab();

        // Add keyboard shortcuts
        addKeyboardShortcuts();

        // Add to sidebar
        addToSidebar();

        console.log('[CognitiveModes] ✅ IDE integration complete!');
    }

    /**
     * Add cognitive modes section to settings panel
     */
    function addToSettingsPanel() {
        // Wait for settings panel to be available
        const checkSettings = setInterval(() => {
            const settingsContent = document.getElementById('settings-tab-content');
            
            if (settingsContent) {
                clearInterval(checkSettings);

                // Create section
                const section = document.createElement('div');
                section.id = 'cognitive-modes-settings-section';
                section.className = 'settings-section';
                section.style.marginTop = '20px';

                const header = document.createElement('h2');
                header.innerHTML = '🧠 Cognitive Modes';
                header.style.marginBottom = '15px';
                section.appendChild(header);

                const description = document.createElement('p');
                description.textContent = 'Control AI reasoning capabilities with fine-grained toggles and priority sliders.';
                description.style.color = '#a0a0a0';
                description.style.marginBottom = '20px';
                section.appendChild(description);

                // Create modes container
                const modesContainer = document.createElement('div');
                modesContainer.id = 'cognitive-modes-settings-container';
                section.appendChild(modesContainer);

                // Add to settings panel
                settingsContent.appendChild(section);

                // Create UI in the container
                window.cognitiveModeUI.createUI(modesContainer);

                console.log('[CognitiveModes] ✅ Added to settings panel');
            }
        }, 100);

        // Timeout after 5 seconds
        setTimeout(() => clearInterval(checkSettings), 5000);
    }

    /**
     * Create standalone cognitive modes tab
     */
    function createCognitiveModeTab() {
        // Create tab content container
        const tabContent = document.createElement('div');
        tabContent.id = 'cognitive-modes-tab-content';
        tabContent.className = 'tab-content';
        tabContent.style.cssText = 'display: none; flex: 1; overflow-y: auto; padding: 20px;';

        // Add header
        const header = document.createElement('div');
        header.style.cssText = 'margin-bottom: 30px; text-align: center;';
        header.innerHTML = `
            <h1 style="font-size: 36px; margin-bottom: 10px;">
                🧠 Cognitive Modes
            </h1>
            <p style="color: #a0a0a0; font-size: 16px;">
                Control AI reasoning capabilities
            </p>
        `;
        tabContent.appendChild(header);

        // Create modes container
        const modesContainer = document.createElement('div');
        modesContainer.id = 'cognitive-modes-tab-container';
        modesContainer.style.cssText = 'max-width: 1400px; margin: 0 auto;';
        tabContent.appendChild(modesContainer);

        // Add to main content area
        const mainContent = document.querySelector('#main-content') || 
                           document.querySelector('#content-area') ||
                           document.body;
        
        mainContent.appendChild(tabContent);

        // Create UI in the container
        window.cognitiveModeUI.createUI(modesContainer);

        // Register with tab system if available
        if (window.tabSystem) {
            window.tabSystem.registerCognitiveModeTab = function() {
                // Hide all other tabs
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
                
                // Show cognitive modes tab
                tabContent.style.display = 'flex';
                tabContent.style.flexDirection = 'column';
                
                console.log('[CognitiveModes] 📂 Tab opened');
            };
        }

        // Global function to open cognitive modes
        window.openCognitiveModes = function() {
            if (window.tabSystem && window.tabSystem.registerCognitiveModeTab) {
                window.tabSystem.registerCognitiveModeTab();
            } else {
                // Fallback: just show the tab
                document.querySelectorAll('.tab-content').forEach(tab => {
                    tab.style.display = 'none';
                });
                tabContent.style.display = 'flex';
                tabContent.style.flexDirection = 'column';
            }
        };

        console.log('[CognitiveModes] ✅ Standalone tab created');
    }

    /**
     * Add keyboard shortcuts
     */
    function addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+M - Open Cognitive Modes
            if (e.ctrlKey && e.shiftKey && e.key === 'M') {
                e.preventDefault();
                window.openCognitiveModes();
                console.log('[CognitiveModes] ⌨️ Keyboard shortcut triggered');
            }

            // Ctrl+Alt+1-5 - Toggle individual modes
            if (e.ctrlKey && e.altKey && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const modes = ['thinking', 'search', 'planning', 'reflect', 'learn'];
                const index = parseInt(e.key) - 1;
                const mode = modes[index];
                
                if (mode) {
                    window.cognitiveModeManager.toggle(mode);
                    
                    // Show toast notification
                    showToast(`${mode} mode: ${window.cognitiveModeManager.isEnabled(mode) ? 'ON' : 'OFF'}`);
                }
            }

            // Ctrl+Alt+P - Open preset selector
            if (e.ctrlKey && e.altKey && e.key === 'P') {
                e.preventDefault();
                showPresetSelector();
            }
        });

        console.log('[CognitiveModes] ⌨️ Keyboard shortcuts registered');
        console.log('  Ctrl+Shift+M: Open Cognitive Modes');
        console.log('  Ctrl+Alt+1-5: Toggle modes');
        console.log('  Ctrl+Alt+P: Preset selector');
    }

    /**
     * Add to sidebar (if sidebar exists)
     */
    function addToSidebar() {
        const checkSidebar = setInterval(() => {
            const sidebar = document.querySelector('.sidebar-quick-buttons') ||
                           document.querySelector('.sidebar-buttons');
            
            if (sidebar) {
                clearInterval(checkSidebar);

                const button = document.createElement('button');
                button.className = 'sidebar-quick-button';
                button.innerHTML = `
                    🧠 Cognitive Modes <span class="shortcut">Ctrl+Shift+M</span>
                `;
                button.onclick = window.openCognitiveModes;
                
                sidebar.appendChild(button);

                console.log('[CognitiveModes] ✅ Added to sidebar');
            }
        }, 100);

        setTimeout(() => clearInterval(checkSidebar), 5000);
    }

    /**
     * Show toast notification
     */
    function showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'cognitive-mode-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(toast);

        // Remove after 2 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    /**
     * Show preset selector dialog
     */
    function showPresetSelector() {
        const presets = {
            'default': '🎯 Default - All modes enabled',
            'coding': '💻 Coding - Focus on development',
            'research': '🔬 Research - Deep investigation',
            'planning': '📋 Planning - Task organization',
            'learning': '🎓 Learning - Knowledge acquisition',
            'fast': '⚡ Fast - Quick responses'
        };

        const dialog = document.createElement('div');
        dialog.className = 'cognitive-preset-dialog';
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #1a1a2e;
            border: 2px solid #667eea;
            border-radius: 12px;
            padding: 24px;
            z-index: 10000;
            min-width: 400px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        `;

        let html = '<h3 style="margin-bottom: 16px; color: #667eea;">Select Preset</h3>';
        
        for (const [key, label] of Object.entries(presets)) {
            html += `
                <button onclick="window.cognitiveModeManager.loadPreset('${key}'); this.parentElement.remove();"
                        style="display: block; width: 100%; padding: 12px; margin: 8px 0; 
                               background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3);
                               border-radius: 8px; color: white; cursor: pointer; text-align: left;">
                    ${label}
                </button>
            `;
        }

        html += `
            <button onclick="this.parentElement.remove();"
                    style="display: block; width: 100%; padding: 12px; margin-top: 16px; 
                           background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                           border-radius: 8px; color: white; cursor: pointer;">
                Cancel
            </button>
        `;

        dialog.innerHTML = html;
        document.body.appendChild(dialog);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }

        .sidebar-quick-button:hover {
            background: rgba(102, 126, 234, 0.2);
        }

        .cognitive-preset-dialog button:hover {
            background: rgba(102, 126, 234, 0.2) !important;
            border-color: rgba(102, 126, 234, 0.5) !important;
            transform: translateY(-2px);
        }
    `;
    document.head.appendChild(style);

})();
