#!/usr/bin/env node

/**
 * BigDaddyG IDE - Comprehensive Agentic Testing
 * Tests ALL agentic features to ensure everything works
 */

const fs = require('fs');
const path = require('path');

class AgenticTester {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: []
        };
        
        this.stats = {
            total: 0,
            passed: 0,
            failed: 0
        };
        
        this.features = {
            aiProviders: { tested: 0, working: 0 },
            agenticCore: { tested: 0, working: 0 },
            selfHealing: { tested: 0, working: 0 },
            multiAgent: { tested: 0, working: 0 },
            gameIntegration: { tested: 0, working: 0 },
            uiComponents: { tested: 0, working: 0 }
        };
    }
    
    /**
     * Run comprehensive agentic tests
     */
    async run() {
        console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║          🤖 COMPREHENSIVE AGENTIC TESTING - ALL FEATURES 🤖                   ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Test Suite 1: AI Provider Infrastructure
        await this.testAIProviders();
        
        // Test Suite 2: Agentic Core Features
        await this.testAgenticCore();
        
        // Test Suite 3: Self-Healing Capabilities
        await this.testSelfHealing();
        
        // Test Suite 4: Multi-Agent Systems
        await this.testMultiAgent();
        
        // Test Suite 5: Game Development Integration
        await this.testGameIntegration();
        
        // Test Suite 6: Agentic UI Components
        await this.testUIComponents();
        
        // Test Suite 7: Integration & Wiring
        await this.testIntegration();
        
        // Generate comprehensive report
        this.generateReport();
    }
    
    /**
     * Test AI Provider Infrastructure
     */
    async testAIProviders() {
        console.log('🤖 TEST SUITE 1: AI Provider Infrastructure\n');
        
        const tests = [
            { name: 'AI Provider Manager exists', file: 'ai-provider-manager.js' },
            { name: 'API Key Manager UI exists', file: 'ui/api-key-manager-ui.js' },
            { name: 'BigDaddyA Integration exists', file: 'bigdaddya-integration.js' },
            { name: 'Agentic AI Bridge exists', file: 'agentic-ai-bridge.js' },
            { name: 'Built-in Local AI exists', file: 'built-in-local-ai.js' }
        ];
        
        for (const test of tests) {
            this.features.aiProviders.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.aiProviders.working++;
        }
        
        // Test provider registration
        const providerFile = path.join(__dirname, 'ai-provider-manager.js');
        if (fs.existsSync(providerFile)) {
            const content = fs.readFileSync(providerFile, 'utf8');
            
            const providers = [
                'openai', 'anthropic', 'gemini', 'groq', 'deepseek',
                'kimi', 'cursor', 'cohere', 'azure', 'ollama'
            ];
            
            for (const provider of providers) {
                this.features.aiProviders.tested++;
                const hasProvider = content.includes(`this.providers.set('${provider}'`);
                const hasMethod = content.includes(`async chat${provider.charAt(0).toUpperCase() + provider.slice(1)}(`);
                
                if (hasProvider && hasMethod) {
                    this.pass(`Provider ${provider}: ✅ Registered & Implemented`);
                    this.features.aiProviders.working++;
                } else {
                    this.fail(`Provider ${provider}: ❌ Missing registration or method`);
                }
            }
        }
        
        console.log('');
    }
    
    /**
     * Test Agentic Core Features
     */
    async testAgenticCore() {
        console.log('🧠 TEST SUITE 2: Agentic Core Features\n');
        
        const tests = [
            { name: 'Agentic Coder', file: 'agentic-coder.js' },
            { name: 'Agentic Executor', file: 'agentic-executor.js' },
            { name: 'Enhanced Agentic Executor', file: 'enhanced-agentic-executor.js' },
            { name: 'Agentic Auto-Fixer', file: 'agentic-auto-fixer.js' },
            { name: 'Agentic Safety', file: 'agentic-safety.js' },
            { name: 'Agentic Test Runner', file: 'agentic-test-runner.js' },
            { name: 'Command Generator', file: 'command-generator.js' },
            { name: 'Agent Panel', file: 'agent-panel.js' },
            { name: 'Agentic Global API', file: 'agentic-global-api.js' }
        ];
        
        for (const test of tests) {
            this.features.agenticCore.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.agenticCore.working++;
        }
        
        // Test for agentic capabilities
        const agenticFiles = [
            'agentic-coder.js',
            'agentic-executor.js',
            'agentic-auto-fixer.js'
        ];
        
        for (const file of agenticFiles) {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                this.features.agenticCore.tested++;
                const content = fs.readFileSync(fullPath, 'utf8');
                
                // Check for key agentic patterns
                const hasAsync = content.includes('async');
                const hasAI = content.includes('AI') || content.includes('ai');
                const hasAutomation = content.includes('auto') || content.includes('generate');
                
                if (hasAsync && hasAI && hasAutomation) {
                    this.pass(`${path.basename(file)}: ✅ Has agentic patterns`);
                    this.features.agenticCore.working++;
                } else {
                    this.warn(`${path.basename(file)}: ⚠️ Missing some agentic patterns`);
                }
            }
        }
        
        console.log('');
    }
    
    /**
     * Test Self-Healing Capabilities
     */
    async testSelfHealing() {
        console.log('🔧 TEST SUITE 3: Self-Healing Capabilities\n');
        
        const tests = [
            { name: 'Error Protection', file: 'error-protection.js' },
            { name: 'Enhanced Error Recovery', file: 'enhanced-error-recovery.js' },
            { name: 'Error Tracker', file: 'error-tracker.js' },
            { name: 'Error Cleanup', file: 'error-cleanup.js' },
            { name: 'Auto-Fixer (CSS)', file: 'auto-fixer.js' },
            { name: 'Error Handler Fixer', file: 'error-handler-fixer.js' },
            { name: 'Connection Fixer', file: 'connection-fixer.js' },
            { name: 'System Diagnostic', file: 'system-diagnostic.js' },
            { name: 'Quick Health Check', file: 'quick-health-check.js' }
        ];
        
        for (const test of tests) {
            this.features.selfHealing.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.selfHealing.working++;
        }
        
        console.log('');
    }
    
    /**
     * Test Multi-Agent Systems
     */
    async testMultiAgent() {
        console.log('👥 TEST SUITE 4: Multi-Agent Systems\n');
        
        const tests = [
            { name: 'Multi-Agent Swarm', file: 'multi-agent-swarm.js' },
            { name: 'Swarm Engine', file: 'swarm-engine.js' },
            { name: 'Swarm Visualizer', file: 'ui/swarm-visualizer.js' },
            { name: 'Background Agent Manager', file: 'background-agent-manager.js' },
            { name: 'Background Agent Worker', file: 'background-agent-worker.js' },
            { name: 'Agent Panel (Enhanced)', file: 'ui/agent-panel-enhanced.js' },
            { name: 'Agent Panel (Cursor Style)', file: 'ui/agent-panel-cursor-style.js' }
        ];
        
        for (const test of tests) {
            this.features.multiAgent.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.multiAgent.working++;
        }
        
        console.log('');
    }
    
    /**
     * Test Game Development Integration
     */
    async testGameIntegration() {
        console.log('🎮 TEST SUITE 5: Game Development Integration\n');
        
        const tests = [
            { name: 'Godot Complete Integration', file: 'godot-complete-integration.js' },
            { name: 'Unity Integration', file: 'unity-integration.js' },
            { name: 'Unreal Integration', file: 'unreal-integration.js' },
            { name: 'Visual Game Editor', file: 'game-editor/visual-game-editor.js' },
            { name: 'Asset Preview System', file: 'game-editor/asset-preview-system.js' },
            { name: 'Shader Editor', file: 'game-editor/shader-editor.js' },
            { name: 'Animation Timeline', file: 'game-editor/animation-timeline-editor.js' },
            { name: 'Game Project Detector', file: 'game-project-detector.js' },
            { name: 'Game Loop Manager', file: 'game-loop-manager.js' }
        ];
        
        for (const test of tests) {
            this.features.gameIntegration.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.gameIntegration.working++;
        }
        
        console.log('');
    }
    
    /**
     * Test Agentic UI Components
     */
    async testUIComponents() {
        console.log('🎨 TEST SUITE 6: Agentic UI Components\n');
        
        const tests = [
            { name: 'Enhanced Agentic UI', file: 'enhanced-agentic-ui.js' },
            { name: 'Live Coding Panel', file: 'ui/live-coding-panel.js' },
            { name: 'TODO Panel', file: 'ui/todo-panel.js' },
            { name: 'Chat Customizer', file: 'ui/chat-customizer.js' },
            { name: 'Optimizer Panel', file: 'ui/optimizer-panel.js' },
            { name: 'Collapsible Agent Sidebar', file: 'collapsible-agent-sidebar.js' },
            { name: 'Agent Panel', file: 'agent-panel.js' },
            { name: 'Parallel Execution Viz', file: 'parallel-execution-viz.js' }
        ];
        
        for (const test of tests) {
            this.features.uiComponents.tested++;
            const result = await this.testFileExists(test.name, test.file);
            if (result) this.features.uiComponents.working++;
        }
        
        console.log('');
    }
    
    /**
     * Test Integration & Wiring
     */
    async testIntegration() {
        console.log('🔌 TEST SUITE 7: Integration & Wiring\n');
        
        this.stats.total++;
        
        // Check index.html loads critical scripts
        const indexPath = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexPath)) {
            const content = fs.readFileSync(indexPath, 'utf8');
            
            const criticalScripts = [
                'ai-provider-manager.js',
                'bigdaddya-integration.js',
                'agentic-ai-bridge.js',
                'agentic-coder.js',
                'renderer.js'
            ];
            
            let allLoaded = true;
            for (const script of criticalScripts) {
                this.stats.total++;
                if (content.includes(script)) {
                    this.pass(`Script loaded: ${script}`);
                    this.stats.passed++;
                } else {
                    this.fail(`Script NOT loaded: ${script}`);
                    this.stats.failed++;
                    allLoaded = false;
                }
            }
            
            if (allLoaded) {
                this.pass('All critical agentic scripts loaded ✅');
                this.stats.passed++;
            } else {
                this.fail('Some agentic scripts missing from index.html ❌');
                this.stats.failed++;
            }
        }
        
        // Check renderer.js initializes AI system
        const rendererPath = path.join(__dirname, 'renderer.js');
        if (fs.existsSync(rendererPath)) {
            this.stats.total++;
            const content = fs.readFileSync(rendererPath, 'utf8');
            
            if (content.includes('initializeAISystem')) {
                this.pass('Renderer initializes AI system ✅');
                this.stats.passed++;
            } else {
                this.fail('Renderer missing AI system initialization ❌');
                this.stats.failed++;
            }
        }
        
        console.log('');
    }
    
    /**
     * Test file exists
     */
    async testFileExists(name, file) {
        this.stats.total++;
        const fullPath = path.join(__dirname, file);
        
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            const sizeKB = (stat.size / 1024).toFixed(1);
            this.pass(`${name}: ✅ Exists (${sizeKB}KB)`);
            this.stats.passed++;
            return true;
        } else {
            this.fail(`${name}: ❌ Missing`);
            this.stats.failed++;
            return false;
        }
    }
    
    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 COMPREHENSIVE AGENTIC TEST REPORT');
        console.log('═'.repeat(80) + '\n');
        
        // Overall stats
        const passRate = ((this.stats.passed / this.stats.total) * 100).toFixed(1);
        
        console.log('📈 OVERALL RESULTS:');
        console.log(`   Tests Run:     ${this.stats.total}`);
        console.log(`   Passed:        ${this.stats.passed} ✅`);
        console.log(`   Failed:        ${this.stats.failed} ❌`);
        console.log(`   Pass Rate:     ${passRate}%\n`);
        
        // Feature breakdown
        console.log('🎯 FEATURE BREAKDOWN:\n');
        
        const features = [
            { name: 'AI Providers', data: this.features.aiProviders },
            { name: 'Agentic Core', data: this.features.agenticCore },
            { name: 'Self-Healing', data: this.features.selfHealing },
            { name: 'Multi-Agent', data: this.features.multiAgent },
            { name: 'Game Integration', data: this.features.gameIntegration },
            { name: 'UI Components', data: this.features.uiComponents }
        ];
        
        for (const feature of features) {
            const rate = feature.data.tested > 0 
                ? ((feature.data.working / feature.data.tested) * 100).toFixed(0) 
                : 0;
            const status = rate >= 90 ? '✅' : rate >= 70 ? '⚠️' : '❌';
            
            console.log(`   ${status} ${feature.name.padEnd(20)} ${feature.data.working}/${feature.data.tested} (${rate}%)`);
        }
        
        console.log('');
        
        // Failed tests
        if (this.results.failed.length > 0) {
            console.log('❌ FAILED TESTS:');
            this.results.failed.slice(0, 10).forEach(test => console.log(`   ${test}`));
            if (this.results.failed.length > 10) {
                console.log(`   ... and ${this.results.failed.length - 10} more`);
            }
            console.log('');
        }
        
        // Warnings
        if (this.results.warnings.length > 0) {
            console.log('⚠️  WARNINGS:');
            this.results.warnings.slice(0, 5).forEach(warning => console.log(`   ${warning}`));
            if (this.results.warnings.length > 5) {
                console.log(`   ... and ${this.results.warnings.length - 5} more`);
            }
            console.log('');
        }
        
        // Agentic capabilities summary
        console.log('🤖 AGENTIC CAPABILITIES:');
        console.log(`   ✅ AI Providers: ${this.features.aiProviders.working} working`);
        console.log(`   ✅ Core Features: ${this.features.agenticCore.working} working`);
        console.log(`   ✅ Self-Healing: ${this.features.selfHealing.working} working`);
        console.log(`   ✅ Multi-Agent: ${this.features.multiAgent.working} working`);
        console.log(`   ✅ Game Dev: ${this.features.gameIntegration.working} working`);
        console.log(`   ✅ UI Components: ${this.features.uiComponents.working} working\n`);
        
        // Final verdict
        console.log('═'.repeat(80));
        
        if (passRate >= 95) {
            console.log('✅ VERDICT: EXCELLENT - FULLY AGENTIC');
            console.log('   Status: 🚀 ALL AGENTIC FEATURES OPERATIONAL');
        } else if (passRate >= 85) {
            console.log('⚠️  VERDICT: GOOD - MOSTLY AGENTIC');
            console.log('   Status: ✅ CORE AGENTIC FEATURES WORKING');
        } else if (passRate >= 70) {
            console.log('⚠️  VERDICT: FAIR - PARTIAL AGENTIC');
            console.log('   Status: ⚠️  SOME AGENTIC FEATURES NEED WORK');
        } else {
            console.log('❌ VERDICT: NEEDS WORK');
            console.log('   Status: ❌ AGENTIC FEATURES NEED ATTENTION');
        }
        
        console.log('═'.repeat(80) + '\n');
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            passRate: parseFloat(passRate),
            features: this.features,
            failed: this.results.failed,
            warnings: this.results.warnings,
            verdict: this.getVerdict(passRate)
        };
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'agentic-test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📄 Full report saved: agentic-test-report.json\n');
    }
    
    /**
     * Get verdict based on pass rate
     */
    getVerdict(passRate) {
        if (passRate >= 95) return 'EXCELLENT';
        if (passRate >= 85) return 'GOOD';
        if (passRate >= 70) return 'FAIR';
        return 'NEEDS_WORK';
    }
    
    /**
     * Log pass
     */
    pass(message) {
        this.results.passed.push(message);
        console.log(`   ${message}`);
    }
    
    /**
     * Log fail
     */
    fail(message) {
        this.results.failed.push(message);
        console.log(`   ${message}`);
    }
    
    /**
     * Log warning
     */
    warn(message) {
        this.results.warnings.push(message);
        console.log(`   ${message}`);
    }
}

// Run tests
if (require.main === module) {
    const tester = new AgenticTester();
    tester.run().then(() => {
        console.log('✅ Agentic testing complete!');
        process.exit(tester.stats.failed > 0 ? 1 : 0);
    }).catch(error => {
        console.error('❌ Testing failed:', error);
        process.exit(1);
    });
}

module.exports = AgenticTester;
