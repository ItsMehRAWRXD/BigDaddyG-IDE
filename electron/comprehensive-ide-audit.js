/**
 * Comprehensive IDE Audit System
 * Runs complete system checks and generates detailed reports
 */

console.log('[IDEAudit] 🔍 Loading comprehensive IDE audit system...');

class ComprehensiveIDEAudit {
    constructor() {
        this.auditResults = {
            timestamp: null,
            syntaxErrors: [],
            performanceIssues: [],
            memoryLeaks: [],
            securityIssues: [],
            enhancementOpportunities: [],
            overallScore: 0
        };
        
        this.init();
    }
    
    init() {
        console.log('[IDEAudit] 🔧 Audit system initialized');
        console.log('[IDEAudit] 💡 Run window.ideAudit.runFullAudit() to audit the IDE');
    }
    
    async runFullAudit() {
        console.log('[IDEAudit] 🔍 Starting comprehensive IDE audit...');
        console.log('='.repeat(70));
        
        this.auditResults.timestamp = new Date().toISOString();
        
        // Run all audit checks
        await this.auditSyntax();
        await this.auditPerformance();
        await this.auditMemory();
        await this.auditSecurity();
        await this.auditEnhancements();
        
        // Calculate overall score
        this.calculateOverallScore();
        
        // Generate report
        this.generateReport();
        
        console.log('='.repeat(70));
        console.log('[IDEAudit] ✅ Audit complete!');
        
        return this.auditResults;
    }
    
    async auditSyntax() {
        console.log('[IDEAudit] 📝 Auditing syntax and code quality...');
        
        const issues = [];
        
        // Check if all core modules are loaded
        const requiredModules = [
            { name: 'Monaco Editor', check: () => typeof monaco !== 'undefined' },
            { name: 'Renderer', check: () => typeof editor !== 'undefined' },
            { name: 'Chat System', check: () => typeof sendToAI === 'function' },
            { name: 'File Explorer', check: () => typeof fileExplorer !== 'undefined' },
            { name: 'Agentic Systems', check: () => window.agenticAutoFixer !== undefined }
        ];
        
        requiredModules.forEach(module => {
            try {
                if (!module.check()) {
                    issues.push({
                        severity: 'error',
                        module: module.name,
                        message: `${module.name} not properly loaded`
                    });
                }
            } catch (error) {
                issues.push({
                    severity: 'error',
                    module: module.name,
                    message: `Error checking ${module.name}: ${error.message}`
                });
            }
        });
        
        this.auditResults.syntaxErrors = issues;
        console.log(`[IDEAudit]   Found ${issues.length} syntax/loading issues`);
    }
    
    async auditPerformance() {
        console.log('[IDEAudit] ⚡ Auditing performance...');
        
        const issues = [];
        
        // Check FPS
        if (window.performanceOptimizer) {
            const metrics = window.performanceOptimizer.getMetrics();
            
            if (metrics.fps < 30) {
                issues.push({
                    severity: 'error',
                    category: 'FPS',
                    message: `Low FPS detected: ${metrics.fps}`,
                    recommendation: 'Enable performance optimizations'
                });
            } else if (metrics.fps < 50) {
                issues.push({
                    severity: 'warning',
                    category: 'FPS',
                    message: `Suboptimal FPS: ${metrics.fps}`,
                    recommendation: 'Consider reducing visual effects'
                });
            }
        }
        
        // Check tab count
        if (window.openTabs) {
            const tabCount = Object.keys(window.openTabs).length;
            if (tabCount > 50) {
                issues.push({
                    severity: 'warning',
                    category: 'Tabs',
                    message: `Many tabs open: ${tabCount}`,
                    recommendation: 'Close unused tabs to improve performance'
                });
            }
        }
        
        // Check render time
        const renderStart = performance.now();
        await new Promise(resolve => requestAnimationFrame(resolve));
        const renderTime = performance.now() - renderStart;
        
        if (renderTime > 50) {
            issues.push({
                severity: 'warning',
                category: 'Render Time',
                message: `Slow render time: ${renderTime.toFixed(2)}ms`,
                recommendation: 'Check for expensive DOM operations'
            });
        }
        
        this.auditResults.performanceIssues = issues;
        console.log(`[IDEAudit]   Found ${issues.length} performance issues`);
    }
    
