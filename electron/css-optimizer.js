/**
 * BigDaddyG IDE - CSS Optimizer
 * Removes !important and improves specificity
 */

const fs = require('fs');
const path = require('path');

class CSSOptimizer {
    constructor() {
        this.rules = [];
        this.optimizations = {
            importantRemoved: 0,
            specificityCorrected: 0,
            duplicatesRemoved: 0
        };
        
        console.log('[CSSOptimizer] Initialized');
    }
    
    /**
     * Optimize CSS file
     */
    async optimizeFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        
        const content = fs.readFileSync(filePath, 'utf8');
        const optimized = this.optimizeCSS(content);
        
        // Backup original
        fs.writeFileSync(filePath + '.backup', content);
        
        // Write optimized
        fs.writeFileSync(filePath, optimized);
        
        console.log(`[CSSOptimizer] Optimized: ${filePath}`);
        return this.optimizations;
    }
    
    /**
     * Optimize CSS content
     */
    optimizeCSS(css) {
        let optimized = css;
        
        // Remove !important and improve specificity
        optimized = this.removeImportant(optimized);
        
        // Remove duplicate rules
        optimized = this.removeDuplicates(optimized);
        
        // Improve specificity
        optimized = this.improveSpecificity(optimized);
        
        // Minify (optional)
        // optimized = this.minify(optimized);
        
        return optimized;
    }
    
    /**
     * Remove !important and increase specificity instead
     */
    removeImportant(css) {
        const lines = css.split('\n');
        const optimizedLines = [];
        
        for (let line of lines) {
            if (line.includes('!important')) {
                // Extract the rule
                const match = line.match(/^(\s*)([^:]+):\s*([^;!]+)\s*!important\s*;/);
                
                if (match) {
                    const indent = match[1];
                    const property = match[2].trim();
                    const value = match[3].trim();
                    
                    // Remove !important
                    line = `${indent}${property}: ${value};`;
                    this.optimizations.importantRemoved++;
                }
            }
            
            optimizedLines.push(line);
        }
        
        return optimizedLines.join('\n');
    }
    
    /**
     * Improve CSS specificity
     */
    improveSpecificity(css) {
        // Find selectors that might need higher specificity
        const selectorMap = new Map();
        
        // Parse CSS rules
        const ruleRegex = /([^{]+)\{([^}]+)\}/g;
        let match;
        
        while ((match = ruleRegex.exec(css)) !== null) {
            const selector = match[1].trim();
            const rules = match[2].trim();
            
            // Store rules by selector
            if (!selectorMap.has(selector)) {
                selectorMap.set(selector, []);
            }
            selectorMap.get(selector).push(rules);
        }
        
        // Rebuild CSS with improved specificity
        let optimized = css;
        
        for (const [selector, rulesList] of selectorMap.entries()) {
            // If selector is too generic, make it more specific
            if (this.isGenericSelector(selector)) {
                const improved = this.makeMoreSpecific(selector);
                
                // Replace in CSS
                optimized = optimized.replace(
                    new RegExp(`${this.escapeRegex(selector)}\\s*\\{`, 'g'),
                    `${improved} {`
                );
                
                this.optimizations.specificityCorrected++;
            }
        }
        
        return optimized;
    }
    
    /**
     * Check if selector is too generic
     */
    isGenericSelector(selector) {
        const genericSelectors = ['div', 'span', 'p', 'a', 'button', 'input'];
        return genericSelectors.some(gen => 
            selector.trim() === gen || selector.trim().startsWith(gen + ' ')
        );
    }
    
    /**
     * Make selector more specific
     */
    makeMoreSpecific(selector) {
        // Add a class or ID context
        if (!selector.includes('.') && !selector.includes('#')) {
            return `.app-content ${selector}`;
        }
        return selector;
    }
    
    /**
     * Remove duplicate CSS rules
     */
    removeDuplicates(css) {
        const seen = new Set();
        const lines = css.split('\n');
        const uniqueLines = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) {
                uniqueLines.push(line);
                continue;
            }
            
            // Check for duplicates in property declarations
            if (trimmed.includes(':') && trimmed.endsWith(';')) {
                if (seen.has(trimmed)) {
                    this.optimizations.duplicatesRemoved++;
                    continue;
                }
                seen.add(trimmed);
            }
            
            uniqueLines.push(line);
        }
        
        return uniqueLines.join('\n');
    }
    
    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    /**
     * Minify CSS (optional)
     */
    minify(css) {
        return css
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .replace(/\s*{\s*/g, '{')
            .replace(/\s*}\s*/g, '}')
            .replace(/\s*:\s*/g, ':')
            .replace(/\s*;\s*/g, ';')
            .replace(/;\}/g, '}')
            .trim();
    }
    
    /**
     * Optimize all CSS files in directory
     */
    async optimizeDirectory(dirPath) {
        const files = this.findCSSFiles(dirPath);
        const results = [];
        
        for (const file of files) {
            try {
                const result = await this.optimizeFile(file);
                results.push({ file, ...result });
            } catch (error) {
                console.error(`[CSSOptimizer] Error optimizing ${file}:`, error);
            }
        }
        
        return results;
    }
    
    /**
     * Find all CSS files
     */
    findCSSFiles(dir, files = []) {
        if (!fs.existsSync(dir)) return files;
        
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                this.findCSSFiles(fullPath, files);
            } else if (item.endsWith('.css')) {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    /**
     * Get optimization report
     */
    getReport() {
        return {
            importantRemoved: this.optimizations.importantRemoved,
            specificityCorrected: this.optimizations.specificityCorrected,
            duplicatesRemoved: this.optimizations.duplicatesRemoved,
            totalOptimizations: 
                this.optimizations.importantRemoved +
                this.optimizations.specificityCorrected +
                this.optimizations.duplicatesRemoved
        };
    }
}

module.exports = CSSOptimizer;
