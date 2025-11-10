/**
 * BigDaddyG IDE - Integration Updates
 * Ensures layout manager and chat history work together seamlessly
 */

(function() {
'use strict';

console.log('[Integration] 🔧 Applying UI integration updates...');

// Wait for core systems to load
function waitForSystems() {
    return new Promise((resolve) => {
        const checkSystems = () => {
            if (window.layoutManager && window.chatHistory) {
                resolve();
            } else {
                setTimeout(checkSystems, 100);
            }
        };
        checkSystems();
    });
}

// Initialize integration
async function initializeIntegration() {
    await waitForSystems();
    
    console.log('[Integration] ✅ Core systems ready, applying integrations...');
    
    // 1. Ensure layout manager respects chat history panel
    if (window.layoutManager && window.chatHistory) {
        // Hook into layout changes to preserve chat history
        const originalApplyLayout = window.layoutManager.applyLayout;
        window.layoutManager.applyLayout = function() {
            originalApplyLayout.call(this);
            
            // Ensure chat history container maintains proper sizing
            const chatContainer = document.getElementById('ai-chat-messages');
            if (chatContainer) {
                // Let layout manager handle the sizing
                chatContainer.style.height = 'auto';
                chatContainer.style.flex = '1';
            }
        };
        
        console.log('[Integration] ✅ Layout manager integrated with chat history');
    }
    
    // 2. Add keyboard shortcuts for new chat
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'n' && !e.shiftKey) {
            // Only create new chat if not in editor
            const activeElement = document.activeElement;
            if (!activeElement || !activeElement.closest('#monaco-container')) {
                e.preventDefault();
                if (window.chatHistory) {
                    window.chatHistory.createNewChat();
                }
            }
        }
    });
    
    // 3. Ensure panels collapse properly
    const setupPanelToggle = (panelId, toggleKey) => {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === toggleKey) {
                e.preventDefault();
                if (window.layoutManager) {
                    window.layoutManager.togglePanel(panelId);
                }
            }
        });
    };
    
    // Setup panel toggles
    setupPanelToggle('sidebar', '[');
    setupPanelToggle('right-sidebar', ']');
    setupPanelToggle('bottom-panel', '`');
    
    // 4. Auto-save layout settings when panels are resized
    if (window.layoutManager) {
        const observer = new MutationObserver(() => {
            // Debounce saves
            clearTimeout(window.layoutSaveTimeout);
            window.layoutSaveTimeout = setTimeout(() => {
                window.layoutManager.saveSettings();
            }, 1000);
        });
        
        // Observe panel size changes
        ['sidebar', 'right-sidebar', 'bottom-panel'].forEach(id => {
            const panel = document.getElementById(id);
            if (panel) {
                observer.observe(panel, { 
                    attributes: true, 
                    attributeFilter: ['style', 'class'] 
                });
            }
        });
        
        console.log('[Integration] ✅ Auto-save for layout settings enabled');
    }
    
    // 5. Integrate chat history with window focus/blur
    window.addEventListener('focus', () => {
        if (window.chatHistory) {
            // Resume current chat when window gains focus
            const currentChat = window.chatHistory.getCurrentChat();
            if (currentChat) {
                window.chatHistory.loadChatIntoUI(currentChat);
            }
        }
    });
    
    window.addEventListener('beforeunload', () => {
        if (window.chatHistory) {
            // Save chat state before closing
            window.chatHistory.saveChats();
        }
        if (window.layoutManager) {
            // Save layout state before closing
            window.layoutManager.saveSettings();
        }
    });
    
    // 6. Add visual feedback for panel operations
    const addPanelFeedback = (panelId, action) => {
        const panel = document.getElementById(panelId);
        if (panel) {
            // Add temporary visual feedback
            const feedback = document.createElement('div');
            feedback.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: var(--cursor-accent);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                pointer-events: none;
                animation: fadeInOut 2s ease-in-out;
            `;
            feedback.textContent = action;
            panel.style.position = 'relative';
            panel.appendChild(feedback);
            
            setTimeout(() => feedback.remove(), 2000);
        }
    };
    
    // Override panel toggle to add feedback
    if (window.layoutManager) {
        const originalTogglePanel = window.layoutManager.togglePanel;
        window.layoutManager.togglePanel = function(panelId) {
            const panel = document.getElementById(panelId);
            const isCollapsed = panel?.classList.contains('collapsed');
            
            originalTogglePanel.call(this, panelId);
            
            // Add feedback
            const action = isCollapsed ? 'Panel Expanded' : 'Panel Collapsed';
            addPanelFeedback(panelId, action);
        };
    }
    
    // 7. Add CSS animations for smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
        
        /* Smooth panel transitions */
        #sidebar, #right-sidebar, #bottom-panel {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        
        /* Chat message animations */
        .chat-message {
            animation: slideInFromBottom 0.3s ease-out;
        }
        
        @keyframes slideInFromBottom {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Panel resize handles */
        .resizer {
            transition: background-color 0.2s ease;
        }
        
        .resizer:hover {
            background-color: var(--cursor-accent) !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('[Integration] ✅ Enhanced animations and transitions added');
    
    // 8. Status indicator for integration health
    const createStatusIndicator = () => {
        const indicator = document.createElement('div');
        indicator.id = 'integration-status';
        indicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: var(--cursor-jade-dark);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            z-index: 10000;
            opacity: 0.8;
            pointer-events: none;
        `;
        indicator.innerHTML = '✅ UI Integration Active';
        document.body.appendChild(indicator);
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            indicator.style.transition = 'opacity 1s ease';
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 1000);
        }, 3000);
    };
    
    createStatusIndicator();
    
    console.log('[Integration] 🎉 All UI integration updates applied successfully!');
    
    // 9. Expose integration API
    window.ideIntegration = {
        version: '1.0.0',
        features: [
            'Layout Manager Integration',
            'Chat History Persistence', 
            'Panel Auto-Save',
            'Keyboard Shortcuts',
            'Visual Feedback',
            'Smooth Animations'
        ],
        
        // Utility functions
        resetLayout: () => {
            if (window.layoutManager) {
                window.layoutManager.resetLayout();
                addPanelFeedback('main-container', 'Layout Reset');
            }
        },
        
        exportChatHistory: () => {
            if (window.chatHistory) {
                window.chatHistory.exportChats();
            }
        },
        
        newChat: () => {
            if (window.chatHistory) {
                window.chatHistory.createNewChat();
            }
        },
        
        toggleAllPanels: () => {
            ['sidebar', 'right-sidebar', 'bottom-panel'].forEach(id => {
                if (window.layoutManager) {
                    window.layoutManager.togglePanel(id);
                }
            });
        }
    };
    
    console.log('[Integration] 🔧 Integration API exposed as window.ideIntegration');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeIntegration);
} else {
    initializeIntegration();
}

})();