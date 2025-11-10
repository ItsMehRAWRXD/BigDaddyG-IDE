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
        const h3 = document.createElement('h3');
        h3.style.cssText = 'margin: 0; color: var(--cursor-jade-dark); font-size: 14px;';
        h3.textContent = '🧠 Code Intelligence';
        
        const closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'background: none; border: none; color: var(--cursor-text-secondary); cursor: pointer; font-size: 16px;';
        closeBtn.textContent = '×';
        closeBtn.onclick = () => panel.style.display = 'none';
        
        header.appendChild(h3);
        header.appendChild(closeBtn);
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

        // Clear content safely
        content.textContent = '';
        
        // Create summary section
        const summaryDiv = document.createElement('div');
        summaryDiv.style.cssText = 'background: var(--cursor-bg-tertiary); padding: 12px; border-radius: 8px; margin-bottom: 12px;';
        
        const summaryHeader = document.createElement('div');
        summaryHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;';
        
        const summaryTitle = document.createElement('span');
        summaryTitle.style.cssText = 'font-weight: 600; color: var(--cursor-text);';
        summaryTitle.textContent = 'Analysis Summary';
        
        const issuesBadge = document.createElement('span');
        const badgeColor = totalIssues === 0 ? 'var(--cursor-jade-dark)' : totalIssues < 5 ? 'orange' : 'var(--cursor-error)';
        issuesBadge.style.cssText = `background: ${badgeColor}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px;`;
        issuesBadge.textContent = `${totalIssues} issues`;
        
        summaryHeader.appendChild(summaryTitle);
        summaryHeader.appendChild(issuesBadge);
        
        const complexityDiv = document.createElement('div');
        complexityDiv.style.cssText = 'font-size: 12px; color: var(--cursor-text-secondary);';
        const complexityColor = analysis.complexity.rating === 'LOW' ? 'var(--cursor-jade-dark)' : analysis.complexity.rating === 'MEDIUM' ? 'orange' : 'var(--cursor-error)';
        complexityDiv.innerHTML = `Complexity: <span style="color: ${complexityColor};">${analysis.complexity.score} (${analysis.complexity.rating})</span>`;
        
        summaryDiv.appendChild(summaryHeader);
        summaryDiv.appendChild(complexityDiv);
        content.appendChild(summaryDiv);
        
        // Add issue categories
        this.renderIssueCategorySafe(content, 'Security', analysis.security, '🔒', 'var(--cursor-error)');
        this.renderIssueCategorySafe(content, 'Performance', analysis.performance, '⚡', 'orange');
        this.renderIssueCategorySafe(content, 'Quality', analysis.quality, '✨', 'var(--cursor-jade-dark)');
        
        // Add AI suggestions
        if (analysis.suggestions.length > 0) {
            this.renderAISuggestionsSafe(content, analysis.suggestions);
        }
        
        // Add action buttons
        this.renderActionButtonsSafe(content);

        // Show panel
        panel.style.display = 'block';
    }

    renderIssueCategorySafe(container, title, issues, icon, color) {
        if (issues.length === 0) return;
        
        const categoryDiv = document.createElement('div');
        categoryDiv.style.cssText = 'margin-bottom: 12px;';
        
        const categoryHeader = document.createElement('h4');
        categoryHeader.style.cssText = `margin: 0 0 8px 0; color: ${color}; font-size: 12px; display: flex; align-items: center; gap: 6px;`;
        categoryHeader.textContent = `${icon} ${title} (${issues.length})`;
        categoryDiv.appendChild(categoryHeader);
        
        issues.slice(0, 3).forEach(issue => {
            const issueDiv = document.createElement('div');
            issueDiv.style.cssText = `background: var(--cursor-bg-tertiary); padding: 8px; border-radius: 6px; margin-bottom: 6px; border-left: 3px solid ${color};`;
            
            const issueHeader = document.createElement('div');
            issueHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';
            
            const messageSpan = document.createElement('span');
            messageSpan.style.cssText = 'font-size: 11px; font-weight: 600; color: var(--cursor-text);';
            messageSpan.textContent = issue.message;
            
            const severitySpan = document.createElement('span');
            severitySpan.style.cssText = `background: ${color}; color: white; padding: 1px 6px; border-radius: 8px; font-size: 9px;`;
            severitySpan.textContent = issue.severity;
            
            issueHeader.appendChild(messageSpan);
            issueHeader.appendChild(severitySpan);
            issueDiv.appendChild(issueHeader);
            
            const lineDiv = document.createElement('div');
            lineDiv.style.cssText = 'font-size: 10px; color: var(--cursor-text-secondary); margin-bottom: 4px;';
            lineDiv.textContent = `Line ${issue.line}`;
            issueDiv.appendChild(lineDiv);
            
            if (issue.fix) {
                const fixDiv = document.createElement('div');
                fixDiv.style.cssText = 'font-size: 10px; color: var(--cursor-jade-dark); font-style: italic;';
                fixDiv.textContent = `💡 ${issue.fix}`;
                issueDiv.appendChild(fixDiv);
            }
            
            categoryDiv.appendChild(issueDiv);
        });
        
        if (issues.length > 3) {
            const moreDiv = document.createElement('div');
            moreDiv.style.cssText = 'font-size: 10px; color: var(--cursor-text-secondary); text-align: center;';
            moreDiv.textContent = `... and ${issues.length - 3} more`;
            categoryDiv.appendChild(moreDiv);
        }
        
        container.appendChild(categoryDiv);
    }
    
    renderAISuggestionsSafe(container, suggestions) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.style.cssText = 'margin-top: 12px;';
        
        const suggestionsHeader = document.createElement('h4');
        suggestionsHeader.style.cssText = 'margin: 0 0 8px 0; color: var(--cursor-jade-dark); font-size: 12px; display: flex; align-items: center; gap: 6px;';
        suggestionsHeader.textContent = '🤖 AI Suggestions';
        suggestionsDiv.appendChild(suggestionsHeader);
        
        suggestions.forEach(s => {
            const suggestionDiv = document.createElement('div');
            suggestionDiv.style.cssText = 'background: var(--cursor-bg-tertiary); padding: 8px; border-radius: 6px; margin-bottom: 6px; font-size: 11px;';
            
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = 'color: var(--cursor-text); margin-bottom: 4px;';
            messageDiv.textContent = s.message;
            suggestionDiv.appendChild(messageDiv);
            
            if (s.fix) {
                const fixDiv = document.createElement('div');
                fixDiv.style.cssText = 'color: var(--cursor-text-secondary); font-style: italic;';
                fixDiv.textContent = `💡 ${s.fix}`;
                suggestionDiv.appendChild(fixDiv);
            }
            
            suggestionsDiv.appendChild(suggestionDiv);
        });
        
        container.appendChild(suggestionsDiv);
    }
    
    renderActionButtonsSafe(container) {
        const actionsDiv = document.createElement('div');
        actionsDiv.style.cssText = 'margin-top: 12px; display: flex; gap: 8px;';
        
        const fixBtn = document.createElement('button');
        fixBtn.style.cssText = 'flex: 1; background: var(--cursor-jade-dark); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;';
        fixBtn.textContent = '🔧 Auto-fix';
        fixBtn.onclick = () => window.codeIntelligence?.fixAllIssues();
        
        const exportBtn = document.createElement('button');
        exportBtn.style.cssText = 'flex: 1; background: var(--cursor-accent); color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 11px;';
        exportBtn.textContent = '📊 Export';
        exportBtn.onclick = () => window.codeIntelligence?.exportReport();
        
        actionsDiv.appendChild(fixBtn);
        actionsDiv.appendChild(exportBtn);
        container.appendChild(actionsDiv);
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