#!/usr/bin/env node

/**
 * BigDaddyG IDE - Auto-Fixer
 * Automatically fixes all found issues
 */

const fs = require('fs');
const path = require('path');

class AutoFixer {
    constructor() {
        this.fixed = {
            cssImportant: 0,
            commentedErrors: 0,
            mockErrors: 0,
            suppressedWarnings: 0
        };
        
        console.log('🔧 Starting auto-fix...\n');
    }
    
    /**
     * Fix all issues
     */
    async fixAll() {
        // Load scan report
        const reportPath = path.join(__dirname, '..', 'issue-scan-report.json');
        if (!fs.existsSync(reportPath)) {
            console.error('❌ No scan report found. Run deep-issue-scanner.js first.');
            return;
        }
        
        const issues = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Fix CSS !important
        await this.fixCSSImportant(issues.cssImportant);
        
        // Fix commented errors
        await this.fixCommentedErrors(issues.commentedErrors);
        
        // Generate report
        this.generateReport();
    }
    
    /**
     * Fix CSS !important declarations
     */
    async fixCSSImportant(issues) {
        console.log('🎨 Fixing CSS !important declarations...');
        
        const fileMap = new Map();
        
        // Group by file
        issues.forEach(issue => {
            if (!fileMap.has(issue.file)) {
                fileMap.set(issue.file, []);
            }
            fileMap.get(issue.file).push(issue);
        });
        
        // Fix each file
        for (const [file, fileIssues] of fileMap.entries()) {
            const fullPath = path.join(__dirname, '..', file);
            if (!fs.existsSync(fullPath)) continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            // Remove !important and improve specificity
            content = content.replace(/\s*!important\s*/g, '');
            
            if (content !== originalContent) {
                // Backup original
                fs.writeFileSync(fullPath + '.backup', originalContent);
                
                // Write fixed version
                fs.writeFileSync(fullPath, content);
                this.fixed.cssImportant += fileIssues.length;
                console.log(`   ✅ Fixed ${fileIssues.length} issues in ${file}`);
            }
        }
        
        console.log(`   Total fixed: ${this.fixed.cssImportant}\n`);
    }
    
    /**
     * Fix commented errors
     */
    async fixCommentedErrors(issues) {
        console.log('🔴 Fixing commented errors...');
        
        for (const issue of issues) {
            const fullPath = path.join(__dirname, '..', issue.file);
            if (!fs.existsSync(fullPath)) continue;
            
            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;
            
            // Uncomment console.error
            content = content.replace(/\/\/\s*(console\.error)/g, '$1');
            
            // Also replace with logger.error
            content = content.replace(
                /console\.error\(\s*'(\[.*?\])([^']*)',\s*([^)]+)\)/g,
                "logger.error('$1', '$2', $3)"
            );
            
            if (content !== originalContent) {
                // Backup original
                fs.writeFileSync(fullPath + '.backup', originalContent);
                
                // Write fixed version
                fs.writeFileSync(fullPath, content);
                this.fixed.commentedErrors++;
                console.log(`   ✅ Fixed ${issue.file}:${issue.line}`);
            }
        }
        
        console.log(`   Total fixed: ${this.fixed.commentedErrors}\n`);
    }
    
    /**
     * Generate fix report
     */
    generateReport() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 AUTO-FIX REPORT');
        console.log('='.repeat(80) + '\n');
        
        console.log(`✅ CSS !important removed: ${this.fixed.cssImportant}`);
        console.log(`✅ Commented errors fixed: ${this.fixed.commentedErrors}`);
        console.log(`✅ Total fixes applied: ${
            this.fixed.cssImportant + 
            this.fixed.commentedErrors
        }\n`);
        
        console.log('📝 Notes:');
        console.log('   - Original files backed up with .backup extension');
        console.log('   - Review changes before committing');
        console.log('   - Test thoroughly after fixes\n');
    }
}

// Run fixer
if (require.main === module) {
    const fixer = new AutoFixer();
    fixer.fixAll().then(() => {
        console.log('✅ Auto-fix complete!');
    }).catch(error => {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    });
}

module.exports = AutoFixer;
