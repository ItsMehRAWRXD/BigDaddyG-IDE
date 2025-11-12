#!/usr/bin/env node
/**
 * BigDaddyG IDE - Runtime Feature Validator
 * Deep validation of runtime behavior and integration
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🔍 BIGDADDYG IDE - RUNTIME FEATURE VALIDATOR');
console.log('='.repeat(80));
console.log('Testing runtime behavior and integration...\n');

class RuntimeFeatureValidator {
    constructor() {
        this.results = {
            syntax: { passed: 0, failed: 0, errors: [] },
            dependencies: { passed: 0, failed: 0, errors: [] },
            integration: { passed: 0, failed: 0, errors: [] },
            performance: { passed: 0, failed: 0, errors: [] }
        };
        this.electronDir = __dirname;
    }
    
    async validate() {
        console.log('📦 Phase 1: Syntax Validation');
        await this.validateSyntax();
        
        console.log('\n📚 Phase 2: Dependency Validation');
        await this.validateDependencies();
        
        console.log('\n🔗 Phase 3: Integration Validation');
        await this.validateIntegration();
        
        console.log('\n⚡ Phase 4: Performance Validation');
        await this.validatePerformance();
        
        return this.generateReport();
    }
    
    async validateSyntax() {
        const jsFiles = this.getAllJSFiles();
        console.log(`   Checking ${jsFiles.length} JavaScript files...\n`);
        
        for (const file of jsFiles) {
            const relativePath = path.relative(this.electronDir, file);
            try {
                await this.checkSyntax(file);
                this.results.syntax.passed++;
                console.log(`   ✅ ${relativePath}`);
            } catch (error) {
                this.results.syntax.failed++;
                this.results.syntax.errors.push({ file: relativePath, error: error.message });
                console.log(`   ❌ ${relativePath}: ${error.message}`);
            }
        }
    }
    
    async checkSyntax(file) {
        return new Promise((resolve, reject) => {
            const process = spawn('node', ['--check', file]);
            let stderr = '';
            
            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            
            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(stderr.trim()));
                } else {
                    resolve();
                }
            });
            
            process.on('error', reject);
        });
    }
    
    getAllJSFiles() {
        const files = [];
        const walk = (dir) => {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                    walk(fullPath);
                } else if (stat.isFile() && item.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        };
        walk(this.electronDir);
        return files;
    }
    
    async validateDependencies() {
        const tests = [
            { name: 'package.json exists', test: () => fs.existsSync(path.join(this.electronDir, '..', 'package.json')) },
            { name: 'node_modules exists', test: () => fs.existsSync(path.join(this.electronDir, '..', 'node_modules')) },
            { name: 'Monaco editor installed', test: () => fs.existsSync(path.join(this.electronDir, '..', 'node_modules', 'monaco-editor')) },
            { name: 'Electron installed', test: () => fs.existsSync(path.join(this.electronDir, '..', 'node_modules', 'electron')) },
            { name: 'Monaco CSS exists', test: () => fs.existsSync(path.join(this.electronDir, '..', 'node_modules', 'monaco-editor', 'min', 'vs', 'style.css')) },
            { name: 'Monaco loader exists', test: () => fs.existsSync(path.join(this.electronDir, '..', 'node_modules', 'monaco-editor', 'min', 'vs', 'loader.js')) }
        ];
        
        for (const test of tests) {
            try {
                const result = test.test();
                if (result) {
                    this.results.dependencies.passed++;
                    console.log(`   ✅ ${test.name}`);
                } else {
                    throw new Error('Test returned false');
                }
            } catch (error) {
                this.results.dependencies.failed++;
                this.results.dependencies.errors.push({ test: test.name, error: error.message });
                console.log(`   ❌ ${test.name}`);
            }
        }
    }
    
    async validateIntegration() {
        const integrationTests = [
            { name: 'Main.js loads correctly', test: () => this.validateMainJS() },
            { name: 'Renderer.js structure valid', test: () => this.validateRendererJS() },
            { name: 'Index.html structure valid', test: () => this.validateIndexHTML() },
            { name: 'Agentic core loadable', test: () => this.validateAgenticCore() },
            { name: 'AI provider manager loadable', test: () => this.validateAIProviderManager() },
            { name: 'Settings service loadable', test: () => this.validateSettingsService() },
            { name: 'File explorer loadable', test: () => this.validateFileExplorer() },
            { name: 'Monaco integration valid', test: () => this.validateMonacoIntegration() }
        ];
        
        for (const test of integrationTests) {
            try {
                const result = await test.test();
                if (result) {
                    this.results.integration.passed++;
                    console.log(`   ✅ ${test.name}`);
                } else {
                    throw new Error('Integration test failed');
                }
            } catch (error) {
                this.results.integration.failed++;
                this.results.integration.errors.push({ test: test.name, error: error.message });
                console.log(`   ❌ ${test.name}: ${error.message}`);
            }
        }
    }
    
    validateMainJS() {
        const mainPath = path.join(this.electronDir, 'main.js');
        const content = fs.readFileSync(mainPath, 'utf8');
        return content.includes('createMainWindow') && 
               content.includes('BrowserWindow') &&
               content.includes('app.whenReady');
    }
    
    validateRendererJS() {
        const rendererPath = path.join(this.electronDir, 'renderer.js');
        const content = fs.readFileSync(rendererPath, 'utf8');
        return content.includes('monaco') && 
               content.includes('loadMonacoCSS');
    }
    
    validateIndexHTML() {
        const indexPath = path.join(this.electronDir, 'index.html');
        const content = fs.readFileSync(indexPath, 'utf8');
        return content.includes('BigDaddyG') && 
               content.includes('monaco-editor') &&
               content.includes('renderer.js');
    }
    
    validateAgenticCore() {
        const corePath = path.join(this.electronDir, 'bigdaddyg-agentic-core.js');
        const content = fs.readFileSync(corePath, 'utf8');
        return content.includes('class') && 
               content.includes('agentic');
    }
    
    validateAIProviderManager() {
        const aiPath = path.join(this.electronDir, 'ai-provider-manager.js');
        const content = fs.readFileSync(aiPath, 'utf8');
        return content.includes('provider') || content.includes('AI');
    }
    
    validateSettingsService() {
        const settingsPath = path.join(this.electronDir, 'settings', 'settings-service.js');
        const content = fs.readFileSync(settingsPath, 'utf8');
        return content.includes('settings') || content.includes('config');
    }
    
    validateFileExplorer() {
        const explorerPath = path.join(this.electronDir, 'file-explorer.js');
        const content = fs.readFileSync(explorerPath, 'utf8');
        return content.includes('file') || content.includes('explorer');
    }
    
    validateMonacoIntegration() {
        const files = [
            path.join(this.electronDir, 'renderer.js'),
            path.join(this.electronDir, 'index.html')
        ];
        
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            if (!content.includes('style.css')) {
                return false;
            }
        }
        return true;
    }
    
    async validatePerformance() {
        const perfTests = [
            { name: 'File count reasonable', test: () => this.getAllJSFiles().length < 500 },
            { name: 'No excessively large files', test: () => this.checkFileSizes() },
            { name: 'Performance modules present', test: () => fs.existsSync(path.join(this.electronDir, 'performance-optimizer.js')) },
            { name: 'Error recovery present', test: () => fs.existsSync(path.join(this.electronDir, 'enhanced-error-recovery.js')) },
            { name: 'Health checker present', test: () => fs.existsSync(path.join(this.electronDir, 'comprehensive-health-checker.js')) }
        ];
        
        for (const test of perfTests) {
            try {
                const result = test.test();
                if (result) {
                    this.results.performance.passed++;
                    console.log(`   ✅ ${test.name}`);
                } else {
                    throw new Error('Performance test failed');
                }
            } catch (error) {
                this.results.performance.failed++;
                this.results.performance.errors.push({ test: test.name, error: error.message });
                console.log(`   ❌ ${test.name}`);
            }
        }
    }
    
    checkFileSizes() {
        const files = this.getAllJSFiles();
        for (const file of files) {
            const stat = fs.statSync(file);
            if (stat.size > 5 * 1024 * 1024) { // 5MB
                return false;
            }
        }
        return true;
    }
    
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 RUNTIME VALIDATION REPORT');
        console.log('='.repeat(80));
        
        const categories = ['syntax', 'dependencies', 'integration', 'performance'];
        let totalPassed = 0;
        let totalFailed = 0;
        
        categories.forEach(category => {
            const { passed, failed } = this.results[category];
            totalPassed += passed;
            totalFailed += failed;
            const total = passed + failed;
            const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
            const icon = failed === 0 ? '✅' : '⚠️';
            
            console.log(`\n${icon} ${category.toUpperCase()}: ${passed}/${total} passed (${passRate}%)`);
            
            if (this.results[category].errors.length > 0) {
                console.log(`   Errors:`);
                this.results[category].errors.forEach(err => {
                    console.log(`   - ${err.file || err.test}: ${err.error}`);
                });
            }
        });
        
        const total = totalPassed + totalFailed;
        const overallPassRate = ((totalPassed / total) * 100).toFixed(1);
        const grade = totalFailed === 0 ? 'A+' :
                     overallPassRate >= 90 ? 'A' :
                     overallPassRate >= 80 ? 'B' :
                     overallPassRate >= 70 ? 'C' : 'F';
        
        console.log('\n' + '='.repeat(80));
        console.log(`📈 OVERALL: ${totalPassed}/${total} tests passed (${overallPassRate}%)`);
        console.log(`🎯 GRADE: ${grade}`);
        console.log('='.repeat(80));
        
        return {
            results: this.results,
            totalPassed,
            totalFailed,
            grade
        };
    }
}

// Run validation if executed directly
if (require.main === module) {
    const validator = new RuntimeFeatureValidator();
    
    validator.validate().then(report => {
        const reportPath = path.join(__dirname, '..', 'RUNTIME-VALIDATION-REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 Full report saved to: ${reportPath}`);
        
        process.exit(report.totalFailed > 0 ? 1 : 0);
    }).catch(error => {
        console.error('\n💥 FATAL ERROR:', error);
        process.exit(1);
    });
}

module.exports = RuntimeFeatureValidator;
