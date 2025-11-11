/**
 * BigDaddyG IDE - Comprehensive IDE Validator & Manifest Generator
 * 
 * Analyzes every file, checks wiring, validates connections,
 * and generates a complete manifest of the entire IDE
 * 
 * @author BigDaddyG IDE Team + AI Family
 */

const fs = require('fs');
const path = require('path');

class IDEValidator {
    constructor(rootPath) {
        this.rootPath = rootPath;
        this.results = {
            files: [],
            scripts: [],
            styles: [],
            modules: [],
            dependencies: [],
            connections: [],
            issues: [],
            warnings: [],
            manifest: {},
            stats: {}
        };
        
        console.log('[Validator] 🔍 Initializing IDE Validator...');
    }

    /**
     * Run complete validation
     */
    async validate() {
        console.log('\n🚀 STARTING COMPREHENSIVE IDE VALIDATION\n');
        
        await this.scanFiles();
        await this.analyzeIndexHTML();
        await this.checkScriptDependencies();
        await this.validateModuleConnections();
        await this.checkFrontendToBackend();
        await this.verifySettings();
        await this.analyzeEventListeners();
        await this.checkGlobalVariables();
        await this.validateCSS();
        await this.checkAssets();
        await this.generateManifest();
        await this.reportResults();
        
        return this.results;
    }

