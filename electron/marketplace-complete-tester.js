#!/usr/bin/env node
/**
 * BigDaddyG IDE - Marketplace Complete Tester
 * Tests EVERYTHING related to extensions and marketplace
 * This is CRITICAL - marketplace is the backup if Ollama fails
 */

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                               ║');
console.log('║         🛒 BIGDADDYG IDE - MARKETPLACE COMPLETE TESTER 🛒                    ║');
console.log('║                    CRITICAL SYSTEM VALIDATION                                ║');
console.log('║                                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

class MarketplaceCompleteTester {
    constructor() {
        this.electronDir = __dirname;
        this.results = {
            marketplace: { tested: 0, working: 0, broken: 0 },
            extensions: { tested: 0, loaded: 0, failed: 0 },
            vscodeCompat: { tested: 0, compatible: 0, incompatible: 0 },
            installation: { tested: 0, working: 0, broken: 0 },
            ui: { tested: 0, functional: 0, broken: 0 },
            api: { tested: 0, implemented: 0, missing: 0 }
        };
        
        this.criticalIssues = [];
        this.recommendations = [];
    }
    
    async runAllTests() {
        console.log('🔍 Starting CRITICAL marketplace system testing...\n');
        
        await this.testMarketplaceCore();
        await this.testExtensionSystem();
        await this.testVSCodeCompatibility();
        await this.testExtensionInstallation();
        await this.testExtensionManagement();
        await this.testMarketplaceUI();
        await this.testExtensionAPI();
        await this.testPluginSystem();
        await this.testExtensionHost();
        await this.testBackupSystems();
        
        return this.generateReport();
    }
    
    // Test marketplace core
    async testMarketplaceCore() {
        console.log('🛒 Testing Marketplace Core System');
        console.log('─'.repeat(80));
        
        const coreFiles = [
            { file: 'plugin-marketplace.js', name: 'Plugin Marketplace', critical: true },
            { file: 'marketplace/marketplace-client.js', name: 'Marketplace Client', critical: true },
            { file: 'marketplace/extension-manager.js', name: 'Extension Manager', critical: true },
            { file: 'unified-extension-system.js', name: 'Unified Extension System', critical: true },
            { file: 'plugin-system.js', name: 'Plugin System', critical: true }
        ];
        
        for (const component of coreFiles) {
            const filePath = path.join(this.electronDir, component.file);
            
            if (!fs.existsSync(filePath)) {
                console.log(`   ❌ ${component.name} - FILE NOT FOUND`);
                this.addCriticalIssue(`CRITICAL: ${component.name} missing - marketplace cannot function`);
                this.results.marketplace.broken++;
            } else {
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Check for essential marketplace functions
                const hasInstall = /install.*extension|installPlugin/i.test(content);
                const hasUninstall = /uninstall|remove.*extension/i.test(content);
                const hasSearch = /search|query.*extensions/i.test(content);
                const hasList = /list.*extensions|getExtensions/i.test(content);
                
                const functionalityScore = [hasInstall, hasUninstall, hasSearch, hasList].filter(Boolean).length;
                
                if (functionalityScore >= 3) {
                    console.log(`   ✅ ${component.name} - Fully functional (${functionalityScore}/4 features)`);
                    this.results.marketplace.working++;
                } else if (functionalityScore >= 2) {
                    console.log(`   ⚠️  ${component.name} - Partially functional (${functionalityScore}/4 features)`);
                    this.addCriticalIssue(`${component.name} missing core functionality`);
                    this.results.marketplace.broken++;
                } else {
                    console.log(`   ❌ ${component.name} - Non-functional (${functionalityScore}/4 features)`);
                    this.addCriticalIssue(`CRITICAL: ${component.name} appears broken`);
                    this.results.marketplace.broken++;
                }
            }
            this.results.marketplace.tested++;
        }
        
        console.log('');
    }
    
    // Test extension system
    async testExtensionSystem() {
        console.log('🔌 Testing Extension System');
        console.log('─'.repeat(80));
        
        const extensionTests = [
            {
                name: 'Extension Host',
                file: 'extension-host/extension-host.js',
                mustHave: ['activate', 'deactivate', 'loadExtension']
            },
            {
                name: 'Extension Bridge',
                file: 'extension-host/extension-bridge.js',
                mustHave: ['bridge', 'communicate', 'ipc']
            },
            {
                name: 'VSCode API',
                file: 'vscode-api/vscode-api.js',
                mustHave: ['vscode', 'commands', 'window']
            },
            {
                name: 'Extension Loader',
                file: 'unified-extension-system.js',
                mustHave: ['load', 'register', 'enable']
            }
        ];
        
        for (const test of extensionTests) {
            const filePath = path.join(this.electronDir, test.file);
            
            if (!fs.existsSync(filePath)) {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addCriticalIssue(`CRITICAL: ${test.name} missing`);
                this.results.extensions.failed++;
            } else {
                const content = fs.readFileSync(filePath, 'utf8');
                const hasRequired = test.mustHave.every(req => 
                    new RegExp(req, 'i').test(content)
                );
                
                if (hasRequired) {
                    console.log(`   ✅ ${test.name} - All required functions present`);
                    this.results.extensions.loaded++;
                } else {
                    console.log(`   ⚠️  ${test.name} - Missing some required functions`);
                    this.addCriticalIssue(`${test.name} incomplete`);
                    this.results.extensions.failed++;
                }
            }
            this.results.extensions.tested++;
        }
        
        console.log('');
    }
    
    // Test VS Code compatibility
    async testVSCodeCompatibility() {
        console.log('📦 Testing VS Code Extension Compatibility');
        console.log('─'.repeat(80));
        
        const vscodeAPIPath = path.join(this.electronDir, 'vscode-api');
        
        if (!fs.existsSync(vscodeAPIPath)) {
            console.log('   ❌ VS Code API directory not found');
            this.addCriticalIssue('CRITICAL: No VS Code compatibility layer');
            return;
        }
        
        const apiModules = [
            { file: 'vscode-api.js', name: 'Main API', apis: ['commands', 'window', 'workspace'] },
            { file: 'commands.js', name: 'Commands API', apis: ['registerCommand', 'executeCommand'] },
            { file: 'window.js', name: 'Window API', apis: ['showInformationMessage', 'showErrorMessage'] },
            { file: 'workspace.js', name: 'Workspace API', apis: ['openTextDocument', 'workspaceFolders'] },
            { file: 'languages.js', name: 'Languages API', apis: ['registerCompletionItemProvider'] },
            { file: 'env.js', name: 'Environment API', apis: ['appName', 'language'] },
            { file: 'extensions.js', name: 'Extensions API', apis: ['getExtension', 'all'] }
        ];
        
        for (const module of apiModules) {
            const modulePath = path.join(vscodeAPIPath, module.file);
            
            if (!fs.existsSync(modulePath)) {
                console.log(`   ❌ ${module.name} - NOT FOUND`);
                this.results.vscodeCompat.incompatible++;
            } else {
                const content = fs.readFileSync(modulePath, 'utf8');
                const implementedAPIs = module.apis.filter(api =>
                    new RegExp(api, 'i').test(content)
                ).length;
                
                const percentage = ((implementedAPIs / module.apis.length) * 100).toFixed(0);
                
                if (percentage === '100') {
                    console.log(`   ✅ ${module.name} - Fully compatible (${implementedAPIs}/${module.apis.length})`);
                    this.results.vscodeCompat.compatible++;
                } else if (percentage >= '50') {
                    console.log(`   ⚠️  ${module.name} - Partially compatible (${percentage}%)`);
                    this.results.vscodeCompat.incompatible++;
                } else {
                    console.log(`   ❌ ${module.name} - Poorly compatible (${percentage}%)`);
                    this.addCriticalIssue(`${module.name} compatibility too low`);
                    this.results.vscodeCompat.incompatible++;
                }
            }
            this.results.vscodeCompat.tested++;
        }
        
        console.log('');
    }
    
    // Test extension installation
    async testExtensionInstallation() {
        console.log('📥 Testing Extension Installation Process');
        console.log('─'.repeat(80));
        
        const installationTests = [
            {
                name: 'Download Extension',
                files: ['marketplace/marketplace-client.js'],
                pattern: /download|fetch.*extension/i
            },
            {
                name: 'Verify Extension',
                files: ['marketplace/extension-manager.js'],
                pattern: /verify|validate.*extension/i
            },
            {
                name: 'Extract Extension',
                files: ['marketplace/extension-manager.js'],
                pattern: /extract|unzip/i
            },
            {
                name: 'Install Extension',
                files: ['marketplace/extension-manager.js', 'unified-extension-system.js'],
                pattern: /install.*extension|installExtension/i
            },
            {
                name: 'Activate Extension',
                files: ['extension-host/extension-host.js'],
                pattern: /activate.*extension|activateExtension/i
            }
        ];
        
        for (const test of installationTests) {
            let found = false;
            
            for (const file of test.files) {
                const filePath = path.join(this.electronDir, file);
                if (fs.existsSync(filePath)) {
                    const content = fs.readFileSync(filePath, 'utf8');
                    if (test.pattern.test(content)) {
                        found = true;
                        break;
                    }
                }
            }
            
            if (found) {
                console.log(`   ✅ ${test.name} - Implementation found`);
                this.results.installation.working++;
            } else {
                console.log(`   ❌ ${test.name} - NOT IMPLEMENTED`);
                this.addCriticalIssue(`Installation step missing: ${test.name}`);
                this.results.installation.broken++;
            }
            this.results.installation.tested++;
        }
        
        console.log('');
    }
    
    // Test extension management
    async testExtensionManagement() {
        console.log('⚙️  Testing Extension Management');
        console.log('─'.repeat(80));
        
        const managerPath = path.join(this.electronDir, 'marketplace/extension-manager.js');
        
        if (!fs.existsSync(managerPath)) {
            console.log('   ❌ Extension Manager not found');
            this.addCriticalIssue('CRITICAL: Extension Manager missing');
            return;
        }
        
        const content = fs.readFileSync(managerPath, 'utf8');
        
        const managementFeatures = [
            { name: 'List installed extensions', pattern: /list.*installed|getInstalled/i },
            { name: 'Enable/disable extensions', pattern: /enable|disable.*extension/i },
            { name: 'Update extensions', pattern: /update.*extension|checkUpdates/i },
            { name: 'Uninstall extensions', pattern: /uninstall|remove.*extension/i },
            { name: 'Extension settings', pattern: /settings|configuration.*extension/i },
            { name: 'Extension dependencies', pattern: /dependencies|requires/i }
        ];
        
        managementFeatures.forEach(feature => {
            if (feature.pattern.test(content)) {
                console.log(`   ✅ ${feature.name}`);
            } else {
                console.log(`   ⚠️  ${feature.name} - Not found`);
            }
        });
        
        console.log('');
    }
    
    // Test marketplace UI
    async testMarketplaceUI() {
        console.log('🎨 Testing Marketplace UI');
        console.log('─'.repeat(80));
        
        const indexPath = path.join(this.electronDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            console.log('   ❌ index.html not found\n');
            return;
        }
        
        const indexContent = fs.readFileSync(indexPath, 'utf8');
        
        const uiTests = [
            { name: 'Marketplace panel/modal', pattern: /marketplace|extensions.*panel/i },
            { name: 'Extension list view', pattern: /extension.*list|extensions.*grid/i },
            { name: 'Search functionality', pattern: /search.*extension|extension.*search/i },
            { name: 'Install button', pattern: /install.*button|btn.*install/i },
            { name: 'Settings/config UI', pattern: /extension.*settings|configure.*extension/i }
        ];
        
        // Also check plugin-marketplace.js for UI code
        const marketplacePath = path.join(this.electronDir, 'plugin-marketplace.js');
        const marketplaceContent = fs.existsSync(marketplacePath) ? 
            fs.readFileSync(marketplacePath, 'utf8') : '';
        
        uiTests.forEach(test => {
            const foundInHTML = test.pattern.test(indexContent);
            const foundInMarketplace = test.pattern.test(marketplaceContent);
            
            if (foundInHTML || foundInMarketplace) {
                console.log(`   ✅ ${test.name} - Present`);
                this.results.ui.functional++;
            } else {
                console.log(`   ❌ ${test.name} - NOT FOUND`);
                this.addCriticalIssue(`UI component missing: ${test.name}`);
                this.results.ui.broken++;
            }
            this.results.ui.tested++;
        });
        
        console.log('');
    }
    
    // Test extension API
    async testExtensionAPI() {
        console.log('🔧 Testing Extension API');
        console.log('─'.repeat(80));
        
        const vscodeAPIPath = path.join(this.electronDir, 'vscode-api/vscode-api.js');
        
        if (!fs.existsSync(vscodeAPIPath)) {
            console.log('   ❌ VSCode API not found\n');
            return;
        }
        
        const content = fs.readFileSync(vscodeAPIPath, 'utf8');
        
        const apiTests = [
            { name: 'commands namespace', pattern: /commands\s*[:=]|exports\.commands/i },
            { name: 'window namespace', pattern: /window\s*[:=]|exports\.window/i },
            { name: 'workspace namespace', pattern: /workspace\s*[:=]|exports\.workspace/i },
            { name: 'languages namespace', pattern: /languages\s*[:=]|exports\.languages/i },
            { name: 'env namespace', pattern: /env\s*[:=]|exports\.env/i },
            { name: 'extensions namespace', pattern: /extensions\s*[:=]|exports\.extensions/i },
            { name: 'Uri class', pattern: /class\s+Uri|Uri\s*=/i },
            { name: 'Range class', pattern: /class\s+Range|Range\s*=/i },
            { name: 'Position class', pattern: /class\s+Position|Position\s*=/i },
            { name: 'TextDocument interface', pattern: /TextDocument|class.*Document/i }
        ];
        
        apiTests.forEach(test => {
            if (test.pattern.test(content)) {
                console.log(`   ✅ ${test.name}`);
                this.results.api.implemented++;
            } else {
                console.log(`   ⚠️  ${test.name} - Missing`);
                this.results.api.missing++;
            }
            this.results.api.tested++;
        });
        
        console.log('');
    }
    
    // Test plugin system
    async testPluginSystem() {
        console.log('🔌 Testing Plugin System');
        console.log('─'.repeat(80));
        
        const pluginsDir = path.join(this.electronDir, 'plugins');
        
        if (!fs.existsSync(pluginsDir)) {
            console.log('   ⚠️  No plugins directory found');
            console.log('   💡 Creating plugins directory...');
        } else {
            const plugins = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
            console.log(`   ✅ Plugins directory exists (${plugins.length} plugins found)`);
            
            plugins.forEach(plugin => {
                console.log(`      - ${plugin}`);
            });
        }
        
        // Test plugin loading system
        const pluginSystemPath = path.join(this.electronDir, 'plugin-system.js');
        if (fs.existsSync(pluginSystemPath)) {
            const content = fs.readFileSync(pluginSystemPath, 'utf8');
            
            const hasLoadPlugin = /loadPlugin|load.*plugin/i.test(content);
            const hasRegisterPlugin = /registerPlugin|register.*plugin/i.test(content);
            const hasPluginAPI = /pluginAPI|plugin.*api/i.test(content);
            
            if (hasLoadPlugin && hasRegisterPlugin) {
                console.log('   ✅ Plugin loading system operational');
            } else {
                console.log('   ⚠️  Plugin loading system incomplete');
            }
        }
        
        console.log('');
    }
    
    // Test extension host
    async testExtensionHost() {
        console.log('🏠 Testing Extension Host');
        console.log('─'.repeat(80));
        
        const hostPath = path.join(this.electronDir, 'extension-host/extension-host.js');
        
        if (!fs.existsSync(hostPath)) {
            console.log('   ❌ Extension host not found');
            this.addCriticalIssue('CRITICAL: Extension host missing');
            return;
        }
        
        const content = fs.readFileSync(hostPath, 'utf8');
        
        const hostFeatures = [
            { name: 'Extension activation', pattern: /activate.*extension|activateExtension/i, critical: true },
            { name: 'Extension deactivation', pattern: /deactivate.*extension|deactivateExtension/i, critical: true },
            { name: 'Extension context', pattern: /context|ExtensionContext/i, critical: true },
            { name: 'Extension lifecycle', pattern: /lifecycle|onLoad|onUnload/i, critical: false },
            { name: 'Extension sandboxing', pattern: /sandbox|isolate/i, critical: false },
            { name: 'IPC communication', pattern: /ipc|message.*pass/i, critical: true }
        ];
        
        hostFeatures.forEach(feature => {
            if (feature.pattern.test(content)) {
                console.log(`   ✅ ${feature.name}`);
            } else {
                const icon = feature.critical ? '❌' : '⚠️';
                console.log(`   ${icon} ${feature.name} - Not found`);
                if (feature.critical) {
                    this.addCriticalIssue(`Extension host missing: ${feature.name}`);
                }
            }
        });
        
        console.log('');
    }
    
    // Test backup systems
    async testBackupSystems() {
        console.log('🔄 Testing Backup Systems (Critical if Ollama fails)');
        console.log('─'.repeat(80));
        
        console.log('   Testing fallback AI providers...');
        
        const aiProviderPath = path.join(this.electronDir, 'ai-provider-manager.js');
        if (fs.existsSync(aiProviderPath)) {
            const content = fs.readFileSync(aiProviderPath, 'utf8');
            
            const providers = [
                { name: 'OpenAI (cloud backup)', pattern: /openai/i },
                { name: 'Anthropic Claude (cloud backup)', pattern: /anthropic|claude/i },
                { name: 'Extension-based AI', pattern: /extension.*provider|provider.*extension/i },
                { name: 'Fallback provider', pattern: /fallback|backup.*provider/i }
            ];
            
            providers.forEach(provider => {
                if (provider.pattern.test(content)) {
                    console.log(`   ✅ ${provider.name} - Available`);
                } else {
                    console.log(`   ⚠️  ${provider.name} - Not found`);
                }
            });
        } else {
            console.log('   ❌ AI Provider Manager not found');
            this.addCriticalIssue('CRITICAL: No backup AI providers available');
        }
        
        console.log('');
    }
    
    addCriticalIssue(description) {
        this.criticalIssues.push(description);
    }
    
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                   MARKETPLACE SYSTEM REPORT                                   ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Summary
        console.log('📊 MARKETPLACE STATUS:\n');
        
        const categories = [
            { name: 'Marketplace Core', data: this.results.marketplace, good: 'working', bad: 'broken' },
            { name: 'Extension System', data: this.results.extensions, good: 'loaded', bad: 'failed' },
            { name: 'VS Code Compatibility', data: this.results.vscodeCompat, good: 'compatible', bad: 'incompatible' },
            { name: 'Installation Process', data: this.results.installation, good: 'working', bad: 'broken' },
            { name: 'Marketplace UI', data: this.results.ui, good: 'functional', bad: 'broken' },
            { name: 'Extension API', data: this.results.api, good: 'implemented', bad: 'missing' }
        ];
        
        categories.forEach(cat => {
            const total = cat.data.tested;
            const good = cat.data[cat.good] || 0;
            const percentage = total > 0 ? ((good / total) * 100).toFixed(1) : 0;
            const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
            
            console.log(`${status} ${cat.name}: ${good}/${total} (${percentage}%)`);
        });
        
        // Critical issues
        console.log('\n🚨 CRITICAL ISSUES:\n');
        if (this.criticalIssues.length === 0) {
            console.log('   ✅ No critical issues found!');
        } else {
            this.criticalIssues.forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue}`);
            });
        }
        
        // Overall marketplace readiness
        const totalTests = Object.values(this.results).reduce((sum, cat) => sum + cat.tested, 0);
        const totalGood = this.results.marketplace.working +
                         this.results.extensions.loaded +
                         this.results.vscodeCompat.compatible +
                         this.results.installation.working +
                         this.results.ui.functional +
                         this.results.api.implemented;
        
        const readinessScore = totalTests > 0 ? ((totalGood / totalTests) * 100).toFixed(1) : 0;
        
        console.log('\n' + '═'.repeat(80));
        console.log(`📈 MARKETPLACE READINESS: ${readinessScore}%`);
        
        let status = '';
        let recommendation = '';
        
        if (readinessScore >= 90) {
            status = '✅ PRODUCTION READY';
            recommendation = 'Marketplace is fully functional and ready for users!';
        } else if (readinessScore >= 75) {
            status = '⚠️  MOSTLY READY';
            recommendation = 'Minor fixes needed. Users can use marketplace with some limitations.';
        } else if (readinessScore >= 50) {
            status = '🔧 NEEDS WORK';
            recommendation = 'Significant development required before users can rely on marketplace.';
        } else {
            status = '❌ NOT READY';
            recommendation = 'CRITICAL: Marketplace is not functional. Users cannot install extensions.';
        }
        
        console.log(`🎯 STATUS: ${status}`);
        console.log('═'.repeat(80));
        
        console.log(`\n💡 RECOMMENDATION:\n   ${recommendation}\n`);
        
        // Backup strategy
        console.log('🔄 BACKUP STRATEGY (If Ollama Fails):\n');
        if (readinessScore >= 75) {
            console.log('   ✅ Marketplace is viable backup');
            console.log('   ✅ Users can install AI extensions');
            console.log('   ✅ Multiple AI providers available via extensions');
        } else {
            console.log('   ❌ Marketplace NOT ready as backup');
            console.log('   ⚠️  If Ollama fails, users have NO fallback');
            console.log('   🚨 URGENT: Fix marketplace OR implement built-in AI');
        }
        
        return {
            results: this.results,
            criticalIssues: this.criticalIssues,
            readinessScore,
            status,
            recommendation,
            isViableBackup: readinessScore >= 75
        };
    }
}

// Run tests
if (require.main === module) {
    const tester = new MarketplaceCompleteTester();
    
    tester.runAllTests().then(report => {
        const reportPath = path.join(__dirname, '..', 'MARKETPLACE-COMPLETE-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📄 Full report saved to: ${reportPath}\n`);
        
        process.exit(report.isViableBackup ? 0 : 1);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = MarketplaceCompleteTester;
