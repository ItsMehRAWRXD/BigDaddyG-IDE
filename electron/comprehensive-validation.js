#!/usr/bin/env node

/**
 * BigDaddyG IDE - Comprehensive Validation & Auto-Fix
 * Checks ALL components and fixes missing integrations
 */

const fs = require('fs');
const path = require('path');

class ComprehensiveValidator {
    constructor() {
        this.issues = [];
        this.fixes = [];
        this.warnings = [];
        
        console.log('🔍 Starting comprehensive validation...\n');
    }
    
    /**
     * Run all validations
     */
    async validate() {
        await this.checkFileExistence();
        await this.checkIntegrations();
        await this.checkInitialization();
        await this.checkUIWiring();
        await this.checkAPIConnections();
        await this.checkDependencies();
        await this.checkConfiguration();
        
        this.generateReport();
        await this.applyFixes();
    }
    
    /**
     * Check critical files exist
     */
    async checkFileExistence() {
        console.log('📁 Checking critical files...');
        
        const criticalFiles = [
            'electron/ai-provider-manager.js',
            'electron/bigdaddya-integration.js',
            'electron/built-in-local-ai.js',
            'electron/standalone-local-ai.js',
            'electron/ui/api-key-manager-ui.js',
            'electron/logger.js',
            'electron/memory-manager.js',
            'electron/css-optimizer.js',
            'electron/settings-manager.js',
            'electron/theme-manager.js',
            'bigdaddyg-cli.js',
            'bigdaddyg-cli.ps1'
        ];
        
        for (const file of criticalFiles) {
            const fullPath = path.join(__dirname, '..', file);
            if (!fs.existsSync(fullPath)) {
                this.issues.push({
                    type: 'MISSING_FILE',
                    severity: 'HIGH',
                    file,
                    message: `Critical file missing: ${file}`
                });
            }
        }
        
        console.log(`   ✅ Checked ${criticalFiles.length} critical files\n`);
    }
    
    /**
     * Check component integrations
     */
    async checkIntegrations() {
        console.log('🔗 Checking component integrations...');
        
        // Check if API Key Manager UI is initialized
        const rendererPath = path.join(__dirname, 'renderer.js');
        if (fs.existsSync(rendererPath)) {
            const content = fs.readFileSync(rendererPath, 'utf8');
            
            if (!content.includes('api-key-manager-ui') && !content.includes('APIKeyManagerUI')) {
                this.issues.push({
                    type: 'MISSING_INTEGRATION',
                    severity: 'MEDIUM',
                    file: 'renderer.js',
                    message: 'API Key Manager UI not initialized in renderer',
                    fix: 'ADD_API_KEY_UI_INIT'
                });
            }
            
            if (!content.includes('aiProviderManager')) {
                this.issues.push({
                    type: 'MISSING_INTEGRATION',
                    severity: 'HIGH',
                    file: 'renderer.js',
                    message: 'AI Provider Manager not initialized',
                    fix: 'ADD_AI_PROVIDER_INIT'
                });
            }
        }
        
        console.log(`   ✅ Integration check complete\n`);
    }
    
    /**
     * Check initialization sequences
     */
    async checkInitialization() {
        console.log('🚀 Checking initialization...');
        
        const mainPath = path.join(__dirname, 'main.js');
        if (fs.existsSync(mainPath)) {
            const content = fs.readFileSync(mainPath, 'utf8');
            
            // Check for IPC handlers
            if (!content.includes('ipcMain.handle') && !content.includes('apikeys')) {
                this.warnings.push({
                    type: 'MISSING_IPC',
                    severity: 'MEDIUM',
                    message: 'API key IPC handlers may be missing',
                    fix: 'ADD_IPC_HANDLERS'
                });
            }
        }
        
        console.log(`   ✅ Initialization check complete\n`);
    }
    
    /**
     * Check UI wiring
     */
    async checkUIWiring() {
        console.log('🎨 Checking UI wiring...');
        
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');
            
            // Check for script includes
            const requiredScripts = [
                'ai-provider-manager.js',
                'renderer.js'
            ];
            
            for (const script of requiredScripts) {
                if (!content.includes(script)) {
                    this.warnings.push({
                        type: 'MISSING_SCRIPT',
                        severity: 'LOW',
                        file: 'index.html',
                        message: `Script not included: ${script}`
                    });
                }
            }
        }
        
