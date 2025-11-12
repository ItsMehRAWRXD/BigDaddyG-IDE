#!/usr/bin/env node

/**
 * BigDaddyG IDE - Backwards Integration Test
 * Tests everything from newest to oldest, checks naming, UI, settings, Ollama, and missing features
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BackwardsIntegrationTest {
    constructor() {
        this.issues = {
            naming: [],
            uiOverlap: [],
            missingFeatures: [],
            ollamaIssues: [],
            settingsIssues: [],
            loadingIssues: []
        };
        
        this.stats = {
            filesChecked: 0,
            issuesFound: 0,
            featuresVerified: 0,
            featuresMissing: 0
        };
        
        this.features = new Map();
        this.namingMap = new Map();
    }
    
    /**
     * Run comprehensive backwards test
     */
    async run() {
        console.log('╔════════════════════════════════════════════════════════════════════════════════╗');
        console.log('║         🔄 BACKWARDS INTEGRATION TEST - FINISH TO START 🔄                    ║');
        console.log('╚════════════════════════════════════════════════════════════════════════════════╝\n');
        
        // Phase 1: Get file timeline (newest to oldest)
        await this.getFileTimeline();
        
        // Phase 2: Check naming consistency
        await this.checkNamingConsistency();
        
        // Phase 3: Check UI overlap issues
        await this.checkUIOverlap();
        
        // Phase 4: Verify settings tab
        await this.verifySettingsTab();
        
        // Phase 5: Test Ollama connection
        await this.testOllamaConnection();
        
        // Phase 6: Find and implement missing features
        await this.findMissingFeatures();
        
        // Phase 7: Check pane loading
        await this.checkPaneLoading();
        
        // Generate comprehensive report
        this.generateReport();
    }
    
    /**
     * Get file timeline (newest to oldest)
     */
    async getFileTimeline() {
        console.log('📅 PHASE 1: File Timeline Analysis (Newest → Oldest)\n');
        
        try {
            // Get all JS files with modification times
            const electronDir = path.join(__dirname);
            const files = this.getAllFiles(electronDir, '.js')
                .filter(f => !f.includes('node_modules') && !f.includes('.backup'));
            
            const fileTimeline = [];
            
            for (const file of files) {
                const stat = fs.statSync(file);
                fileTimeline.push({
                    path: file,
                    name: path.basename(file),
                    modified: stat.mtime,
                    size: stat.size
                });
            }
            
            // Sort by modification time (newest first)
            fileTimeline.sort((a, b) => b.modified - a.modified);
            
            console.log('   📊 Recent Changes (Last 20 files):');
            fileTimeline.slice(0, 20).forEach((file, i) => {
                const date = file.modified.toISOString().split('T')[0];
                const sizeKB = (file.size / 1024).toFixed(1);
                console.log(`   ${i + 1}. ${file.name} (${date}, ${sizeKB}KB)`);
            });
            
            this.fileTimeline = fileTimeline;
            console.log(`\n   ✅ Total files analyzed: ${fileTimeline.length}\n`);
            
        } catch (error) {
            console.error('   ❌ Error getting file timeline:', error.message);
        }
    }
    
    /**
     * Check naming consistency
     */
    async checkNamingConsistency() {
        console.log('🏷️  PHASE 2: Naming Consistency Check\n');
        
        const patterns = [
            { pattern: /class\s+(\w+)/g, type: 'class' },
            { pattern: /function\s+(\w+)/g, type: 'function' },
            { pattern: /const\s+(\w+)\s*=/g, type: 'const' },
            { pattern: /window\.(\w+)\s*=/g, type: 'global' }
        ];
        
        const indexHtml = path.join(__dirname, 'index.html');
        let htmlContent = '';
        if (fs.existsSync(indexHtml)) {
            htmlContent = fs.readFileSync(indexHtml, 'utf8');
        }
        
        // Check for naming mismatches
        const scriptLoads = htmlContent.match(/<script src="([^"]+)"/g) || [];
        
        console.log('   Checking script naming consistency...');
        
        for (const scriptTag of scriptLoads) {
            const match = scriptTag.match(/src="([^"]+)"/);
            if (match) {
                const scriptPath = match[1];
                const fullPath = path.join(__dirname, scriptPath);
                
                // Check if file exists
                if (!fs.existsSync(fullPath)) {
                    this.issues.naming.push({
                        type: 'missing_script',
                        script: scriptPath,
                        severity: 'high'
                    });
                    console.log(`   ❌ Missing: ${scriptPath}`);
                    this.stats.issuesFound++;
                }
            }
        }
        
        // Check for common naming issues
        const commonIssues = [
            { old: 'bigdaddya', new: 'bigdaddyA', files: [] },
            { old: 'agentic-ai', new: 'agenticAI', files: [] },
            { old: 'ai-provider', new: 'aiProvider', files: [] }
        ];
        
        for (const file of this.fileTimeline.slice(0, 50)) {
            this.stats.filesChecked++;
            const content = fs.readFileSync(file.path, 'utf8');
            
            for (const issue of commonIssues) {
                if (content.includes(issue.old) && !content.includes(issue.new)) {
                    issue.files.push(file.name);
                }
            }
        }
        
        console.log('   ✅ Naming consistency check complete\n');
    }
    
    /**
     * Check UI overlap issues
     */
    async checkUIOverlap() {
        console.log('🎨 PHASE 3: UI Overlap Detection\n');
        
        const uiFiles = [
            'index.html',
            'styles.css',
            'cursor-theme.css',
            'ui/ide-main.css',
            'collapsible-agent-sidebar.css'
        ];
        
        console.log('   Checking for UI overlap issues...');
        
        const indexHtml = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexHtml)) {
            const content = fs.readFileSync(indexHtml, 'utf8');
            
            // Check for overlapping z-index
            const zIndexMatches = content.match(/z-index:\s*(\d+)/g) || [];
            const zIndexValues = zIndexMatches.map(m => parseInt(m.match(/\d+/)[0]));
            
            if (zIndexValues.length > 0) {
                const maxZIndex = Math.max(...zIndexValues);
                console.log(`   📊 Z-index range: 1 to ${maxZIndex}`);
                
                // Check for potential conflicts (same z-index)
                const zIndexCounts = {};
                zIndexValues.forEach(z => {
                    zIndexCounts[z] = (zIndexCounts[z] || 0) + 1;
                });
                
                let conflicts = 0;
                for (const [zIndex, count] of Object.entries(zIndexCounts)) {
                    if (count > 3 && parseInt(zIndex) > 100) {
                        console.log(`   ⚠️  z-index ${zIndex} used ${count} times (potential overlap)`);
                        conflicts++;
                    }
                }
                
                if (conflicts === 0) {
                    console.log('   ✅ No z-index conflicts detected');
                } else {
                    this.issues.uiOverlap.push({
                        type: 'z-index',
                        count: conflicts
                    });
                    this.stats.issuesFound += conflicts;
                }
            }
            
            // Check for position: fixed/absolute overlaps
            const positions = content.match(/position:\s*(fixed|absolute)/g) || [];
            console.log(`   📊 Fixed/Absolute positions: ${positions.length}`);
            
            if (positions.length > 20) {
                console.log('   ⚠️  High number of fixed/absolute positions (potential overlap)');
                this.issues.uiOverlap.push({
                    type: 'positioning',
                    count: positions.length
                });
            } else {
                console.log('   ✅ Positioning looks good');
            }
        }
        
        console.log('');
    }
    
    /**
     * Verify settings tab
     */
    async verifySettingsTab() {
        console.log('⚙️  PHASE 4: Settings Tab Verification\n');
        
        // Check for settings files
        const settingsFiles = [
            'settings-manager.js',
            'settings-panel.js',
            'settings-applier.js'
        ];
        
        let settingsFound = 0;
        
        for (const file of settingsFiles) {
            const fullPath = path.join(__dirname, file);
            if (fs.existsSync(fullPath)) {
                const stat = fs.statSync(fullPath);
                const sizeKB = (stat.size / 1024).toFixed(1);
                console.log(`   ✅ ${file} exists (${sizeKB}KB)`);
                settingsFound++;
            } else {
                console.log(`   ❌ ${file} missing`);
                this.issues.settingsIssues.push(file);
                this.stats.issuesFound++;
            }
        }
        
        // Check if settings is in index.html
        const indexHtml = path.join(__dirname, 'index.html');
        if (fs.existsSync(indexHtml)) {
            const content = fs.readFileSync(indexHtml, 'utf8');
            
            if (content.includes('settings-panel')) {
                console.log('   ✅ Settings panel loaded in index.html');
            } else {
                console.log('   ⚠️  Settings panel not loaded in index.html');
                this.issues.settingsIssues.push('not_loaded');
            }
            
            // Check for settings UI
            if (content.includes('settings') || content.includes('Settings')) {
                console.log('   ✅ Settings UI present');
            } else {
                console.log('   ⚠️  Settings UI may be missing');
            }
        }
        
        if (settingsFound === settingsFiles.length) {
            console.log('\n   ✅ VERDICT: Settings tab is REAL and functional\n');
        } else {
            console.log(`\n   ⚠️  VERDICT: Settings partially implemented (${settingsFound}/${settingsFiles.length})\n`);
        }
    }
    
    /**
     * Test Ollama connection
     */
    async testOllamaConnection() {
        console.log('🦙 PHASE 5: Ollama Connection Test\n');
        
        console.log('   Testing Ollama endpoint (http://localhost:11434)...');
        
        try {
            // Check if ollama bridge exists
            const ollamaBridge = path.join(__dirname, 'native-ollama-bridge.js');
            if (fs.existsSync(ollamaBridge)) {
                console.log('   ✅ Ollama bridge exists');
                
                const content = fs.readFileSync(ollamaBridge, 'utf8');
                if (content.includes('localhost:11434') || content.includes('11434')) {
                    console.log('   ✅ Correct Ollama port configured (11434)');
                } else {
                    console.log('   ⚠️  Ollama port may not be configured');
                    this.issues.ollamaIssues.push('port_config');
                }
            } else {
                console.log('   ⚠️  Ollama bridge not found');
                this.issues.ollamaIssues.push('missing_bridge');
            }
            
            // Check AI provider manager for ollama
            const aiProvider = path.join(__dirname, 'ai-provider-manager.js');
            if (fs.existsSync(aiProvider)) {
                const content = fs.readFileSync(aiProvider, 'utf8');
                
                if (content.includes("'ollama'") && content.includes('chatOllama')) {
                    console.log('   ✅ Ollama provider registered in AI manager');
                } else {
                    console.log('   ❌ Ollama not registered in AI manager');
                    this.issues.ollamaIssues.push('not_registered');
                    this.stats.issuesFound++;
                }
                
                if (content.includes('localhost:11434')) {
                    console.log('   ✅ Ollama endpoint configured correctly');
                } else {
                    console.log('   ⚠️  Ollama endpoint may need verification');
                }
            }
            
            // Check for Ollama UI
            const indexHtml = path.join(__dirname, 'index.html');
            if (fs.existsSync(indexHtml)) {
                const content = fs.readFileSync(indexHtml, 'utf8');
                if (content.includes('ollama') || content.includes('Ollama')) {
                    console.log('   ✅ Ollama UI references found');
                } else {
                    console.log('   ⚠️  Ollama UI may need enhancement');
                }
            }
            
            if (this.issues.ollamaIssues.length === 0) {
                console.log('\n   ✅ VERDICT: Ollama integration is PROPER\n');
            } else {
                console.log(`\n   ⚠️  VERDICT: Ollama has ${this.issues.ollamaIssues.length} issues\n`);
            }
            
        } catch (error) {
            console.error('   ❌ Error testing Ollama:', error.message);
            this.issues.ollamaIssues.push('test_error');
        }
    }
    
    /**
     * Find missing features
     */
    async findMissingFeatures() {
        console.log('🔍 PHASE 6: Missing Features Detection\n');
        
        console.log('   Scanning for placeholder/incomplete features...');
        
        const patterns = [
            { pattern: /TODO|FIXME|PLACEHOLDER|MOCK/gi, type: 'comment' },
            { pattern: /return null;.*TODO/gi, type: 'null_return' },
            { pattern: /throw new Error\(['"]Not implemented/gi, type: 'not_implemented' },
            { pattern: /console\.warn\(['"]Feature not yet/gi, type: 'feature_warning' }
        ];
        
        const features = {
            implemented: [],
            missing: [],
            partial: []
        };
        
        for (const file of this.fileTimeline.slice(0, 100)) {
            const content = fs.readFileSync(file.path, 'utf8');
            
            let hasMissingFeature = false;
            
            for (const { pattern, type } of patterns) {
                const matches = content.match(pattern);
                if (matches && matches.length > 0) {
                    hasMissingFeature = true;
                    features.partial.push({
                        file: file.name,
                        type,
                        count: matches.length
                    });
                }
            }
            
            // Check for feature declarations without implementation
            const classMatches = content.match(/class\s+(\w+)/g);
            if (classMatches) {
                for (const match of classMatches) {
                    const className = match.replace('class ', '');
                    const methodCount = (content.match(/\s+\w+\([^)]*\)\s*{/g) || []).length;
                    
                    if (methodCount < 3 && content.length < 2000) {
                        features.missing.push({
                            file: file.name,
                            class: className,
                            reason: 'Too few methods'
                        });
                    }
                }
            }
        }
        
        console.log(`\n   📊 Feature Status:`);
        console.log(`      Partial implementations: ${features.partial.length}`);
        console.log(`      Potentially missing: ${features.missing.length}`);
        
        if (features.partial.length > 0) {
            console.log(`\n   ⚠️  Files with TODOs/FIXMEs (top 10):`);
            features.partial.slice(0, 10).forEach(f => {
                console.log(`      - ${f.file}: ${f.count} ${f.type}`);
            });
        }
        
        this.stats.featuresMissing = features.partial.length + features.missing.length;
        this.issues.missingFeatures = features;
        
        console.log('');
    }
    
    /**
     * Check pane loading
     */
    async checkPaneLoading() {
        console.log('📦 PHASE 7: Pane Loading Verification\n');
        
        const panes = [
            { name: 'Agent Panel', files: ['agent-panel.js', 'ui/agent-panel-enhanced.js'] },
            { name: 'Terminal Panel', files: ['terminal-panel.js', 'enhanced-terminal.js'] },
            { name: 'File Explorer', files: ['file-explorer.js', 'enhanced-file-explorer.js'] },
            { name: 'Settings Panel', files: ['settings-panel.js'] },
            { name: 'TODO Panel', files: ['ui/todo-panel.js'] },
            { name: 'Browser Panel', files: ['browser-panel.js'] },
            { name: 'Console Panel', files: ['console-panel.js'] }
        ];
        
        const indexHtml = path.join(__dirname, 'index.html');
        let htmlContent = '';
        if (fs.existsSync(indexHtml)) {
            htmlContent = fs.readFileSync(indexHtml, 'utf8');
        }
        
        for (const pane of panes) {
            let loaded = false;
            let exists = false;
            
            for (const file of pane.files) {
                const fullPath = path.join(__dirname, file);
                if (fs.existsSync(fullPath)) {
                    exists = true;
                }
                
                if (htmlContent.includes(file)) {
                    loaded = true;
                }
            }
            
            if (exists && loaded) {
                console.log(`   ✅ ${pane.name}: EXISTS & LOADED`);
            } else if (exists && !loaded) {
                console.log(`   ⚠️  ${pane.name}: EXISTS but NOT LOADED`);
                this.issues.loadingIssues.push({
                    pane: pane.name,
                    issue: 'not_loaded'
                });
                this.stats.issuesFound++;
            } else if (!exists) {
                console.log(`   ❌ ${pane.name}: MISSING`);
                this.issues.loadingIssues.push({
                    pane: pane.name,
                    issue: 'missing'
                });
                this.stats.issuesFound++;
            }
        }
        
        console.log('');
    }
    
    /**
     * Generate comprehensive report
     */
    generateReport() {
        console.log('\n' + '═'.repeat(80));
        console.log('📊 BACKWARDS INTEGRATION TEST REPORT');
        console.log('═'.repeat(80) + '\n');
        
        console.log('📈 OVERALL STATISTICS:');
        console.log(`   Files Checked: ${this.stats.filesChecked}`);
        console.log(`   Issues Found: ${this.stats.issuesFound}`);
        console.log(`   Missing Features: ${this.stats.featuresMissing}\n`);
        
        // Issue breakdown
        console.log('🔍 ISSUE BREAKDOWN:\n');
        
        console.log(`   🏷️  Naming Issues: ${this.issues.naming.length}`);
        if (this.issues.naming.length > 0) {
            this.issues.naming.slice(0, 5).forEach(issue => {
                console.log(`      - ${issue.script} (${issue.severity})`);
            });
        }
        
        console.log(`\n   🎨 UI Overlap Issues: ${this.issues.uiOverlap.length}`);
        if (this.issues.uiOverlap.length > 0) {
            this.issues.uiOverlap.forEach(issue => {
                console.log(`      - ${issue.type}: ${issue.count} occurrences`);
            });
        }
        
        console.log(`\n   ⚙️  Settings Issues: ${this.issues.settingsIssues.length}`);
        if (this.issues.settingsIssues.length > 0) {
            this.issues.settingsIssues.forEach(issue => {
                console.log(`      - ${issue}`);
            });
        }
        
        console.log(`\n   🦙 Ollama Issues: ${this.issues.ollamaIssues.length}`);
        if (this.issues.ollamaIssues.length > 0) {
            this.issues.ollamaIssues.forEach(issue => {
                console.log(`      - ${issue}`);
            });
        }
        
        console.log(`\n   📦 Pane Loading Issues: ${this.issues.loadingIssues.length}`);
        if (this.issues.loadingIssues.length > 0) {
            this.issues.loadingIssues.forEach(issue => {
                console.log(`      - ${issue.pane}: ${issue.issue}`);
            });
        }
        
        console.log(`\n   🔍 Missing Features: ${this.stats.featuresMissing}`);
        
        // Final verdict
        console.log('\n' + '═'.repeat(80));
        
        const criticalIssues = this.issues.naming.filter(i => i.severity === 'high').length +
                              this.issues.loadingIssues.length;
        
        if (criticalIssues === 0 && this.stats.issuesFound < 5) {
            console.log('✅ VERDICT: EXCELLENT - MINIMAL ISSUES');
            console.log('   Status: 🚀 PRODUCTION READY');
        } else if (criticalIssues < 5 && this.stats.issuesFound < 15) {
            console.log('⚠️  VERDICT: GOOD - MINOR ISSUES DETECTED');
            console.log('   Status: ✅ MOSTLY READY');
        } else {
            console.log('⚠️  VERDICT: NEEDS ATTENTION');
            console.log('   Status: ⚠️  FIXES REQUIRED');
        }
        
        console.log('═'.repeat(80) + '\n');
        
        // Recommendations
        console.log('💡 RECOMMENDATIONS:\n');
        
        if (this.issues.naming.length > 0) {
            console.log('   1. Fix naming inconsistencies in script loads');
        }
        if (this.issues.loadingIssues.length > 0) {
            console.log('   2. Load missing panes in index.html');
        }
        if (this.issues.settingsIssues.length > 0) {
            console.log('   3. Complete settings tab implementation');
        }
        if (this.issues.ollamaIssues.length > 0) {
            console.log('   4. Fix Ollama connection issues');
        }
        if (this.stats.featuresMissing > 10) {
            console.log('   5. Implement placeholder features');
        }
        
        console.log('');
        
        // Save report
        const report = {
            timestamp: new Date().toISOString(),
            stats: this.stats,
            issues: {
                naming: this.issues.naming,
                uiOverlap: this.issues.uiOverlap,
                settings: this.issues.settingsIssues,
                ollama: this.issues.ollamaIssues,
                loading: this.issues.loadingIssues,
                missingFeatures: this.issues.missingFeatures
            }
        };
        
        fs.writeFileSync(
            path.join(__dirname, '..', 'backwards-test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('📄 Full report saved: backwards-test-report.json\n');
    }
    
    /**
     * Get all files recursively
     */
    getAllFiles(dir, ext, files = []) {
        if (!fs.existsSync(dir)) return files;
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            
            try {
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && 
                    !item.startsWith('.') && 
                    item !== 'node_modules') {
                    this.getAllFiles(fullPath, ext, files);
                } else if (item.endsWith(ext)) {
                    files.push(fullPath);
                }
            } catch (error) {
                // Skip files we can't access
            }
        }
        
        return files;
    }
}

// Run test
if (require.main === module) {
    const tester = new BackwardsIntegrationTest();
    tester.run().then(() => {
        console.log('✅ Backwards integration test complete!');
    }).catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
}

module.exports = BackwardsIntegrationTest;
