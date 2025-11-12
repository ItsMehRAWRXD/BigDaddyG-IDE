/**
 * FULL FILE SYSTEM INTEGRATION
 * Open files, save files, load projects, browse entire file system
 * Like VS Code, JetBrains, Sublime - REAL IDE capabilities
 */

(function() {
'use strict';

class FileSystemIntegration {
    constructor() {
        this.currentProject = null;
        this.openFiles = new Map(); // Map of file paths to content
        this.fileWatchers = new Map();
        this.recentProjects = this.loadRecentProjects();
        this.platform = this.detectPlatform();
        console.log('[FileSystem] 🖥️ Platform detected:', this.platform);
        this.init();
    }
    
    /**
     * Detect OS platform - CROSS-PLATFORM
     */
    detectPlatform() {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'mac';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
    }
    
    /**
     * Normalize path for current platform - CROSS-PLATFORM
     */
    normalizePath(path) {
        if (!path) return '';
        let normalized = String(path).trim();
        
        if (this.platform === 'windows') {
            // Windows: Keep backslashes
            normalized = normalized.replace(/\//g, '\\');
        } else {
            // Mac/Linux: Convert to forward slashes
            normalized = normalized.replace(/\\\\/g, '/').replace(/\\/g, '/');
        }
        
        return normalized;
    }
    
    init() {
        console.log('[FileSystem] 📁 Initializing FULL file system integration...');
        
        // Register global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+O - Open File
            if (e.ctrlKey && e.key === 'o') {
                e.preventDefault();
                this.openFileDialog();
            }
            
            // Ctrl+S - Save File
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentFile();
            }
            
            // Ctrl+Shift+S - Save As
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.saveFileAsDialog();
            }
            
            // Ctrl+Shift+O - Open Folder/Project
            if (e.ctrlKey && e.shiftKey && e.key === 'O') {
                e.preventDefault();
                this.openFolderDialog();
            }
            
            // Ctrl+N - New File
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNewFile();
            }
        });
        
        // Make globally available
        window.fileSystem = this;
        
        console.log('[FileSystem] ✅ File system integration ready');
        console.log('[FileSystem] 💡 Ctrl+O = Open File | Ctrl+S = Save | Ctrl+Shift+O = Open Folder');
    }
    
    /**
     * Open file dialog and load file
     */
    async openFileDialog() {
        try {
            console.log('[FileSystem] 📂 Opening file dialog...');
            
            if (!window.electron || !window.electron.openFileDialog) {
                alert('File system access requires Electron');
                return;
            }
            
            // Use the exposed wrapper function
            const result = await window.electron.openFileDialog();
            
            if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
                console.log('[FileSystem] User canceled file dialog');
                return;
            }
            
            const filePath = result.filePaths[0];
            await this.loadFile(filePath);
            
        } catch (error) {
            console.error('[FileSystem] Error opening file:', error);
            alert('Error opening file: ' + error.message);
        }
    }
    
    /**
     * Load a file from disk
     */
    async loadFile(filePath) {
        try {
            console.log('[FileSystem] 📄 Loading file:', filePath);
            
            const result = await window.electron.readFile(filePath);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            const content = result.content;
            const fileName = filePath.split(/[\\/]/).pop();
            
            // Store in open files
            this.openFiles.set(filePath, content);
            
            // Create editor tab with file content
            if (window.completeTabSystem) {
                const editorId = window.completeTabSystem.createEditorTab(fileName);
                
                // Set content and file path
                setTimeout(() => {
                    const textarea = document.querySelector(`#content-${editorId} textarea`);
                    if (textarea) {
                        textarea.value = content;
                        textarea.dataset.filePath = filePath;
                        textarea.dataset.fileName = fileName;
                        
                        // Mark as saved
                        textarea.dataset.saved = 'true';
                        
                        // Watch for changes
                        textarea.addEventListener('input', () => {
                            textarea.dataset.saved = 'false';
                            this.updateTabTitle(editorId, fileName + ' ●'); // Unsaved indicator
                        });
                        
                        console.log('[FileSystem] ✅ File loaded:', fileName);
                    }
                }, 100);
            }
            
            // Add to recent files
            this.addToRecent(filePath);
            
        } catch (error) {
            console.error('[FileSystem] Error loading file:', error);
            alert('Error loading file: ' + error.message);
        }
    }
    
    /**
     * Save current file
     */
    async saveCurrentFile() {
        try {
            if (!window.completeTabSystem) return;
            
            const activeTabId = window.completeTabSystem.activeTabId;
            if (!activeTabId) {
                console.log('[FileSystem] No active tab');
                return;
            }
            
            const tab = window.completeTabSystem.tabs.get(activeTabId);
            if (!tab) return;
            
            const textarea = tab.content.querySelector('textarea');
            if (!textarea) {
                console.log('[FileSystem] Active tab is not an editor');
                return;
            }
            
            const filePath = textarea.dataset.filePath;
            
            if (!filePath) {
                // No file path - show save as dialog
                return this.saveFileAsDialog();
            }
            
            // Save to existing path
            await this.saveFile(filePath, textarea.value);
            
            // Mark as saved
            textarea.dataset.saved = 'true';
            
            // Update tab title (remove unsaved indicator)
            const fileName = textarea.dataset.fileName || filePath.split(/[\\/]/).pop();
            this.updateTabTitle(activeTabId, fileName);
            
            console.log('[FileSystem] ✅ File saved:', filePath);
            
        } catch (error) {
            console.error('[FileSystem] Error saving file:', error);
            alert('Error saving file: ' + error.message);
        }
    }
    
    /**
     * Save file as (choose location)
     */
    async saveFileAsDialog() {
        try {
            if (!window.completeTabSystem) return;
            
            const activeTabId = window.completeTabSystem.activeTabId;
            if (!activeTabId) return;
            
            const tab = window.completeTabSystem.tabs.get(activeTabId);
            if (!tab) return;
            
            const textarea = tab.content.querySelector('textarea');
            if (!textarea) return;
            
            const content = textarea.value;
            const defaultName = textarea.dataset.fileName || 'untitled.txt';
            
            // Show save dialog
            const result = await window.electron.saveFileDialog({ defaultPath: defaultName });
            
            if (result.canceled || !result.filePath) {
                console.log('[FileSystem] User canceled save dialog');
                return;
            }
            
            const filePath = result.filePath;
            
            // Save file
            await this.saveFile(filePath, content);
            
            // Update textarea metadata
            const fileName = filePath.split(/[\\/]/).pop();
            textarea.dataset.filePath = filePath;
            textarea.dataset.fileName = fileName;
            textarea.dataset.saved = 'true';
            
            // Update tab title
            this.updateTabTitle(activeTabId, fileName);
            
            console.log('[FileSystem] ✅ File saved as:', filePath);
            
        } catch (error) {
            console.error('[FileSystem] Error in save as:', error);
            alert('Error saving file: ' + error.message);
        }
    }
    
    /**
     * Save file to disk
     */
    async saveFile(filePath, content) {
        const result = await window.electron.writeFile(filePath, content);
        
        if (!result.success) {
            throw new Error(result.error);
        }
        
        // Update in-memory cache
        this.openFiles.set(filePath, content);
    }
    
    /**
     * Open folder/project
     */
    async openFolderDialog() {
        try {
            console.log('[FileSystem] 📁 Opening folder dialog...');
            
            if (!window.electron || !window.electron.openFolderDialog) {
                alert('File system access requires Electron');
                return;
            }
            
            const result = await window.electron.openFolderDialog();
            
            console.log('[FileSystem] 🔍 Dialog result:', result);
            
            // Check multiple possible return formats
            const folderPath = result.filePaths?.[0] || result.folderPath || null;
            const wasCanceled = result.canceled === true;
            
            console.log('[FileSystem] 📊 Parsed:', { folderPath, wasCanceled, result });
            
            if (wasCanceled || !folderPath) {
                console.log('[FileSystem] ⚠️ No folder selected (canceled or empty)');
                
                // Update any active file explorer tab
                const activeExplorerContent = document.querySelector('[id^="explorer-"][id$="-content"]');
                if (activeExplorerContent) {
                    activeExplorerContent.innerHTML = `
                        <div style="text-align: center; margin-top: 100px;">
                            <p style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">📁</p>
                            <p style="font-size: 18px; color: #ccc; margin-bottom: 10px;">No folder selected</p>
                            <p style="font-size: 14px; color: #888;">Click "Open Folder" to try again</p>
                            <p style="font-size: 12px; color: #666; margin-top: 10px;">Debug: ${JSON.stringify(result)}</p>
                        </div>
                    `;
                }
                return;
            }
            
            console.log('[FileSystem] ✅ Folder selected:', folderPath);
            await this.loadProject(folderPath);
            
        } catch (error) {
            console.error('[FileSystem] Error opening folder:', error);
            
            // Show error in explorer tab
            const activeExplorerContent = document.querySelector('[id^="explorer-"][id$="-content"]');
            if (activeExplorerContent) {
                activeExplorerContent.innerHTML = `
                    <div style="text-align: center; margin-top: 100px; color: #ff4757;">
                        <p style="font-size: 64px; margin-bottom: 20px;">❌</p>
                        <p style="font-size: 18px; margin-bottom: 10px;">Error opening folder</p>
                        <p style="font-size: 14px;">${error.message}</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Load entire project/folder
     */
    async loadProject(folderPath) {
        try {
            console.log('[FileSystem] 📂 Loading project:', folderPath);
            
            const result = await window.electron.readDir(folderPath);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.currentProject = {
                path: folderPath,
                name: folderPath.split(/[\\/]/).pop(),
                files: result.files
            };
            
            // Update project explorer
            this.renderProjectExplorer();
            
            // Add to recent projects
            this.addToRecentProjects(folderPath);
            
            console.log('[FileSystem] ✅ Project loaded:', this.currentProject.name);
            console.log('[FileSystem] 📊 Files found:', result.files.length);
            
        } catch (error) {
            console.error('[FileSystem] Error loading project:', error);
            
            // Handle specific error types
            if (error.message.includes('EPERM') || error.message.includes('operation not permitted')) {
                alert('⚠️ Access Denied\n\nThis folder is protected by Windows.\nTry a different folder like:\n• C:\\Users\\YourName\\Documents\n• D:\\Projects\n• Desktop');
            } else if (error.message.includes('ENOENT')) {
                alert('⚠️ Folder Not Found\n\nThe selected folder no longer exists.');
            } else {
                alert('Error loading project: ' + error.message);
            }
        }
    }
    
    /**
     * Render project explorer with file tree
     */
    renderProjectExplorer() {
        if (!this.currentProject) return;
        
        console.log('[FileSystem] 📂 Rendering project explorer with', this.currentProject.files.length, 'files');
        
        // FIRST: Update the File Explorer TAB content if it exists
        const activeExplorerContent = document.querySelector('[id^="explorer-"][id$="-content"]');
        if (activeExplorerContent) {
            console.log('[FileSystem] ✅ Found File Explorer tab content, updating...');
            
            activeExplorerContent.innerHTML = `
                <div style="margin-bottom: 15px; padding: 15px; background: rgba(0, 212, 255, 0.05); border-bottom: 2px solid rgba(0, 212, 255, 0.3); border-radius: 8px 8px 0 0;">
                    <div style="color: #00d4ff; font-weight: bold; font-size: 16px; margin-bottom: 8px;">
                        📁 ${this.currentProject.name}
                    </div>
                    <div style="color: #888; font-size: 11px; font-family: monospace; word-break: break-all;">${this.currentProject.path}</div>
                    <div style="color: #00ff88; font-size: 13px; margin-top: 8px; font-weight: bold;">✅ ${this.currentProject.files.length} items loaded</div>
                </div>
                <div id="file-tree-in-tab" style="overflow-y: auto; max-height: 600px; padding: 10px;"></div>
            `;
            
            // Render files in the tab
            this.renderFileTreeInTab(this.currentProject.files, 'file-tree-in-tab');
            
            console.log('[FileSystem] ✅ Project rendered in File Explorer tab');
        } else {
            console.warn('[FileSystem] ⚠️ File Explorer tab content not found');
        }
        
        // THEN: Create or get project explorer panel
        let panel = document.getElementById('project-explorer-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'project-explorer-panel';
            panel.style.cssText = `
                position: fixed;
                left: 0;
                top: 95px;
                width: 300px;
                bottom: 0;
                background: #05050f;
                border-right: 1px solid rgba(0, 212, 255, 0.2);
                z-index: 99;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;
            document.body.appendChild(panel);
            
            // Adjust main container
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                mainContainer.style.marginLeft = '300px';
            }
            
            // Hide open files panel to avoid overlap
            const openFilesPanel = document.getElementById('open-files-panel');
            if (openFilesPanel) {
                openFilesPanel.style.display = 'none';
            }
        }
        
        panel.innerHTML = `
            <div style="
                padding: 12px;
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                background: rgba(0, 212, 255, 0.05);
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <div style="color: #00d4ff; font-weight: bold; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                        📁 Project
                    </div>
                    <div style="color: #fff; font-size: 13px; margin-top: 4px;">
                        ${this.currentProject.name}
                    </div>
                </div>
                <button 
                    onclick="window.fileSystem.closeProject()"
                    style="
                        background: rgba(255, 71, 87, 0.2);
                        border: 1px solid #ff4757;
                        color: #ff4757;
                        padding: 4px 8px;
                        border-radius: 3px;
                        cursor: pointer;
                        font-size: 10px;
                        font-weight: bold;
                    "
                >✕</button>
            </div>
            <div id="project-file-tree" style="
                flex: 1;
                overflow-y: auto;
                padding: 8px 0;
            "></div>
            <div style="
                padding: 8px 12px;
                border-top: 1px solid rgba(0, 212, 255, 0.2);
                font-size: 11px;
                color: #888;
            ">
                <div>${this.currentProject.files.length} items</div>
                <div style="margin-top: 4px; font-size: 10px; opacity: 0.7;">
                    ${this.currentProject.path}
                </div>
            </div>
        `;
        
        // Render file tree
        this.renderFileTree(this.currentProject.files, 'project-file-tree');
    }
    
    /**
     * Render file tree in File Explorer TAB
     */
    renderFileTreeInTab(files, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[FileSystem] ❌ Container not found:', containerId);
            return;
        }
        
        console.log('[FileSystem] 📋 Rendering', files.length, 'files in tab');
        
        container.innerHTML = files.map(file => {
            // DETECT FILE TYPE if not provided (cross-platform detection)
            let fileType = file.type;
            if (!fileType || fileType === 'undefined') {
                // Detect based on name: files have extensions, directories don't
                const hasExtension = file.name && file.name.includes('.') && !file.name.startsWith('.');
                fileType = hasExtension ? 'file' : 'directory';
            }
            
            const icon = fileType === 'directory' ? '📁' : this.getFileIcon(file.name);
            const isDir = fileType === 'directory';
            const escapedPath = file.path.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            
            console.log('[FileSystem] 📄 Rendering:', file.name, 'Type:', fileType, 'Path:', file.path);
            
            return `
                <div 
                    class="file-tree-item"
                    data-path="${escapedPath}"
                    data-type="${fileType}"
                    data-name="${file.name}"
                    style="
                        padding: 10px 12px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        color: #ccc;
                        font-size: 13px;
                        border-radius: 4px;
                        margin: 2px 0;
                        transition: all 0.2s;
                    "
                    onclick="window.fileSystem.handleFileClick('${escapedPath}', '${fileType}')"
                    onmouseover="this.style.background='rgba(0,212,255,0.1)'; this.style.borderLeft='3px solid #00d4ff'"
                    onmouseout="this.style.background='transparent'; this.style.borderLeft='3px solid transparent'"
                >
                    <span style="font-size: 18px;">${icon}</span>
                    <span style="flex: 1; user-select: none;">${file.name}</span>
                    ${isDir ? '<span style="color: #888; font-size: 10px;">›</span>' : '<span style="color: #00d4ff; font-size: 10px;">📄</span>'}
                </div>
            `;
        }).join('');
        
        console.log('[FileSystem] ✅ File tree rendered in tab');
    }
    
    /**
     * Handle file click from explorer - CROSS-PLATFORM
     */
    async handleFileClick(filePath, type) {
        console.log('[FileSystem] 🖱️ Click detected!');
        console.log('[FileSystem] 📂 Path:', filePath);
        console.log('[FileSystem] 🏷️ Type:', type);
        
        // Check for protected/system folders FIRST
        const protectedFolders = ['$RECYCLE.BIN', 'System Volume Information', 'Recovery', 'Config.Msi', 'ProgramData', 'Recycle.Bin'];
        const fileName = filePath.split(/[\/\\]/).pop();
        
        if (protectedFolders.some(pf => fileName.toLowerCase().includes(pf.toLowerCase()))) {
            console.warn('[FileSystem] ⚠️ Skipping protected folder:', fileName);
            alert(`⚠️ Protected System Folder\n\n"${fileName}" is a Windows system folder.\n\nAccess is restricted for security.`);
            return;
        }
        
        // Robust type detection (handles undefined, "undefined" string, etc.)
        if (!type || type === 'undefined' || type === undefined) {
            console.warn('[FileSystem] ⚠️ Type is undefined, auto-detecting...');
            
            // Extract filename from path (cross-platform)
            const filename = filePath.split(/[\/\\]/).pop();
            
            // Files have extensions (except hidden files like .gitignore)
            // Directories don't, OR are known folder names
            const hasExtension = filename.includes('.') && !filename.startsWith('.');
            const isHiddenFile = filename.startsWith('.') && filename.includes('.');
            
            if (hasExtension || isHiddenFile) {
                type = 'file';
                console.log('[FileSystem] 🔍 Auto-detected as FILE (has extension)');
            } else {
                type = 'directory';
                console.log('[FileSystem] 🔍 Auto-detected as DIRECTORY (no extension)');
            }
        }
        
        console.log('[FileSystem] ✅ Final type:', type);
        
        if (type === 'file') {
            console.log('[FileSystem] 📄 Opening file in new tab...');
            try {
                await this.loadFile(filePath);
            } catch (error) {
                console.error('[FileSystem] Error opening file:', error);
                alert(`⚠️ Cannot Open File\n\n${error.message}`);
            }
        } else if (type === 'directory') {
            console.log('[FileSystem] 📁 Expanding directory...');
            try {
                await this.loadProject(filePath);
            } catch (error) {
                console.error('[FileSystem] Error loading directory:', error);
                // Error already handled in loadProject
            }
        } else {
            console.error('[FileSystem] ❌ Unknown type:', type);
        }
    }
    
    /**
     * Render file tree recursively
     */
    renderFileTree(files, containerId, depth = 0) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = files.map(file => {
            const indent = depth * 20;
            const icon = file.type === 'directory' ? '📁' : this.getFileIcon(file.name);
            const isDir = file.type === 'directory';
            
            return `
                <div 
                    class="file-tree-item"
                    data-path="${file.path}"
                    data-type="${file.type}"
                    style="
                        padding: 6px 12px 6px ${indent + 12}px;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        color: #ccc;
                        font-size: 13px;
                        transition: all 0.2s;
                    "
                    onclick="window.fileSystem.handleFileTreeClick('${file.path}', '${file.type}')"
                    onmouseover="this.style.background='rgba(255,255,255,0.05)'"
                    onmouseout="this.style.background='transparent'"
                >
                    <span style="font-size: 16px;">${icon}</span>
                    <span style="flex: 1;">${file.name}</span>
                    ${isDir ? '<span style="color: #888; font-size: 10px;">›</span>' : ''}
                </div>
            `;
        }).join('');
        
        container.innerHTML += html;
    }
    
    /**
     * Handle file tree click
     */
    async handleFileTreeClick(path, type) {
        if (type === 'file') {
            // Load file
            await this.loadFile(path);
        } else if (type === 'directory') {
            // Expand/collapse directory
            // TODO: Implement directory expansion
            console.log('[FileSystem] Directory clicked:', path);
        }
    }
    
    /**
     * Close current project
     */
    closeProject() {
        this.currentProject = null;
        
        const panel = document.getElementById('project-explorer-panel');
        if (panel) {
            panel.remove();
        }
        
        // Restore main container margin
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.style.marginLeft = '250px';
        }
        
        // Show open files panel
        const openFilesPanel = document.getElementById('open-files-panel');
        if (openFilesPanel) {
            openFilesPanel.style.display = 'flex';
        }
        
        console.log('[FileSystem] Project closed');
    }
    
    /**
     * Create new file
     */
    createNewFile() {
        if (window.completeTabSystem) {
            window.completeTabSystem.createEditorTab('Untitled');
            console.log('[FileSystem] ✅ New file created');
        }
    }
    
    /**
     * Get file icon based on extension
     */
    getFileIcon(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        
        const iconMap = {
            'js': '🟨', 'ts': '🔷', 'jsx': '⚛️', 'tsx': '⚛️',
            'py': '🐍', 'java': '☕', 'cpp': '©️', 'c': '©️',
            'cs': '🎯', 'go': '🐹', 'rs': '🦀', 'php': '🐘',
            'rb': '💎', 'swift': '🦅', 'kt': '🟣', 'dart': '🎯',
            'html': '🌐', 'css': '🎨', 'scss': '🎨', 'sass': '🎨',
            'json': '📦', 'xml': '📋', 'yaml': '⚙️', 'yml': '⚙️',
            'md': '📝', 'txt': '📄', 'pdf': '📕', 'doc': '📘',
            'sh': '🐚', 'bash': '🐚', 'sql': '🗄️', 'db': '🗄️',
            'vue': '💚', 'svelte': '🔥', 'png': '🖼️', 'jpg': '🖼️',
            'gif': '🖼️', 'svg': '🎨', 'ico': '🎨'
        };
        
        return iconMap[ext] || '📄';
    }
    
    /**
     * Update tab title
     */
    updateTabTitle(tabId, newTitle) {
        if (!window.completeTabSystem) return;
        
        const tab = window.completeTabSystem.tabs.get(tabId);
        if (tab && tab.button) {
            const titleSpan = tab.button.querySelector('span:nth-child(2)');
            if (titleSpan) {
                titleSpan.textContent = newTitle;
            }
        }
    }
    
    /**
     * Recent files management
     */
    addToRecent(filePath) {
        let recent = JSON.parse(localStorage.getItem('recentFiles') || '[]');
        recent = recent.filter(p => p !== filePath);
        recent.unshift(filePath);
        recent = recent.slice(0, 10); // Keep last 10
        localStorage.setItem('recentFiles', JSON.stringify(recent));
    }
    
    addToRecentProjects(folderPath) {
        this.recentProjects = this.recentProjects.filter(p => p !== folderPath);
        this.recentProjects.unshift(folderPath);
        this.recentProjects = this.recentProjects.slice(0, 10);
        localStorage.setItem('recentProjects', JSON.stringify(this.recentProjects));
    }
    
    loadRecentProjects() {
        return JSON.parse(localStorage.getItem('recentProjects') || '[]');
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.fileSystem = new FileSystemIntegration();
    });
} else {
    window.fileSystem = new FileSystemIntegration();
}

// Also init after delay
setTimeout(() => {
    if (!window.fileSystem) {
        window.fileSystem = new FileSystemIntegration();
    }
}, 1500);

console.log('[FileSystem] 📁 Module loaded - Full file system integration ready');

})();
