/**
 * BigDaddyG IDE - File Explorer Component
 * Full-featured file browser with open/save/create
 */

(function() {
'use strict';

console.log('[FileExplorer] 📁 Loading file explorer component...');

class FileExplorerComponent {
    constructor(containerId) {
        this.containerId = containerId;
        this.currentPath = null;
        this.files = [];
        this.selectedFile = null;
    }
    
    async initialize() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error('[FileExplorer] Container not found:', this.containerId);
            return;
        }
        
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; height: 100%; background: rgba(0, 0, 0, 0.2); border-radius: 8px;">
                <!-- Toolbar -->
                <div style="display: flex; gap: 10px; padding: 15px; background: rgba(0, 212, 255, 0.1); border-bottom: 1px solid rgba(0, 212, 255, 0.2);">
                    <button id="open-folder-btn" style="padding: 8px 16px; background: #00d4ff; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        📂 Open Folder
                    </button>
                    <button id="open-file-btn" style="padding: 8px 16px; background: #00d4ff; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        📄 Open File
                    </button>
                    <button id="new-file-btn" style="padding: 8px 16px; background: #00d4ff; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        ➕ New File
                    </button>
                    <button id="save-file-btn" style="padding: 8px 16px; background: #00d4ff; color: #000; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">
                        💾 Save
                    </button>
                </div>
                
                <!-- Current Path -->
                <div id="current-path" style="padding: 10px 15px; background: rgba(0, 0, 0, 0.3); border-bottom: 1px solid rgba(0, 212, 255, 0.1); color: #888; font-size: 12px; font-family: monospace;">
                    No folder opened - Click "Open Folder" to browse files
                </div>
                
                <!-- File Tree -->
                <div id="file-tree" style="flex: 1; overflow-y: auto; padding: 10px;">
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <div style="font-size: 64px; margin-bottom: 20px;">📁</div>
                        <p style="font-size: 16px; margin-bottom: 10px;">No folder opened</p>
                        <p style="font-size: 12px;">Click "Open Folder" above to browse your files</p>
                    </div>
                </div>
                
                <!-- Status -->
                <div id="explorer-status" style="padding: 10px 15px; background: rgba(0, 0, 0, 0.3); border-top: 1px solid rgba(0, 212, 255, 0.1); color: #888; font-size: 12px;">
                    Ready
                </div>
            </div>
        `;
        
        this.attachEventHandlers();
        console.log('[FileExplorer] ✅ File explorer initialized');
    }
    
    attachEventHandlers() {
        // Open Folder
        document.getElementById('open-folder-btn')?.addEventListener('click', async () => {
            await this.openFolder();
        });
        
        // Open File
        document.getElementById('open-file-btn')?.addEventListener('click', async () => {
            await this.openFile();
        });
        
        // New File
        document.getElementById('new-file-btn')?.addEventListener('click', () => {
            this.createNewFile();
        });
        
        // Save File
        document.getElementById('save-file-btn')?.addEventListener('click', async () => {
            await this.saveCurrentFile();
        });
    }
    
    async openFolder() {
        if (!window.electron?.openFolderDialog) {
            this.showStatus('❌ File system not available', 'error');
            return;
        }
        
        this.showStatus('📂 Opening folder dialog...');
        
        try {
            const result = await window.electron.openFolderDialog();
            
            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                this.showStatus('Canceled');
                return;
            }
            
            const folderPath = result.filePaths[0];
            this.currentPath = folderPath;
            
            this.showStatus('📂 Loading files...');
            await this.loadFolder(folderPath);
            
        } catch (error) {
            console.error('[FileExplorer] Error opening folder:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async loadFolder(folderPath) {
        try {
            const result = await window.electron.readDir(folderPath);
            
            if (!result.success) {
                this.showStatus(`❌ Error reading folder: ${result.error}`, 'error');
                return;
            }
            
            this.files = result.files || [];
            this.renderFileTree();
            
            document.getElementById('current-path').textContent = folderPath;
            this.showStatus(`✅ Loaded ${this.files.length} items`);
            
        } catch (error) {
            console.error('[FileExplorer] Error loading folder:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    renderFileTree() {
        const treeContainer = document.getElementById('file-tree');
        if (!treeContainer) return;
        
        if (this.files.length === 0) {
            treeContainer.innerHTML = '<p style="color: #666; padding: 20px;">Empty folder</p>';
            return;
        }
        
        // Sort: directories first, then files
        const sorted = [...this.files].sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) {
                return a.isDirectory ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
        });
        
        treeContainer.innerHTML = sorted.map(file => `
            <div class="file-item" data-path="${file.path}" data-is-dir="${file.isDirectory}" style="
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 15px;
                cursor: pointer;
                border-radius: 6px;
                transition: all 0.2s;
                color: #ccc;
            ">
                <span style="font-size: 20px;">${file.isDirectory ? '📁' : this.getFileIcon(file.name)}</span>
                <span style="flex: 1;">${file.name}</span>
                ${!file.isDirectory ? `<span style="font-size: 11px; color: #666;">${this.formatSize(file.size)}</span>` : ''}
            </div>
        `).join('');
        
        // Attach click handlers
        treeContainer.querySelectorAll('.file-item').forEach(item => {
            const path = item.dataset.path;
            const isDir = item.dataset.isDir === 'true';
            
            item.addEventListener('mouseenter', () => {
                item.style.background = 'rgba(0, 212, 255, 0.2)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.background = 'transparent';
            });
            
            item.addEventListener('click', async () => {
                if (isDir) {
                    await this.loadFolder(path);
                } else {
                    await this.openFileInEditor(path);
                }
            });
            
            item.addEventListener('dblclick', async () => {
                if (!isDir) {
                    await this.openFileInEditor(path);
                }
            });
        });
    }
    
    async openFile() {
        if (!window.electron?.openFileDialog) {
            this.showStatus('❌ File system not available', 'error');
            return;
        }
        
        try {
            const result = await window.electron.openFileDialog({
                properties: ['openFile'],
                filters: [
                    { name: 'All Files', extensions: ['*'] },
                    { name: 'JavaScript', extensions: ['js', 'jsx'] },
                    { name: 'TypeScript', extensions: ['ts', 'tsx'] },
                    { name: 'HTML', extensions: ['html', 'htm'] },
                    { name: 'CSS', extensions: ['css', 'scss', 'sass'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'Text', extensions: ['txt', 'md'] }
                ]
            });
            
            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                this.showStatus('Canceled');
                return;
            }
            
            const filePath = result.filePaths[0];
            await this.openFileInEditor(filePath);
            
        } catch (error) {
            console.error('[FileExplorer] Error opening file:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async openFileInEditor(filePath) {
        this.showStatus(`📄 Opening ${filePath}...`);
        
        try {
            const result = await window.electron.readFile(filePath);
            
            if (!result.success) {
                this.showStatus(`❌ Error reading file: ${result.error}`, 'error');
                return;
            }
            
            // Create new editor tab with file content
            const fileName = filePath.split(/[/\\]/).pop();
            const tabId = window.completeTabSystem.createEditorTab();
            
            // Wait for tab to be created
            setTimeout(() => {
                const editorTextarea = document.querySelector(`#content-${tabId} textarea`);
                if (editorTextarea) {
                    editorTextarea.value = result.content;
                    editorTextarea.dataset.filePath = filePath;
                    
                    // Update tab title
                    const tab = window.completeTabSystem.tabs.get(tabId);
                    if (tab) {
                        tab.button.querySelector('span:nth-child(2)').textContent = fileName;
                    }
                    
                    this.showStatus(`✅ Opened: ${fileName}`);
                } else {
                    this.showStatus('⚠️ Editor not found', 'warning');
                }
            }, 200);
            
        } catch (error) {
            console.error('[FileExplorer] Error opening file in editor:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    createNewFile() {
        // Create new editor tab
        const tabId = window.completeTabSystem.createEditorTab();
        this.showStatus('✅ New file created');
    }
    
    async saveCurrentFile() {
        // Find active editor tab
        const activeTabId = window.completeTabSystem.activeTabId;
        const activeTab = window.completeTabSystem.tabs.get(activeTabId);
        
        if (!activeTab) {
            this.showStatus('⚠️ No active tab', 'warning');
            return;
        }
        
        const editorTextarea = document.querySelector(`#content-${activeTabId} textarea`);
        if (!editorTextarea) {
            this.showStatus('⚠️ No editor in active tab', 'warning');
            return;
        }
        
        const content = editorTextarea.value;
        const existingPath = editorTextarea.dataset.filePath;
        
        // If file has path, save to it; otherwise show save dialog
        if (existingPath) {
            await this.saveToPath(existingPath, content);
        } else {
            await this.saveAs(content);
        }
    }
    
    async saveAs(content) {
        if (!window.electron?.saveFileDialog) {
            this.showStatus('❌ File system not available', 'error');
            return;
        }
        
        try {
            const result = await window.electron.saveFileDialog({
                filters: [
                    { name: 'JavaScript', extensions: ['js'] },
                    { name: 'TypeScript', extensions: ['ts'] },
                    { name: 'HTML', extensions: ['html'] },
                    { name: 'CSS', extensions: ['css'] },
                    { name: 'JSON', extensions: ['json'] },
                    { name: 'Python', extensions: ['py'] },
                    { name: 'Text', extensions: ['txt'] },
                    { name: 'All Files', extensions: ['*'] }
                ]
            });
            
            if (result.canceled || !result.filePath) {
                this.showStatus('Canceled');
                return;
            }
            
            await this.saveToPath(result.filePath, content);
            
        } catch (error) {
            console.error('[FileExplorer] Error in save dialog:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    async saveToPath(filePath, content) {
        this.showStatus(`💾 Saving ${filePath}...`);
        
        try {
            const result = await window.electron.writeFile(filePath, content);
            
            if (result.success) {
                const fileName = filePath.split(/[/\\]/).pop();
                this.showStatus(`✅ Saved: ${fileName}`);
                
                // Update editor's file path
                const activeTabId = window.completeTabSystem.activeTabId;
                const editorTextarea = document.querySelector(`#content-${activeTabId} textarea`);
                if (editorTextarea) {
                    editorTextarea.dataset.filePath = filePath;
                }
            } else {
                this.showStatus(`❌ Save failed: ${result.error}`, 'error');
            }
            
        } catch (error) {
            console.error('[FileExplorer] Error saving file:', error);
            this.showStatus(`❌ Error: ${error.message}`, 'error');
        }
    }
    
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        const icons = {
            js: '📜', jsx: '⚛️', ts: '📘', tsx: '⚛️',
            html: '🌐', css: '🎨', scss: '🎨', sass: '🎨',
            json: '📋', xml: '📋',
            py: '🐍', java: '☕', cpp: '⚙️', c: '⚙️',
            md: '📝', txt: '📄',
            png: '🖼️', jpg: '🖼️', gif: '🖼️', svg: '🎨',
            zip: '📦', rar: '📦', '7z': '📦',
            pdf: '📕', doc: '📘', docx: '📘'
        };
        return icons[ext] || '📄';
    }
    
    formatSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('explorer-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.style.color = type === 'error' ? '#ff4757' : 
                                   type === 'warning' ? '#ffa502' : '#888';
        }
        console.log(`[FileExplorer] ${message}`);
    }
}

// Make globally available
window.FileExplorerComponent = FileExplorerComponent;

console.log('[FileExplorer] ✅ File explorer component loaded');

})();
