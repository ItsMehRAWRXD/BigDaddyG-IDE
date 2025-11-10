/**
 * Layout Manager - Prevents panel overlap and respects settings
 */

class LayoutManager {
    constructor() {
        this.settings = {
            sidebarWidth: 250,
            rightSidebarWidth: 350,
            bottomPanelHeight: 250,
            minEditorWidth: 400,
            minEditorHeight: 300
        };
        this.loadSettings();
        this.init();
    }

    init() {
        this.applyLayout();
        window.addEventListener('resize', () => this.applyLayout());
        this.setupResizers();
        console.log('[Layout] ✅ Layout manager initialized');
    }

    loadSettings() {
        const saved = localStorage.getItem('bigdaddyg-layout-settings');
        if (saved) {
            Object.assign(this.settings, JSON.parse(saved));
        }
    }

    saveSettings() {
        localStorage.setItem('bigdaddyg-layout-settings', JSON.stringify(this.settings));
    }

    applyLayout() {
        const sidebar = document.getElementById('sidebar');
        const rightSidebar = document.getElementById('right-sidebar');
        const editorContainer = document.getElementById('editor-container');
        const bottomPanel = document.getElementById('bottom-panel');
        const mainContainer = document.getElementById('main-container');

        if (!mainContainer) return;

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const titleBarHeight = 32;

        // Calculate available space
        let leftOffset = 0;
        let rightOffset = 0;
        let bottomOffset = 0;

        // Left sidebar
        if (sidebar && !sidebar.classList.contains('collapsed')) {
            sidebar.style.width = `${this.settings.sidebarWidth}px`;
            sidebar.style.height = `${windowHeight - titleBarHeight}px`;
            leftOffset = this.settings.sidebarWidth;
        }

        // Right sidebar
        if (rightSidebar && !rightSidebar.classList.contains('collapsed')) {
            rightSidebar.style.width = `${this.settings.rightSidebarWidth}px`;
            rightSidebar.style.height = `${windowHeight - titleBarHeight}px`;
            rightOffset = this.settings.rightSidebarWidth;
        }

        // Bottom panel
        if (bottomPanel && !bottomPanel.classList.contains('collapsed')) {
            bottomPanel.style.height = `${this.settings.bottomPanelHeight}px`;
            bottomOffset = this.settings.bottomPanelHeight;
        }

        // Editor container - never overlap
        if (editorContainer) {
            const editorWidth = Math.max(
                windowWidth - leftOffset - rightOffset,
                this.settings.minEditorWidth
            );
            const editorHeight = Math.max(
                windowHeight - titleBarHeight - bottomOffset,
                this.settings.minEditorHeight
            );

            editorContainer.style.width = `${editorWidth}px`;
            editorContainer.style.height = `${editorHeight}px`;
            editorContainer.style.left = `${leftOffset}px`;
            editorContainer.style.top = `${titleBarHeight}px`;
        }

        // Position bottom panel
        if (bottomPanel) {
            bottomPanel.style.width = `${windowWidth - leftOffset - rightOffset}px`;
            bottomPanel.style.left = `${leftOffset}px`;
            bottomPanel.style.bottom = '0';
        }
    }

    setupResizers() {
        this.createResizer('sidebar', 'right', (delta) => {
            this.settings.sidebarWidth = Math.max(200, Math.min(500, this.settings.sidebarWidth + delta));
            this.saveSettings();
            this.applyLayout();
        });

        this.createResizer('right-sidebar', 'left', (delta) => {
            this.settings.rightSidebarWidth = Math.max(250, Math.min(600, this.settings.rightSidebarWidth - delta));
            this.saveSettings();
            this.applyLayout();
        });

        this.createResizer('bottom-panel', 'top', (delta) => {
            this.settings.bottomPanelHeight = Math.max(150, Math.min(500, this.settings.bottomPanelHeight - delta));
            this.saveSettings();
            this.applyLayout();
        });
    }

    createResizer(elementId, side, onResize) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const resizer = document.createElement('div');
        resizer.className = `resizer resizer-${side}`;
        resizer.style.cssText = `
            position: absolute;
            ${side}: 0;
            ${side === 'left' || side === 'right' ? 'top: 0; bottom: 0; width: 4px; cursor: ew-resize;' : 'left: 0; right: 0; height: 4px; cursor: ns-resize;'}
            background: transparent;
            z-index: 1000;
        `;

        let startPos = 0;
        let isDragging = false;

        resizer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPos = side === 'left' || side === 'right' ? e.clientX : e.clientY;
            document.body.style.cursor = side === 'left' || side === 'right' ? 'ew-resize' : 'ns-resize';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const currentPos = side === 'left' || side === 'right' ? e.clientX : e.clientY;
            const delta = currentPos - startPos;
            startPos = currentPos;
            onResize(delta);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
            }
        });

        element.appendChild(resizer);
    }

    togglePanel(panelId) {
        const panel = document.getElementById(panelId);
        if (!panel) return;

        panel.classList.toggle('collapsed');
        this.applyLayout();
    }

    resetLayout() {
        this.settings = {
            sidebarWidth: 250,
            rightSidebarWidth: 350,
            bottomPanelHeight: 250,
            minEditorWidth: 400,
            minEditorHeight: 300
        };
        this.saveSettings();
        this.applyLayout();
        console.log('[Layout] 🔄 Layout reset to defaults');
    }
}

// Initialize
if (typeof window !== 'undefined') {
    window.layoutManager = new LayoutManager();
}

module.exports = LayoutManager;