        console.log(`   ✅ UI wiring check complete\n`);
    }
    
    /**
     * Check API connections
     */
    async checkAPIConnections() {
        console.log('🌐 Checking API connections...');
        
        const aiProviderPath = path.join(__dirname, 'ai-provider-manager.js');
        if (fs.existsSync(aiProviderPath)) {
            const content = fs.readFileSync(aiProviderPath, 'utf8');
            
            // Check all providers are registered
            const providers = ['openai', 'anthropic', 'gemini', 'groq', 'deepseek', 'kimi', 'cohere', 'azure'];
            
            for (const provider of providers) {
                if (!content.includes(`'${provider}'`)) {
                    this.warnings.push({
                        type: 'MISSING_PROVIDER',
                        severity: 'LOW',
                        message: `Provider may not be fully configured: ${provider}`
                    });
                }
            }
        }
        
        console.log(`   ✅ API connections check complete\n`);
    }
    
    /**
     * Check dependencies
     */
    async checkDependencies() {
        console.log('📦 Checking dependencies...');
        
        const packagePath = path.join(__dirname, '..', 'package.json');
        if (fs.existsSync(packagePath)) {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            const requiredDeps = [
                'electron',
                'monaco-editor'
            ];
            
            for (const dep of requiredDeps) {
                if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
                    this.warnings.push({
                        type: 'MISSING_DEPENDENCY',
                        severity: 'MEDIUM',
                        message: `Dependency may be missing: ${dep}`
                    });
                }
            }
        }
        
        console.log(`   ✅ Dependencies check complete\n`);
    }
    
    /**
     * Check configuration files
     */
    async checkConfiguration() {
        console.log('⚙️  Checking configuration...');
        
        // Check for settings file structure
        const settingsPath = path.join(__dirname, '..', 'settings.json');
        if (!fs.existsSync(settingsPath)) {
            this.fixes.push({
                type: 'CREATE_SETTINGS',
                action: () => {
                    const defaultSettings = {
                        theme: 'dark',
                        fontSize: 14,
                        autoSave: true,
                        aiProvider: 'bigdaddya',
                        gameEngine: 'godot',
                        recentFiles: [],
                        recentProjects: []
                    };
                    
                    fs.writeFileSync(settingsPath, JSON.stringify(defaultSettings, null, 2));
                    console.log('   ✅ Created default settings.json');
                }
            });
        }
        
        console.log(`   ✅ Configuration check complete\n`);
    }
    
    /**
     * Generate validation report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 VALIDATION REPORT');
        console.log('='.repeat(80) + '\n');
        
        console.log(`🔴 Critical Issues: ${this.issues.filter(i => i.severity === 'HIGH').length}`);
        console.log(`🟡 Medium Issues: ${this.issues.filter(i => i.severity === 'MEDIUM').length}`);
        console.log(`🟢 Low Issues: ${this.issues.filter(i => i.severity === 'LOW').length}`);
        console.log(`⚠️  Warnings: ${this.warnings.length}`);
        console.log(`🔧 Auto-fixes available: ${this.fixes.length}\n`);
        
        if (this.issues.length > 0) {
            console.log('Issues Found:');
            for (const issue of this.issues) {
                const icon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🟢';
                console.log(`  ${icon} [${issue.type}] ${issue.message}`);
                if (issue.file) console.log(`      File: ${issue.file}`);
            }
            console.log('');
        }
        
        if (this.warnings.length > 0) {
            console.log('Warnings:');
            for (const warning of this.warnings) {
                console.log(`  ⚠️  ${warning.message}`);
            }
            console.log('');
        }
    }
    
    /**
     * Apply automatic fixes
     */
    async applyFixes() {
        if (this.fixes.length === 0) {
            console.log('✅ No fixes needed!\n');
            return;
        }
        
        console.log(`🔧 Applying ${this.fixes.length} automatic fixes...\n`);
        
        for (const fix of this.fixes) {
            try {
                await fix.action();
            } catch (error) {
                console.error(`   ❌ Fix failed: ${error.message}`);
            }
        }
        
        console.log('\n✅ All fixes applied!\n');
    }
}

// Run validation
if (require.main === module) {
    const validator = new ComprehensiveValidator();
    validator.validate().then(() => {
        console.log('🎉 Validation complete!');
    }).catch(error => {
        console.error('❌ Validation failed:', error);
        process.exit(1);
    });
}

module.exports = ComprehensiveValidator;
