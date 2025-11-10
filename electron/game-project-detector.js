/**
 * BigDaddyG IDE - Game Project Detector
 * Auto-detects game engine projects
 */

const fs = require('fs');
const path = require('path');

class GameProjectDetector {
    constructor() {
        this.detectors = new Map();
        this.initializeDetectors();
        
        console.log('[GameProjectDetector] Initialized');
    }
    
    /**
     * Initialize project detectors
     */
    initializeDetectors() {
        this.detectors.set('godot', this.detectGodotProject.bind(this));
        this.detectors.set('unity', this.detectUnityProject.bind(this));
        this.detectors.set('unreal', this.detectUnrealProject.bind(this));
        this.detectors.set('sunshine', this.detectSunshineProject.bind(this));
    }
    
    /**
     * Detect project type
     */
    detectProject(projectPath) {
        if (!fs.existsSync(projectPath)) {
            return null;
        }
        
        for (const [engine, detector] of this.detectors) {
            const result = detector(projectPath);
            if (result) {
                return { engine, ...result };
            }
        }
        
        return null;
    }
    
    /**
     * Detect Godot project
     */
    detectGodotProject(projectPath) {
        const projectFile = path.join(projectPath, 'project.godot');
        
        if (fs.existsSync(projectFile)) {
            const content = fs.readFileSync(projectFile, 'utf8');
            
            // Parse Godot project file
            const configMatch = content.match(/config\/name="([^"]+)"/);
            const versionMatch = content.match(/config\/features=PackedStringArray\("([^"]+)"/);
            
            return {
                detected: true,
                projectName: configMatch ? configMatch[1] : 'Godot Project',
                version: versionMatch ? versionMatch[1] : '4.x',
                projectFile,
                scenes: this.findFiles(projectPath, '.tscn'),
                scripts: this.findFiles(projectPath, '.gd'),
                assets: this.findFiles(projectPath, '.import')
            };
        }
        
        return null;
    }
    
    /**
     * Detect Unity project
     */
    detectUnityProject(projectPath) {
        const assetsPath = path.join(projectPath, 'Assets');
        const projectSettingsPath = path.join(projectPath, 'ProjectSettings');
        
        if (fs.existsSync(assetsPath) && fs.existsSync(projectSettingsPath)) {
            const projectVersionFile = path.join(projectSettingsPath, 'ProjectVersion.txt');
            let version = 'Unknown';
            
            if (fs.existsSync(projectVersionFile)) {
                const content = fs.readFileSync(projectVersionFile, 'utf8');
                const versionMatch = content.match(/m_EditorVersion:\s*(.+)/);
                version = versionMatch ? versionMatch[1] : 'Unknown';
            }
            
            return {
                detected: true,
                projectName: path.basename(projectPath),
                version,
                assetsPath,
                scenes: this.findFiles(assetsPath, '.unity'),
                scripts: this.findFiles(assetsPath, '.cs'),
                prefabs: this.findFiles(assetsPath, '.prefab')
            };
        }
        
        return null;
    }
    
    /**
     * Detect Unreal project
     */
    detectUnrealProject(projectPath) {
        const files = fs.readdirSync(projectPath);
        const uprojectFile = files.find(f => f.endsWith('.uproject'));
        
        if (uprojectFile) {
            const uprojectPath = path.join(projectPath, uprojectFile);
            const content = JSON.parse(fs.readFileSync(uprojectPath, 'utf8'));
            
            return {
                detected: true,
                projectName: content.Name || path.basename(uprojectFile, '.uproject'),
                version: content.EngineAssociation || '5.x',
                projectFile: uprojectPath,
                content: path.join(projectPath, 'Content'),
                source: path.join(projectPath, 'Source'),
                blueprints: this.findFiles(path.join(projectPath, 'Content'), '.uasset'),
                scripts: this.findFiles(path.join(projectPath, 'Source'), '.cpp')
            };
        }
        
        return null;
    }
    
    /**
     * Detect Sunshine Engine project
     */
    detectSunshineProject(projectPath) {
        const projectFiles = [
            'sunshine.project',
            '.sunshine',
            'SunshineProject.json'
        ];
        
        for (const file of projectFiles) {
            const filePath = path.join(projectPath, file);
            if (fs.existsSync(filePath)) {
                let config = {};
                
                try {
                    if (file.endsWith('.json')) {
                        config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                    }
                } catch (e) {
        console.error('[Error]', e);
    }
                
                return {
                    detected: true,
                    projectName: config.name || path.basename(projectPath),
                    version: config.version || '1.0',
                    projectFile: filePath,
                    scenes: this.findFiles(projectPath, '.scene'),
                    scripts: this.findFiles(projectPath, '.ss'),
                    assets: this.findFiles(projectPath, '.asset'),
                    shaders: this.findFiles(projectPath, '.shader')
                };
            }
        }
        
        return null;
    }
    
    /**
     * Find files with extension
     */
    findFiles(dir, extension, files = []) {
        if (!fs.existsSync(dir)) return files;
        
        try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Skip common exclude directories
                    if (!['node_modules', '.git', 'Temp', 'Library'].includes(item)) {
                        this.findFiles(fullPath, extension, files);
                    }
                } else if (item.endsWith(extension)) {
                    files.push(fullPath);
                }
                
                // Limit to prevent performance issues
                if (files.length >= 100) break;
            }
        } catch (error) {
        console.error('[Error]', error);
    }
        
        return files;
    }
    
    /**
     * Get project info
     */
    getProjectInfo(projectPath) {
        const detection = this.detectProject(projectPath);
        
        if (detection) {
            return {
                path: projectPath,
                engine: detection.engine,
                name: detection.projectName,
                version: detection.version,
                fileCount: {
                    scenes: detection.scenes?.length || 0,
                    scripts: detection.scripts?.length || 0,
                    assets: detection.assets?.length || 0
                }
            };
        }
        
        return null;
    }
}

module.exports = GameProjectDetector;
