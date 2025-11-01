/**
 * BigDaddyG IDE - Advanced File Tree
 * Full drive visibility including hidden files, system files, and all drives
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ============================================================================
// FILE TREE CONFIGURATION
// ============================================================================

const FileTreeConfig = {
    // Visibility settings
    showHiddenFiles: true,
    showSystemFiles: true,
    showAllDrives: true,
    showNetworkDrives: true,
    
    // Performance
    maxDepth: 5,
    maxFilesPerDir: 1000,
    lazyLoad: true,
    
    // Filtering
    excludePatterns: [],  // Empty = show everything
    includePatterns: ['*'], // Show all files
    
    // Display
    showFileSize: true,
    showFileDate: true,
    showPermissions: false,
    sortBy: 'name', // 'name', 'date', 'size', 'type'
};

// ============================================================================
// DRIVE SCANNER (ALL DRIVES INCLUDING HIDDEN)
// ============================================================================

class DriveScanner {
    static async getAllDrives() {
        console.log('[FileTree] 🔍 Scanning all drives...');
        const drives = [];
        
        if (process.platform === 'win32') {
            // Windows: Scan A-Z drives
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
            
            for (const letter of letters) {
                const drivePath = `${letter}:\\`;
                
                try {
                    // Try to access drive
                    await fs.promises.access(drivePath, fs.constants.R_OK);
                    const stats = await fs.promises.stat(drivePath);
                    
                    // Get drive info
                    const driveInfo = {
                        path: drivePath,
                        letter: letter,
                        label: await this.getDriveLabel(drivePath),
                        type: await this.getDriveType(drivePath),
                        total: 0,
                        free: 0,
                        used: 0,
                        exists: true
                    };
                    
                    drives.push(driveInfo);
                    console.log(`[FileTree] ✅ Found drive: ${letter}:\\ (${driveInfo.label})`);
                } catch (error) {
                    // Drive not accessible or doesn't exist
                }
            }
        } else if (process.platform === 'darwin') {
            // macOS: /Volumes
            drives.push({ path: '/', label: 'Macintosh HD', type: 'local' });
            
            try {
                const volumes = await fs.promises.readdir('/Volumes');
                for (const volume of volumes) {
                    const volumePath = `/Volumes/${volume}`;
                    drives.push({ path: volumePath, label: volume, type: 'volume' });
                }
            } catch (error) {
                console.error('[FileTree] Error scanning /Volumes:', error);
            }
        } else {
            // Linux: root + mounted drives
            drives.push({ path: '/', label: 'Root', type: 'local' });
            
            try {
                const mounts = await fs.promises.readdir('/mnt');
                for (const mount of mounts) {
                    const mountPath = `/mnt/${mount}`;
                    drives.push({ path: mountPath, label: mount, type: 'mount' });
                }
            } catch (error) {
                // /mnt might not exist
            }
        }
        
        console.log(`[FileTree] 📊 Found ${drives.length} drive(s)`);
        return drives;
    }
    
    static async getDriveLabel(drivePath) {
        // Try to get volume label on Windows
        if (process.platform === 'win32') {
            try {
                const { execSync } = require('child_process');
                const output = execSync(`vol ${drivePath.charAt(0)}:`, { encoding: 'utf8' });
                const match = output.match(/Volume in drive \w is (.+)/);
                return match ? match[1] : `Drive ${drivePath.charAt(0)}`;
            } catch {
                return `Drive ${drivePath.charAt(0)}`;
            }
        }
        return path.basename(drivePath) || 'Drive';
    }
    
    static async getDriveType(drivePath) {
        // Detect drive type: fixed, removable, network, etc.
        if (process.platform === 'win32') {
            try {
                const { execSync } = require('child_process');
                const output = execSync(`fsutil fsinfo drivetype ${drivePath}`, { encoding: 'utf8' });
                
                if (output.includes('Fixed')) return 'Fixed Drive';
                if (output.includes('Removable')) return 'Removable Drive';
                if (output.includes('Network')) return 'Network Drive';
                if (output.includes('CD-ROM')) return 'CD-ROM Drive';
                return 'Unknown';
            } catch {
                return 'Drive';
            }
        }
        return 'Drive';
    }
}

// ============================================================================
// FILE TREE BUILDER (INCLUDING HIDDEN & SYSTEM FILES)
// ============================================================================

class FileTreeBuilder {
    static async buildTree(rootPath, depth = 0) {
        if (depth > FileTreeConfig.maxDepth) {
            return null;
        }
        
        try {
            const stats = await fs.promises.stat(rootPath);
            const isDirectory = stats.isDirectory();
            
            const node = {
                path: rootPath,
                name: path.basename(rootPath) || rootPath,
                isDirectory: isDirectory,
                isHidden: this.isHidden(rootPath),
                isSystem: this.isSystemFile(rootPath),
                size: stats.size,
                modified: stats.mtime,
                permissions: this.getPermissions(stats),
                children: []
            };
            
            if (isDirectory) {
                try {
                    // Read directory with full visibility
                    const entries = await fs.promises.readdir(rootPath, { withFileTypes: true });
                    
                    // Filter if needed
                    let filteredEntries = entries;
                    
                    // Sort entries
                    filteredEntries = this.sortEntries(filteredEntries, rootPath);
                    
                    // Limit entries
                    if (filteredEntries.length > FileTreeConfig.maxFilesPerDir) {
                        filteredEntries = filteredEntries.slice(0, FileTreeConfig.maxFilesPerDir);
                        node.truncated = true;
                    }
                    
                    // Build children
                    if (FileTreeConfig.lazyLoad && depth > 1) {
                        // Mark as lazy-loadable
                        node.lazyLoad = true;
                        node.childCount = filteredEntries.length;
                    } else {
                        // Load children immediately
                        for (const entry of filteredEntries) {
                            const childPath = path.join(rootPath, entry.name);
                            const childNode = await this.buildTree(childPath, depth + 1);
                            if (childNode) {
                                node.children.push(childNode);
                            }
                        }
                    }
                } catch (error) {
                    // Permission denied or other error
                    node.error = error.code || 'EACCES';
                    node.errorMessage = error.message;
                }
            }
            
            return node;
        } catch (error) {
            console.error(`[FileTree] Error accessing ${rootPath}:`, error.message);
            return null;
        }
    }
    
    static isHidden(filePath) {
        const basename = path.basename(filePath);
        
        // Unix-style hidden files (start with .)
        if (basename.startsWith('.')) {
            return true;
        }
        
        // Windows hidden files (check attributes)
        if (process.platform === 'win32') {
            try {
                const { execSync } = require('child_process');
                const output = execSync(`attrib "${filePath}"`, { encoding: 'utf8' });
                return output.includes('H'); // H = Hidden attribute
            } catch {
                return false;
            }
        }
        
        return false;
    }
    
    static isSystemFile(filePath) {
        const basename = path.basename(filePath);
        
        // Common system files/folders
        const systemNames = [
            '$Recycle.Bin', 'System Volume Information', 'pagefile.sys', 'hiberfil.sys',
            'swapfile.sys', 'DumpStack.log.tmp', 'Windows', 'Program Files', 'Program Files (x86)',
            'ProgramData', 'Recovery'
        ];
        
        if (systemNames.includes(basename)) {
            return true;
        }
        
        // Windows system files (check attributes)
        if (process.platform === 'win32') {
            try {
                const { execSync } = require('child_process');
                const output = execSync(`attrib "${filePath}"`, { encoding: 'utf8' });
                return output.includes('S'); // S = System attribute
            } catch {
                return false;
            }
        }
        
        return false;
    }
    
    static getPermissions(stats) {
        // Convert numeric mode to rwx format
        const mode = stats.mode;
        const perms = {
            owner: {
                read: !!(mode & 0o400),
                write: !!(mode & 0o200),
                execute: !!(mode & 0o100)
            },
            group: {
                read: !!(mode & 0o040),
                write: !!(mode & 0o020),
                execute: !!(mode & 0o010)
            },
            others: {
                read: !!(mode & 0o004),
                write: !!(mode & 0o002),
                execute: !!(mode & 0o001)
            }
        };
        
        return perms;
    }
    
    static sortEntries(entries, rootPath) {
        return entries.sort((a, b) => {
            // Directories first
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            
            // Then by sort order
            switch (FileTreeConfig.sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'date':
                    try {
                        const statA = fs.statSync(path.join(rootPath, a.name));
                        const statB = fs.statSync(path.join(rootPath, b.name));
                        return statB.mtime - statA.mtime;
                    } catch {
                        return 0;
                    }
                case 'size':
                    try {
                        const statA = fs.statSync(path.join(rootPath, a.name));
                        const statB = fs.statSync(path.join(rootPath, b.name));
                        return statB.size - statA.size;
                    } catch {
                        return 0;
                    }
                case 'type':
                    return path.extname(a.name).localeCompare(path.extname(b.name));
                default:
                    return 0;
            }
        });
    }
}

// ============================================================================
// FILE TREE RENDERER
// ============================================================================

class FileTreeRenderer {
    static renderTree(tree, parentElement) {
        if (!tree) return;
        
        const treeHTML = this.nodeToHTML(tree, 0);
        parentElement.innerHTML = treeHTML;
        
        // Attach event listeners
        this.attachEventListeners(parentElement);
    }
    
    static nodeToHTML(node, depth) {
        const indent = depth * 20;
        const icon = this.getIcon(node);
        const sizeStr = node.isDirectory ? '' : this.formatSize(node.size);
        const dateStr = this.formatDate(node.modified);
        
        let html = '';
        
        // Node container
        html += `<div class="tree-node" data-path="${node.path}" style="padding-left: ${indent}px;">`;
        
        // Expand/collapse icon for directories
        if (node.isDirectory) {
            html += `<span class="tree-expand" onclick="toggleTreeNode(this)">▶</span>`;
        } else {
            html += `<span class="tree-spacer"></span>`;
        }
        
        // File icon
        html += `<span class="tree-icon">${icon}</span>`;
        
        // File name
        html += `<span class="tree-name" onclick="openFile('${node.path}')">${node.name}</span>`;
        
        // Badges
        if (node.isHidden) {
            html += `<span class="tree-badge" style="background: rgba(255,107,53,0.3); color: var(--orange);">Hidden</span>`;
        }
        if (node.isSystem) {
            html += `<span class="tree-badge" style="background: rgba(255,71,87,0.3); color: var(--red);">System</span>`;
        }
        if (node.error) {
            html += `<span class="tree-badge" style="background: rgba(255,71,87,0.3); color: var(--red);">Access Denied</span>`;
        }
        
        // File size
        if (FileTreeConfig.showFileSize && sizeStr) {
            html += `<span class="tree-size">${sizeStr}</span>`;
        }
        
        // Modified date
        if (FileTreeConfig.showFileDate) {
            html += `<span class="tree-date">${dateStr}</span>`;
        }
        
        html += `</div>`;
        
        // Children container
        if (node.isDirectory && node.children.length > 0) {
            html += `<div class="tree-children" style="display: none;">`;
            for (const child of node.children) {
                html += this.nodeToHTML(child, depth + 1);
            }
            if (node.truncated) {
                html += `<div style="padding-left: ${(depth + 1) * 20}px; color: #666; font-size: 11px; font-style: italic;">... more files (truncated)</div>`;
            }
            html += `</div>`;
        }
        
        return html;
    }
    
    static getIcon(node) {
        if (node.isDirectory) {
            if (node.error) return '🔒';
            return '📁';
        }
        
        const ext = path.extname(node.name).toLowerCase();
        const icons = {
            // Code
            '.js': '📜', '.ts': '📘', '.jsx': '⚛️', '.tsx': '⚛️',
            '.py': '🐍', '.java': '☕', '.cpp': '⚙️', '.c': '🔧',
            '.rs': '🦀', '.go': '🐹', '.rb': '💎', '.php': '🐘',
            '.cs': '🔷', '.swift': '🔶', '.kt': '💜',
            
            // Web
            '.html': '🌐', '.css': '🎨', '.json': '📋', '.xml': '📄',
            '.md': '📝', '.yaml': '📋', '.yml': '📋',
            
            // Assembly
            '.asm': '⚡', '.s': '⚡',
            
            // Data
            '.sql': '🗄️', '.db': '🗄️', '.sqlite': '🗄️',
            
            // Archives
            '.zip': '📦', '.rar': '📦', '.7z': '📦', '.tar': '📦', '.gz': '📦',
            
            // Images
            '.png': '🖼️', '.jpg': '🖼️', '.jpeg': '🖼️', '.gif': '🖼️', '.svg': '🖼️',
            
            // Documents
            '.pdf': '📄', '.doc': '📄', '.docx': '📄', '.txt': '📄',
            
            // Executables
            '.exe': '⚙️', '.dll': '📚', '.so': '📚', '.dylib': '📚',
            
            // Scripts
            '.sh': '💻', '.bat': '💻', '.ps1': '💻', '.cmd': '💻'
        };
        
        return icons[ext] || '📄';
    }
    
    static formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }
    
    static formatDate(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        
        return date.toLocaleDateString();
    }
    
    static attachEventListeners(parentElement) {
        // Already attached via onclick in HTML
    }
}

// ============================================================================
// IPC HANDLERS FOR ELECTRON
// ============================================================================

function setupFileTreeIPCHandlers(ipcMain) {
    ipcMain.handle('filetree:get-drives', async () => {
        return await DriveScanner.getAllDrives();
    });
    
    ipcMain.handle('filetree:build-tree', async (event, rootPath) => {
        return await FileTreeBuilder.buildTree(rootPath);
    });
    
    ipcMain.handle('filetree:read-dir', async (event, dirPath) => {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            return entries.map(entry => ({
                name: entry.name,
                isDirectory: entry.isDirectory(),
                isFile: entry.isFile()
            }));
        } catch (error) {
            throw new Error(`Failed to read directory: ${error.message}`);
        }
    });
    
    ipcMain.handle('filetree:get-stats', async (event, filePath) => {
        try {
            const stats = await fs.promises.stat(filePath);
            return {
                size: stats.size,
                modified: stats.mtime,
                created: stats.birthtime,
                isDirectory: stats.isDirectory(),
                isFile: stats.isFile()
            };
        } catch (error) {
            throw new Error(`Failed to get stats: ${error.message}`);
        }
    });
    
    console.log('[FileTree] ✅ IPC handlers registered');
}

// ============================================================================
// GLOBAL FUNCTIONS (CALLED FROM HTML)
// ============================================================================

function toggleTreeNode(element) {
    const node = element.parentElement;
    const children = node.nextElementSibling;
    
    if (children && children.classList.contains('tree-children')) {
        if (children.style.display === 'none') {
            children.style.display = 'block';
            element.textContent = '▼';
        } else {
            children.style.display = 'none';
            element.textContent = '▶';
        }
    }
}

async function openFile(filePath) {
    console.log('[FileTree] 📂 Opening:', filePath);
    
    // Send to renderer to open in editor
    if (window.electron) {
        const content = await window.electron.readFile(filePath);
        if (content.success) {
            // Open in Monaco editor
            // This will be handled by renderer.js
            document.dispatchEvent(new CustomEvent('file-open', {
                detail: { path: filePath, content: content.content }
            }));
        }
    }
}

// ============================================================================
// EXPORT
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DriveScanner,
        FileTreeBuilder,
        FileTreeRenderer,
        FileTreeConfig,
        setupFileTreeIPCHandlers
    };
}

console.log('[FileTree] 💎 Advanced file tree module loaded');
console.log('[FileTree] ✅ Full drive visibility enabled');
console.log('[FileTree] ✅ Hidden files visible');
console.log('[FileTree] ✅ System files visible');