    async auditMemory() {
        console.log('[IDEAudit] 💾 Auditing memory usage...');
        
        const issues = [];
        
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            const percent = (used / limit) * 100;
            
            const usedMB = Math.round(used / 1024 / 1024);
            const limitMB = Math.round(limit / 1024 / 1024);
            
            if (percent > 80) {
                issues.push({
                    severity: 'error',
                    category: 'Memory Usage',
                    message: `High memory usage: ${usedMB}MB / ${limitMB}MB (${percent.toFixed(1)}%)`,
                    recommendation: 'Clear caches and close unused tabs'
                });
            } else if (percent > 60) {
                issues.push({
                    severity: 'warning',
                    category: 'Memory Usage',
                    message: `Elevated memory usage: ${usedMB}MB / ${limitMB}MB (${percent.toFixed(1)}%)`,
                    recommendation: 'Monitor memory usage'
                });
            }
        }
        
        // Check for potential memory leaks
        if (window.getTimerStats) {
            const timerStats = window.getTimerStats();
            if (timerStats.active > 100) {
                issues.push({
                    severity: 'warning',
                    category: 'Timers',
                    message: `Many active timers: ${timerStats.active}`,
                    recommendation: 'Check for timer leaks'
                });
            }
        }
        
        this.auditResults.memoryLeaks = issues;
        console.log(`[IDEAudit]   Found ${issues.length} memory issues`);
    }
    
    async auditSecurity() {
        console.log('[IDEAudit] 🔒 Auditing security...');
        
        const issues = [];
        
        // Check if dangerous commands are being used
        const dangerousPatterns = [
            { pattern: 'eval(', severity: 'error', message: 'Dangerous eval() usage detected' },
            { pattern: 'innerHTML =', severity: 'warning', message: 'Direct innerHTML assignment (potential XSS)' },
            { pattern: 'document.write(', severity: 'error', message: 'Dangerous document.write() usage' }
        ];
        
        // Note: In production, this would scan actual code files
        // For now, just check if security modules are loaded
        
        if (!window.agenticSafety) {
            issues.push({
                severity: 'warning',
                category: 'Security Module',
                message: 'Agentic safety module not loaded',
                recommendation: 'Ensure security modules are active'
            });
        }
        
        this.auditResults.securityIssues = issues;
        console.log(`[IDEAudit]   Found ${issues.length} security issues`);
    }
    
    async auditEnhancements() {
        console.log('[IDEAudit] 💡 Checking for enhancement opportunities...');
        
        const opportunities = [];
        
        // Check if enhanced error recovery is active
        if (!window.enhancedErrorRecovery) {
            opportunities.push({
                category: 'Error Handling',
                enhancement: 'Enhanced Error Recovery',
                benefit: 'Automatic recovery from common errors',
                implemented: false
            });
        } else {
            opportunities.push({
                category: 'Error Handling',
                enhancement: 'Enhanced Error Recovery',
                benefit: 'Automatic recovery from common errors',
                implemented: true
            });
        }
        
        // Check if performance optimizer is active
        if (!window.performanceOptimizer) {
            opportunities.push({
                category: 'Performance',
                enhancement: 'Performance Optimizer',
                benefit: 'Auto-optimization based on system resources',
                implemented: false
            });
        } else {
            opportunities.push({
                category: 'Performance',
                enhancement: 'Performance Optimizer',
                benefit: 'Auto-optimization based on system resources',
                implemented: true
            });
        }
        
        // Check if health checker is active
        if (!window.comprehensiveHealthChecker) {
            opportunities.push({
                category: 'Monitoring',
                enhancement: 'Comprehensive Health Checker',
                benefit: 'Continuous system health monitoring',
                implemented: false
            });
        } else {
            opportunities.push({
                category: 'Monitoring',
                enhancement: 'Comprehensive Health Checker',
                benefit: 'Continuous system health monitoring',
                implemented: true
            });
        }
        
        this.auditResults.enhancementOpportunities = opportunities;
        console.log(`[IDEAudit]   Found ${opportunities.length} enhancement opportunities`);
    }
    
    calculateOverallScore() {
        let score = 100;
        
        // Deduct points for issues
        this.auditResults.syntaxErrors.forEach(issue => {
            score -= issue.severity === 'error' ? 10 : 5;
        });
        
        this.auditResults.performanceIssues.forEach(issue => {
            score -= issue.severity === 'error' ? 5 : 2;
        });
        
        this.auditResults.memoryLeaks.forEach(issue => {
            score -= issue.severity === 'error' ? 5 : 2;
        });
        
        this.auditResults.securityIssues.forEach(issue => {
            score -= issue.severity === 'error' ? 10 : 3;
        });
        
        // Add points for implemented enhancements
        const implementedCount = this.auditResults.enhancementOpportunities.filter(e => e.implemented).length;
        score += implementedCount * 2;
        
        this.auditResults.overallScore = Math.max(0, Math.min(100, score));
    }
    
    generateReport() {
        console.log('\n' + '='.repeat(70));
        console.log('📊 IDE AUDIT REPORT');
        console.log('='.repeat(70));
        console.log(`Timestamp: ${this.auditResults.timestamp}`);
        console.log(`Overall Score: ${this.auditResults.overallScore}/100`);
        console.log('');
        
        // Syntax Errors
        console.log('📝 Syntax & Loading Issues:', this.auditResults.syntaxErrors.length);
        this.auditResults.syntaxErrors.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`  ${icon} [${issue.module}] ${issue.message}`);
        });
        console.log('');
        
        // Performance
        console.log('⚡ Performance Issues:', this.auditResults.performanceIssues.length);
        this.auditResults.performanceIssues.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`  ${icon} [${issue.category}] ${issue.message}`);
            console.log(`      💡 ${issue.recommendation}`);
        });
        console.log('');
        
        // Memory
        console.log('💾 Memory Issues:', this.auditResults.memoryLeaks.length);
        this.auditResults.memoryLeaks.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`  ${icon} [${issue.category}] ${issue.message}`);
            console.log(`      💡 ${issue.recommendation}`);
        });
        console.log('');
        
        // Security
        console.log('🔒 Security Issues:', this.auditResults.securityIssues.length);
        this.auditResults.securityIssues.forEach(issue => {
            const icon = issue.severity === 'error' ? '❌' : '⚠️';
            console.log(`  ${icon} [${issue.category}] ${issue.message}`);
            console.log(`      💡 ${issue.recommendation}`);
        });
        console.log('');
        
        // Enhancements
        console.log('💡 Enhancement Status:');
        this.auditResults.enhancementOpportunities.forEach(opp => {
            const icon = opp.implemented ? '✅' : '➕';
            const status = opp.implemented ? 'ACTIVE' : 'AVAILABLE';
            console.log(`  ${icon} [${opp.category}] ${opp.enhancement} - ${status}`);
            console.log(`      ℹ️ ${opp.benefit}`);
        });
        console.log('');
        
        // Score interpretation
        const grade = this.auditResults.overallScore >= 90 ? 'A' :
                     this.auditResults.overallScore >= 80 ? 'B' :
                     this.auditResults.overallScore >= 70 ? 'C' :
                     this.auditResults.overallScore >= 60 ? 'D' : 'F';
        
        console.log('📈 Final Grade:', grade);
        console.log('='.repeat(70));
    }
    
    exportReport() {
        const report = {
            ...this.auditResults,
            grade: this.auditResults.overallScore >= 90 ? 'A' :
                   this.auditResults.overallScore >= 80 ? 'B' :
                   this.auditResults.overallScore >= 70 ? 'C' :
                   this.auditResults.overallScore >= 60 ? 'D' : 'F'
        };
        
        return JSON.stringify(report, null, 2);
    }
}

// Initialize and expose globally
window.ideAudit = new ComprehensiveIDEAudit();

console.log('[IDEAudit] 🔍 Comprehensive IDE audit system loaded!');
console.log('[IDEAudit] 💡 Commands:');
console.log('[IDEAudit]   - window.ideAudit.runFullAudit() - Run complete audit');
console.log('[IDEAudit]   - window.ideAudit.exportReport() - Export audit results');
