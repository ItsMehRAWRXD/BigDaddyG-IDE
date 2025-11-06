/**
 * Predictive Debugger
 * Revolutionary: AI predicts bugs BEFORE you run the code
 * Uses pattern matching + AI to forecast runtime errors, edge cases, and vulnerabilities
 */

class PredictiveDebugger {
    constructor(editor) {
        this.editor = editor;
        this.predictions = [];
        this.activeWarnings = [];
        this.decorations = [];
        this.analysisInterval = null;
        
        console.log('[PredictiveDebugger] 🔮 Predictive Debugger initialized');
    }
    
    // ========================================================================
    // REAL-TIME ANALYSIS
    // ========================================================================
    
    startContinuousAnalysis() {
        console.log('[PredictiveDebugger] 👁️ Starting continuous analysis...');
        
        // Listen to editor changes
        this.editor.onDidChangeModelContent(() => {
            clearTimeout(this.analysisInterval);
            this.analysisInterval = setTimeout(() => {
                this.analyzeCode();
            }, 1500); // Analyze 1.5s after typing stops
        });
        
        // Initial analysis
        this.analyzeCode();
    }
    
    async analyzeCode() {
        const code = this.editor.getValue();
        if (!code || code.trim().length < 10) return;
        
        console.log('[PredictiveDebugger] 🔍 Analyzing code for potential issues...');
        
        // Clear previous decorations
        this.clearDecorations();
        
        // Phase 1: Local pattern-based detection (fast)
        const localIssues = this.detectLocalIssues(code);
        
        // Phase 2: AI-powered deep analysis (slower but smarter)
        const aiIssues = await this.getAIPredictions(code);
        
        // Combine results
        this.predictions = [...localIssues, ...aiIssues];
        
        // Display warnings
        this.displayPredictions();
        
        // Add inline decorations
        this.addInlineWarnings();
        
        console.log(`[PredictiveDebugger] ✅ Found ${this.predictions.length} potential issues`);
    }
    
    // ========================================================================
    // LOCAL PATTERN DETECTION
    // ========================================================================
    
    detectLocalIssues(code) {
        const issues = [];
        const lines = code.split('\n');
        
        lines.forEach((line, index) => {
            const lineNum = index + 1;
            
            // Detect potential null/undefined access
            if (/\.\w+/.test(line) && !/if\s*\(/.test(line) && !/&&/.test(line)) {
                if (!/(let|const|var)\s+\w+\s*=/.test(line)) {
                    issues.push({
                        line: lineNum,
                        column: line.indexOf('.'),
                        severity: 'warning',
                        message: 'Potential null/undefined access without check',
                        type: 'null-access',
                        suggestion: 'Add null check before accessing property'
                    });
                }
            }
            
            // Detect infinite loops
            if (/while\s*\(\s*true\s*\)/.test(line) || /for\s*\(\s*;\s*;\s*\)/.test(line)) {
                if (!/(break|return)/.test(code.substring(code.indexOf(line)))) {
                    issues.push({
                        line: lineNum,
                        column: 0,
                        severity: 'error',
                        message: 'Potential infinite loop detected',
                        type: 'infinite-loop',
                        suggestion: 'Add break condition or return statement'
                    });
                }
            }
            
            // Detect == instead of ===
            if (/==/.test(line) && !/===/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: line.indexOf('=='),
                    severity: 'warning',
                    message: 'Using == instead of === (loose equality)',
                    type: 'loose-equality',
                    suggestion: 'Use === for strict equality comparison'
                });
            }
            
            // Detect var instead of let/const
            if (/var\s+\w+/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: line.indexOf('var'),
                    severity: 'info',
                    message: 'Using var (function-scoped) instead of let/const',
                    type: 'var-usage',
                    suggestion: 'Use let or const for block-scoped variables'
                });
            }
            
