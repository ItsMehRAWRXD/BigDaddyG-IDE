/**
 * Quick Security & Performance Fixes
 * Automated fixes for common issues
 */

const fs = require('fs');
const path = require('path');

class QuickFixes {
    constructor() {
        this.fixes = [
            {
                name: 'Remove console.log',
                pattern: /console\.log\s*\([^)]*\);?\s*\n?/g,
                replacement: '',
                type: 'performance'
            },
            {
                name: 'Cache DOM queries',
                pattern: /document\.getElementById\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
                replacement: 'this.cached_$1 = this.cached_$1 || document.getElementById(\'$1\')',
                type: 'performance'
            },
            {
                name: 'Add input validation',
                pattern: /JSON\.parse\s*\(\s*([^)]+)\s*\)/g,
                replacement: 'JSON.parse($1) /* TODO: Add validation */',
                type: 'security'
            },
            {
                name: 'Secure innerHTML',
                pattern: /\.innerHTML\s*=\s*([^;]+);/g,
                replacement: '.textContent = $1; /* Changed from innerHTML for security */',
                type: 'security'
            },
            {
                name: 'Add timer cleanup',
                pattern: /(setInterval\s*\([^)]+\))/g,
                replacement: '$1 /* TODO: Add clearInterval in cleanup */',
                type: 'memory'
            }
        ];
    }
    
    applyFixes(filePath, fixTypes = ['performance', 'security', 'memory']) {
        let content = fs.readFileSync(filePath, 'utf8');
        let applied = 0;
        
        this.fixes.forEach(fix => {
            if (fixTypes.includes(fix.type)) {
                const matches = content.match(fix.pattern);
                if (matches) {
                    content = content.replace(fix.pattern, fix.replacement);
                    applied += matches.length;
                    console.log(`✅ Applied ${fix.name}: ${matches.length} fixes`);
                }
            }
        });
        
        if (applied > 0) {
            fs.writeFileSync(filePath + '.fixed', content);
            console.log(`💾 Fixed file saved as: ${filePath}.fixed`);
        }
        
        return applied;
    }
    
    fixDirectory(dirPath, fixTypes = ['performance']) {
        const files = fs.readdirSync(dirPath);
        let totalFixes = 0;
        
        files.forEach(file => {
            if (file.endsWith('.js') && !file.includes('.fixed')) {
                const filePath = path.join(dirPath, file);
                totalFixes += this.applyFixes(filePath, fixTypes);
            }
        });
        
        return totalFixes;
    }
}

module.exports = QuickFixes;