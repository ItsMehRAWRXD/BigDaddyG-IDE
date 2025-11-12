/**
 * OPEN FILES PANEL - Shows all currently open editor tabs
 * Updates in real-time as files are opened/closed
 */

(function() {
'use strict';

class OpenFilesPanel {
    constructor() {
        this.files = [];
        this.visible = true;
        this.init();
    }
    
    init() {
        console.log('[OpenFiles] 📂 Initializing open files panel...');
        this.createPanel();
        this.startWatching();
        console.log('[OpenFiles] ✅ Open files panel ready');
    }
    
    createPanel() {
        // Check if panel already exists
        let panel = document.getElementById('open-files-panel');
        if (panel) {
            console.log('[OpenFiles] Panel already exists, updating...');
            return;
        }
        
        // Create sidebar panel
        panel = document.createElement('div');
        panel.id = 'open-files-panel';
        panel.style.cssText = `
            position: fixed;
            left: 0;
            top: 95px;
            width: 250px;
            bottom: 0;
            background: #05050f;
            border-right: 1px solid rgba(0, 212, 255, 0.2);
            z-index: 100;
            display: flex;
            flex-direction: column;
            transition: transform 0.3s;
        `;
        
        panel.innerHTML = `
            <div style="
                padding: 12px;
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: rgba(0, 212, 255, 0.05);
            ">
                <div style="
                    color: #00d4ff;
                    font-weight: bold;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">📂 Open Files</div>
                <button 
                    onclick="window.openFilesPanel.toggle()"
                    style="
                        background: none;
                        border: 1px solid #00d4ff;
                        color: #00d4ff;
                        padding: 2px 8px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 10px;
                        font-weight: bold;
                    "
                >─</button>
            </div>
            <div id="open-files-list" style="
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;
            "></div>
            <div style="
                padding: 8px 12px;
                border-top: 1px solid rgba(0, 212, 255, 0.2);
                font-size: 11px;
                color: #888;
                text-align: center;
            ">
                <span id="open-files-count">0 files open</span>
            </div>
        `;
        
        document.body.appendChild(panel);
        
        // Adjust main container to not overlap
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.marginLeft = '250px';
        }
        
        console.log('[OpenFiles] ✅ Panel created');
    }
    
    startWatching() {
        // Watch for tab changes every second
        setInterval(() => {
            this.updateFilesList();
        }, 1000);
        
        // Initial update
        setTimeout(() => this.updateFilesList(), 500);
    }
    
    updateFilesList() {
        if (!window.completeTabSystem) return;
        
        const openFiles = [];
        
        // Find all tabs with text editors
        window.completeTabSystem.tabs.forEach((tab, id) => {
            const textarea = tab.content.querySelector('textarea');
            const input = tab.content.querySelector('input[type="text"]');
            
            if (textarea || input) {
                const fileName = textarea?.dataset?.filePath || 
                               textarea?.dataset?.fileName || 
                               tab.button.querySelector('span:nth-child(2)')?.textContent ||
                               'Untitled';
                
                const isActive = id === window.completeTabSystem.activeTabId;
                
                openFiles.push({
                    id,
                    name: fileName,
                    active: isActive,
                    icon: this.getFileIcon(fileName)
                });
            }
        });
        
        this.files = openFiles;
        this.render();
    }
    
    getFileIcon(fileName) {
        if (!fileName) return '📄';
        
        const ext = fileName.split('.').pop().toLowerCase();
        
        const iconMap = {
            'js': '🟨',
            'ts': '🔷',
            'jsx': '⚛️',
            'tsx': '⚛️',
            'py': '🐍',
            'java': '☕',
            'cpp': '©️',
            'c': '©️',
            'cs': '🎯',
            'go': '🐹',
            'rs': '🦀',
            'php': '🐘',
            'rb': '💎',
            'swift': '🦅',
            'kt': '🟣',
            'html': '🌐',
            'css': '🎨',
            'json': '📦',
            'md': '📝',
            'txt': '📄',
            'xml': '📋',
            'yaml': '⚙️',
            'yml': '⚙️',
            'sh': '🐚',
            'bash': '🐚',
            'sql': '🗄️',
            'vue': '💚',
            'svelte': '🔥',
            'dart': '🎯'
        };
        
        return iconMap[ext] || '📄';
    }
    
    render() {
        const listEl = document.getElementById('open-files-list');
        const countEl = document.getElementById('open-files-count');
        
        if (!listEl) return;
        
        if (this.files.length === 0) {
            listEl.innerHTML = `
                <div style="
                    padding: 40px 20px;
                    text-align: center;
                    color: #888;
                    font-size: 13px;
                ">
                    <div style="font-size: 48px; margin-bottom: 12px; opacity: 0.3;">📂</div>
                    <div>No files open</div>
                    <div style="font-size: 11px; margin-top: 8px; opacity: 0.7;">Press Ctrl+T to create tabs</div>
                </div>
            `;
        } else {
            listEl.innerHTML = this.files.map(file => `
                <div 
                    class="open-file-item ${file.active ? 'active' : ''}"
                    onclick="window.completeTabSystem.activateTab('${file.id}')"
                    style="
                        padding: 10px 16px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        background: ${file.active ? 'rgba(0, 212, 255, 0.15)' : 'transparent'};
                        border-left: 3px solid ${file.active ? '#00d4ff' : 'transparent'};
                        color: ${file.active ? '#00d4ff' : '#ccc'};
                        transition: all 0.2s;
                        font-size: 13px;
                    "
                    onmouseover="if (!this.classList.contains('active')) { this.style.background='rgba(255,255,255,0.05)'; this.style.borderLeftColor='rgba(0,212,255,0.3)'; }"
                    onmouseout="if (!this.classList.contains('active')) { this.style.background='transparent'; this.style.borderLeftColor='transparent'; }"
                >
                    <span style="font-size: 16px;">${file.icon}</span>
                    <span style="
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        font-weight: ${file.active ? '600' : '400'};
                    ">${file.name}</span>
                    ${file.active ? '<span style="color: #00ff88; font-size: 10px;">●</span>' : ''}
                </div>
            `).join('');
        }
        
        // Update count
        if (countEl) {
            countEl.textContent = `${this.files.length} file${this.files.length === 1 ? '' : 's'} open`;
        }
    }
    
    toggle() {
        const panel = document.getElementById('open-files-panel');
        const mainContainer = document.getElementById('main-container');
        
        if (!panel) return;
        
        this.visible = !this.visible;
        
        if (this.visible) {
            panel.style.transform = 'translateX(0)';
            if (mainContainer) mainContainer.style.marginLeft = '250px';
        } else {
            panel.style.transform = 'translateX(-100%)';
            if (mainContainer) mainContainer.style.marginLeft = '0';
        }
        
        console.log('[OpenFiles] Panel', this.visible ? 'shown' : 'hidden');
    }
    
    show() {
        this.visible = true;
        const panel = document.getElementById('open-files-panel');
        const mainContainer = document.getElementById('main-container');
        if (panel) panel.style.transform = 'translateX(0)';
        if (mainContainer) mainContainer.style.marginLeft = '250px';
    }
    
    hide() {
        this.visible = false;
        const panel = document.getElementById('open-files-panel');
        const mainContainer = document.getElementById('main-container');
        if (panel) panel.style.transform = 'translateX(-100%)';
        if (mainContainer) mainContainer.style.marginLeft = '0';
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.openFilesPanel = new OpenFilesPanel();
    });
} else {
    window.openFilesPanel = new OpenFilesPanel();
}

// Also init after a short delay to ensure everything is loaded
setTimeout(() => {
    if (!window.openFilesPanel) {
        window.openFilesPanel = new OpenFilesPanel();
    }
}, 1000);

console.log('[OpenFiles] 📂 Module loaded');

})();