            // Detect missing await
            if (/\.\w+\(/.test(line) && /async/.test(code) && !/(await|then)/.test(line)) {
                const funcName = line.match(/\.(\w+)\(/)?.[1];
                if (funcName && (funcName.includes('fetch') || funcName.includes('get') || funcName.includes('post'))) {
                    issues.push({
                        line: lineNum,
                        column: line.indexOf(funcName),
                        severity: 'error',
                        message: 'Async function call without await',
                        type: 'missing-await',
                        suggestion: 'Add await before async function call'
                    });
                }
            }
            
            // Detect SQL injection risk
            if (/(query|execute)\s*\(/.test(line) && /\+/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: 0,
                    severity: 'critical',
                    message: 'Potential SQL injection vulnerability',
                    type: 'sql-injection',
                    suggestion: 'Use parameterized queries instead of string concatenation'
                });
            }
            
            // Detect XSS risk
            if (/innerHTML\s*=/.test(line) && !/(sanitize|escape|DOMPurify)/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: line.indexOf('innerHTML'),
                    severity: 'critical',
                    message: 'Potential XSS vulnerability (innerHTML without sanitization)',
                    type: 'xss',
                    suggestion: 'Sanitize user input before setting innerHTML'
                });
            }
            
            // Detect division by zero
            if (/\/\s*[a-zA-Z_]\w*/.test(line) && !/if\s*\([^)]*!==?\s*0/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: line.indexOf('/'),
                    severity: 'warning',
                    message: 'Potential division by zero',
                    type: 'division-by-zero',
                    suggestion: 'Add zero check before division'
                });
            }
            
            // Detect hardcoded credentials
            if (/(password|secret|api_key|token)\s*=\s*['"][^'"]+['"]/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: 0,
                    severity: 'critical',
                    message: 'Hardcoded credentials detected',
                    type: 'hardcoded-secret',
                    suggestion: 'Use environment variables for sensitive data'
                });
            }
            
            // Detect console.log in production code
            if (/console\.log/.test(line)) {
                issues.push({
                    line: lineNum,
                    column: line.indexOf('console.log'),
                    severity: 'info',
                    message: 'Console.log statement (remove for production)',
                    type: 'console-log',
                    suggestion: 'Remove or use proper logging library'
                });
            }
        });
        
        return issues;
    }
    
    // ========================================================================
    // AI-POWERED ANALYSIS
    // ========================================================================
    
    async getAIPredictions(code) {
        try {
            const response = await fetch('http://localhost:11441/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `As a security-focused code analyzer, examine this code for:

1. **Runtime Errors**: Null pointers, undefined variables, type mismatches
2. **Logic Bugs**: Off-by-one errors, wrong conditions, missing edge cases
3. **Security Issues**: SQL injection, XSS, CSRF, buffer overflows
4. **Performance Problems**: Inefficient algorithms, memory leaks, N+1 queries
5. **Best Practice Violations**: Code smells, anti-patterns

Respond ONLY in this JSON format:
{
  "predictions": [
    {
      "line": 10,
      "severity": "error|warning|info|critical",
      "message": "Brief description",
      "type": "bug-type",
      "suggestion": "How to fix"
    }
  ]
}

Code to analyze:
\`\`\`
${code}
\`\`\``,
                    model: 'BigDaddyG:Security'
                })
            });
            
            const data = await response.json();
            
            // Parse AI response
            const jsonMatch = data.response.match(/\{[\s\S]*"predictions"[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return parsed.predictions || [];
            }
            
            return [];
            
        } catch (error) {
            // Silently fail - predictive analysis is optional
            // Only log if there's a real error message
            if (error && error.message) {
                console.warn('[PredictiveDebugger] ⚠️ AI analysis unavailable:', error.message);
            }
            return [];
        }
    }
    
    // ========================================================================
    // VISUALIZATION
    // ========================================================================
    
    displayPredictions() {
        // Create or update prediction panel
        let panel = document.getElementById('predictive-debug-panel');
        
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'predictive-debug-panel';
            panel.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                max-height: 500px;
                background: rgba(10, 10, 30, 0.98);
                backdrop-filter: blur(20px);
                border: 2px solid var(--red);
                border-radius: 12px;
                z-index: 9998;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(255, 71, 87, 0.4);
            `;
            document.body.appendChild(panel);
        }
        
        const criticalCount = this.predictions.filter(p => p.severity === 'critical').length;
        const errorCount = this.predictions.filter(p => p.severity === 'error').length;
        const warningCount = this.predictions.filter(p => p.severity === 'warning').length;
        const infoCount = this.predictions.filter(p => p.severity === 'info').length;
        
        panel.innerHTML = `
            <!-- Header -->
            <div style="padding: 15px; background: rgba(0, 0, 0, 0.5); border-bottom: 2px solid var(--red); display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h3 style="margin: 0; color: var(--red); font-size: 16px;">🔮 Predictive Debugger</h3>
                    <div style="margin-top: 5px; font-size: 11px; color: #888;">
                        <span style="color: var(--red);">${criticalCount} critical</span> • 
                        <span style="color: var(--orange);">${errorCount} errors</span> • 
                        <span style="color: #ffa726;">${warningCount} warnings</span> • 
                        <span style="color: var(--cyan);">${infoCount} info</span>
                    </div>
                </div>
                <button onclick="document.getElementById('predictive-debug-panel').remove()" style="background: none; border: none; color: #888; font-size: 20px; cursor: pointer;">×</button>
            </div>
            
            <!-- Predictions List -->
            <div style="max-height: 400px; overflow-y: auto; padding: 15px;">
                ${this.predictions.length === 0 ? `
                    <div style="text-align: center; padding: 40px 20px; color: var(--green);">
                        <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
                        <div style="font-size: 14px; font-weight: bold;">No Issues Detected!</div>
                        <div style="font-size: 11px; color: #888; margin-top: 5px;">Your code looks clean</div>
                    </div>
                ` : this.predictions.map(pred => this.renderPrediction(pred)).join('')}
            </div>
        `;
    }
    
    renderPrediction(pred) {
        const severityColors = {
            critical: 'var(--red)',
            error: 'var(--orange)',
            warning: '#ffa726',
            info: 'var(--cyan)'
        };
        
        const severityIcons = {
            critical: '🔥',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        const color = severityColors[pred.severity] || '#888';
        const icon = severityIcons[pred.severity] || '•';
        
        return `
            <div onclick="window.predictiveDebugger.jumpToLine(${pred.line})" style="margin-bottom: 12px; padding: 12px; background: rgba(0, 0, 0, 0.3); border-left: 3px solid ${color}; border-radius: 6px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(0,0,0,0.5)'" onmouseout="this.style.background='rgba(0,0,0,0.3)'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                    <span style="color: ${color}; font-weight: bold; font-size: 13px;">${icon} ${pred.severity.toUpperCase()}</span>
                    <span style="color: #888; font-size: 11px;">Line ${pred.line}</span>
                </div>
                <div style="color: #fff; font-size: 12px; margin-bottom: 6px;">${pred.message}</div>
                <div style="color: var(--green); font-size: 11px; background: rgba(0, 255, 136, 0.05); padding: 6px 8px; border-radius: 4px; margin-top: 8px;">
                    💡 ${pred.suggestion}
                </div>
            </div>
        `;
    }
    
    addInlineWarnings() {
        const model = this.editor.getModel();
        if (!model) return;
        
        this.decorations = this.editor.deltaDecorations(
            this.decorations,
            this.predictions.map(pred => ({
                range: new monaco.Range(pred.line, 1, pred.line, 1),
                options: {
                    isWholeLine: true,
                    className: `predictive-warning-${pred.severity}`,
                    glyphMarginClassName: `predictive-glyph-${pred.severity}`,
                    hoverMessage: {
                        value: `**${pred.severity.toUpperCase()}**: ${pred.message}\n\n💡 ${pred.suggestion}`
                    },
                    glyphMarginHoverMessage: {
                        value: pred.message
                    }
                }
            }))
        );
        
        // Add CSS for decorations
        this.addDecorationStyles();
    }
    
    addDecorationStyles() {
        if (document.getElementById('predictive-debug-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'predictive-debug-styles';
        style.textContent = `
            .predictive-warning-critical {
                background: rgba(255, 71, 87, 0.15) !important;
                border-left: 3px solid var(--red) !important;
            }
            
            .predictive-warning-error {
                background: rgba(255, 107, 53, 0.1) !important;
                border-left: 3px solid var(--orange) !important;
            }
            
            .predictive-warning-warning {
                background: rgba(255, 165, 0, 0.08) !important;
                border-left: 3px solid #ffa726 !important;
            }
            
            .predictive-warning-info {
                background: rgba(0, 212, 255, 0.05) !important;
                border-left: 3px solid var(--cyan) !important;
            }
            
            .predictive-glyph-critical::before {
                content: '🔥';
                font-size: 14px;
            }
            
            .predictive-glyph-error::before {
                content: '❌';
                font-size: 14px;
            }
            
            .predictive-glyph-warning::before {
                content: '⚠️';
                font-size: 14px;
            }
            
            .predictive-glyph-info::before {
                content: 'ℹ️';
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);
    }
    
    clearDecorations() {
        if (this.decorations.length > 0) {
            this.decorations = this.editor.deltaDecorations(this.decorations, []);
        }
    }
    
    jumpToLine(lineNumber) {
        this.editor.revealLineInCenter(lineNumber);
        this.editor.setPosition({ lineNumber, column: 1 });
        this.editor.focus();
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

window.PredictiveDebugger = PredictiveDebugger;

setTimeout(() => {
    if (window.editor) {
        window.predictiveDebugger = new PredictiveDebugger(window.editor);
        window.predictiveDebugger.startContinuousAnalysis();
        
        console.log('[PredictiveDebugger] 🎯 Active! Watching for potential bugs...');
    }
}, 2000);

console.log('[PredictiveDebugger] 📦 Predictive Debugger module loaded');

