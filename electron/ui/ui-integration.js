/**
 * UI Integration - Connects layout manager with chat history
 */

class UIIntegration {
    constructor() {
        this.init();
    }

    init() {
        // Wait for both managers to be ready
        this.waitForManagers().then(() => {
            this.setupIntegration();
            console.log('[UI] ✅ UI integration ready');
        });
    }

    async waitForManagers() {
        return new Promise((resolve) => {
            const check = () => {
                if (window.layoutManager && window.chatHistory) {
                    resolve();
                } else {
                    setTimeout(check, 100);
                }
            };
            check();
        });
    }

    setupIntegration() {
        // Sync layout changes with chat UI
        const originalApplyLayout = window.layoutManager.applyLayout;
        window.layoutManager.applyLayout = () => {
            originalApplyLayout.call(window.layoutManager);
            this.updateChatContainers();
        };

        // Handle panel toggles
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-toggle-panel]')) {
                const panelId = e.target.dataset.togglePanel;
                window.layoutManager.togglePanel(panelId);
            }
        });
    }

    updateChatContainers() {
        const containers = window.chatHistory?.getActiveContainers() || [];
        containers.forEach(container => {
            // Ensure chat containers respect layout bounds
            container.style.maxHeight = 'calc(100% - 60px)';
            container.style.overflowY = 'auto';
        });
    }
}

// Initialize
if (typeof window !== 'undefined') {
    window.uiIntegration = new UIIntegration();
}

module.exports = UIIntegration;