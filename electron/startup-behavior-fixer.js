/**
 * Startup Behavior Fixer
 * Ensures panels/features start HIDDEN and only show when user requests
 * Fixes duplicate panels issue
 */

(function() {
    'use strict';

    console.log('[StartupFixer] 🔧 Fixing panel auto-show behavior...');

    // Wait for DOM to be ready
    function init() {
        // Give panels time to initialize
        setTimeout(() => {
            hidePanelsOnStartup();
            preventDuplicates();
            console.log('[StartupFixer] ✅ Startup behavior fixed');
        }, 1000);
    }

    /**
     * Hide all panels that shouldn't be visible on startup
     */
    function hidePanelsOnStartup() {
        const panelsToHide = [
            // Terminal/Console
            { id: 'terminal-panel', name: 'Terminal Panel' },
            { id: 'console-panel', name: 'Console Panel' },
            { id: 'enhanced-terminal-container', name: 'Enhanced Terminal' },
            
            // Sidebars
            { id: 'conversation-history-sidebar', name: 'Conversation History' },
            { id: 'agent-panel', name: 'Agent Panel' },
            
            // Floating elements
            { id: 'floating-chat-container', name: 'Floating Chat' },
            { id: 'performance-overlay', name: 'Performance Overlay' },
            { id: 'visual-test-overlay', name: 'Visual Test' },
            
            // Browser/Preview
            { id: 'browser-panel', name: 'Browser Panel' },
            { id: 'browser-container', name: 'Browser Container' },
            
            // Debug/Dev tools
            { id: 'memory-dashboard', name: 'Memory Dashboard' },
            { id: 'swarm-visualizer', name: 'Swarm Visualizer' },
            { id: 'optimizer-panel', name: 'Optimizer Panel' },
            
            // Modals/Dialogs
            { id: 'command-palette-modal', name: 'Command Palette' },
            { id: 'hotkey-help-modal', name: 'Hotkey Help' }
        ];

        let hiddenCount = 0;

        panelsToHide.forEach(({ id, name }) => {
            const element = document.getElementById(id);
            
            if (element) {
                // Check if it's visible
                const isVisible = element.style.display !== 'none' && 
                                 element.style.visibility !== 'hidden' &&
                                 !element.hasAttribute('hidden');

                if (isVisible) {
                    // Hide it
                    element.style.display = 'none';
                    hiddenCount++;
                    console.log(`[StartupFixer] 🙈 Hidden: ${name}`);
                }
            }
        });

        if (hiddenCount > 0) {
            console.log(`[StartupFixer] ✅ Hidden ${hiddenCount} panel(s) that were auto-shown`);
        } else {
            console.log('[StartupFixer] ✅ All panels already hidden on startup');
        }
    }

    /**
     * Prevent duplicate panels
     */
    function preventDuplicates() {
        // Check for duplicate IDs
        const allElements = document.querySelectorAll('[id]');
        const idCount = {};
        const duplicates = [];

        allElements.forEach(el => {
            const id = el.id;
            if (id) {
                idCount[id] = (idCount[id] || 0) + 1;
                if (idCount[id] > 1) {
                    duplicates.push(id);
                }
            }
        });

        if (duplicates.length > 0) {
            console.warn('[StartupFixer] ⚠️ Duplicate IDs found:', [...new Set(duplicates)]);
            
            // Remove duplicates (keep first, remove rest)
            duplicates.forEach(id => {
                const elements = document.querySelectorAll(`#${id}`);
                for (let i = 1; i < elements.length; i++) {
                    console.log(`[StartupFixer] 🗑️ Removing duplicate: ${id} (instance ${i + 1})`);
                    elements[i].remove();
                }
            });

            console.log(`[StartupFixer] ✅ Removed ${duplicates.length} duplicate panel(s)`);
        }
    }

    /**
     * Override common "show" methods to ensure clean behavior
     */
    function overrideShowMethods() {
        // Store original show methods
        const originalMethods = new Map();

        // Common panel objects that might auto-show
        const panelObjects = [
            'terminalPanelInstance',
            'consolePanelInstance', 
            'browserPanel',
            'webBrowser'
        ];

        panelObjects.forEach(objName => {
            if (window[objName] && typeof window[objName].show === 'function') {
                originalMethods.set(objName, window[objName].show);
                
                // Wrap show method
                window[objName].show = function(...args) {
                    console.log(`[StartupFixer] 📺 ${objName}.show() called`);
                    return originalMethods.get(objName).apply(this, args);
                };
            }
        });
    }

    /**
     * Add global toggle states to prevent conflicts
     */
    function initializeToggleStates() {
        if (!window.panelStates) {
            window.panelStates = {
                terminal: false,
                console: false,
                browser: false,
                chat: false,
                agent: false,
                settings: false
            };
        }
    }

    /**
     * Create unified toggle function
     */
    function createUnifiedToggles() {
        // Unified terminal toggle
        window.toggleTerminalPanel = function() {
            const panel = document.getElementById('terminal-panel') ||
                         document.getElementById('enhanced-terminal-container');
            
            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                window.panelStates.terminal = !isVisible;
                
                console.log(`[StartupFixer] Terminal: ${isVisible ? 'Hidden' : 'Shown'}`);
            }
        };

        // Unified console toggle
        window.toggleConsolePanel = function() {
            const panel = document.getElementById('console-panel');
            
            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                window.panelStates.console = !isVisible;
                
                console.log(`[StartupFixer] Console: ${isVisible ? 'Hidden' : 'Shown'}`);
            }
        };

        // Unified browser toggle
        window.toggleBrowserPanel = function() {
            const panel = document.getElementById('browser-panel') ||
                         document.getElementById('browser-container');
            
            if (panel) {
                const isVisible = panel.style.display !== 'none';
                panel.style.display = isVisible ? 'none' : 'block';
                window.panelStates.browser = !isVisible;
                
                console.log(`[StartupFixer] Browser: ${isVisible ? 'Hidden' : 'Shown'}`);
            }
        };

        console.log('[StartupFixer] ✅ Unified toggle functions created');
    }

    /**
     * Fix hotkey conflicts
     */
    function fixHotkeyConflicts() {
        // Ensure Ctrl+J only toggles terminal once
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'j') {
                e.preventDefault();
                e.stopPropagation();
                
                // Use unified toggle
                if (window.toggleTerminalPanel) {
                    window.toggleTerminalPanel();
                }
            }
        }, { capture: true }); // Capture phase to catch early

        console.log('[StartupFixer] ✅ Hotkey conflicts fixed');
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            initializeToggleStates();
            createUnifiedToggles();
            overrideShowMethods();
            fixHotkeyConflicts();
        });
    } else {
        init();
        initializeToggleStates();
        createUnifiedToggles();
        overrideShowMethods();
        fixHotkeyConflicts();
    }

    // Expose utility for debugging
    window.debugPanels = function() {
        console.log('=== PANEL DEBUG INFO ===');
        console.log('Panel States:', window.panelStates);
        
        const panels = document.querySelectorAll('[id*="panel"], [id*="container"]');
        console.log(`\nFound ${panels.length} panel-like elements:`);
        
        panels.forEach(panel => {
            const isVisible = panel.style.display !== 'none' && 
                            panel.style.visibility !== 'hidden' &&
                            !panel.hasAttribute('hidden');
            
            console.log(`  ${panel.id}: ${isVisible ? '✅ Visible' : '🙈 Hidden'}`);
        });
    };

})();
