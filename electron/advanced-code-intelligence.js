/**
 * Advanced Code Intelligence - AI-powered code analysis and suggestions
 * Features: Smart refactoring, code quality analysis, security scanning, performance optimization
 */

(function() {
'use strict';

class AdvancedCodeIntelligence {
    constructor() {
        this.analysisCache = new Map();
        this.securityRules = new Map();
        this.performancePatterns = new Map();
        this.refactoringHistory = [];
        this.init();
    }

    async init() {
        console.log('[CodeIntel] 🧠 Initializing advanced code intelligence...');
        
        this.loadSecurityRules();
        this.loadPerformancePatterns();
        this.setupRealtimeAnalysis();
        
        console.log('[CodeIntel] ✅ Code intelligence ready');
    }

    loadSecurityRules() {
        // Common security vulnerabilities
        this.securityRules.set('sql_injection', {
            pattern: /(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER).*(?:\+|\|\||CONCAT)/gi,
            severity: 'HIGH',
            message: 'Potential SQL injection vulnerability detected',
            fix: 'Use parameterized queries or prepared statements'
        });

        this.securityRules.set('xss_vulnerability', {
            pattern: /innerHTML\s*=\s*.*\+|document\.write\s*\(.*\+/gi,
            severity: 'HIGH',
            message: 'Potential XSS vulnerability - unsafe HTML injection',
            fix: 'Use textContent or sanitize input before inserting HTML'
        });

        this.securityRules.set('hardcoded_secrets', {
            pattern: /(?:password|secret|key|token)\s*[:=]\s*["'][^"']{8,}["']/gi,
            severity: 'CRITICAL',
            message: 'Hardcoded secret detected',
            fix: 'Move secrets to environment variables or secure configuration'
        });

        this.securityRules.set('weak_crypto', {
            pattern: /MD5|SHA1|DES|RC4/gi,
            severity: 'MEDIUM',
            message: 'Weak cryptographic algorithm detected',
            fix: 'Use SHA-256, AES, or other modern cryptographic algorithms'
        });

        console.log('[CodeIntel] 🔒 Loaded security rules');
    }

    loadPerformancePatterns() {
        // Performance anti-patterns
        this.performancePatterns.set('nested_loops', {
            pattern: /for\s*\([^}]*\{[^}]*for\s*\(/gi,
            severity: 'MEDIUM',
            message: 'Nested loops detected - potential O(n²) complexity',
            fix: 'Consider using hash maps, sets, or optimized algorithms'
        });

        this.performancePatterns.set('dom_queries_in_loop', {
            pattern: /for\s*\([^}]*\{[^}]*(?:getElementById|querySelector|getElementsBy)/gi,
            severity: 'HIGH',
            message: 'DOM queries inside loop - performance bottleneck',
            fix: 'Cache DOM elements outside the loop'
        });

        this.performancePatterns.set('synchronous_operations', {
            pattern: /(?:fs\.readFileSync|XMLHttpRequest|\.sync\(\))/gi,
            severity: 'MEDIUM',
            message: 'Synchronous operation detected - blocks event loop',
            fix: 'Use async/await or Promise-based alternatives'
        });

        console.log('[CodeIntel] ⚡ Loaded performance patterns');
    }

    setupRealtimeAnalysis() {
        // Hook into Monaco editor changes
        if (window.editor) {
            window.editor.onDidChangeModelContent(() => {
                this.debounceAnalysis();
            });
        }

        // Set up debounced analysis
        this.analysisTimeout = null;
    }

    debounceAnalysis() {
        clearTimeout(this.analysisTimeout);
        this.analysisTimeout = setTimeout(() => {
            this.analyzeCurrentFile();
        }, 1000); // Analyze 1 second after user stops typing
    }

    async analyzeCurrentFile() {
        if (!window.editor) return;

        const code = window.editor.getValue();
        const language = window.editor.getModel()?.getLanguageId() || 'plaintext';
        
        if (code.length < 10) return; // Skip very short files

        console.log('[CodeIntel] 🔍 Analyzing code...');

        const analysis = {
            security: this.analyzeSecurityIssues(code),
            performance: this.analyzePerformanceIssues(code),
            quality: this.analyzeCodeQuality(code),
            complexity: this.calculateComplexity(code),
            suggestions: await this.generateSuggestions(code, language)
        };

        this.displayAnalysisResults(analysis);
        this.cacheAnalysis(code, analysis);
    }

    analyzeSecurityIssues(code) {
        const issues = [];

        for (const [ruleName, rule] of this.securityRules) {
            const matches = [...code.matchAll(rule.pattern)];
            
            matches.forEach(match => {
                const lineNumber = code.substring(0, match.index).split('\n').length;
                issues.push({
                    type: 'security',
                    rule: ruleName,
                    severity: rule.severity,
                    message: rule.message,
                    fix: rule.fix,
                    line: lineNumber,
                    column: match.index - code.lastIndexOf('\n', match.index - 1) - 1,
                    code: match[0]
                });
            });
        }

        return issues;
    }

    analyzePerformanceIssues(code) {
        const issues = [];

        for (const [patternName, pattern] of this.performancePatterns) {
            const matches = [...code.matchAll(pattern.pattern)];
            
            matches.forEach(match => {
                const lineNumber = code.substring(0, match.index).split('\n').length;
                issues.push({
                    type: 'performance',
                    pattern: patternName,
                    severity: pattern.severity,
                    message: pattern.message,
                    fix: pattern.fix,
                    line: lineNumber,
                    column: match.index - code.lastIndexOf('\n', match.index - 1) - 1,
                    code: match[0]
                });
            });
        }

        return issues;
    }

    analyzeCodeQuality(code) {
        const issues = [];
        const lines = code.split('\n');

        lines.forEach((line, index) => {
            // Long lines
            if (line.length > 120) {
                issues.push({
                    type: 'quality',
                    rule: 'line_length',
                    severity: 'LOW',
                    message: `Line too long (${line.length} characters)`,
                    fix: 'Break line into multiple lines or extract to variable',
                    line: index + 1,
                    column: 120
                });
            }

            // TODO comments
            if (line.includes('TODO') || line.includes('FIXME') || line.includes('HACK')) {
                issues.push({
                    type: 'quality',
                    rule: 'todo_comment',
                    severity: 'INFO',
                    message: 'TODO/FIXME comment found',
                    fix: 'Complete the task or create a proper issue',
                    line: index + 1,
                    column: line.indexOf('TODO') !== -1 ? line.indexOf('TODO') : 
                           line.indexOf('FIXME') !== -1 ? line.indexOf('FIXME') : 
                           line.indexOf('HACK')
                });
            }

            // Console.log statements
            if (line.includes('console.log') && !line.includes('//')) {
                issues.push({
                    type: 'quality',
                    rule: 'console_log',
                    severity: 'LOW',
                    message: 'Console.log statement found',
                    fix: 'Remove debug statements or use proper logging',
                    line: index + 1,
                    column: line.indexOf('console.log')
                });
            }
        });

        return issues;
    }

    calculateComplexity(code) {
        // Simplified cyclomatic complexity calculation
        const complexityKeywords = [
            'if', 'else', 'while', 'for', 'switch', 'case', 'catch', 'try', '&&', '||', '?'
        ];

        let complexity = 1; // Base complexity
        
        complexityKeywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            const matches = code.match(regex);
            if (matches) {
                complexity += matches.length;
            }
        });

        return {
            score: complexity,
            rating: complexity <= 10 ? 'LOW' : complexity <= 20 ? 'MEDIUM' : 'HIGH',
            message: complexity <= 10 ? 'Good complexity' : 
                    complexity <= 20 ? 'Moderate complexity - consider refactoring' :
                    'High complexity - refactoring recommended'
        };
    }

    async generateSuggestions(code, language) {
        const suggestions = [];

        // Language-specific suggestions
        if (language === 'javascript' || language === 'typescript') {
            // Suggest modern JS features
            if (code.includes('var ')) {
                suggestions.push({
                    type: 'modernization',
                    message: 'Consider using let/const instead of var',
                    fix: 'Replace var with let or const for better scoping'
                });
            }

            if (code.includes('function(') && !code.includes('=>')) {
                suggestions.push({
                    type: 'modernization',
                    message: 'Consider using arrow functions',
                    fix: 'Use arrow functions for cleaner syntax'
                });
            }
        }

        if (language === 'python') {
            // Python-specific suggestions
            if (code.includes('print(') && code.includes('f"')) {
                suggestions.push({
                    type: 'best_practice',
                    message: 'Good use of f-strings for formatting',
                    fix: null
                });
            }
        }

        // AI-powered suggestions (if available)
        if (window.agenticAI && window.agenticAI.ready) {
            try {
                const aiSuggestions = await this.getAISuggestions(code, language);
                suggestions.push(...aiSuggestions);
            } catch (error) {
                console.warn('[CodeIntel] AI suggestions unavailable:', error);
            }
        }

        return suggestions;
    }

    async getAISuggestions(code, language) {
        const prompt = `Analyze this ${language} code and provide 3 specific improvement suggestions:

\`\`\`${language}
${code.substring(0, 2000)} // Truncated for analysis
\`\`\`

Focus on:
1. Code quality improvements
2. Performance optimizations  
3. Best practices

Respond with JSON array of suggestions.`;

        try {
            const response = await window.agenticAI.chat(prompt, { 
                model: 'code-analysis',
                temperature: 0.3 
            });

            // Parse AI response for suggestions
            const suggestions = this.parseAISuggestions(response);
            return suggestions;
        } catch (error) {
            console.warn('[CodeIntel] AI analysis failed:', error);
            return [];
        }
    }

    parseAISuggestions(response) {
        // Extract suggestions from AI response
        const suggestions = [];
        
        try {
            // Try to parse JSON response
            const parsed = JSON.parse(response);
            if (Array.isArray(parsed)) {
                return parsed.map(s => ({
                    type: 'ai_suggestion',
                    message: s.message || s.suggestion,
                    fix: s.fix || s.solution,
                    confidence: s.confidence || 0.8
                }));
            }
        } catch (e) {
            // Fallback: extract suggestions from text
            const lines = response.split('\n');
            lines.forEach(line => {
                if (line.includes('suggestion') || line.includes('improve') || line.includes('optimize')) {
                    suggestions.push({
                        type: 'ai_suggestion',
                        message: line.trim(),
                        fix: null,
                        confidence: 0.7
                    });
                }
            });
        }

        return suggestions.slice(0, 3); // Limit to 3 suggestions
    }

    displayAnalysisResults(analysis) {
        // Create or update analysis panel
        let panel = document.getElementById('code-intelligence-panel');
        
        if (!panel) {
            panel = this.createAnalysisPanel();
        }

        this.updateAnalysisPanel(panel, analysis);
    }

    createAnalysisPanel() {
        const panel = document.createElement('div');
        panel.id = 'code-intelligence-panel';
        panel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 420px;
            width: 350px;
            max-height: 500px;
            background: var(--cursor-bg-secondary);
            border: 2px solid var(--cursor-jade-light);
            border-radius: 12px;
            padding: 16px;
            z-index: 1000;
            overflow-y: auto;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
            display: none;
        `;

        // Add header with close button
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--cursor-border);';
        header.innerHTML = `
            <h3 style="margin: 0; color: var(--cursor-jade-dark); font-size: 14px;">🧠 Code Intelligence</h3>
            <button onclick="this.parentElement.parentElement.style.display='none'" style="background: none; border: none; color: var(--cursor-text-secondary); cursor: pointer; font-size: 16px;">×</button>
        `;
        panel.appendChild(header);

        // Add content area
        const content = document.createElement('div');
        content.id = 'analysis-content';
        panel.appendChild(content);

        document.body.appendChild(panel);
        return panel;
    }

    updateAnalysisPanel(panel, analysis) {
        const content = panel.querySelector('#analysis-content');
        if (!content) return;

        const totalIssues = analysis.security.length + analysis.performance.length + analysis.quality.length;

        content.innerHTML = `
            <!-- Summary -->
            <div style="background: var(--cursor-bg-tertiary); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 600; color: var(--cursor-text);">Analysis Summary</span>
                    <span style="background: ${totalIssues === 0 ? 'var(--cursor-jade-dark)' : totalIssues < 5 ? 'orange' : 'var(--cursor-error)'}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;">
                        ${totalIssues} issues
                    </span>
                </div>
                <div style="font-size: 12px; color: var(--cursor-text-secondary);">
                    Complexity: <span style="color: ${analysis.complexity.rating === 'LOW' ? 'var(--cursor-jade-dark)' : analysis.complexity.rating === 'MEDIUM' ? 'orange' : 'var(--cursor-error)'};">${analysis.complexity.score} (${analysis.complexity.rating})</span>
                </div>
            </div>

            <!-- Issues by Category -->
            ${this.renderIssueCategory('Security', analysis.security, '🔒', 'var(--cursor-error)')}
            ${this.renderIssueCategory('Performance', analysis.performance, '⚡', 'orange')}
            ${this.renderIssueCategory('Quality', analysis.quality, '✨', 'var(--cursor-jade-dark)')}
            
            <!-- AI Suggestions -->
            ${analysis.suggestions.length > 0 ? `
                <div style="margin-top: 12px;">
                    <h4 style="margin: 0 0 8px 0; color: var(--cursor-jade-dark); font-size: 12px; display: flex; align-items: center; gap: 6px;">
                        🤖 AI Suggestions
                    </h4>
                    ${analysis.suggestions.map(s => `
                        <div style="background: var(--cursor-bg-tertiary); padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;">
                            <div style="color: var(--cursor-text); margin-bottom: 4px;">${s.message}</div>
                            ${s.fix ? `<div style="color: var(--cursor-text-secondary); font-style: italic;">💡 ${s.fix}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            <!-- Actions -->
            <div style="margin-top: 12px; display: flex; gap: 8px;">
                <button onclick="codeIntelligence.fixAllIssues()" style="flex: 1; background: var(--cursor-jade-dark); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    🔧 Auto-fix
                </button>
                <button onclick="codeIntelligence.exportReport()" style="flex: 1; background: var(--cursor-accent); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;">
                    📊 Export
                </button>
            </div>
        `;

        // Show panel
        panel.style.display = 'block';
    }

    renderIssueCategory(title, issues, icon, color) {
        if (issues.length === 0) return '';

        return `
            <div style="margin-bottom: 12px;">
                <h4 style="margin: 0 0 8px 0; color: ${color}; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                    ${icon} ${title} (${issues.length})
                </h4>
                ${issues.slice(0, 3).map(issue => `
                    <div style="background: var(--cursor-bg-tertiary); padding: 8px; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid ${color};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                            <span style="font-size: 11px; font-weight: 600; color: var(--cursor-text);">${issue.message}</span>
                            <span style="background: ${color}; color: white; padding: 1px 6px; border-radius: 8px; font-size: 9px;">${issue.severity}</span>
                        </div>
                        <div style="font-size: 10px; color: var(--cursor-text-secondary); margin-bottom: 4px;">Line ${issue.line}</div>
                        ${issue.fix ? `<div style="font-size: 10px; color: var(--cursor-jade-dark); font-style: italic;">💡 ${issue.fix}</div>` : ''}
                    </div>
                `).join('')}
                ${issues.length > 3 ? `<div style="font-size: 10px; color: var(--cursor-text-secondary); text-align: center;">... and ${issues.length - 3} more</div>` : ''}
            </div>
        `;
    }

    async fixAllIssues() {
        if (!window.editor) return;

        console.log('[CodeIntel] 🔧 Auto-fixing issues...');

        const code = window.editor.getValue();
        let fixedCode = code;

        // Apply automatic fixes
        fixedCode = this.applySecurityFixes(fixedCode);
        fixedCode = this.applyPerformanceFixes(fixedCode);
        fixedCode = this.applyQualityFixes(fixedCode);

        if (fixedCode !== code) {
            // Apply changes to editor
            window.editor.setValue(fixedCode);
            
            // Show notification
            if (window.showNotification) {
                window.showNotification('🔧 Auto-fix Complete', 'Code issues have been automatically fixed', 'success');
            }

            // Re-analyze
            setTimeout(() => this.analyzeCurrentFile(), 500);
        } else {
            if (window.showNotification) {
                window.showNotification('ℹ️ No Auto-fixes Available', 'Manual review required for remaining issues', 'info');
            }
        }
    }

    applySecurityFixes(code) {
        // Fix hardcoded secrets (basic obfuscation)
        code = code.replace(
            /(?:password|secret|key|token)\s*[:=]\s*["']([^"']{8,})["']/gi,
            (match, secret) => match.replace(secret, 'process.env.SECRET_KEY')
        );

        return code;
    }

    applyPerformanceFixes(code) {
        // Cache DOM queries
        code = code.replace(
            /(for\s*\([^}]*\{[^}]*)(document\.getElementById\(['"]([^'"]+)['"]\))/gi,
            (match, forPart, query, id) => {
                return `const cached_${id.replace(/[^a-zA-Z0-9]/g, '_')} = ${query};\n${forPart}cached_${id.replace(/[^a-zA-Z0-9]/g, '_')}`;
            }
        );

        return code;
    }

    applyQualityFixes(code) {
        // Remove console.log statements
        code = code.replace(/^\s*console\.log\([^)]*\);\s*$/gm, '');
        
        // Convert var to let/const (basic)
        code = code.replace(/\bvar\b/g, 'let');

        return code;
    }

    async exportReport() {
        const analysis = this.analysisCache.get(window.editor?.getValue());
        if (!analysis) return;

        const report = {
            timestamp: new Date().toISOString(),
            file: window.openTabs?.[window.activeTab]?.filename || 'untitled',
            summary: {
                totalIssues: analysis.security.length + analysis.performance.length + analysis.quality.length,
                complexity: analysis.complexity,
                securityIssues: analysis.security.length,
                performanceIssues: analysis.performance.length,
                qualityIssues: analysis.quality.length
            },
            details: analysis
        };

        // Download as JSON
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code-analysis-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('[CodeIntel] 📊 Report exported');
    }

    cacheAnalysis(code, analysis) {
        // Cache analysis results to avoid re-computation
        const hash = this.hashCode(code);
        this.analysisCache.set(hash, analysis);

        // Limit cache size
        if (this.analysisCache.size > 50) {
            const firstKey = this.analysisCache.keys().next().value;
            this.analysisCache.delete(firstKey);
        }
    }

    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
    }

    // Public API
    togglePanel() {
        const panel = document.getElementById('code-intelligence-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        } else {
            this.analyzeCurrentFile();
        }
    }

    async analyzeSelection() {
        if (!window.editor) return;

        const selection = window.editor.getSelection();
        const selectedText = window.editor.getModel().getValueInRange(selection);
        
        if (selectedText.trim().length === 0) {
            this.analyzeCurrentFile();
            return;
        }

        console.log('[CodeIntel] 🔍 Analyzing selection...');

        const analysis = {
            security: this.analyzeSecurityIssues(selectedText),
            performance: this.analyzePerformanceIssues(selectedText),
            quality: this.analyzeCodeQuality(selectedText),
            complexity: this.calculateComplexity(selectedText),
            suggestions: await this.generateSuggestions(selectedText, window.editor.getModel()?.getLanguageId())
        };

        this.displayAnalysisResults(analysis);
    }
}

// Initialize
window.codeIntelligence = null;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.codeIntelligence = new AdvancedCodeIntelligence();
    });
} else {
    window.codeIntelligence = new AdvancedCodeIntelligence();
}

// Add to Monaco context menu
setTimeout(() => {
    if (window.editor) {
        window.editor.addAction({
            id: 'analyze-code',
            label: '🧠 Analyze Code',
            contextMenuGroupId: 'bigdaddyg',
            contextMenuOrder: 7,
            run: () => window.codeIntelligence?.analyzeSelection()
        });
    }
}, 2000);

console.log('[CodeIntel] 🧠 Advanced Code Intelligence loaded');

})();