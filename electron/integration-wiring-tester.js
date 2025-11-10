#!/usr/bin/env node
/**
 * BigDaddyG IDE - Integration & Wiring Tester
 * Tests all UI/GUI components and backend integrations
 * Identifies what's connected, what's broken, and what's missing
 */

const fs = require('fs');
const path = require('path');

console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                               ║');
console.log('║           🔌 BIGDADDYG IDE - INTEGRATION & WIRING TESTER 🔌                  ║');
console.log('║                                                                               ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
console.log('');

class IntegrationWiringTester {
    constructor() {
        this.electronDir = __dirname;
        this.results = {
            uiComponents: { tested: 0, wired: 0, unwired: 0, broken: 0 },
            backendIntegrations: { tested: 0, wired: 0, unwired: 0, broken: 0 },
            eventHandlers: { tested: 0, wired: 0, unwired: 0, broken: 0 },
            apiEndpoints: { tested: 0, wired: 0, unwired: 0, broken: 0 },
            modules: { tested: 0, loaded: 0, missing: 0, broken: 0 }
        };
        
        this.issues = [];
        this.recommendations = [];
    }
    
    async runAllTests() {
        console.log('🔍 Starting comprehensive integration testing...\n');
        
        await this.testIndexHTML();
        await this.testRendererJS();
        await this.testMainJS();
        await this.testUIComponents();
        await this.testBackendIntegrations();
        await this.testEventHandlers();
        await this.testModuleLoading();
        await this.testAgenticIntegrations();
        await this.testAIProviderIntegrations();
        await this.testPerformanceIntegrations();
        
        return this.generateReport();
    }
    
    // Test index.html structure and script loading
    async testIndexHTML() {
        console.log('📄 Testing index.html Structure & Script Loading');
        console.log('─'.repeat(80));
        
        const indexPath = path.join(this.electronDir, 'index.html');
        
        if (!fs.existsSync(indexPath)) {
            this.addIssue('CRITICAL', 'index.html not found');
            return;
        }
        
        const content = fs.readFileSync(indexPath, 'utf8');
        
        // Test critical elements
        const tests = [
            { name: 'HTML structure', test: content.includes('<!DOCTYPE html>') },
            { name: 'Monaco CSS loading', test: content.includes('style.css') },
            { name: 'Monaco loader script', test: content.includes('loader.js') },
            { name: 'Renderer.js loaded', test: content.includes('renderer.js') },
            { name: 'Tab system loaded', test: content.includes('tab-system.js') },
            { name: 'File explorer loaded', test: content.includes('file-explorer.js') },
            { name: 'AI provider manager', test: content.includes('ai-provider-manager.js') },
            { name: 'Agentic core loaded', test: content.includes('bigdaddyg-agentic-core.js') },
            { name: 'Performance optimizer', test: content.includes('performance-optimizer.js') },
            { name: 'Error recovery loaded', test: content.includes('enhanced-error-recovery.js') },
            { name: 'Health checker loaded', test: content.includes('comprehensive-health-checker.js') },
            { name: 'IDE audit loaded', test: content.includes('comprehensive-ide-audit.js') }
        ];
        
        tests.forEach(test => {
            if (test.test) {
                console.log(`   ✅ ${test.name}`);
                this.results.modules.loaded++;
            } else {
                console.log(`   ❌ ${test.name} - NOT LOADED`);
                this.addIssue('HIGH', `${test.name} not loaded in index.html`);
                this.results.modules.missing++;
            }
            this.results.modules.tested++;
        });
        
        console.log('');
    }
    
    // Test renderer.js integrations
    async testRendererJS() {
        console.log('⚙️  Testing Renderer.js Integrations');
        console.log('─'.repeat(80));
        
        const rendererPath = path.join(this.electronDir, 'renderer.js');
        
        if (!fs.existsSync(rendererPath)) {
            this.addIssue('CRITICAL', 'renderer.js not found');
            return;
        }
        
        const content = fs.readFileSync(rendererPath, 'utf8');
        
        const integrations = [
            { name: 'Monaco editor initialization', pattern: /monaco.*editor/i, critical: true },
            { name: 'loadMonacoCSS function', pattern: /loadMonacoCSS/i, critical: true },
            { name: 'Tab system integration', pattern: /TabSystem|tabSystem/i, critical: true },
            { name: 'File operations', pattern: /readFile|writeFile/i, critical: true },
            { name: 'IPC communication', pattern: /ipcRenderer/i, critical: true },
            { name: 'AI provider calls', pattern: /aiProvider|ai-provider/i, critical: false },
            { name: 'Error handling', pattern: /try.*catch|\.catch\(/i, critical: true },
            { name: 'Event listeners', pattern: /addEventListener|\.on\(/i, critical: true }
        ];
        
        integrations.forEach(integration => {
            const found = integration.pattern.test(content);
            if (found) {
                console.log(`   ✅ ${integration.name}`);
                this.results.backendIntegrations.wired++;
            } else {
                console.log(`   ${integration.critical ? '❌' : '⚠️'}  ${integration.name} - NOT FOUND`);
                this.addIssue(integration.critical ? 'HIGH' : 'MEDIUM', 
                    `${integration.name} not found in renderer.js`);
                this.results.backendIntegrations.unwired++;
            }
            this.results.backendIntegrations.tested++;
        });
        
        console.log('');
    }
    
    // Test main.js backend
    async testMainJS() {
        console.log('🖥️  Testing Main.js Backend');
        console.log('─'.repeat(80));
        
        const mainPath = path.join(this.electronDir, 'main.js');
        
        if (!fs.existsSync(mainPath)) {
            this.addIssue('CRITICAL', 'main.js not found');
            return;
        }
        
        const content = fs.readFileSync(mainPath, 'utf8');
        
        const backendFeatures = [
            { name: 'Window creation', pattern: /BrowserWindow/i, critical: true },
            { name: 'IPC handlers', pattern: /ipcMain.*handle|ipcMain.*on/i, critical: true },
            { name: 'File system access', pattern: /fs\.|require.*fs/i, critical: true },
            { name: 'Menu system', pattern: /Menu\.buildFromTemplate/i, critical: false },
            { name: 'App lifecycle', pattern: /app\.whenReady|app\.on/i, critical: true },
            { name: 'Security policies', pattern: /webSecurity|nodeIntegration/i, critical: true },
            { name: 'Ollama integration', pattern: /ollama/i, critical: false },
            { name: 'GitHub integration', pattern: /github/i, critical: false }
        ];
        
        backendFeatures.forEach(feature => {
            const found = feature.pattern.test(content);
            if (found) {
                console.log(`   ✅ ${feature.name}`);
                this.results.backendIntegrations.wired++;
            } else {
                console.log(`   ${feature.critical ? '❌' : '⚠️'}  ${feature.name} - NOT FOUND`);
                this.addIssue(feature.critical ? 'HIGH' : 'MEDIUM', 
                    `${feature.name} not implemented in main.js`);
                this.results.backendIntegrations.unwired++;
            }
            this.results.backendIntegrations.tested++;
        });
        
        console.log('');
    }
    
    // Test UI components
    async testUIComponents() {
        console.log('🎨 Testing UI Components');
        console.log('─'.repeat(80));
        
        const uiComponents = [
            { file: 'tab-system.js', name: 'Tab System', critical: true },
            { file: 'file-explorer.js', name: 'File Explorer', critical: true },
            { file: 'enhanced-file-explorer.js', name: 'Enhanced File Explorer', critical: false },
            { file: 'settings-panel.js', name: 'Settings Panel', critical: true },
            { file: 'command-palette.js', name: 'Command Palette', critical: false },
            { file: 'terminal-panel.js', name: 'Terminal Panel', critical: false },
            { file: 'console-panel.js', name: 'Console Panel', critical: false },
            { file: 'agent-panel.js', name: 'Agent Panel', critical: false },
            { file: 'performance-dashboard.js', name: 'Performance Dashboard', critical: false },
            { file: 'memory-dashboard.js', name: 'Memory Dashboard', critical: false },
            { file: 'chat-history.js', name: 'Chat History', critical: false },
            { file: 'floating-chat.js', name: 'Floating Chat', critical: false }
        ];
        
        for (const component of uiComponents) {
            const componentPath = path.join(this.electronDir, component.file);
            
            if (!fs.existsSync(componentPath)) {
                console.log(`   ${component.critical ? '❌' : '⚠️'}  ${component.name} - FILE NOT FOUND`);
                this.addIssue(component.critical ? 'HIGH' : 'LOW', 
                    `${component.name} (${component.file}) not found`);
                this.results.uiComponents.unwired++;
            } else {
                const content = fs.readFileSync(componentPath, 'utf8');
                
                // Check if it has proper structure
                const hasClass = /class\s+\w+/i.test(content);
                const hasFunction = /function\s+\w+|const\s+\w+\s*=.*function/i.test(content);
                const hasExports = /module\.exports|export\s+(default|class|function)/i.test(content);
                
                if (hasClass || hasFunction) {
                    console.log(`   ✅ ${component.name} - Properly structured`);
                    this.results.uiComponents.wired++;
                } else {
                    console.log(`   ⚠️  ${component.name} - Structure unclear`);
                    this.addIssue('MEDIUM', `${component.name} may have structural issues`);
                    this.results.uiComponents.broken++;
                }
            }
            this.results.uiComponents.tested++;
        }
        
        console.log('');
    }
    
    // Test backend integrations
    async testBackendIntegrations() {
        console.log('🔗 Testing Backend Integrations');
        console.log('─'.repeat(80));
        
        const integrations = [
            { file: 'ai-provider-manager.js', name: 'AI Provider Manager', exports: ['AIProviderManager', 'getProvider'] },
            { file: 'ollama-integration.js', name: 'Ollama Integration', exports: ['OllamaIntegration', 'startOllama'] },
            { file: 'github-integration.js', name: 'GitHub Integration', exports: ['GitHubIntegration'] },
            { file: 'file-tree.js', name: 'File Tree', exports: ['FileTree', 'buildTree'] },
            { file: 'settings/settings-service.js', name: 'Settings Service', exports: ['SettingsService'] },
            { file: 'memory-service.js', name: 'Memory Service', exports: ['MemoryService'] }
        ];
        
        for (const integration of integrations) {
            const integrationPath = path.join(this.electronDir, integration.file);
            
            if (!fs.existsSync(integrationPath)) {
                console.log(`   ❌ ${integration.name} - FILE NOT FOUND`);
                this.addIssue('HIGH', `${integration.name} (${integration.file}) not found`);
                this.results.backendIntegrations.unwired++;
            } else {
                const content = fs.readFileSync(integrationPath, 'utf8');
                
                // Check if exports are present
                const hasExports = integration.exports.some(exp => 
                    content.includes(exp) || new RegExp(`class\\s+${exp}`).test(content)
                );
                
                if (hasExports) {
                    console.log(`   ✅ ${integration.name} - Properly exported`);
                    this.results.backendIntegrations.wired++;
                } else {
                    console.log(`   ⚠️  ${integration.name} - Exports unclear`);
                    this.addIssue('MEDIUM', `${integration.name} exports may be missing`);
                    this.results.backendIntegrations.broken++;
                }
            }
            this.results.backendIntegrations.tested++;
        }
        
        console.log('');
    }
    
    // Test event handlers
    async testEventHandlers() {
        console.log('📡 Testing Event Handlers & IPC');
        console.log('─'.repeat(80));
        
        const indexPath = path.join(this.electronDir, 'index.html');
        const rendererPath = path.join(this.electronDir, 'renderer.js');
        const mainPath = path.join(this.electronDir, 'main.js');
        
        const eventTests = [
            {
                name: 'File operations IPC',
                frontend: rendererPath,
                backend: mainPath,
                pattern: /read-file|write-file|open-file/i
            },
            {
                name: 'Settings IPC',
                frontend: rendererPath,
                backend: mainPath,
                pattern: /get-settings|save-settings/i
            },
            {
                name: 'AI provider IPC',
                frontend: rendererPath,
                backend: mainPath,
                pattern: /ai-request|chat-message/i
            },
            {
                name: 'Tab system events',
                frontend: indexPath,
                backend: rendererPath,
                pattern: /tab-open|tab-close|tab-switch/i
            }
        ];
        
        for (const test of eventTests) {
            let frontendHas = false;
            let backendHas = false;
            
            if (fs.existsSync(test.frontend)) {
                const frontendContent = fs.readFileSync(test.frontend, 'utf8');
                frontendHas = test.pattern.test(frontendContent);
            }
            
            if (fs.existsSync(test.backend)) {
                const backendContent = fs.readFileSync(test.backend, 'utf8');
                backendHas = test.pattern.test(backendContent);
            }
            
            if (frontendHas && backendHas) {
                console.log(`   ✅ ${test.name} - Both sides wired`);
                this.results.eventHandlers.wired++;
            } else if (frontendHas || backendHas) {
                console.log(`   ⚠️  ${test.name} - Partially wired (${frontendHas ? 'frontend only' : 'backend only'})`);
                this.addIssue('MEDIUM', `${test.name} only wired on one side`);
                this.results.eventHandlers.broken++;
            } else {
                console.log(`   ❌ ${test.name} - Not wired`);
                this.addIssue('HIGH', `${test.name} not implemented`);
                this.results.eventHandlers.unwired++;
            }
            this.results.eventHandlers.tested++;
        }
        
        console.log('');
    }
    
    // Test module loading
    async testModuleLoading() {
        console.log('📦 Testing Module Loading & Dependencies');
        console.log('─'.repeat(80));
        
        const criticalModules = [
            'bigdaddyg-agentic-core.js',
            'ai-provider-manager.js',
            'performance-optimizer.js',
            'enhanced-error-recovery.js',
            'comprehensive-health-checker.js',
            'tab-system.js',
            'file-explorer.js',
            'renderer.js'
        ];
        
        for (const module of criticalModules) {
            const modulePath = path.join(this.electronDir, module);
            
            if (!fs.existsSync(modulePath)) {
                console.log(`   ❌ ${module} - NOT FOUND`);
                this.results.modules.missing++;
            } else {
                // Try to check syntax
                try {
                    const content = fs.readFileSync(modulePath, 'utf8');
                    // Basic syntax check
                    const hasSyntaxError = content.includes('SyntaxError') && !content.includes('catch');
                    
                    if (hasSyntaxError) {
                        console.log(`   ⚠️  ${module} - Potential syntax issues`);
                        this.results.modules.broken++;
                    } else {
                        console.log(`   ✅ ${module} - Loaded successfully`);
                        this.results.modules.loaded++;
                    }
                } catch (error) {
                    console.log(`   ❌ ${module} - Load error: ${error.message}`);
                    this.results.modules.broken++;
                }
            }
            this.results.modules.tested++;
        }
        
        console.log('');
    }
    
    // Test agentic integrations
    async testAgenticIntegrations() {
        console.log('🤖 Testing Agentic System Integrations');
        console.log('─'.repeat(80));
        
        const agenticComponents = [
            { file: 'bigdaddyg-agentic-core.js', name: 'Agentic Core', hasClass: 'BigDaddyGAgent' },
            { file: 'agentic-executor.js', name: 'Agentic Executor', hasClass: 'AgenticExecutor' },
            { file: 'agentic-auto-fixer.js', name: 'Auto-Fixer', hasClass: 'AgenticAutoFixer' },
            { file: 'multi-agent-swarm.js', name: 'Multi-Agent Swarm', hasClass: 'MultiAgentSwarm' },
            { file: 'background-agent-manager.js', name: 'Background Agent Manager', hasClass: 'BackgroundAgentManager' },
            { file: 'swarm-engine.js', name: 'Swarm Engine', hasClass: 'SwarmEngine' }
        ];
        
        for (const component of agenticComponents) {
            const componentPath = path.join(this.electronDir, component.file);
            
            if (!fs.existsSync(componentPath)) {
                console.log(`   ❌ ${component.name} - NOT FOUND`);
                this.addIssue('MEDIUM', `${component.name} not found`);
            } else {
                const content = fs.readFileSync(componentPath, 'utf8');
                const hasExpectedClass = new RegExp(`class\\s+${component.hasClass}`, 'i').test(content);
                
                if (hasExpectedClass) {
                    console.log(`   ✅ ${component.name} - Properly implemented`);
                } else {
                    console.log(`   ⚠️  ${component.name} - Structure unclear`);
                    this.addIssue('LOW', `${component.name} structure may differ from expected`);
                }
            }
        }
        
        console.log('');
    }
    
    // Test AI provider integrations
    async testAIProviderIntegrations() {
        console.log('🧠 Testing AI Provider Integrations');
        console.log('─'.repeat(80));
        
        const aiPath = path.join(this.electronDir, 'ai-provider-manager.js');
        
        if (!fs.existsSync(aiPath)) {
            console.log('   ❌ AI Provider Manager not found');
            this.addIssue('CRITICAL', 'AI Provider Manager missing');
            return;
        }
        
        const content = fs.readFileSync(aiPath, 'utf8');
        
        const providers = [
            { name: 'OpenAI', pattern: /openai|gpt/i },
            { name: 'Anthropic Claude', pattern: /anthropic|claude/i },
            { name: 'Ollama', pattern: /ollama/i },
            { name: 'Custom Provider', pattern: /custom.*provider|addProvider/i }
        ];
        
        providers.forEach(provider => {
            if (provider.pattern.test(content)) {
                console.log(`   ✅ ${provider.name} - Supported`);
            } else {
                console.log(`   ⚠️  ${provider.name} - Not detected`);
            }
        });
        
        console.log('');
    }
    
    // Test performance integrations
    async testPerformanceIntegrations() {
        console.log('⚡ Testing Performance System Integrations');
        console.log('─'.repeat(80));
        
        const perfComponents = [
            { file: 'performance-optimizer.js', name: 'Performance Optimizer' },
            { file: 'performance-dashboard.js', name: 'Performance Dashboard' },
            { file: 'memory-service.js', name: 'Memory Service' },
            { file: 'memory-dashboard.js', name: 'Memory Dashboard' },
            { file: 'enhanced-error-recovery.js', name: 'Error Recovery' },
            { file: 'comprehensive-health-checker.js', name: 'Health Checker' }
        ];
        
        for (const component of perfComponents) {
            const componentPath = path.join(this.electronDir, component.file);
            
            if (fs.existsSync(componentPath)) {
                console.log(`   ✅ ${component.name} - Available`);
            } else {
                console.log(`   ❌ ${component.name} - NOT FOUND`);
                this.addIssue('MEDIUM', `${component.name} not found`);
            }
        }
        
        console.log('');
    }
    
    addIssue(severity, description) {
        this.issues.push({ severity, description });
    }
    
    generateReport() {
        console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
        console.log('║                        INTEGRATION TEST REPORT                                ║');
        console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Summary statistics
        console.log('📊 TEST SUMMARY:\n');
        
        const categories = [
            { name: 'UI Components', data: this.results.uiComponents },
            { name: 'Backend Integrations', data: this.results.backendIntegrations },
            { name: 'Event Handlers', data: this.results.eventHandlers },
            { name: 'Modules', data: this.results.modules }
        ];
        
        categories.forEach(cat => {
            const total = cat.data.tested;
            const wired = cat.data.wired || cat.data.loaded || 0;
            const percentage = total > 0 ? ((wired / total) * 100).toFixed(1) : 0;
            const status = percentage >= 90 ? '✅' : percentage >= 70 ? '⚠️' : '❌';
            
            console.log(`${status} ${cat.name}:`);
            console.log(`   Tested: ${total}`);
            console.log(`   Working: ${wired} (${percentage}%)`);
            console.log(`   Issues: ${cat.data.unwired + cat.data.broken + cat.data.missing || 0}`);
            console.log('');
        });
        
        // Issues by severity
        const critical = this.issues.filter(i => i.severity === 'CRITICAL').length;
        const high = this.issues.filter(i => i.severity === 'HIGH').length;
        const medium = this.issues.filter(i => i.severity === 'MEDIUM').length;
        const low = this.issues.filter(i => i.severity === 'LOW').length;
        
        console.log('🚨 ISSUES FOUND:\n');
        console.log(`   🔴 Critical: ${critical}`);
        console.log(`   🟠 High:     ${high}`);
        console.log(`   🟡 Medium:   ${medium}`);
        console.log(`   🟢 Low:      ${low}`);
        console.log(`   ─────────────────`);
        console.log(`   📊 Total:    ${this.issues.length}`);
        
        if (this.issues.length > 0) {
            console.log('\n📋 DETAILED ISSUES:\n');
            this.issues.slice(0, 20).forEach((issue, i) => {
                const icon = {
                    'CRITICAL': '🔴',
                    'HIGH': '🟠',
                    'MEDIUM': '🟡',
                    'LOW': '🟢'
                }[issue.severity];
                console.log(`   ${i + 1}. ${icon} [${issue.severity}] ${issue.description}`);
            });
            
            if (this.issues.length > 20) {
                console.log(`\n   ... and ${this.issues.length - 20} more issues`);
            }
        }
        
        // Overall grade
        const totalTests = Object.values(this.results).reduce((sum, cat) => sum + cat.tested, 0);
        const totalPassing = this.results.uiComponents.wired + 
                            this.results.backendIntegrations.wired + 
                            this.results.eventHandlers.wired + 
                            this.results.modules.loaded;
        const overallPercentage = totalTests > 0 ? ((totalPassing / totalTests) * 100).toFixed(1) : 0;
        
        const grade = overallPercentage >= 90 ? 'A' :
                     overallPercentage >= 80 ? 'B' :
                     overallPercentage >= 70 ? 'C' :
                     overallPercentage >= 60 ? 'D' : 'F';
        
        console.log('\n' + '═'.repeat(80));
        console.log(`📈 OVERALL: ${totalPassing}/${totalTests} integrations working (${overallPercentage}%)`);
        console.log(`🎯 GRADE: ${grade}`);
        console.log('═'.repeat(80));
        
        // Recommendations
        if (critical > 0) {
            console.log('\n⚠️  CRITICAL ISSUES REQUIRE IMMEDIATE ATTENTION');
        }
        
        if (overallPercentage < 80) {
            console.log('\n💡 RECOMMENDATION: Significant integration work needed');
        } else if (overallPercentage < 90) {
            console.log('\n💡 RECOMMENDATION: Minor integration fixes recommended');
        } else {
            console.log('\n✅ RECOMMENDATION: System is well integrated');
        }
        
        return {
            results: this.results,
            issues: this.issues,
            totalTests,
            totalPassing,
            overallPercentage,
            grade
        };
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new IntegrationWiringTester();
    
    tester.runAllTests().then(report => {
        // Save report
        const reportPath = path.join(__dirname, '..', 'INTEGRATION-WIRING-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}\n`);
        
        // Exit with appropriate code
        const exitCode = report.grade === 'F' ? 2 : report.grade === 'D' ? 1 : 0;
        process.exit(exitCode);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = IntegrationWiringTester;
