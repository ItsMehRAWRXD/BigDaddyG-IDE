/**
 * AGENTIC FILE ACCESS
 * Gives AI agents full access to browse drives, read files, and work on projects
 */

(function() {
'use strict';

class AgenticFileAccess {
    constructor() {
        this.currentWorkspace = null;
        this.indexedFiles = new Map();
        this.fileCache = new Map();
        this.init();
    }
    
    init() {
        console.log('[AgenticFileAccess] 🤖 Initializing agentic file access...');
        
        // Make globally available
        window.agenticFileAccess = this;
        
        console.log('[AgenticFileAccess] ✅ AI can now access file system agentically');
        console.log('[AgenticFileAccess] 💡 AI commands:');
        console.log('[AgenticFileAccess]   • "scan D:\\Projects" - Index a workspace');
        console.log('[AgenticFileAccess]   • "show files" - List all indexed files');
        console.log('[AgenticFileAccess]   • "read file.js" - Read file content');
        console.log('[AgenticFileAccess]   • "find *.py" - Search for files');
    }
    
    /**
     * Index entire workspace/drive for AI
     */
    async indexWorkspace(path) {
        try {
            console.log('[AgenticFileAccess] 📂 Indexing workspace:', path);
            
            if (!window.electron || !window.electron.readDirRecursive) {
                throw new Error('Electron file API not available');
            }
            
            const result = await window.electron.readDirRecursive(path, 5); // Max 5 levels deep
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            this.currentWorkspace = {
                path,
                files: result.files || [],
                indexed: new Date().toISOString()
            };
            
            // Cache file paths
            this.indexedFiles.clear();
            result.files.forEach(file => {
                if (file.type === 'file') {
                    this.indexedFiles.set(file.path, file);
                }
            });
            
            console.log('[AgenticFileAccess] ✅ Indexed', this.indexedFiles.size, 'files');
            
            return {
                success: true,
                totalFiles: this.indexedFiles.size,
                path: path,
                files: result.files
            };
            
        } catch (error) {
            console.error('[AgenticFileAccess] ❌ Error indexing workspace:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Get file list for AI context
     */
    getFileList(limit = 100) {
        const files = Array.from(this.indexedFiles.values()).slice(0, limit);
        return files.map(f => ({
            path: f.path,
            name: f.name,
            size: f.size
        }));
    }
    
    /**
     * Read file content for AI
     */
    async readFileForAI(filePath) {
        try {
            // Check cache first
            if (this.fileCache.has(filePath)) {
                console.log('[AgenticFileAccess] 📦 Using cached file:', filePath);
                return this.fileCache.get(filePath);
            }
            
            console.log('[AgenticFileAccess] 📄 Reading file for AI:', filePath);
            
            const result = await window.electron.readFile(filePath);
            
            if (!result.success) {
                throw new Error(result.error);
            }
            
            // Cache it
            this.fileCache.set(filePath, result.content);
            
            return result.content;
            
        } catch (error) {
            console.error('[AgenticFileAccess] ❌ Error reading file:', error);
            return null;
        }
    }
    
    /**
     * Search files by pattern
     */
    searchFiles(pattern) {
        const regex = new RegExp(pattern, 'i');
        const matches = [];
        
        this.indexedFiles.forEach((file, path) => {
            if (regex.test(file.name) || regex.test(path)) {
                matches.push(file);
            }
        });
        
        console.log('[AgenticFileAccess] 🔍 Found', matches.length, 'matches for:', pattern);
        
        return matches;
    }
    
    /**
     * Get workspace summary for AI context
     */
    getWorkspaceSummary() {
        if (!this.currentWorkspace) {
            return 'No workspace indexed. Ask user to run: window.agenticFileAccess.indexWorkspace("D:\\\\Your\\\\Path")';
        }
        
        const filesByType = {};
        this.indexedFiles.forEach(file => {
            const ext = file.name.split('.').pop();
            filesByType[ext] = (filesByType[ext] || 0) + 1;
        });
        
        return {
            path: this.currentWorkspace.path,
            totalFiles: this.indexedFiles.size,
            indexed: this.currentWorkspace.indexed,
            fileTypes: filesByType,
            topFiles: this.getFileList(20)
        };
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.agenticFileAccess = new AgenticFileAccess();
    });
} else {
    window.agenticFileAccess = new AgenticFileAccess();
}

setTimeout(() => {
    if (!window.agenticFileAccess) {
        window.agenticFileAccess = new AgenticFileAccess();
    }
}, 2000);

console.log('[AgenticFileAccess] 📁 Module loaded - AI can now access files');

})();
