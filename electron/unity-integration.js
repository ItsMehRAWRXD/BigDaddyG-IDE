/**
 * BigDaddyG IDE - Unity 2022 LTS Integration
 * Full support for Unity game engine development
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class UnityIntegration {
    constructor() {
        this.unityPath = null;
        this.currentProject = null;
        this.isInitialized = false;
        
        console.log('[Unity Integration] Initialized');
    }
    
    /**
     * Initialize Unity integration
     */
    async initialize() {
        if (this.isInitialized) return { success: true };
        
        try {
            await this.detectUnity();
            
            this.isInitialized = true;
            return { success: true, unityPath: this.unityPath };
        } catch (error) {
            console.error('[Unity] Initialization error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Detect Unity installation
     */
    async detectUnity() {
        const commonPaths = [
            'C:\\Program Files\\Unity\\Hub\\Editor\\2022.3.0f1\\Editor\\Unity.exe',
            '/Applications/Unity/Hub/Editor/2022.3.0f1/Unity.app',
            '/opt/unity/Editor/Unity',
            process.env.UNITY_PATH
        ].filter(Boolean);
        
        for (const upath of commonPaths) {
            if (fs.existsSync(upath)) {
                this.unityPath = upath;
                console.log(`[Unity] Found at: ${upath}`);
                return true;
            }
        }
        
        console.log('[Unity] Not found - IDE features available without Unity');
        return false;
    }
    
    /**
     * Detect Unity project
     */
    isUnityProject(dir) {
        const assetsDir = path.join(dir, 'Assets');
        const projectSettings = path.join(dir, 'ProjectSettings');
        return fs.existsSync(assetsDir) && fs.existsSync(projectSettings);
    }
    
    /**
     * Open Unity project
     */
    async openProject(projectPath) {
        if (!this.isUnityProject(projectPath)) {
            return { success: false, error: 'Not a Unity project' };
        }
        
        this.currentProject = projectPath;
        
        return {
            success: true,
            project: projectPath,
            files: this.scanProjectFiles(projectPath)
        };
    }
    
    /**
     * Scan Unity project files
     */
    scanProjectFiles(projectPath) {
        const files = {
            scripts: [],
            scenes: [],
            prefabs: [],
            assets: []
        };
        
        const assetsPath = path.join(projectPath, 'Assets');
        if (!fs.existsSync(assetsPath)) return files;
        
        const walk = (dir) => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        walk(fullPath);
                    } else if (stat.isFile()) {
                        const ext = path.extname(item);
                        if (ext === '.cs') files.scripts.push(fullPath);
                        else if (ext === '.unity') files.scenes.push(fullPath);
                        else if (ext === '.prefab') files.prefabs.push(fullPath);
                        else files.assets.push(fullPath);
                    }
                });
            } catch (error) {
                console.error('[Unity] Error scanning:', error);
            }
        };
        
        walk(assetsPath);
        return files;
    }
    
    /**
     * Run Unity editor
     */
    async runEditor(projectPath) {
        if (!this.unityPath) {
            return { success: false, error: 'Unity executable not found' };
        }
        
        return new Promise((resolve) => {
            const proc = spawn(this.unityPath, ['-projectPath', projectPath]);
            
            proc.on('close', (code) => {
                resolve({ success: code === 0, code });
            });
            
            proc.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    
    /**
     * Build Unity project
     */
    async buildProject(projectPath, target = 'StandaloneWindows64', outputPath) {
        if (!this.unityPath) {
            return { success: false, error: 'Unity executable not found' };
        }
        
        return new Promise((resolve) => {
            const proc = spawn(this.unityPath, [
                '-quit',
                '-batchmode',
                '-projectPath', projectPath,
                '-buildTarget', target,
                '-buildPath', outputPath
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
     * Get C# language features for Unity
     */
    getLanguageFeatures() {
        return {
            language: 'csharp',
            extensions: ['.cs'],
            syntax: {
                keywords: ['using', 'namespace', 'class', 'public', 'private', 'protected', 'void', 'int', 'float', 'bool', 'string', 'if', 'else', 'for', 'foreach', 'while', 'return', 'new'],
                unityTypes: ['MonoBehaviour', 'GameObject', 'Transform', 'Vector3', 'Quaternion', 'Rigidbody', 'Collider'],
                unityFunctions: ['Start', 'Update', 'FixedUpdate', 'OnTriggerEnter', 'OnCollisionEnter', 'Instantiate', 'Destroy']
            },
            snippets: this.getCSharpSnippets()
        };
    }
    
    /**
     * C# code snippets for Unity
     */
    getCSharpSnippets() {
        return {
            'monobehaviour': 'using UnityEngine;\n\npublic class ${1:ClassName} : MonoBehaviour\n{\n\tvoid Start()\n\t{\n\t\t${2}\n\t}\n\n\tvoid Update()\n\t{\n\t\t${3}\n\t}\n}',
            'coroutine': 'IEnumerator ${1:CoroutineName}()\n{\n\t${2}\n\tyield return null;\n}',
            'serialize': '[SerializeField] private ${1:type} ${2:name};'
        };
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            name: 'Unity 2022 LTS',
            initialized: this.isInitialized,
            unityPath: this.unityPath,
            currentProject: this.currentProject,
            features: [
                'C# editing',
                'Scene file support',
                'Project detection',
                'Asset management',
                'Inspector support',
                'Build/Export support'
            ]
        };
    }
}

// Singleton
let instance = null;

function getUnityIntegration() {
    if (!instance) {
        instance = new UnityIntegration();
    }
    return instance;
}

module.exports = {
    UnityIntegration,
    getUnityIntegration
};

// Auto-init if main
if (require.main === module) {
    const unity = getUnityIntegration();
    unity.initialize().then(() => {
        console.log('Unity Integration Status:', unity.getStatus());
    });
}
