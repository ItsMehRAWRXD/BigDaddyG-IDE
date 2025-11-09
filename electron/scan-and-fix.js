#!/usr/bin/env node
/**
 * Scan and Fix Tool
 * Complete security and performance analysis with automated fixes
 */

const SecurityPerformanceScanner = require('./security-performance-scanner');
const QuickFixes = require('./quick-fixes');
const path = require('path');

class ScanAndFix {
    constructor() {
        this.scanner = new SecurityPerformanceScanner();
        this.fixer = new QuickFixes();
    }
    
    async analyze(targetPath = '.') {
        console.log('🔍 Starting comprehensive scan...');
        
        // Scan for issues
        this.scanner.scanDirectory(targetPath);
        const report = this.scanner.generateReport();
        
        // Display results
        this.displayResults(report);
        
        // Suggest fixes
        this.suggestFixes(report);
        
        return report;
    }
    
    displayResults(report) {
        console.log('\n📊 SECURITY & PERFORMANCE ANALYSIS');
        console.log('═'.repeat(50));
        console.log(`Files scanned: ${report.summary.files}`);
        console.log(`Total issues: ${report.summary.issues}`);
        console.log(`🚨 Critical: ${report.summary.critical}`);
        console.log(`⚠️  High: ${report.summary.high}`);
        console.log(`📋 Medium: ${report.summary.medium}`);
        console.log(`ℹ️  Low: ${report.summary.low}`);
        
        if (report.critical.length > 0) {
            console.log('\n🚨 CRITICAL SECURITY ISSUES:');
            report.critical.forEach((issue, i) => {
                console.log(`${i+1}. ${path.basename(issue.file)}:${issue.line}`);
                console.log(`   ${issue.message}`);
                console.log(`   Code: ${issue.code.substring(0, 80)}...`);
            });
        }
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            report.recommendations.forEach(rec => console.log(`• ${rec}`));
        }
    }
    
    suggestFixes(report) {
        const fixable = report.critical.length + report.high.length + report.medium.length;
        
        if (fixable > 0) {
            console.log('\n🔧 AUTOMATED FIXES AVAILABLE:');
            console.log('• Performance optimizations (safe)');
            console.log('• Security hardening (review required)');
            console.log('• Memory leak prevention');
            console.log('\nRun with --fix flag to apply automated fixes');
        }
    }
    
    applyFixes(targetPath = '.', types = ['performance']) {
        console.log('🔧 Applying automated fixes...');
        const fixes = this.fixer.fixDirectory(targetPath, types);
        console.log(`✅ Applied ${fixes} automated fixes`);
        return fixes;
    }
}

// CLI Interface
if (require.main === module) {
    const tool = new ScanAndFix();
    const args = process.argv.slice(2);
    const targetPath = args.find(arg => !arg.startsWith('--')) || '.';
    const shouldFix = args.includes('--fix');
    const fixTypes = args.includes('--security') ? ['security', 'performance'] : ['performance'];
    
    tool.analyze(targetPath).then(report => {
        if (shouldFix && report.summary.issues > 0) {
            tool.applyFixes(targetPath, fixTypes);
        }
    });
}

module.exports = ScanAndFix;