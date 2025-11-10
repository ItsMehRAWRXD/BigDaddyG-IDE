/**
 * BigDaddyG IDE - Recent Files Manager
 * Manages recent files and projects
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class RecentFilesManager {
    constructor() {
        this.storagePath = path.join(app.getPath('userData'), 'recent-files.json');
        this.recentFiles = [];
        this.recentProjects = [];
        this.maxRecentFiles = 20;
        this.maxRecentProjects = 10;
        
        this.load();
        
        console.log('[RecentFilesManager] Initialized');
    }
    
    /**
     * Load recent files from storage
     */
    load() {
        try {
            if (fs.existsSync(this.storagePath)) {
                const data = JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
                this.recentFiles = data.files || [];
                this.recentProjects = data.projects || [];
                
                // Clean up non-existent files
                this.recentFiles = this.recentFiles.filter(item => fs.existsSync(item.path));
                this.recentProjects = this.recentProjects.filter(item => fs.existsSync(item.path));
            }
        } catch (error) {
            console.error('[RecentFilesManager] Error loading recent files:', error);
        }
    }
    
    /**
     * Save recent files to storage
     */
    save() {
        try {
            const dir = path.dirname(this.storagePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            const data = {
                files: this.recentFiles,
                projects: this.recentProjects
            };
            
            fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('[RecentFilesManager] Error saving recent files:', error);
        }
    }
    
    /**
     * Add a recent file
     */
    addFile(filePath) {
        if (!filePath || !fs.existsSync(filePath)) {
            return;
        }
        
        const stats = fs.statSync(filePath);
        const item = {
            path: filePath,
            name: path.basename(filePath),
            directory: path.dirname(filePath),
            timestamp: Date.now(),
            size: stats.size
        };
        
        // Remove if already exists
        this.recentFiles = this.recentFiles.filter(f => f.path !== filePath);
        
        // Add to beginning
        this.recentFiles.unshift(item);
        
        // Limit size
        if (this.recentFiles.length > this.maxRecentFiles) {
            this.recentFiles = this.recentFiles.slice(0, this.maxRecentFiles);
        }
        
        this.save();
    }
    
    /**
     * Add a recent project
     */
    addProject(projectPath) {
        if (!projectPath || !fs.existsSync(projectPath)) {
            return;
        }
        
        const stats = fs.statSync(projectPath);
        const item = {
            path: projectPath,
            name: path.basename(projectPath),
            timestamp: Date.now(),
            type: this.detectProjectType(projectPath)
        };
        
        // Remove if already exists
        this.recentProjects = this.recentProjects.filter(p => p.path !== projectPath);
        
        // Add to beginning
        this.recentProjects.unshift(item);
        
        // Limit size
        if (this.recentProjects.length > this.maxRecentProjects) {
            this.recentProjects = this.recentProjects.slice(0, this.maxRecentProjects);
        }
        
        this.save();
    }
    
    /**
     * Detect project type
     */
    detectProjectType(projectPath) {
        if (fs.existsSync(path.join(projectPath, 'project.godot'))) {
            return 'godot';
        }
        if (fs.existsSync(path.join(projectPath, 'Assets')) && 
            fs.existsSync(path.join(projectPath, 'ProjectSettings'))) {
            return 'unity';
        }
        if (fs.readdirSync(projectPath).some(f => f.endsWith('.uproject'))) {
            return 'unreal';
        }
        if (fs.existsSync(path.join(projectPath, 'sunshine.project'))) {
            return 'sunshine';
        }
        if (fs.existsSync(path.join(projectPath, 'package.json'))) {
            return 'node';
        }
        return 'unknown';
    }
    
    /**
     * Get recent files
     */
    getRecentFiles() {
        return this.recentFiles;
    }
    
    /**
     * Get recent projects
     */
    getRecentProjects() {
        return this.recentProjects;
    }
    
    /**
     * Remove a recent file
     */
    removeFile(filePath) {
        this.recentFiles = this.recentFiles.filter(f => f.path !== filePath);
        this.save();
    }
    
    /**
     * Remove a recent project
     */
    removeProject(projectPath) {
        this.recentProjects = this.recentProjects.filter(p => p.path !== projectPath);
        this.save();
    }
    
    /**
     * Clear all recent files
     */
    clearFiles() {
        this.recentFiles = [];
        this.save();
    }
    
    /**
     * Clear all recent projects
     */
    clearProjects() {
        this.recentProjects = [];
        this.save();
    }
    
    /**
     * Clear all
     */
    clearAll() {
        this.recentFiles = [];
        this.recentProjects = [];
        this.save();
    }
}

module.exports = RecentFilesManager;
