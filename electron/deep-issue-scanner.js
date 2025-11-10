#!/usr/bin/env node

/**
 * BigDaddyG IDE - Deep Issue Scanner
 * Finds ALL hidden issues: CSS warnings, suppressed errors, mocked warnings
 */

const fs = require('fs');
const path = require('path');

class DeepIssueScanner {
    constructor() {
        this.issues = {
            cssImportant: [],
            commentedErrors: [],
            emptyTryCatch: [],
            mockErrors: [],
            todoFixme: [],
            suppressedWarnings: [],
            placeholders: []
        };
        
        this.stats = {
            filesScanned: 0,
            totalIssues: 0
        };
    }
    
    /**
     * Scan all files
     */
    async scan() {
        console.log('🔍 Starting deep issue scan...\n');
        
        // Scan CSS files
        await this.scanCSS();
        
        // Scan JavaScript files
        await this.scanJavaScript();
        
        // Scan HTML files
        await this.scanHTML();
        
        // Generate report
        this.generateReport();
        
        // Generate fixes
        this.generateFixes();
    }
    
    /**
     * Scan CSS for !important and issues
     */
    async scanCSS() {
        console.log('🎨 Scanning CSS files...');
        
        const cssFiles = this.findFiles(path.join(__dirname), '.css');
        
        for (const file of cssFiles) {
            this.stats.filesScanned++;
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                // Check for !important
                if (line.includes('!important')) {
                    this.issues.cssImportant.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: line.trim(),
                        severity: 'MEDIUM'
                    });
                }
            });
        }
        
        console.log(`   Found ${this.issues.cssImportant.length} !important declarations\n`);
    }
    
    /**
     * Scan JavaScript for suppressed errors
     */
    async scanJavaScript() {
        console.log('📜 Scanning JavaScript files...');
        
        const jsFiles = this.findFiles(path.join(__dirname), '.js');
        
        for (const file of jsFiles) {
            // Skip this scanner file
            if (file.includes('deep-issue-scanner.js')) continue;
            
            this.stats.filesScanned++;
            const content = fs.readFileSync(file, 'utf8');
            const lines = content.split('\n');
            
            lines.forEach((line, index) => {
                const trimmed = line.trim();
                
                // Commented out console.error
                if (trimmed.match(/\/\/\s*console\.error/)) {
                    this.issues.commentedErrors.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'HIGH'
                    });
                }
                
                // Empty catch blocks
                if (trimmed.match(/catch\s*\([^)]*\)\s*\{\s*\}/)) {
                    this.issues.emptyTryCatch.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'HIGH'
                    });
                }
                
                // Catch with only comment
                if (trimmed.match(/catch\s*\([^)]*\)\s*\{\s*\/\//)) {
                    this.issues.emptyTryCatch.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'HIGH'
                    });
                }
                
                // Mock/placeholder errors
                if (trimmed.match(/mock|placeholder|temp|temporary/i) && 
                    (trimmed.includes('error') || trimmed.includes('warning'))) {
                    this.issues.mockErrors.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'MEDIUM'
                    });
                }
                
                // TODO/FIXME/HACK comments
                if (trimmed.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/)) {
                    this.issues.todoFixme.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'LOW'
                    });
                }
                
                // Suppressed warnings (console.warn commented)
                if (trimmed.match(/\/\/\s*console\.warn/)) {
                    this.issues.suppressedWarnings.push({
                        file: path.relative(path.join(__dirname, '..'), file),
                        line: index + 1,
                        content: trimmed,
                        severity: 'MEDIUM'
                    });
                }
                
                // Placeholder implementations
                if (trimmed.match(/return\s+null|return\s+undefined|return\s+\{\}/)) {
                    if (trimmed.includes('placeholder') || trimmed.includes('TODO')) {
                        this.issues.placeholders.push({
                            file: path.relative(path.join(__dirname, '..'), file),
                            line: index + 1,
                            content: trimmed,
                            severity: 'LOW'
                        });
                    }
                }
            });
        }
        
        console.log(`   Found ${this.issues.commentedErrors.length} commented errors`);
        console.log(`   Found ${this.issues.emptyTryCatch.length} empty try-catch blocks`);
        console.log(`   Found ${this.issues.mockErrors.length} mock/placeholder errors`);
        console.log(`   Found ${this.issues.suppressedWarnings.length} suppressed warnings`);
        console.log(`   Found ${this.issues.todoFixme.length} TODO/FIXME comments\n`);
    }
    
    /**
     * Scan HTML files
     */
    async scanHTML() {
        console.log('📄 Scanning HTML files...');
        
        const htmlFiles = this.findFiles(path.join(__dirname), '.html');
        
        for (const file of htmlFiles) {
            this.stats.filesScanned++;
            const content = fs.readFileSync(file, 'utf8');
            
            // Check for inline !important
            const importantMatches = content.match(/!important/g);
            if (importantMatches) {
                this.issues.cssImportant.push({
                    file: path.relative(path.join(__dirname, '..'), file),
                    line: 'inline',
                    content: `${importantMatches.length} inline !important declarations`,
                    severity: 'MEDIUM'
                });
            }
        }
        
        console.log(`   Scanned ${htmlFiles.length} HTML files\n`);
    }
    
    /**
     * Find files recursively
     */
    findFiles(dir, ext, files = []) {
        if (!fs.existsSync(dir)) return files;
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && 
                !item.startsWith('.') && 
                item !== 'node_modules' &&
                item !== 'dist' &&
                item !== 'build') {
                this.findFiles(fullPath, ext, files);
            } else if (item.endsWith(ext)) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    /**
     * Generate detailed report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 DEEP ISSUE SCAN REPORT');
        console.log('='.repeat(80) + '\n');
        
        console.log(`Files Scanned: ${this.stats.filesScanned}`);
        
        // Count total issues
        this.stats.totalIssues = 
            this.issues.cssImportant.length +
            this.issues.commentedErrors.length +
            this.issues.emptyTryCatch.length +
            this.issues.mockErrors.length +
            this.issues.suppressedWarnings.length;
        
        console.log(`Total Issues Found: ${this.stats.totalIssues}\n`);
        
        // CSS !important
        if (this.issues.cssImportant.length > 0) {
            console.log(`🎨 CSS !important (${this.issues.cssImportant.length}):`);
            this.issues.cssImportant.slice(0, 10).forEach(issue => {
                console.log(`   ${issue.file}:${issue.line}`);
                console.log(`      ${issue.content}`);
            });
            if (this.issues.cssImportant.length > 10) {
                console.log(`   ... and ${this.issues.cssImportant.length - 10} more\n`);
            } else {
                console.log('');
            }
        }
        
        // Commented Errors
        if (this.issues.commentedErrors.length > 0) {
            console.log(`🔴 Commented Errors (${this.issues.commentedErrors.length}):`);
            this.issues.commentedErrors.slice(0, 5).forEach(issue => {
                console.log(`   ${issue.file}:${issue.line}`);
                console.log(`      ${issue.content}`);
            });
            if (this.issues.commentedErrors.length > 5) {
                console.log(`   ... and ${this.issues.commentedErrors.length - 5} more\n`);
            } else {
                console.log('');
            }
        }
        
        // Empty Try-Catch
        if (this.issues.emptyTryCatch.length > 0) {
            console.log(`⚠️  Empty Try-Catch (${this.issues.emptyTryCatch.length}):`);
            this.issues.emptyTryCatch.slice(0, 5).forEach(issue => {
                console.log(`   ${issue.file}:${issue.line}`);
                console.log(`      ${issue.content}`);
            });
            if (this.issues.emptyTryCatch.length > 5) {
                console.log(`   ... and ${this.issues.emptyTryCatch.length - 5} more\n`);
            } else {
                console.log('');
            }
        }
        
        // Mock Errors
        if (this.issues.mockErrors.length > 0) {
            console.log(`🎭 Mock/Placeholder Errors (${this.issues.mockErrors.length}):`);
            this.issues.mockErrors.slice(0, 5).forEach(issue => {
                console.log(`   ${issue.file}:${issue.line}`);
            });
            if (this.issues.mockErrors.length > 5) {
                console.log(`   ... and ${this.issues.mockErrors.length - 5} more\n`);
            } else {
                console.log('');
            }
        }
        
        // Suppressed Warnings
        if (this.issues.suppressedWarnings.length > 0) {
            console.log(`🟡 Suppressed Warnings (${this.issues.suppressedWarnings.length}):`);
            this.issues.suppressedWarnings.slice(0, 5).forEach(issue => {
                console.log(`   ${issue.file}:${issue.line}`);
            });
            if (this.issues.suppressedWarnings.length > 5) {
                console.log(`   ... and ${this.issues.suppressedWarnings.length - 5} more\n`);
            } else {
                console.log('');
            }
        }
        
        // TODOs (informational)
        console.log(`📝 TODO/FIXME Comments: ${this.issues.todoFixme.length} (informational)\n`);
    }
    
    /**
     * Generate fixes
     */
    generateFixes() {
        console.log('🔧 RECOMMENDED FIXES:\n');
        
        console.log('1. CSS !important:');
        console.log('   - Use CSS Optimizer to remove all !important');
        console.log('   - Run: node electron/css-optimizer.js\n');
        
        console.log('2. Commented Errors:');
        console.log('   - Uncomment all console.error statements');
        console.log('   - Use proper error handling\n');
        
        console.log('3. Empty Try-Catch:');
        console.log('   - Add proper error handling');
        console.log('   - Use logger.error() for all errors\n');
        
        console.log('4. Mock/Placeholder Errors:');
        console.log('   - Replace with real implementations');
        console.log('   - Remove temporary code\n');
        
        console.log('5. Suppressed Warnings:');
        console.log('   - Uncomment all console.warn statements');
        console.log('   - Use logger.warn() instead\n');
        
        // Save detailed report
        const reportPath = path.join(__dirname, '..', 'issue-scan-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.issues, null, 2));
        console.log(`📄 Detailed report saved: ${reportPath}\n`);
    }
}

// Run scan
if (require.main === module) {
    const scanner = new DeepIssueScanner();
    scanner.scan().then(() => {
        console.log('✅ Deep scan complete!');
    }).catch(error => {
        console.error('❌ Scan failed:', error);
        process.exit(1);
    });
}

module.exports = DeepIssueScanner;
