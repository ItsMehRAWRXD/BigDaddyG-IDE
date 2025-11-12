/**
 * BigDaddyG IDE - Godot 4.2+ Integration
 * Full support for Godot Engine game development
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class GodotIntegration {
    constructor() {
        this.godotPath = null;
        this.currentProject = null;
        this.isInitialized = false;
        
        console.log('[Godot Integration] Initialized');
    }
    
    /**
     * Initialize Godot integration
     */
    async initialize() {
        if (this.isInitialized) return { success: true };
        
        try {
            // Try to find Godot installation
            await this.detectGodot();
            
            this.isInitialized = true;
            return { success: true, godotPath: this.godotPath };
        } catch (error) {
            console.error('[Godot] Initialization error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Detect Godot installation
     */
    async detectGodot() {
        const commonPaths = [
            'godot',
            'godot4',
            '/usr/bin/godot',
            '/usr/local/bin/godot',
            'C:\\Program Files\\Godot\\godot.exe',
            process.env.GODOT_PATH
        ].filter(Boolean);
        
        for (const gpath of commonPaths) {
            if (await this.testGodotPath(gpath)) {
                this.godotPath = gpath;
                console.log(`[Godot] Found at: ${gpath}`);
                return true;
            }
        }
        
        console.log('[Godot] Not found in PATH - IDE features available without Godot executable');
        return false;
    }
    
    /**
     * Test if Godot path is valid
     */
    async testGodotPath(gpath) {
        return new Promise((resolve) => {
            try {
                const proc = spawn(gpath, ['--version'], { timeout: 2000 });
                proc.on('close', (code) => resolve(code === 0));
                proc.on('error', () => resolve(false));
            } catch {
                resolve(false);
            }
        });
    }
    
    /**
     * Detect Godot project
     */
    isGodotProject(dir) {
        const projectFile = path.join(dir, 'project.godot');
        return fs.existsSync(projectFile);
    }
    
    /**
     * Open Godot project
     */
    async openProject(projectPath) {
        if (!this.isGodotProject(projectPath)) {
            return { success: false, error: 'Not a Godot project' };
        }
        
        this.currentProject = projectPath;
        
        return {
            success: true,
            project: projectPath,
            files: this.scanProjectFiles(projectPath)
        };
    }
    
    /**
     * Scan Godot project files
     */
    scanProjectFiles(projectPath) {
        const files = {
            scripts: [],
            scenes: [],
            resources: [],
            assets: []
        };
        
        const walk = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory() && item !== '.godot' && item !== '.git') {
                        walk(fullPath);
                    } else if (stat.isFile()) {
                        const ext = path.extname(item);
                        if (ext === '.gd') files.scripts.push(fullPath);
                        else if (ext === '.tscn' || ext === '.scn') files.scenes.push(fullPath);
                        else if (ext === '.tres' || ext === '.res') files.resources.push(fullPath);
                        else files.assets.push(fullPath);
                    }
                });
            } catch (error) {
                console.error('[Godot] Error scanning:', error);
            }
        };
        
        walk(projectPath);
        return files;
    }
    
    /**
     * Run Godot project
     */
    async runProject(projectPath) {
        if (!this.godotPath) {
            return { success: false, error: 'Godot executable not found' };
        }
        
        return new Promise((resolve) => {
            const proc = spawn(this.godotPath, ['--path', projectPath]);
            
            proc.on('close', (code) => {
                resolve({ success: code === 0, code });
            });
            
            proc.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    
    /**
     * Build/export Godot project
     */
    async exportProject(projectPath, preset, outputPath) {
        if (!this.godotPath) {
            return { success: false, error: 'Godot executable not found' };
        }
        
        return new Promise((resolve) => {
            const proc = spawn(this.godotPath, [
                '--path', projectPath,
                '--export', preset,
                outputPath
            ]);
            
            proc.on('close', (code) => {
                resolve({ success: code === 0, code, output: outputPath });
            });
            
            proc.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    
    /**
     * Get GDScript language features
     */
    getLanguageFeatures() {
        return {
            language: 'gdscript',
            extensions: ['.gd'],
            syntax: {
                keywords: ['var', 'const', 'func', 'class', 'extends', 'signal', 'enum', 'if', 'elif', 'else', 'for', 'while', 'match', 'break', 'continue', 'pass', 'return'],
                builtinTypes: ['int', 'float', 'bool', 'String', 'Vector2', 'Vector3', 'Color', 'Array', 'Dictionary'],
                builtinFunctions: ['print', 'printerr', 'push_error', 'push_warning']
            },
            snippets: this.getGDScriptSnippets()
        };
    }
    
    /**
     * GDScript code snippets
     */
    getGDScriptSnippets() {
        return {
            'node': 'extends Node\n\nfunc _ready():\n\tpass',
            'node2d': 'extends Node2D\n\nfunc _ready():\n\tpass\n\nfunc _process(delta):\n\tpass',
            'signal': 'signal ${1:signal_name}(${2:args})',
            'func': 'func ${1:function_name}(${2:args}):\n\t${3:pass}'
        };
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            name: 'Godot 4.2+',
            initialized: this.isInitialized,
            godotPath: this.godotPath,
            currentProject: this.currentProject,
            features: [
                'GDScript editing',
                'Scene file support',
                'Project detection',
                'Resource management',
                'Run/Debug support',
                'Export/Build support'
            ]
        };
    }
}

// Singleton
let instance = null;

function getGodotIntegration() {
    if (!instance) {
        instance = new GodotIntegration();
    }
    return instance;
}

module.exports = {
    GodotIntegration,
    getGodotIntegration
};

// Auto-init if main
if (require.main === module) {
    const godot = getGodotIntegration();
    godot.initialize().then(() => {
        console.log('Godot Integration Status:', godot.getStatus());
    });
}
