/**
 * Security & Performance Scanner
 * Minimal code review tool for vulnerability and performance analysis
 */

const fs = require('fs');
const path = require('path');

class SecurityPerformanceScanner {
    constructor() {
        this.issues = [];
        this.stats = { files: 0, issues: 0, critical: 0, high: 0, medium: 0, low: 0 };
        
        // Security patterns
        this.securityPatterns = [
            { pattern: /eval\s*\(/g, severity: 'critical', type: 'security', message: 'Code injection via eval()' },
            { pattern: /innerHTML\s*=/g, severity: 'high', type: 'security', message: 'XSS via innerHTML' },
            { pattern: /document\.write\s*\(/g, severity: 'high', type: 'security', message: 'XSS via document.write' },
            { pattern: /process\.env\[\s*['"`].*['"`]\s*\]/g, severity: 'medium', type: 'security', message: 'Environment variable exposure' },
            { pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)/g, severity: 'high', type: 'security', message: 'Command execution risk' },
            { pattern: /shell:\s*true/g, severity: 'critical', type: 'security', message: 'Shell injection vulnerability' },
            { pattern: /fs\.readFileSync\s*\(/g, severity: 'medium', type: 'security', message: 'Synchronous file operations' },
            { pattern: /JSON\.parse\s*\(/g, severity: 'low', type: 'security', message: 'JSON parsing without validation' },
            { pattern: /setTimeout\s*\(\s*['"`]/g, severity: 'high', type: 'security', message: 'Code injection via setTimeout string' },
            { pattern: /setInterval\s*\(\s*['"`]/g, severity: 'high', type: 'security', message: 'Code injection via setInterval string' }
        ];
        
        // Performance patterns
        this.performancePatterns = [
            { pattern: /for\s*\(.*\.length.*\)/g, severity: 'medium', type: 'performance', message: 'Loop with repeated length calculation' },
            { pattern: /document\.getElementById\s*\(/g, severity: 'low', type: 'performance', message: 'Repeated DOM queries (cache selectors)' },
            { pattern: /setInterval\s*\(\s*.*,\s*[1-9]\d{0,2}\s*\)/g, severity: 'medium', type: 'performance', message: 'High-frequency interval (<1000ms)' },
            { pattern: /console\.log\s*\(/g, severity: 'low', type: 'performance', message: 'Console logging in production' },
            { pattern: /new\s+RegExp\s*\(/g, severity: 'medium', type: 'performance', message: 'Runtime regex compilation' },
            { pattern: /\.forEach\s*\(/g, severity: 'low', type: 'performance', message: 'Consider for...of for better performance' },
            { pattern: /JSON\.stringify\s*\(\s*.*,\s*null,\s*\d+\s*\)/g, severity: 'low', type: 'performance', message: 'Pretty JSON formatting (remove in production)' }
        ];
        
        // Memory leak patterns
        this.memoryPatterns = [
            { pattern: /addEventListener\s*\(/g, severity: 'medium', type: 'memory', message: 'Event listener (ensure cleanup)' },
            { pattern: /setInterval\s*\(/g, severity: 'high', type: 'memory', message: 'Interval timer (ensure clearInterval)' },
            { pattern: /setTimeout\s*\(/g, severity: 'low', type: 'memory', message: 'Timeout timer (ensure clearTimeout)' },
            { pattern: /new\s+Worker\s*\(/g, severity: 'high', type: 'memory', message: 'Web Worker (ensure termination)' },
            { pattern: /new\s+WebSocket\s*\(/g, severity: 'medium', type: 'memory', message: 'WebSocket (ensure close)' }
        ];
    }
    
    scanFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            this.stats.files++;
            
            [...this.securityPatterns, ...this.performancePatterns, ...this.memoryPatterns]
                .forEach(rule => {
                    let match;
                    while ((match = rule.pattern.exec(content)) !== null) {
                        const lineNum = content.substring(0, match.index).split('\n').length;
                        const line = lines[lineNum - 1]?.trim() || '';
                        
                        this.issues.push({
                            file: filePath,
                            line: lineNum,
                            code: line,
                            severity: rule.severity,
                            type: rule.type,
                            message: rule.message,
                            position: match.index
                        });
                        
                        this.stats.issues++;
                        this.stats[rule.severity]++;
                    }
                });
        } catch (error) {
            console.error(`Error scanning ${filePath}:`, error.message);
        }
    }
    
    scanDirectory(dirPath, extensions = ['.js', '.ts', '.jsx', '.tsx']) {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
                this.scanDirectory(fullPath, extensions);
            } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
                this.scanFile(fullPath);
            }
        });
    }
    
    generateReport() {
        const critical = this.issues.filter(i => i.severity === 'critical');
        const high = this.issues.filter(i => i.severity === 'high');
        const medium = this.issues.filter(i => i.severity === 'medium');
        
        return {
            summary: this.stats,
            critical: critical.slice(0, 10),
            high: high.slice(0, 15),
            medium: medium.slice(0, 20),
            recommendations: this.getRecommendations()
        };
    }
    
    getRecommendations() {
        const recs = [];
        
        if (this.stats.critical > 0) {
            recs.push('🚨 CRITICAL: Fix shell injection and eval() vulnerabilities immediately');
        }
        if (this.stats.high > 5) {
            recs.push('⚠️ HIGH: Multiple XSS and command injection risks detected');
        }
        if (this.issues.filter(i => i.type === 'memory').length > 10) {
            recs.push('💾 MEMORY: Implement proper cleanup for timers and event listeners');
        }
        if (this.issues.filter(i => i.type === 'performance').length > 20) {
            recs.push('⚡ PERFORMANCE: Optimize DOM queries and loop operations');
        }
        
        return recs;
    }
    
    exportReport(outputPath) {
        const report = this.generateReport();
        fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log(`Report exported to: ${outputPath}`);
    }
}

// CLI Usage
if (require.main === module) {
    const scanner = new SecurityPerformanceScanner();
    const targetDir = process.argv[2] || '.';
    
    console.log('🔍 Scanning for security and performance issues...');
    scanner.scanDirectory(targetDir);
    
    const report = scanner.generateReport();
    console.log('\n📊 SCAN RESULTS:');
    console.log(`Files: ${report.summary.files}, Issues: ${report.summary.issues}`);
    console.log(`Critical: ${report.summary.critical}, High: ${report.summary.high}, Medium: ${report.summary.medium}`);
    
    if (report.critical.length > 0) {
        console.log('\n🚨 CRITICAL ISSUES:');
        report.critical.forEach(issue => {
            console.log(`  ${path.basename(issue.file)}:${issue.line} - ${issue.message}`);
        });
    }
    
    if (report.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        report.recommendations.forEach(rec => console.log(`  ${rec}`));
    }
    
    scanner.exportReport('security-performance-report.json');
}

module.exports = SecurityPerformanceScanner;