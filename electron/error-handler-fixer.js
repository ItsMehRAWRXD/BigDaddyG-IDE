#!/usr/bin/env node

/**
 * BigDaddyG IDE - Error Handler Fixer
 * Fixes all empty catch blocks and ensures proper error handling
 */

const fs = require('fs');
const path = require('path');

class ErrorHandlerFixer {
    constructor() {
        this.fixed = 0;
        console.log('🔧 Fixing error handlers...\n');
    }
    
    /**
     * Fix all empty catch blocks
     */
    async fixAll() {
        const jsFiles = this.findFiles(path.join(__dirname), '.js');
        
        for (const file of jsFiles) {
            // Skip this fixer file
            if (file.includes('error-handler-fixer.js')) continue;
            if (file.includes('deep-issue-scanner.js')) continue;
            if (file.includes('auto-fixer.js')) continue;
            
            await this.fixFile(file);
        }
        
        console.log(`\n✅ Total files fixed: ${this.fixed}`);
    }
    
    /**
     * Fix a single file
     */
    async fixFile(filePath) {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        
        // Pattern 1: catch (err) {}
        content = content.replace(
            /catch\s*\(([^)]+)\)\s*\{\s*\}/g,
            `catch ($1) {\n        console.error('[Error]', $1);\n    }`
        );
        
        // Pattern 2: catch (err) { // comment }
        content = content.replace(
            /catch\s*\(([^)]+)\)\s*\{\s*\/\/[^\n]*\n\s*\}/g,
            `catch ($1) {\n        console.error('[Error]', $1);\n    }`
        );
        
        // Pattern 3: Replace console.error with logger.error where logger is available
        // Only do this if the file already uses logger
        if (content.includes('logger.')) {
            content = content.replace(
                /console\.error\(\s*'(\[.*?\])([^']*)',\s*([^)]+)\)/g,
                "logger.error('$1', '$2', $3)"
            );
        }
        
        if (content !== originalContent) {
            const relativePath = path.relative(path.join(__dirname, '..'), filePath);
            console.log(`   ✅ Fixed ${relativePath}`);
            this.fixed++;
            fs.writeFileSync(filePath, content);
        }
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
                item !== 'node_modules') {
                this.findFiles(fullPath, ext, files);
            } else if (item.endsWith(ext)) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
}

// Run fixer
if (require.main === module) {
    const fixer = new ErrorHandlerFixer();
    fixer.fixAll().then(() => {
        console.log('\n✅ Error handler fixes complete!');
    }).catch(error => {
        console.error('❌ Fix failed:', error);
        process.exit(1);
    });
}

module.exports = ErrorHandlerFixer;