    /**
     * Scan all files in the project
     */
    async scanFiles() {
        console.log('📂 Scanning all files...');
        
        const scan = (dir, relativePath = '') => {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const relPath = path.join(relativePath, item);
                
                // Skip node_modules and .git
                if (item === 'node_modules' || item === '.git' || item === '.github') {
                    continue;
                }
                
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    scan(fullPath, relPath);
                } else {
                    const ext = path.extname(item);
                    const size = stat.size;
                    
                    this.results.files.push({
                        path: relPath,
                        fullPath: fullPath,
                        ext: ext,
                        size: size,
                        type: this.getFileType(ext)
                    });
                    
                    // Categorize by type
                    if (ext === '.js') {
                        this.results.scripts.push(relPath);
                    } else if (ext === '.css') {
                        this.results.styles.push(relPath);
                    }
                }
            }
        };
        
        scan(this.rootPath);
        
        console.log(`   ✅ Found ${this.results.files.length} files`);
        console.log(`   📜 JavaScript: ${this.results.scripts.length}`);
        console.log(`   🎨 CSS: ${this.results.styles.length}`);
    }

    /**
     * Get file type from extension
     */
    getFileType(ext) {
        const types = {
            '.js': 'JavaScript',
            '.css': 'CSS',
            '.html': 'HTML',
            '.json': 'JSON',
            '.md': 'Markdown',
            '.txt': 'Text',
            '.png': 'Image',
            '.jpg': 'Image',
            '.svg': 'Image',
            '.ico': 'Icon',
            '.ps1': 'PowerShell',
            '.bat': 'Batch',
            '.sh': 'Shell'
        };
        
        return types[ext] || 'Other';
    }

    /**
     * Analyze index.html
     */
    async analyzeIndexHTML() {
        console.log('\n📄 Analyzing index.html...');
        
        const indexPath = path.join(this.rootPath, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.results.issues.push({
                severity: 'CRITICAL',
                file: 'index.html',
                issue: 'index.html not found!'
            });
            return;
        }
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Find all script tags
        const scriptRegex = /<script\s+(?:.*?\s+)?src=["']([^"']+)["']/g;
        let match;
        
        while ((match = scriptRegex.exec(content)) !== null) {
            const scriptPath = match[1];
            this.results.dependencies.push({
                type: 'script',
                path: scriptPath,
                from: 'index.html'
            });
            
            // Check if file exists
            const fullPath = path.join(this.rootPath, scriptPath);
            if (!fs.existsSync(fullPath)) {
                this.results.issues.push({
                    severity: 'HIGH',
                    file: 'index.html',
                    issue: `Script not found: ${scriptPath}`
                });
            } else {
                console.log(`   ✅ ${scriptPath}`);
            }
        }
        
        // Find all link tags (CSS)
        const linkRegex = /<link\s+.*?href=["']([^"']+\.css)["']/g;
        
        while ((match = linkRegex.exec(content)) !== null) {
            const cssPath = match[1];
            this.results.dependencies.push({
                type: 'css',
                path: cssPath,
                from: 'index.html'
            });
            
            const fullPath = path.join(this.rootPath, cssPath);
            if (!fs.existsSync(fullPath)) {
                this.results.issues.push({
                    severity: 'MEDIUM',
                    file: 'index.html',
                    issue: `CSS not found: ${cssPath}`
                });
            } else {
                console.log(`   🎨 ${cssPath}`);
            }
        }
        
        // Check for essential elements
        const essentials = [
            { id: 'app', name: 'Main app container' },
            { id: 'monaco-container', name: 'Monaco editor container' },
            { id: 'title-bar', name: 'Title bar' }
        ];
        
        for (const essential of essentials) {
            if (!content.includes(`id="${essential.id}"`)) {
                this.results.warnings.push({
                    file: 'index.html',
                    warning: `Missing essential element: ${essential.name} (#${essential.id})`
                });
            }
        }
        
        console.log(`   📊 Found ${this.results.dependencies.length} dependencies`);
    }

    /**
     * Check script dependencies
     */
    async checkScriptDependencies() {
        console.log('\n🔗 Checking script dependencies...');
        
        for (const scriptPath of this.results.scripts) {
            const fullPath = path.join(this.rootPath, scriptPath);
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Find requires
                const requireRegex = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
                let match;
                
                while ((match = requireRegex.exec(content)) !== null) {
                    const depPath = match[1];
                    
                    this.results.connections.push({
                        from: scriptPath,
                        to: depPath,
                        type: 'require'
                    });
                }
                
                // Find imports
                const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"]/g;
                
                while ((match = importRegex.exec(content)) !== null) {
                    const depPath = match[1];
                    
                    this.results.connections.push({
                        from: scriptPath,
                        to: depPath,
                        type: 'import'
                    });
                }
                
                // Find global variable usage
                const globalVars = [
                    'window.tabSystem',
                    'window.aiSystem',
                    'window.cognitiveModeManager',
                    'window.editor',
                    'window.monaco'
                ];
                
                for (const globalVar of globalVars) {
                    if (content.includes(globalVar)) {
                        this.results.connections.push({
                            from: scriptPath,
                            to: globalVar,
                            type: 'global'
                        });
                    }
                }
                
            } catch (error) {
                this.results.issues.push({
                    severity: 'MEDIUM',
                    file: scriptPath,
                    issue: `Error reading file: ${error.message}`
                });
            }
        }
        
        console.log(`   ✅ Found ${this.results.connections.length} connections`);
    }

    /**
     * Validate module connections
     */
    async validateModuleConnections() {
        console.log('\n🔌 Validating module connections...');
        
        const modules = {
            'settings-manager.js': {
                exports: ['SettingsManager', 'loadSettings', 'saveSettings'],
                globals: ['window.settingsManager']
            },
            'theme-manager.js': {
                exports: ['ThemeManager'],
                globals: ['window.themeManager']
            },
            'cognitive-modes/mode-manager.js': {
                exports: ['CognitiveModeManager'],
                globals: ['window.cognitiveModeManager']
            },
            'cognitive-modes/mode-ui.js': {
                exports: ['CognitiveModeUI'],
                globals: ['window.cognitiveModeUI']
            }
        };
        
        for (const [modulePath, config] of Object.entries(modules)) {
            const fullPath = path.join(this.rootPath, modulePath);
            
            if (!fs.existsSync(fullPath)) {
                this.results.issues.push({
                    severity: 'HIGH',
                    file: modulePath,
                    issue: 'Module file not found'
                });
                continue;
            }
            
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Check exports
            for (const exp of config.exports) {
                if (!content.includes(exp)) {
                    this.results.warnings.push({
                        file: modulePath,
                        warning: `Expected export not found: ${exp}`
                    });
                }
            }
            
            // Check global assignments
            for (const global of config.globals) {
                const found = this.results.connections.some(conn => 
                    conn.to === global
                );
                
                if (!found) {
                    this.results.warnings.push({
                        file: modulePath,
                        warning: `Global variable ${global} may not be properly wired`
                    });
                }
            }
            
            console.log(`   ✅ ${modulePath}`);
        }
    }

    /**
     * Check frontend to backend connections
     */
    async checkFrontendToBackend() {
        console.log('\n🌐 Checking frontend to backend connections...');
        
        // Check IPC connections
        const ipcPatterns = [
            'ipcRenderer.send',
            'ipcRenderer.invoke',
            'ipcRenderer.on',
            'ipcMain.on',
            'ipcMain.handle'
        ];
        
        const ipcConnections = [];
        
        for (const scriptPath of this.results.scripts) {
            const fullPath = path.join(this.rootPath, scriptPath);
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                for (const pattern of ipcPatterns) {
                    if (content.includes(pattern)) {
                        // Extract channel names
                        const regex = new RegExp(`${pattern}\\s*\\(\\s*['"]([^'"]+)['"]`, 'g');
                        let match;
                        
                        while ((match = regex.exec(content)) !== null) {
                            ipcConnections.push({
                                file: scriptPath,
                                pattern: pattern,
                                channel: match[1]
                            });
                        }
                    }
                }
            } catch (error) {
                // Skip
            }
        }
        
        console.log(`   ✅ Found ${ipcConnections.length} IPC connections`);
        
        // Check for main.js
        const mainPath = path.join(this.rootPath, 'main.js');
        if (fs.existsSync(mainPath)) {
            console.log('   ✅ main.js found');
        } else {
            this.results.warnings.push({
                file: 'main.js',
                warning: 'Main process file not found'
            });
        }
    }

    /**
     * Verify settings configuration
     */
    async verifySettings() {
        console.log('\n⚙️ Verifying settings configuration...');
        
        const settingsFiles = [
            'bigdaddyg.ini',
            'cognitive-modes-config.json',
            'package.json'
        ];
        
        for (const settingsFile of settingsFiles) {
            const fullPath = path.join(this.rootPath, settingsFile);
            
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ ${settingsFile}`);
                
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    
                    if (settingsFile.endsWith('.json')) {
                        JSON.parse(content); // Validate JSON
                        console.log(`      Valid JSON format`);
                    }
                } catch (error) {
                    this.results.issues.push({
                        severity: 'HIGH',
                        file: settingsFile,
                        issue: `Invalid format: ${error.message}`
                    });
                }
            } else {
                this.results.warnings.push({
                    file: settingsFile,
                    warning: 'Settings file not found'
                });
            }
        }
    }

    /**
     * Analyze event listeners
     */
    async analyzeEventListeners() {
        console.log('\n🎧 Analyzing event listeners...');
        
        const eventPatterns = [
            'addEventListener',
            'on(',
            'onclick',
            'onload',
            'emit('
        ];
        
        let totalEvents = 0;
        
        for (const scriptPath of this.results.scripts) {
            const fullPath = path.join(this.rootPath, scriptPath);
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                for (const pattern of eventPatterns) {
                    const count = (content.match(new RegExp(pattern, 'g')) || []).length;
                    totalEvents += count;
                }
            } catch (error) {
                // Skip
            }
        }
        
        console.log(`   ✅ Found ${totalEvents} event listeners`);
    }

    /**
     * Check global variables
     */
    async checkGlobalVariables() {
        console.log('\n🌍 Checking global variables...');
        
        const expectedGlobals = [
            'window.tabSystem',
            'window.aiSystem',
            'window.cognitiveModeManager',
            'window.cognitiveModeUI',
            'window.cognitiveAIIntegration',
            'window.openCognitiveModes',
            'window.settingsManager',
            'window.themeManager',
            'window.monaco',
            'window.editor'
        ];
        
        const foundGlobals = new Set();
        
        for (const scriptPath of this.results.scripts) {
            const fullPath = path.join(this.rootPath, scriptPath);
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                for (const global of expectedGlobals) {
                    if (content.includes(global)) {
                        foundGlobals.add(global);
                    }
                }
            } catch (error) {
                // Skip
            }
        }
        
        console.log(`   ✅ Found ${foundGlobals.size}/${expectedGlobals.length} expected globals`);
        
        // Report missing globals
        for (const global of expectedGlobals) {
            if (!foundGlobals.has(global)) {
                this.results.warnings.push({
                    file: 'global',
                    warning: `Global variable may not be initialized: ${global}`
                });
            }
        }
    }

    /**
     * Validate CSS
     */
    async validateCSS() {
        console.log('\n🎨 Validating CSS files...');
        
        for (const cssPath of this.results.styles) {
            const fullPath = path.join(this.rootPath, cssPath);
            
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for syntax errors (basic)
                const braceCount = (content.match(/{/g) || []).length - 
                                  (content.match(/}/g) || []).length;
                
                if (braceCount !== 0) {
                    this.results.issues.push({
                        severity: 'HIGH',
                        file: cssPath,
                        issue: 'Mismatched braces in CSS'
                    });
                }
                
                console.log(`   ✅ ${cssPath}`);
            } catch (error) {
                this.results.issues.push({
                    severity: 'MEDIUM',
                    file: cssPath,
                    issue: `Error reading CSS: ${error.message}`
                });
            }
        }
    }

    /**
     * Check assets
     */
    async checkAssets() {
        console.log('\n🖼️ Checking assets...');
        
        const assetTypes = ['.png', '.jpg', '.svg', '.ico', '.icns'];
        const assets = this.results.files.filter(f => 
            assetTypes.includes(f.ext)
        );
        
        console.log(`   ✅ Found ${assets.length} asset files`);
    }

    /**
     * Generate comprehensive manifest
     */
    async generateManifest() {
        console.log('\n📋 Generating manifest...');
        
        this.results.manifest = {
            metadata: {
                generated: new Date().toISOString(),
                ide: 'BigDaddyG IDE',
                version: '1.0.0'
            },
            structure: {
                totalFiles: this.results.files.length,
                javascript: this.results.scripts.length,
                css: this.results.styles.length,
                dependencies: this.results.dependencies.length,
                connections: this.results.connections.length
            },
            health: {
                critical: this.results.issues.filter(i => i.severity === 'CRITICAL').length,
                high: this.results.issues.filter(i => i.severity === 'HIGH').length,
                medium: this.results.issues.filter(i => i.severity === 'MEDIUM').length,
                warnings: this.results.warnings.length
            },
            files: {
                byType: {},
                bySize: {
                    total: 0,
                    average: 0
                }
            },
            features: {
                cognitiveModes: this.checkFeature('cognitive-modes'),
                intellijSystem: this.checkFeature('intellij-system'),
                bigdaddyEditor: this.checkFeature('bigdaddy-editor'),
                settingsPanel: this.checkFeature('settings-panel'),
                themeManager: this.checkFeature('theme-manager')
            }
        };
        
        // Calculate file stats
        const typeCount = {};
        let totalSize = 0;
        
        for (const file of this.results.files) {
            typeCount[file.type] = (typeCount[file.type] || 0) + 1;
            totalSize += file.size;
        }
        
        this.results.manifest.files.byType = typeCount;
        this.results.manifest.files.bySize.total = totalSize;
        this.results.manifest.files.bySize.average = Math.round(totalSize / this.results.files.length);
        
        console.log('   ✅ Manifest generated');
    }

    /**
     * Check if feature exists
     */
    checkFeature(featureName) {
        return this.results.files.some(f => 
            f.path.includes(featureName)
        );
    }

    /**
     * Report results
     */
    async reportResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION REPORT');
        console.log('='.repeat(60));
        
        console.log('\n📈 STATISTICS:');
        console.log(`   Total Files:        ${this.results.files.length}`);
        console.log(`   JavaScript Files:   ${this.results.scripts.length}`);
        console.log(`   CSS Files:          ${this.results.styles.length}`);
        console.log(`   Dependencies:       ${this.results.dependencies.length}`);
        console.log(`   Connections:        ${this.results.connections.length}`);
        
        console.log('\n🏥 HEALTH STATUS:');
        const critical = this.results.issues.filter(i => i.severity === 'CRITICAL').length;
        const high = this.results.issues.filter(i => i.severity === 'HIGH').length;
        const medium = this.results.issues.filter(i => i.severity === 'MEDIUM').length;
        
        console.log(`   🔴 Critical Issues: ${critical}`);
        console.log(`   🟠 High Issues:     ${high}`);
        console.log(`   🟡 Medium Issues:   ${medium}`);
        console.log(`   ⚠️  Warnings:        ${this.results.warnings.length}`);
        
        if (this.results.issues.length > 0) {
            console.log('\n❌ ISSUES FOUND:');
            for (const issue of this.results.issues) {
                console.log(`   [${issue.severity}] ${issue.file}: ${issue.issue}`);
            }
        }
        
        if (this.results.warnings.length > 0 && this.results.warnings.length <= 10) {
            console.log('\n⚠️  WARNINGS:');
            for (const warning of this.results.warnings) {
                console.log(`   ${warning.file}: ${warning.warning}`);
            }
        } else if (this.results.warnings.length > 10) {
            console.log(`\n⚠️  ${this.results.warnings.length} warnings found (see full report)`);
        }
        
        console.log('\n✅ FEATURES DETECTED:');
        for (const [feature, exists] of Object.entries(this.results.manifest.features)) {
            console.log(`   ${exists ? '✅' : '❌'} ${feature}`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        const score = this.calculateScore();
        console.log(`\n🎯 OVERALL SCORE: ${score}/100`);
        
        if (score >= 90) {
            console.log('🎉 EXCELLENT! IDE is production ready!');
        } else if (score >= 75) {
            console.log('✅ GOOD! Minor issues need attention.');
        } else if (score >= 50) {
            console.log('⚠️  NEEDS WORK! Several issues found.');
        } else {
            console.log('❌ CRITICAL! Major issues need immediate attention.');
        }
        
        console.log('\n');
    }

    /**
     * Calculate overall score
     */
    calculateScore() {
        let score = 100;
        
        // Deduct for issues
        score -= this.results.issues.filter(i => i.severity === 'CRITICAL').length * 20;
        score -= this.results.issues.filter(i => i.severity === 'HIGH').length * 10;
        score -= this.results.issues.filter(i => i.severity === 'MEDIUM').length * 5;
        score -= this.results.warnings.length * 1;
        
        return Math.max(0, score);
    }

    /**
     * Save report to file
     */
    async saveReport(outputPath) {
        const report = {
            ...this.results,
            score: this.calculateScore(),
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`📄 Full report saved to: ${outputPath}`);
    }
}

// Export
module.exports = IDEValidator;

// Run if called directly
if (require.main === module) {
    const rootPath = path.join(__dirname, '..');
    const validator = new IDEValidator(rootPath);
    
    validator.validate().then(() => {
        const reportPath = path.join(__dirname, '../ide-validation-report.json');
        validator.saveReport(reportPath);
        
        process.exit(validator.calculateScore() >= 75 ? 0 : 1);
    }).catch(error => {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    });
}
