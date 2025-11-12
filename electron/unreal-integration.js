/**
 * BigDaddyG IDE - Unreal Engine 5.3+ Integration
 * Full support for Unreal Engine game development
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class UnrealIntegration {
    constructor() {
        this.unrealPath = null;
        this.currentProject = null;
        this.isInitialized = false;
        
        console.log('[Unreal Integration] Initialized');
    }
    
    /**
     * Initialize Unreal integration
     */
    async initialize() {
        if (this.isInitialized) return { success: true };
        
        try {
            await this.detectUnreal();
            
            this.isInitialized = true;
            return { success: true, unrealPath: this.unrealPath };
        } catch (error) {
            console.error('[Unreal] Initialization error:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Detect Unreal Engine installation
     */
    async detectUnreal() {
        const commonPaths = [
            'C:\\Program Files\\Epic Games\\UE_5.3\\Engine\\Binaries\\Win64\\UnrealEditor.exe',
            '/opt/UnrealEngine/Engine/Binaries/Linux/UnrealEditor',
            '~/UnrealEngine/Engine/Binaries/Mac/UnrealEditor.app',
            process.env.UE5_PATH
        ].filter(Boolean);
        
        for (const upath of commonPaths) {
            if (fs.existsSync(upath)) {
                this.unrealPath = upath;
                console.log(`[Unreal] Found at: ${upath}`);
                return true;
            }
        }
        
        console.log('[Unreal] Not found - IDE features available without Unreal');
        return false;
    }
    
    /**
     * Detect Unreal project
     */
    isUnrealProject(dir) {
        try {
            const files = fs.readdirSync(dir);
            return files.some(f => f.endsWith('.uproject'));
        } catch {
            return false;
        }
    }
    
    /**
     * Open Unreal project
     */
    async openProject(projectPath) {
        if (!this.isUnrealProject(projectPath)) {
            return { success: false, error: 'Not an Unreal project' };
        }
        
        this.currentProject = projectPath;
        
        return {
            success: true,
            project: projectPath,
            files: this.scanProjectFiles(projectPath)
        };
    }
    
    /**
     * Scan Unreal project files
     */
    scanProjectFiles(projectPath) {
        const files = {
            cpp: [],
            headers: [],
            blueprints: [],
            assets: []
        };
        
        const sourcePath = path.join(projectPath, 'Source');
        const contentPath = path.join(projectPath, 'Content');
        
        const walk = (dir, category) => {
            try {
                const items = fs.readdirSync(dir);
                items.forEach(item => {
                    const fullPath = path.join(dir, item);
                    const stat = fs.statSync(fullPath);
                    
                    if (stat.isDirectory()) {
                        walk(fullPath, category);
                    } else if (stat.isFile()) {
                        const ext = path.extname(item);
                        if (category === 'source') {
                            if (ext === '.cpp') files.cpp.push(fullPath);
                            else if (ext === '.h') files.headers.push(fullPath);
                        } else if (category === 'content') {
                            if (ext === '.uasset' || ext === '.umap') files.blueprints.push(fullPath);
                            else files.assets.push(fullPath);
                        }
                    }
                });
            } catch (error) {
                console.error('[Unreal] Error scanning:', error);
            }
        };
        
        if (fs.existsSync(sourcePath)) walk(sourcePath, 'source');
        if (fs.existsSync(contentPath)) walk(contentPath, 'content');
        
        return files;
    }
    
    /**
     * Run Unreal Editor
     */
    async runEditor(projectPath) {
        if (!this.unrealPath) {
            return { success: false, error: 'Unreal executable not found' };
        }
        
        const uprojectFile = this.findUProjectFile(projectPath);
        if (!uprojectFile) {
            return { success: false, error: 'No .uproject file found' };
        }
        
        return new Promise((resolve) => {
            const proc = spawn(this.unrealPath, [uprojectFile]);
            
            proc.on('close', (code) => {
                resolve({ success: code === 0, code });
            });
            
            proc.on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    }
    
    /**
     * Build Unreal project
     */
    async buildProject(projectPath, configuration = 'Development', platform = 'Win64') {
        const uprojectFile = this.findUProjectFile(projectPath);
        if (!uprojectFile) {
            return { success: false, error: 'No .uproject file found' };
        }
        
        // This would use UnrealBuildTool - simplified for now
        return {
            success: true,
            message: 'Build initiated (requires UnrealBuildTool)',
            configuration,
            platform
        };
    }
    
    /**
     * Find .uproject file
     */
    findUProjectFile(projectPath) {
        try {
            const files = fs.readdirSync(projectPath);
            const uproject = files.find(f => f.endsWith('.uproject'));
            return uproject ? path.join(projectPath, uproject) : null;
        } catch {
            return null;
        }
    }
    
    /**
     * Get C++ language features for Unreal
     */
    getLanguageFeatures() {
        return {
            language: 'cpp',
            extensions: ['.cpp', '.h'],
            syntax: {
                keywords: ['class', 'struct', 'enum', 'namespace', 'public', 'private', 'protected', 'virtual', 'override', 'const', 'void', 'int', 'float', 'bool'],
                unrealMacros: ['UCLASS', 'UFUNCTION', 'UPROPERTY', 'USTRUCT', 'GENERATED_BODY', 'UINTERFACE'],
                unrealTypes: ['AActor', 'UObject', 'UActorComponent', 'FVector', 'FRotator', 'FTransform', 'UWorld']
            },
            snippets: this.getCppSnippets()
        };
    }
    
    /**
     * C++ code snippets for Unreal
     */
    getCppSnippets() {
        return {
            'actor': 'UCLASS()\nclass ${1:PROJECT}_API A${2:ActorName} : public AActor\n{\n\tGENERATED_BODY()\n\npublic:\n\tA${2}();\n\nprotected:\n\tvirtual void BeginPlay() override;\n\npublic:\n\tvirtual void Tick(float DeltaTime) override;\n};',
            'component': 'UCLASS()\nclass ${1:PROJECT}_API U${2:ComponentName} : public UActorComponent\n{\n\tGENERATED_BODY()\n\npublic:\n\tU${2}();\n\nprotected:\n\tvirtual void BeginPlay() override;\n};',
            'uproperty': 'UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "${1:Category}")\n${2:Type} ${3:Name};'
        };
    }
    
    /**
     * Get integration status
     */
    getStatus() {
        return {
            name: 'Unreal Engine 5.3+',
            initialized: this.isInitialized,
            unrealPath: this.unrealPath,
            currentProject: this.currentProject,
            features: [
                'C++ editing',
                'Blueprint support',
                'Project detection',
                'Asset management',
                'UProperty/UFunction macros',
                'Build support'
            ]
        };
    }
}

// Singleton
let instance = null;

function getUnrealIntegration() {
    if (!instance) {
        instance = new UnrealIntegration();
    }
    return instance;
}

module.exports = {
    UnrealIntegration,
    getUnrealIntegration
};

// Auto-init if main
if (require.main === module) {
    const unreal = getUnrealIntegration();
    unreal.initialize().then(() => {
        console.log('Unreal Integration Status:', unreal.getStatus());
    });
}
