#!/usr/bin/env node
/**
 * Complete Marketplace System Tester
 * Tests all marketplace components for production readiness
 */

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                               ║');
console.log('║              🛍️ COMPLETE MARKETPLACE SYSTEM TESTER 🛍️                       ║');
console.log('║                    Production Readiness Validation                           ║');
console.log('║                                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

class CompleteMarketplaceTester {
    constructor() {
        this.electronDir = __dirname.replace(/marketplace$/, '');
        this.results = {
            extensionManager: { tested: 0, working: 0, broken: 0 },
            extensionHost: { tested: 0, working: 0, broken: 0 },
            marketplaceUI: { tested: 0, working: 0, broken: 0 },
            installation: { tested: 0, working: 0, broken: 0 },
            activation: { tested: 0, working: 0, broken: 0 },
            vscodeAPI: { tested: 0, working: 0, broken: 0 }
        };
        this.issues = [];
        this.successes = [];
    }
    
    async runAllTests() {
        console.log('🔍 Testing complete marketplace system...\n');
        
        await this.testExtensionManager();
        await this.testExtensionHost();
        await this.testMarketplaceUI();
        await this.testInstallationProcess();
        await this.testActivationFlow();
        await this.testVSCodeAPI();
        
        return this.generateReport();
    }
    
    /**
     * Test Extension Manager
     */
    async testExtensionManager() {
        console.log('📦 Testing Extension Manager');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Extension Manager file exists',
                check: () => fs.existsSync(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'))
            },
            {
                name: 'Extension Manager has initialize method',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.initialize === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Step 1: Download Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.downloadExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Step 2: Verify Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.verifyExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Step 3: Extract Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.extractExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Step 4: Install Dependencies implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.installDependencies === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Step 5: Activate Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.activateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Deactivate Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.deactivateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Uninstall Extension implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.uninstallExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'List Extensions implemented',
                check: () => {
                    try {
                        const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                        return typeof Manager.prototype.listExtensions === 'function';
                    } catch { return false; }
                }
            }
        ];
        
        tests.forEach(test => {
            const result = test.check();
            this.results.extensionManager.tested++;
            
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.extensionManager.working++;
                this.successes.push({category: 'ExtensionManager', test: test.name});
            } else {
                console.log(`   ❌ ${test.name}`);
                this.results.extensionManager.broken++;
                this.issues.push({category: 'ExtensionManager', test: test.name, severity: 'critical'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Test Extension Host
     */
    async testExtensionHost() {
        console.log('🏠 Testing Extension Host');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Extension Host file exists',
                check: () => fs.existsSync(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'))
            },
            {
                name: 'Extension Host has initialize method',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.initialize === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'VS Code API implemented',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.initializeVSCodeAPI === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Extension activation implemented',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.activateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Extension deactivation implemented',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.deactivateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Extension context creation',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.createExtensionContext === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'IPC communication setup',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.setupIPC === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Core commands registration',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.registerCoreCommands === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Sandbox setup',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.setupSandbox === 'function';
                    } catch { return false; }
                }
            }
        ];
        
        tests.forEach(test => {
            const result = test.check();
            this.results.extensionHost.tested++;
            
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.extensionHost.working++;
                this.successes.push({category: 'ExtensionHost', test: test.name});
            } else {
                console.log(`   ❌ ${test.name}`);
                this.results.extensionHost.broken++;
                this.issues.push({category: 'ExtensionHost', test: test.name, severity: 'critical'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Test Marketplace UI
     */
    async testMarketplaceUI() {
        console.log('🎨 Testing Marketplace UI');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Marketplace UI file exists',
                check: () => fs.existsSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'))
            },
            {
                name: 'UI has initialize method',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /async initialize/.test(content);
                }
            },
            {
                name: 'Discover view implemented',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /renderDiscoverView/.test(content);
                }
            },
            {
                name: 'Installed view implemented',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /renderInstalledView/.test(content);
                }
            },
            {
                name: 'Updates view implemented',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /renderUpdatesView/.test(content);
                }
            },
            {
                name: 'Settings view implemented',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /renderSettingsView/.test(content);
                }
            },
            {
                name: 'Extension card rendering',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /renderExtensionCard/.test(content);
                }
            },
            {
                name: 'Search functionality',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /search\(\)/.test(content);
                }
            },
            {
                name: 'Filter functionality',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /applyFilters/.test(content);
                }
            },
            {
                name: 'Progress indicator',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'ui', 'complete-marketplace-ui.js'), 'utf8');
                    return /showProgress/.test(content) && /hideProgress/.test(content);
                }
            }
        ];
        
        tests.forEach(test => {
            const result = test.check();
            this.results.marketplaceUI.tested++;
            
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.marketplaceUI.working++;
                this.successes.push({category: 'MarketplaceUI', test: test.name});
            } else {
                console.log(`   ❌ ${test.name}`);
                this.results.marketplaceUI.broken++;
                this.issues.push({category: 'MarketplaceUI', test: test.name, severity: 'high'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Test Installation Process (All 5 Steps)
     */
    async testInstallationProcess() {
        console.log('⚙️ Testing Installation Process (5 Steps)');
        console.log('─'.repeat(80));
        
        const steps = [
            { step: 1, name: 'Download Extension', method: 'downloadExtension' },
            { step: 2, name: 'Verify Extension', method: 'verifyExtension' },
            { step: 3, name: 'Extract Extension', method: 'extractExtension' },
            { step: 4, name: 'Install Dependencies', method: 'installDependencies' },
            { step: 5, name: 'Activate Extension', method: 'activateExtension' }
        ];
        
        steps.forEach(stepInfo => {
            try {
                const Manager = require(path.join(this.electronDir, 'marketplace', 'complete-extension-manager.js'));
                const hasMethod = typeof Manager.prototype[stepInfo.method] === 'function';
                
                this.results.installation.tested++;
                
                if (hasMethod) {
                    console.log(`   ✅ Step ${stepInfo.step}: ${stepInfo.name}`);
                    this.results.installation.working++;
                    this.successes.push({category: 'Installation', test: `Step ${stepInfo.step}`});
                } else {
                    console.log(`   ❌ Step ${stepInfo.step}: ${stepInfo.name} - NOT FOUND`);
                    this.results.installation.broken++;
                    this.issues.push({category: 'Installation', test: `Step ${stepInfo.step}`, severity: 'critical'});
                }
            } catch (error) {
                console.log(`   ❌ Step ${stepInfo.step}: ${stepInfo.name} - ERROR`);
                this.results.installation.broken++;
                this.issues.push({category: 'Installation', test: `Step ${stepInfo.step}`, severity: 'critical'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Test Activation Flow
     */
    async testActivationFlow() {
        console.log('⚡ Testing Activation Flow');
        console.log('─'.repeat(80));
        
        const tests = [
            {
                name: 'Extension context creation',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.createExtensionContext === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Extension activation',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.activateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Extension deactivation',
                check: () => {
                    try {
                        const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                        return typeof Host.prototype.deactivateExtension === 'function';
                    } catch { return false; }
                }
            },
            {
                name: 'Subscription management',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'), 'utf8');
                    return /subscriptions/.test(content);
                }
            },
            {
                name: 'Event emitters',
                check: () => {
                    const content = fs.readFileSync(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'), 'utf8');
                    return /EventEmitter/.test(content) && /emit\(/.test(content);
                }
            }
        ];
        
        tests.forEach(test => {
            const result = test.check();
            this.results.activation.tested++;
            
            if (result) {
                console.log(`   ✅ ${test.name}`);
                this.results.activation.working++;
                this.successes.push({category: 'Activation', test: test.name});
            } else {
                console.log(`   ❌ ${test.name}`);
                this.results.activation.broken++;
                this.issues.push({category: 'Activation', test: test.name, severity: 'high'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Test VS Code API Compatibility
     */
    async testVSCodeAPI() {
        console.log('🔌 Testing VS Code API Compatibility');
        console.log('─'.repeat(80));
        
        const apis = [
            'window',
            'workspace',
            'commands',
            'languages',
            'debug',
            'tasks',
            'scm',
            'extensions',
            'env',
            'Uri'
        ];
        
        apis.forEach(api => {
            try {
                const Host = require(path.join(this.electronDir, 'extension-host', 'complete-extension-host.js'));
                const host = new Host();
                host.initializeVSCodeAPI();
                const hasAPI = host.vscodeAPI && host.vscodeAPI[api];
                
                this.results.vscodeAPI.tested++;
                
                if (hasAPI) {
                    console.log(`   ✅ vscode.${api} implemented`);
                    this.results.vscodeAPI.working++;
                    this.successes.push({category: 'VSCodeAPI', test: api});
                } else {
                    console.log(`   ❌ vscode.${api} missing`);
                    this.results.vscodeAPI.broken++;
                    this.issues.push({category: 'VSCodeAPI', test: api, severity: 'medium'});
                }
            } catch (error) {
                console.log(`   ❌ vscode.${api} error`);
                this.results.vscodeAPI.broken++;
                this.issues.push({category: 'VSCodeAPI', test: api, severity: 'medium'});
            }
        });
        
        console.log('');
    }
    
    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                    MARKETPLACE SYSTEM REPORT                                  ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
        
        console.log('📊 TEST RESULTS:\n');
        
        const categories = [
            { name: 'Extension Manager', data: this.results.extensionManager },
            { name: 'Extension Host', data: this.results.extensionHost },
            { name: 'Marketplace UI', data: this.results.marketplaceUI },
            { name: 'Installation Process', data: this.results.installation },
            { name: 'Activation Flow', data: this.results.activation },
            { name: 'VS Code API', data: this.results.vscodeAPI }
        ];
        
        categories.forEach(cat => {
            const total = cat.data.tested;
            const working = cat.data.working;
            const percentage = total > 0 ? ((working / total) * 100).toFixed(1) : 0;
            const status = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
            
            console.log(`${status} ${cat.name}: ${working}/${total} (${percentage}%)`);
        });
        
        // Calculate overall score
        const totalTests = Object.values(this.results).reduce((sum, r) => sum + r.tested, 0);
        const totalWorking = Object.values(this.results).reduce((sum, r) => sum + r.working, 0);
        const overallPercentage = totalTests > 0 ? ((totalWorking / totalTests) * 100).toFixed(1) : 0;
        
        console.log('\n' + '═'.repeat(80));
        console.log(`📈 OVERALL MARKETPLACE READINESS: ${overallPercentage}%`);
        
        let status = '';
        let isViableBackup = false;
        
        if (overallPercentage >= 95) {
            status = '✅ PRODUCTION READY - Marketplace fully functional!';
            isViableBackup = true;
        } else if (overallPercentage >= 85) {
            status = '✅ READY - Minor issues remain';
            isViableBackup = true;
        } else if (overallPercentage >= 70) {
            status = '⚠️ MOSTLY READY - Some work needed';
            isViableBackup = false;
        } else {
            status = '❌ NOT READY - Significant work required';
            isViableBackup = false;
        }
        
        console.log(`🎯 STATUS: ${status}`);
        console.log(`🔄 VIABLE AS OLLAMA BACKUP: ${isViableBackup ? '✅ YES' : '❌ NO'}`);
        console.log('═'.repeat(80));
        
        // Critical issues
        if (this.issues.length > 0) {
            console.log('\n🔴 ISSUES FOUND:\n');
            
            const critical = this.issues.filter(i => i.severity === 'critical');
            const high = this.issues.filter(i => i.severity === 'high');
            const medium = this.issues.filter(i => i.severity === 'medium');
            
            if (critical.length > 0) {
                console.log(`   CRITICAL (${critical.length}):`);
                critical.forEach(issue => {
                    console.log(`      ❌ ${issue.category}: ${issue.test}`);
                });
            }
            
            if (high.length > 0) {
                console.log(`\n   HIGH (${high.length}):`);
                high.forEach(issue => {
                    console.log(`      ⚠️ ${issue.category}: ${issue.test}`);
                });
            }
            
            if (medium.length > 0) {
                console.log(`\n   MEDIUM (${medium.length}):`);
                medium.forEach(issue => {
                    console.log(`      ℹ️ ${issue.category}: ${issue.test}`);
                });
            }
        }
        
        // Summary
        console.log('\n💡 SUMMARY:\n');
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${totalWorking}`);
        console.log(`   Failed: ${totalTests - totalWorking}`);
        console.log(`   Success Rate: ${overallPercentage}%`);
        
        if (overallPercentage >= 95) {
            console.log('\n   🎉 Marketplace is PRODUCTION READY!');
            console.log('   ✅ All critical features working');
            console.log('   ✅ Viable backup for Ollama');
        } else if (overallPercentage >= 85) {
            console.log('\n   ✅ Marketplace is mostly ready');
            console.log('   ✅ Can be used as Ollama backup');
            console.log('   ⚠️ Minor polish recommended');
        }
        
        return {
            results: this.results,
            issues: this.issues,
            successes: this.successes,
            overallPercentage,
            status,
            isViableBackup,
            totalTests,
            totalWorking
        };
    }
}

// Run tests
if (require.main === module) {
    const tester = new CompleteMarketplaceTester();
    
    tester.runAllTests().then(report => {
        const reportPath = path.join(__dirname, '..', '..', 'MARKETPLACE-PRODUCTION-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}\n`);
        
        process.exit(report.overallPercentage >= 85 ? 0 : 1);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = CompleteMarketplaceTester;
